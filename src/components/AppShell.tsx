import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { BarChart3, BookOpen, Calculator, Camera, History, Home, Info, LogIn, LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/analyze", label: "Analyze food", icon: Camera },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/history", label: "Meal history", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/foods", label: "Supported foods", icon: BookOpen },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/about", label: "Methodology", icon: Info },
] as const;
const MOBILE = ["/", "/analyze", "/history", "/insights", "/foods"];

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src={logo} alt="" width={size} height={size} className="shrink-0" />
      <span className="font-display text-lg font-semibold leading-none">
        ThaliSense <span className="text-saffron">AI</span>
      </span>
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  if (pathname.startsWith("/auth") || pathname.startsWith("/reset-password")) return <>{children}</>;

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); };

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-8 px-2 pt-2"><Logo /></Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground">
              <Icon className="size-4" aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="border-t pt-4">
            <p className="truncate px-2 text-xs text-muted-foreground">{user.email}</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
          </div>
        ) : (
          <Button asChild size="sm"><Link to="/auth"><LogIn className="size-4" /> Sign in</Link></Button>
        )}
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/"><Logo size={30} /></Link>
        <div className="flex gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Calculator"><Link to="/calculator"><Calculator className="size-5" /></Link></Button>
          <Button asChild variant="ghost" size="icon" aria-label="Profile"><Link to={user ? "/profile" : "/auth"}><User className="size-5" /></Link></Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10">{children}</main>

      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card md:hidden">
        {NAV.filter((n) => MOBILE.includes(n.to)).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground data-[status=active]:text-primary">
            <Icon className="size-5" aria-hidden /> {label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: typeof Home; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-accent p-3 text-accent-foreground"><Icon className="size-6" aria-hidden /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
