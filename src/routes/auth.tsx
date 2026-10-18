import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/AppShell";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({ meta: [{ title: "Sign in — ThaliSense AI" }, { name: "description", content: "Sign in to ThaliSense AI." }, { property: "og:title", content: "Sign in — ThaliSense AI" }, { property: "og:description", content: "Sign in to ThaliSense AI." }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg("");
    const r = mode === "in" ? await supabase.auth.signInWithPassword({ email, password: pw })
      : await supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: window.location.origin } });
    if (r.error) return setMsg(r.error.message);
    if (mode === "up" && !r.data.session) return setMsg("Check your email to confirm your account.");
    navigate({ to: "/" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="card-surface w-full max-w-sm space-y-4 p-8">
        <Logo />
        <h1 className="text-2xl font-semibold">{mode === "in" ? "Sign in" : "Create account"}</h1>
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" required minLength={6} placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
        {msg && <p className="text-sm text-destructive">{msg}</p>}
        <Button type="submit" className="w-full">{mode === "in" ? "Sign in" : "Sign up"}</Button>
        <Button type="button" variant="outline" className="w-full" onClick={() => lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })}>Continue with Google</Button>
        <button type="button" className="text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}</button>
      </form>
    </div>
  );
}
