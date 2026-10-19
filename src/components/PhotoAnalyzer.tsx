import { useRef, useState, type ChangeEvent } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Camera, Loader2, Upload, X } from "lucide-react";
import { analyzeFood, type PredictionResponse } from "@/lib/analyze.functions";
import { catalogQuery } from "@/lib/data";
import { validateImageFile } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { MealBuilder } from "@/components/MealBuilder";

export function PhotoAnalyzer() {
  const { data: foods } = useSuspenseQuery(catalogQuery);
  const analyze = useServerFn(analyzeFood);
  const input = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<{ url: string; name: string; mime: "image/jpeg" | "image/png" } | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [manual, setManual] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const choosePhoto = async (file?: File) => {
    if (!file || busy || reading) return;
    setError("");
    const invalid = validateImageFile(file);
    if (invalid) { setError(invalid); return; }
    setReading(true);
    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error());
        reader.onerror = () => reject(new Error());
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = url;
      await image.decode();
      if (file.type !== "image/jpeg" && file.type !== "image/png") return;
      setPhoto({ url, name: file.name, mime: file.type });
      setResult(null); setSelected(null); setManual(false); setRevision((v) => v + 1);
    } catch { setError("This photo couldn't be opened. Choose another JPG or PNG."); }
    finally { setReading(false); }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    void choosePhoto(e.target.files?.[0]);
    e.target.value = "";
  };
  const recognize = async () => {
    if (!photo || busy) return;
    setBusy(true); setError(""); setResult(null); setManual(false);
    try {
      const response = await analyze({ data: { mime: photo.mime, base64: photo.url.split(",")[1] ?? "" } });
      setResult(response);
      if (!response.success) setError(response.error ?? "Couldn't recognize this dish. You can select it manually.");
      const top = response.success && response.is_food ? response.predictions[0] : null;
      const match = foods.find((f) => f.slug === top?.class_name);
      setSelected(match?.id ?? null);
      setRevision((v) => v + 1);
    } catch { setError("Couldn't analyze the photo. Check your connection or select the dish manually."); }
    finally { setBusy(false); }
  };
  const candidates = result?.success && result.is_food ? result.predictions : [];
  const predicted = candidates[0];

  return (
    <div className="space-y-8">
      <input ref={input} type="file" accept="image/jpeg,image/png" aria-label="Upload food photo" className="sr-only" onChange={onFile} disabled={busy || reading} />
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative flex aspect-[4/3] min-w-0 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void choosePhoto(e.dataTransfer.files[0]); }}>
          {photo ? <img src={photo.url} alt="Your uploaded food" className="h-full w-full object-contain" /> : (
            <div className="flex flex-col items-center gap-4 px-6 text-center">
              <Camera className="size-12 text-primary" strokeWidth={1.25} aria-hidden />
              <span className="font-display text-xl">Your next meal</span>
              <Button onClick={() => input.current?.click()} disabled={reading}><Upload /> {reading ? "Opening…" : "Choose photo"}</Button>
              <span className="text-xs text-muted-foreground">JPG or PNG · up to 5 MB</span>
            </div>
          )}
          {photo && <Button variant="secondary" size="icon" className="absolute right-3 top-3" aria-label="Remove photo" disabled={busy || reading} onClick={() => { setPhoto(null); setResult(null); setSelected(null); setError(""); setManual(false); }}><X /></Button>}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-5">
          <div>
            <h2 className="text-2xl font-semibold">{photo ? "Ready to recognize" : "A closer look at your plate"}</h2>
            {photo && <p className="mt-2 break-all text-sm text-muted-foreground">{photo.name}</p>}
          </div>
          {photo && <div className="flex flex-wrap gap-2">
            <Button onClick={recognize} disabled={busy || reading || result?.inference_available === false}>{busy ? <Loader2 className="motion-safe:animate-spin" /> : <Camera />} {busy ? "Recognizing…" : "Analyze photo"}</Button>
            <Button variant="outline" disabled={busy || reading} onClick={() => input.current?.click()}><Upload /> Change photo</Button>
          </div>}
          {error && <p role="alert" className="flex items-start gap-2 text-sm text-destructive"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{error}</p>}
          {result?.success && !result.is_food && <p role="status" className="text-sm text-muted-foreground">No food was detected. Choose a different photo or select your dish below.</p>}
          {result?.success && result.is_food && candidates.length === 0 && <p role="status" className="text-sm text-muted-foreground">No catalog match was found. Select your dish manually.</p>}
          {candidates.length > 0 && <div>
            <h3 className="mb-2 text-lg font-semibold">Possible matches</h3>
            <div className="space-y-2">
              {candidates.map((p) => {
                const food = foods.find((f) => f.slug === p.class_name);
                if (!food) return null;
                return <Button key={p.class_name} variant={selected === food.id ? "secondary" : "outline"} className="h-auto w-full justify-between whitespace-normal py-3 text-left" aria-pressed={selected === food.id} onClick={() => { setSelected(food.id); setRevision((v) => v + 1); }}>
                  <span>{food.name}</span><span className="shrink-0 text-xs text-muted-foreground">{Math.round(p.confidence * 100)}% match</span>
                </Button>;
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">AI match estimates are not calibrated probabilities. Confirm the dish and portion before saving.</p>
          </div>}
          <Button variant="link" className="h-auto self-start whitespace-normal px-0 text-left" disabled={busy} onClick={() => setManual((v) => !v)}>{manual ? "Hide manual selection" : "Select a dish manually"}</Button>
        </div>
      </section>
      {(manual || candidates.length > 0) && <section className="border-t pt-6">
        <h2 className="mb-5 text-2xl font-semibold">Confirm your meal</h2>
        <MealBuilder key={`${revision}-${manual}`} initialFoodId={selected} {...(predicted && result ? { imageMeta: { predicted_class: predicted.class_name, confidence: predicted.confidence, model_version: result.model_version } } : {})} />
      </section>}
    </div>
  );
}