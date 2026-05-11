"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Calendar,
  TrendingUp,
  Target,
  ExternalLink,
  Search,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { DownloadPDFButton } from "@/components/reports/download-pdf-button";
import { useAuth } from "@/hooks/useAuth";

function ReportsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Fetch all reports ──
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reports");
      return res.data.data as any[];
    } catch (err) {
      console.error("Failed to fetch reports", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ── On mount: load reports, then open the highlighted one if ?report= is set ──
  useEffect(() => {
    const highlightId =
      searchParams.get("report") || searchParams.get("highlight");
    fetchReports().then((data) => {
      setReports(data);
      if (highlightId) {
        const target = data.find((r) => r._id === highlightId);
        if (target) {
          setSelectedReport(target);
          setIsModalOpen(true);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync modal open/close to ?report= query param ──
  const openReport = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    const url = new URL(window.location.href);
    url.searchParams.set("report", report._id);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("report");
    url.searchParams.delete("highlight");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  // ── Favorite toggle ──
  const toggleFavorite = async (e: React.MouseEvent, report: any) => {
    e.stopPropagation();
    try {
      const newStatus = !report.isFavorite;
      const res = await apiClient.patch(`/reports/${report._id}/favorite`, {
        isFavorite: newStatus,
      });
      if (res.data.success) {
        setReports((prev) =>
          prev.map((r) =>
            r._id === report._id ? { ...r, isFavorite: newStatus } : r,
          ),
        );
        if (selectedReport?._id === report._id) {
          setSelectedReport((prev: any) => ({
            ...prev,
            isFavorite: newStatus,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || r.isFavorite;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Clinical Portfolio
          </h1>
          <p className="text-muted-foreground">
            Detailed insights and analysis from your therapeutic sessions
          </p>
        </div>

        <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-2xl border border-primary/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none focus:ring-0 text-sm pl-9 pr-4 py-2 w-48 md:w-64"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 h-9",
                filter === "all"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground",
              )}
            >
              All
            </Button>
            <Button
              variant={filter === "favorites" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("favorites")}
              className={cn(
                "rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 h-9 flex items-center gap-2",
                filter === "favorites"
                  ? "bg-background shadow-sm text-amber-500"
                  : "text-muted-foreground",
              )}
            >
              <Star
                className={cn(
                  "h-3 w-3",
                  filter === "favorites" && "fill-amber-500",
                )}
              />
              Saved
            </Button>
          </div>
        </div>
      </div>

      {/* ── Report cards grid ── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card
              key={report._id}
              className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col relative"
            >
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-4 right-4 z-10 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                  report.isFavorite
                    ? "opacity-100 text-amber-500 bg-amber-500/10"
                    : "bg-background/50 backdrop-blur-sm",
                )}
                onClick={(e) => toggleFavorite(e, report)}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    report.isFavorite && "fill-amber-500",
                  )}
                />
              </Button>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {format(new Date(report.createdAt), "MMM d, yyyy")}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {report.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {report.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-amber-500" />
                    <span>Mood Trend Identified</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(report.keyTopics || [])
                      .slice(0, 3)
                      .map((topic: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-[9px] bg-muted/50 border-none px-2"
                        >
                          {topic}
                        </Badge>
                      ))}
                    {report.keyTopics?.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{report.keyTopics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex items-center justify-between gap-2 border-t border-primary/5 mt-auto bg-primary/[0.02] p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary font-bold text-xs uppercase tracking-widest group/btn hover:bg-transparent p-0 h-auto"
                  onClick={() => openReport(report)}
                >
                  View Insights
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
                <DownloadPDFButton
                  report={report}
                  user={profile}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/10 hover:bg-primary/5 hover:text-primary transition-all"
                  showText={false}
                />
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full flex flex-col items-center justify-center p-20 text-center border-dashed bg-transparent border-muted-foreground/20">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-muted-foreground opacity-30" />
            </div>
            <CardTitle className="text-2xl mb-2">Portfolio is Empty</CardTitle>
            <CardDescription className="max-w-xs mx-auto mb-8">
              Clinical reports are generated automatically after you complete a
              therapy session.
            </CardDescription>
            <Button asChild className="rounded-xl">
              <Link href="/dashboard/sessions">Complete an Active Session</Link>
            </Button>
          </Card>
        )}
      </div>

      {/* ── Report detail modal ── */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden border-none shadow-2xl bg-background/95 backdrop-blur-xl">
          {selectedReport && (
            // Fixed-height flex column: header pinned top, footer pinned bottom, only middle scrolls
            <div className="flex flex-col h-[85vh]">
              {/* ── Modal header (pinned) ── */}
              <div className="shrink-0 px-8 pt-8 pb-6 border-b bg-primary/5">
                <div className="flex items-center justify-between gap-3 text-primary font-bold text-xs uppercase tracking-widest mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Clinical Evaluation
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-full gap-2 px-3 h-8",
                      selectedReport.isFavorite
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-muted-foreground",
                    )}
                    onClick={(e) => toggleFavorite(e, selectedReport)}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        selectedReport.isFavorite && "fill-amber-500",
                      )}
                    />
                    {selectedReport.isFavorite ? "Saved" : "Save to Portfolio"}
                  </Button>
                </div>
                <DialogTitle className="text-2xl font-extrabold leading-tight mb-2">
                  {selectedReport.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(selectedReport.createdAt), "PPPP")}
                  </span>
                </div>
              </div>

              {/* ── Scrollable body (only this region scrolls) ── */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-8 py-8 space-y-10">
                  {/* Summary */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      Executive Summary
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-base italic bg-muted/30 p-6 rounded-2xl border">
                      "{selectedReport.summary}"
                    </p>
                  </section>

                  <div className="grid md:grid-cols-1 gap-8 ">
                    {/* Key Topics */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 font-bold text-primary/80">
                        <MessageSquare className="h-4 w-4" />
                        Key Topics Discussed
                      </div>
                      <div className="flex flex-col gap-2">
                        {selectedReport.keyTopics?.map(
                          (topic: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="w-full px-3 py-2 border-primary/20 bg-primary/5 whitespace-normal break-words text-left"
                            >
                              {topic}
                            </Badge>
                          ),
                        )}
                      </div>
                    </section>

                    {/* Emotional Patterns */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 font-bold text-amber-500">
                        <TrendingUp className="h-4 w-4" />
                        Emotional Patterns
                      </div>
                      <ul className="space-y-2">
                        {selectedReport.emotionalTrends?.map(
                          (trend: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-center gap-3 text-sm text-muted-foreground"
                            >
                              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                              {trend}
                            </li>
                          ),
                        )}
                      </ul>
                    </section>
                  </div>

                  {/* Recommendations */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-emerald-500">
                      <Target className="h-5 w-5" />
                      Therapeutic Recommendations
                    </div>
                    <div className="grid gap-3">
                      {selectedReport.recommendations?.map(
                        (rec: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                          >
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                            <p className="text-sm leading-relaxed">{rec}</p>
                          </div>
                        ),
                      )}
                    </div>
                  </section>

                  {/* Risk Assessment */}
                  {selectedReport.riskAssessment && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-lg font-bold text-red-500">
                        <AlertTriangle className="h-5 w-5" />
                        Clinical Observations & Risk
                      </div>
                      <p className="text-sm text-muted-foreground bg-red-500/5 border border-red-500/10 p-4 rounded-xl leading-relaxed">
                        {selectedReport.riskAssessment}
                      </p>
                    </section>
                  )}
                </div>
              </ScrollArea>

              {/* ── Modal footer (pinned) ── */}
              <div className="shrink-0 px-6 py-4 border-t bg-muted/20 flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={closeModal}
                >
                  Close
                </Button>
                {selectedReport.contentUrl && (
                  <Button
                    variant="secondary"
                    className="rounded-lg gap-2"
                    onClick={() =>
                      window.open(selectedReport.contentUrl, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    JSON
                  </Button>
                )}
                <DownloadPDFButton
                  report={selectedReport}
                  user={profile}
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 pb-10">
          <div className="flex flex-col gap-2">
            <div className="h-9 w-64 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-muted/30 rounded-lg animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <ReportsPageInner />
    </Suspense>
  );
}
