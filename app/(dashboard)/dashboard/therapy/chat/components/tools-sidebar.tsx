"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AvatarDisplay } from "@/components/avatar/avatar-display";
import { GoalSetting } from "@/components/therapy/goal-setting";
import { cn } from "@/lib/utils";
import { AvatarState } from "../types";

interface ToolsSidebarProps {
  avatarState: AvatarState;
  avatarEnabled: boolean;
  personaDescription: string;
  onPersonaChange: (description: string) => void;
  sessionId: string | null;
}

export function ToolsSidebar({
  avatarState,
  avatarEnabled,
  personaDescription,
  onPersonaChange,
  sessionId,
}: ToolsSidebarProps) {
  return (
    <div className="hidden xl:flex flex-col gap-6 w-72 shrink-0">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Session Avatar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          <AvatarDisplay state={avatarState} enabled={avatarEnabled} size="lg" />
          <div className="mt-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", {
                "bg-blue-400 animate-pulse": avatarState === "calm",
                "bg-amber-400": avatarState === "thinking",
                "bg-green-400": avatarState === "listening",
                "bg-pink-400": avatarState === "supportive",
                "bg-purple-400": avatarState === "reflective",
              })} />
              <span className="text-sm font-bold capitalize">{avatarState}</span>
            </div>
            <p className="text-xs text-muted-foreground italic px-4">
              {avatarState === "listening" ? "Listening closely to your thoughts..." : "Present and ready to support you."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
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
