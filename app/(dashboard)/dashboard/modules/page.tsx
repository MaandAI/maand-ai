"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModulesAPI } from "@/hooks/api/useModules";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Search, Play, Brain, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function ModulesContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const { modules = [], loading, error, refresh } = useModulesAPI();

  const filteredModules = useMemo(() => {
    console.log("New modules", modules);
    return modules.filter((module: any) => {
      const title = module?.name?.toLowerCase() || "";
      const description = module?.description?.toLowerCase() || "";

      return (
        title.includes(searchQuery.toLowerCase()) ||
        description.includes(searchQuery.toLowerCase())
      );
    });
  }, [modules, searchQuery]);

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-lg rounded-[2rem] border-destructive/20">
          <CardContent className="p-10 text-center space-y-4">
            <Brain className="mx-auto h-12 w-12 text-destructive/60" />

            <div className="space-y-2">
              <h2 className="text-2xl font-black">Failed to Load Modules</h2>

              <p className="text-muted-foreground text-sm">
                Something went wrong while fetching your therapeutic pathways.
              </p>
            </div>

            <Button onClick={() => refresh()} className="rounded-2xl">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-primary/20 via-primary/5 to-background p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
              Therapeutic Pathways
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refresh()}
              className="h-8 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Sync Pathways
            </Button>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Your Guided <span className="text-primary">Journey</span>
            </h1>

            <p className="text-lg leading-relaxed text-muted-foreground">
              Scientifically backed, AI-powered modules designed to help you
              master emotional regulation, resilience, and clinical growth.
            </p>
          </div>

          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search your path..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-2xl border-primary/10 bg-background/60 pl-11 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Decorative blur circles */}
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-[320px] w-full rounded-[2rem]" />
          ))}
        </div>
      ) : filteredModules.length === 0 ? (
        /* EMPTY */
        <div className="rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-muted/20 py-24 text-center">
          <Brain className="mx-auto mb-5 h-14 w-14 text-primary/20" />

          <h3 className="text-2xl font-black">No pathways found</h3>

          <p className="mt-2 text-muted-foreground">
            Try a different search term or explore new categories.
          </p>
        </div>
      ) : (
        /* MODULES */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filteredModules.map((module: any) => {
            const progress = module?.userProgress?.progressPercentage ?? 0;

            const status = module?.userProgress?.status ?? "not_started";

            return (
              <Card
                key={module?._id}
                className="group relative overflow-hidden rounded-[2rem] border border-primary/10 bg-card/60 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <CardHeader className="relative z-10 p-8 pb-4">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Brain className="h-7 w-7" />
                    </div>

                    <Badge className="border-primary/10 bg-background/80 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                      {module?.category || "General"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <CardTitle className="text-2xl font-black tracking-tight transition-colors group-hover:text-primary">
                      {module?.title || "Untitled Module"}
                    </CardTitle>

                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                      {module?.description || "No description available."}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-8 p-8 pt-2">
                  {/* PROGRESS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Journey Progress</span>

                      <span className="text-primary">{progress}%</span>
                    </div>

                    <Progress value={progress} className="h-2 rounded-full" />
                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Play className="h-3.5 w-3.5" />

                      <span>{module?.totalStages ?? 0} Stages</span>
                    </div>

                    <Button
                      asChild
                      className="h-12 rounded-2xl px-8 font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Link
                        href={
                          module?.slug
                            ? `/dashboard/modules/${module.slug}`
                            : "#"
                        }
                      >
                        {status === "not_started"
                          ? "Begin Journey"
                          : "Continue Path"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ModulesPage() {
  return (
    <ProtectedRoute>
      <ModulesContent />
    </ProtectedRoute>
  );
}
