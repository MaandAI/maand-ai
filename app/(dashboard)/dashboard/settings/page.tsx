"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useSettings } from "@/hooks/use-settings";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SecuritySettings } from "@/components/user/security-settings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Bell,
  Shield,
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Download,
  Lock,
  LogOut,
  Loader2,
  CheckCircle,
  Eye,
  Languages,
  Clock,
  BrainCircuit,
  MessageSquare,
  FileText,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Deep-get helper ─────────────────────────────────────────────────────────
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

// ─── Deep-set helper (returns new object) ────────────────────────────────────
function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const result = JSON.parse(JSON.stringify(obj ?? {}));
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== "object") {
      cur[keys[i]] = {};
    }
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return result;
}

// ─── Navigation config ───────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: "general",
    label: "General",
    icon: Globe,
    description: "Display, language & accessibility",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Alerts, emails & activity",
  },
  {
    id: "security",
    label: "Security & Privacy",
    icon: Shield,
    description: "2FA, sessions & data control",
  },
  {
    id: "ai",
    label: "AI & Chat",
    icon: Sparkles,
    description: "Model behaviour & memory",
  },
];

// ─── Reusable row components ──────────────────────────────────────────────────
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: any;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 px-1 border-b border-border/40 last:border-0 gap-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="shrink-0 h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 border border-border/60 shadow-sm bg-card rounded-2xl">
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6 rounded-2xl">
          <Skeleton className="h-5 w-40 mb-4" />
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

// ─── General Tab ─────────────────────────────────────────────────────────────
function GeneralTab({ local, onUpdate }: { local: any; onUpdate: (path: string, val: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="Appearance" description="Customise how Maand looks on your device.">
        {/* Theme selector */}
        <div className="py-4 border-b border-border/40">
          <p className="text-sm font-semibold mb-3">Interface Theme</p>
          <div className="flex gap-2">
            {[
              { id: "light", label: "Light", icon: Sun },
              { id: "dark", label: "Dark", icon: Moon },
              { id: "system", label: "System", icon: Monitor },
            ].map(({ id, label, icon: Icon }) => {
              const active = (local?.theme || "system") === id;
              return (
                <button
                  key={id}
                  onClick={() => onUpdate("theme", id)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all duration-150",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <SettingRow
          icon={Eye}
          label="High Contrast Mode"
          description="Increases colour contrast for better accessibility"
        >
          <Switch
            checked={local?.highContrast ?? false}
            onCheckedChange={(v) => onUpdate("highContrast", v)}
          />
        </SettingRow>
      </SectionCard>

      <SectionCard title="Regional" description="Language and time preferences.">
        <SettingRow icon={Languages} label="Language" description="Set your preferred display language">
          <Select value={local?.language || "en"} onValueChange={(v) => onUpdate("language", v)}>
            <SelectTrigger className="w-40 rounded-xl h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="uk">English (UK)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="ur">اردو</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow icon={Clock} label="Timezone" description="Used for scheduling and session timestamps">
          <Select value={local?.timezone || "auto"} onValueChange={(v) => onUpdate("timezone", v)}>
            <SelectTrigger className="w-44 rounded-xl h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="utc">UTC (Universal)</SelectItem>
              <SelectItem value="est">EST (Eastern)</SelectItem>
              <SelectItem value="pst">PST (Pacific)</SelectItem>
              <SelectItem value="gmt">GMT (London)</SelectItem>
              <SelectItem value="ist">IST (Pakistan/India)</SelectItem>
              <SelectItem value="cst">CST (China)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab({ local, onUpdate }: { local: any; onUpdate: (path: string, val: any) => void }) {
  const inAppItems = [
    { path: "notifications.session", icon: Wifi, label: "Session Activity", desc: "Alerts when a therapy session is completed or reaches a milestone" },
    { path: "notifications.report", icon: FileText, label: "Report Generation", desc: "Notified when your AI clinical report is ready to view" },
    { path: "notifications.security", icon: ShieldCheck, label: "Security Alerts", desc: "Login activity, password changes, and device access" },
  ];

  return (
    <div className="space-y-5">
      <SectionCard title="In-App Notifications" description="Control which events trigger notifications inside the dashboard.">
        {inAppItems.map((item) => (
          <SettingRow key={item.path} icon={item.icon} label={item.label} description={item.desc}>
            <Switch
              checked={getNestedValue(local, item.path) ?? true}
              onCheckedChange={(v) => onUpdate(item.path, v)}
            />
          </SettingRow>
        ))}
      </SectionCard>

      <SectionCard title="Email Channels" description="Manage external email communications.">
        <SettingRow icon={Bell} label="Weekly Email Summary" description="A weekly digest of your therapeutic progress and insights">
          <Switch
            checked={local?.notifications?.email ?? true}
            onCheckedChange={(v) => onUpdate("notifications.email", v)}
          />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── AI Tab ────────────────────────────────────────────────────────────────────
function AITab({ local, onUpdate }: { local: any; onUpdate: (path: string, val: any) => void }) {
  return (
    <div className="space-y-5">
      <SectionCard title="AI Behaviour" description="Control how the clinical AI model responds to you.">
        <SettingRow icon={FileText} label="Auto-Generate Reports" description="Automatically produce a clinical insight report after each session ends">
          <Switch
            checked={local?.aiPreferences?.autoReport ?? true}
            onCheckedChange={(v) => onUpdate("aiPreferences.autoReport", v)}
          />
        </SettingRow>

        <SettingRow icon={BrainCircuit} label="Context Memory" description="Allow the AI to reference summaries from your previous sessions">
          <Switch
            checked={local?.aiPreferences?.contextPreservation ?? true}
            onCheckedChange={(v) => onUpdate("aiPreferences.contextPreservation", v)}
          />
        </SettingRow>

        <div className="py-4 border-b border-border/40 last:border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="shrink-0 h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Interaction Style</p>
              <p className="text-xs text-muted-foreground mt-0.5">How the AI therapist communicates with you</p>
            </div>
          </div>
          <Select
            value={local?.aiPreferences?.responseStyle || "empathetic"}
            onValueChange={(v) => onUpdate("aiPreferences.responseStyle", v)}
          >
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="empathetic">Empathetic — Warm, supportive, and gentle</SelectItem>
              <SelectItem value="direct">Clinical — Direct, evidence-based, and structured</SelectItem>
              <SelectItem value="analytical">Analytical — Deconstructive, probing, and Socratic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ session }: { session: any }) {
  return (
    <div className="space-y-5">
      {/* 2FA Section */}
      <SecuritySettings user={session?.user} />

      {/* Data controls */}
      <SectionCard title="Data & Privacy" description="Manage your clinical data and account sovereignty.">
        <SettingRow icon={Download} label="Export My Data" description="Download a full copy of your clinical history as an encrypted JSON file">
          <Button variant="outline" size="sm" className="rounded-xl h-9 gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </SettingRow>

        <SettingRow icon={Lock} label="Terminate All Sessions" description="Sign out of Maand on every device immediately">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950"
            onClick={() => {
              if (confirm("This will sign you out of all devices. Continue?")) {
                fetch("/api/user/logout-all", { method: "POST" }).finally(() =>
                  signOut({ callbackUrl: "/login" })
                );
              }
            }}
          >
            Sign Out All
          </Button>
        </SettingRow>
      </SectionCard>
    </div>
  );
}

// ─── Main content component ───────────────────────────────────────────────────
function SettingsContent() {
  const { data: session } = useSession();
  const { settings, updateSettings, isLoading, isSaving } = useSettings();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  const [local, setLocal] = useState<any>(null);
  const [saveIndicator, setSaveIndicator] = useState<"idle" | "saving" | "saved">("idle");

  // Sync local state from settings (only on first load or external reset)
  useEffect(() => {
    if (settings && local === null) {
      setLocal(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, local]);

  // Debounced save indicator
  useEffect(() => {
    if (isSaving) {
      setSaveIndicator("saving");
    } else if (saveIndicator === "saving") {
      setSaveIndicator("saved");
      const t = setTimeout(() => setSaveIndicator("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [isSaving]);

  const handleUpdate = useCallback(
    async (path: string, value: any) => {
      if (!local) return;
      const updated = setNestedValue(local, path, value);
      setLocal(updated);
      await updateSettings(updated);
    },
    [local, updateSettings]
  );

  const renderTab = () => {
    if (!local) return <SettingsSkeleton />;
    switch (activeTab) {
      case "general": return <GeneralTab local={local} onUpdate={handleUpdate} />;
      case "notifications": return <NotificationsTab local={local} onUpdate={handleUpdate} />;
      case "security": return <SecurityTab session={session} />;
      case "ai": return <AITab local={local} onUpdate={handleUpdate} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          {saveIndicator === "saving" && (
            <Badge variant="secondary" className="gap-1.5 text-xs animate-in fade-in">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving…
            </Badge>
          )}
          {saveIndicator === "saved" && (
            <Badge variant="secondary" className="gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 animate-in fade-in">
              <CheckCircle className="h-3 w-3" />
              Saved
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences, security, and AI experience.
        </p>
      </div>

      {/* Layout: sidebar + content */}
      <div className="flex gap-8 items-start">
        {/* Sidebar nav — fixed width, no shifting */}
        <aside className="w-56 shrink-0 sticky top-24 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left group",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border/50">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all text-sm font-medium"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content area — fills remaining space, stable min-height */}
        <div className="flex-1 min-w-0 min-h-[600px]">
          {isLoading && local === null ? (
            <SettingsSkeleton />
          ) : (
            <div key={activeTab} className="animate-in fade-in duration-200">
              {renderTab()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
