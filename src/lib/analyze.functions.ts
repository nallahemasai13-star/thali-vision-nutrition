import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const MODEL_VERSION = "vision-llm-catalog-v1";
const MODEL_ID = "openai/gpt-6-astra";
const MAX_B64 = Math.ceil((5 * 1024 * 1024 * 4) / 3) + 64;

export type PredictionResponse = {
  success: boolean;
  model_version: string;
  inference_available: boolean;
  is_food: boolean | null;
  predictions: { class_name: string; confidence: number }[];
  error?: string;
};

const input = z.object({
  mime: z.enum(["image/jpeg", "image/png"]),
  base64: z.string().min(100).max(MAX_B64),
});

function sniff(b64: string): "image/jpeg" | "image/png" | null {
  const head = atob(b64.slice(0, 16));
  const b = [...head].map((c) => c.charCodeAt(0));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  return null;
}

export const analyzeFood = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }): Promise<PredictionResponse> => {
    const base: PredictionResponse = {
      success: false, model_version: MODEL_VERSION, inference_available: true, is_food: null, predictions: [],
    };
    let detected: string | null;
    try { detected = sniff(data.base64); } catch { detected = null; }
    if (!detected || detected !== data.mime) {
      return { ...base, error: "The file isn't a valid JPG or PNG image. It may be corrupted." };
    }
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ...base, inference_available: false, error: "Food recognition is not configured." };

    const { data: foods, error: dbErr } = await context.supabase.from("foods").select("slug,name");
    if (dbErr || !foods?.length) return { ...base, error: "Could not load the food catalog. Try again." };
    const slugs = foods.map((f) => f.slug) as [string, ...string[]];

    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const { createLovableAiGatewayRunIdFetch } = await import("./ai-gateway.server");
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const schema = z.object({
      is_food: z.boolean(),
      predictions: z.array(z.object({ class_name: z.enum(slugs), confidence: z.number() })),
    });

    try {
      const result = streamText({
        model: provider.responses(MODEL_ID),
        instructions:
          "You classify a photo of a single Indian dish into ONE of the allowed catalog labels. " +
          "Return up to 3 candidate labels ordered by likelihood with confidence between 0 and 1 (your honest estimate; they need not sum to 1). " +
          "If the photo is not food, set is_food=false and return an empty list. If the dish is not in the catalog, return low confidences. " +
          "Allowed labels: " + foods.map((f) => `${f.slug} (${f.name})`).join(", "),
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Classify this dish." },
            { type: "image", image: `data:${data.mime};base64,${data.base64}` },
          ],
        }],
        output: Output.object({ schema }),
        providerOptions: {
          openai: {
            store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = schema.parse(await result.output);
      const preds = out.predictions
        .filter((p) => Number.isFinite(p.confidence))
        .map((p) => ({ class_name: p.class_name, confidence: Math.min(1, Math.max(0, p.confidence)) }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
      return { ...base, success: true, is_food: out.is_food, predictions: out.is_food ? preds : [] };
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      console.error("analyzeFood failed", status);
      if (status === 429) return { ...base, error: "Too many analyses right now. Please wait a minute and try again." };
      if (status === 402) return { ...base, inference_available: false, error: "AI credits are used up for this workspace. Add credits to continue analyzing photos." };
      if (status === 403) return { ...base, inference_available: false, error: "Food recognition is currently blocked for this workspace." };
      return { ...base, error: "The recognition service didn't return a usable result. Try again or pick the dish manually." };
    }
  });
