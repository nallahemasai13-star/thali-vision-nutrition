import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — ThaliSense AI" }, { name: "description", content: "Your display name and daily nutrition goals." }, { property: "og:title", content: "Profile — ThaliSense AI" }, { property: "og:description", content: "Your display name and daily nutrition goals." }] }),
  component: Profile,
});

const FIELDS = [["display_name", "Display name", "text"], ["calorie_goal", "Daily calorie goal (kcal)", "number"], ["protein_goal", "Daily protein goal (g)", "number"], ["carbs_goal", "Daily carbs goal (g)", "number"], ["fat_goal", "Daily fat goal (g)", "number"]] as const;
type Key = (typeof FIELDS)[number][0];

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient(); const navigate = useNavigate();
  const profile = useQuery({ ...profileQuery(user?.id ?? ""), enabled: !!user });
  const [form, setForm] = useState<Record<Key, string>>({ display_name: "", calorie_goal: "", protein_goal: "", carbs_goal: "", fat_goal: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const p = profile.data; if (!p) return;
    setForm({ display_name: p.display_name ?? "", calorie_goal: p.calorie_goal?.toString() ?? "", protein_goal: p.protein_goal?.toString() ?? "", carbs_goal: p.carbs_goal?.toString() ?? "", fat_goal: p.fat_goal?.toString() ?? "" });
  }, [profile.data]);

  const num = (v: string) => (v.trim() === "" ? null : Number(v));
  const invalid = FIELDS.some(([k, , t]) => t === "number" && form[k] !== "" && !(Number(form[k]) > 0 && Number(form[k]) < 100000));
  const save = async () => {
    if (!user || invalid) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, display_name: form.display_name.trim() || null, calorie_goal: num(form.calorie_goal), protein_goal: num(form.protein_goal), carbs_goal: num(form.carbs_goal), fat_goal: num(form.fat_goal) });
    setSaving(false);
    if (error) { toast.error("Couldn't save your profile."); return; }
    toast.success("Profile saved."); qc.invalidateQueries({ queryKey: ["profile"] });
  };

  return <div className="max-w-xl">
    <PageHeader title="Profile" description={user?.email ?? ""} />
    {profile.isError && <p role="alert" className="mb-4 text-sm text-destructive">Couldn't load your profile.</p>}
    <div className="card-surface space-y-4 p-6">
      {FIELDS.map(([k, label, type]) => <div key={k}>
        <Label htmlFor={k}>{label}</Label>
        <Input id={k} type={type} min={type === "number" ? 1 : undefined} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1.5" />
      </div>)}
      {invalid && <p className="text-xs text-destructive">Goals must be positive numbers.</p>}
      <p className="text-xs text-muted-foreground">Goals are your own targets, not medical advice.</p>
      <Button onClick={save} disabled={saving || invalid || profile.isLoading}>{saving ? "Saving…" : "Save profile"}</Button>
    </div>
    <Button variant="outline" className="mt-6" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); }}><LogOut /> Sign out</Button>
  </div>;
}
