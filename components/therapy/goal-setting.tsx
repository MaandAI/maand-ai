"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Goal {
  _id: string;
  text: string;
  completed: boolean;
}

export function GoalSetting({ sessionId }: { sessionId?: string | null }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [sessionId]);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (data.success) setGoals(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newGoal.trim(), sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setGoals([data.data, ...goals]);
        setNewGoal("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (res.ok) {
        setGoals(goals.map((g) => (g._id === id ? { ...g, completed } : g)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Session Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={addGoal} className="flex gap-2">
          <Input
            placeholder="Add a goal..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="h-9 text-xs bg-muted/30 border-none rounded-xl"
            disabled={adding}
          />
          <Button type="submit" size="icon" className="h-9 w-9 rounded-xl shadow-md" disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>

        <ScrollArea className="h-[150px] pr-4">
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {goals.map((goal) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-2 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group"
                >
                  <Checkbox
                    checked={goal.completed}
                    onCheckedChange={(checked) => toggleGoal(goal._id, checked as boolean)}
                    className="rounded-md border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <span className={cn(
                    "text-xs transition-all",
                    goal.completed ? "text-muted-foreground line-through" : "text-foreground font-medium"
                  )}>
                    {goal.text}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {!loading && goals.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground italic py-4">No goals set yet.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
