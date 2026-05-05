"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { GoalSetting } from "@/components/therapy/goal-setting";
import { cn } from "@/lib/utils";
import { AvatarState } from "@/types/therapy";

interface ToolsSidebarProps {
  avatarState: AvatarState;
  avatarEnabled: boolean;
  personaDescription: string;
  onPersonaChange: (description: string) => void;
  sessionId: string | null;
  className?: string;
}

export function ToolsSidebar({
  avatarState,
  avatarEnabled,
  personaDescription,
  onPersonaChange,
  sessionId,
  className,
}: ToolsSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-6 shrink-0", className)}>
      <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden rounded-[2rem] border border-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black opacity-60">Session Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <AvatarDisplay state={avatarState} enabled={avatarEnabled} size="md" />
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center gap-2.5">
              <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", {
                "bg-blue-400 animate-pulse": avatarState === "calm",
                "bg-amber-400": avatarState === "thinking",
                "bg-green-400": avatarState === "listening",
                "bg-pink-400": avatarState === "supportive",
                "bg-purple-400": avatarState === "reflective",
              })} />
              <span className="text-sm font-black uppercase tracking-widest text-foreground">{avatarState}</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium italic px-6 leading-relaxed">
              {avatarState === "listening" ? "Listening closely to your thoughts..." : "Present and ready to support you."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md rounded-[2rem] border border-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Persona Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe how your assistant should speak..."
            value={personaDescription}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="text-xs min-h-[100px] bg-muted/30 border-none resize-none rounded-xl"
          />
          <p className="text-[10px] text-muted-foreground mt-2 italic">Changes take effect in next response.</p>
        </CardContent>
      </Card>

      <GoalSetting sessionId={sessionId} />
    </div>
  );
}
