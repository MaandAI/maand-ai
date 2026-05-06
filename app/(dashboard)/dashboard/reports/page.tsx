"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogScrollArea,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/reports");
      setReports(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openReport = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Clinical Portfolio
          </h1>
          <p className="text-muted-foreground">
            Detailed insights and analysis from your therapeutic sessions
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <Card
              key={report._id}
              className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col"
            >
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
              <CardFooter className="pt-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-primary font-bold text-xs uppercase tracking-widest group/btn"
                  onClick={() => openReport(report)}
                >
                  View Full Insights
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl">
          {selectedReport && (
            <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl">
              <div className="p-8 border-b bg-primary/5">
                <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                  <ShieldCheck className="h-4 w-4" />
                  Clinical Evaluation
                </div>
                <DialogTitle className="text-3xl font-extrabold mb-1">
                  {selectedReport.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />{" "}
                    {format(new Date(selectedReport.createdAt), "PPPP")}
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1 p-8">
                <div className="space-y-10 pb-10">
                  {/* Summary Section */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                      Executive Summary
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-lg italic bg-muted/30 p-6 rounded-2xl border">
                      "{selectedReport.summary}"
                    </p>
                  </section>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Key Topics */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-md font-bold text-primary/80">
                        <MessageSquare className="h-4 w-4" />
                        Key Topics Discussed
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.keyTopics?.map(
                          (topic: string, i: number) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="px-3 py-1 border-primary/20 bg-primary/5"
                            >
                              {topic}
                            </Badge>
                          ),
                        )}
                      </div>
                    </section>

                    {/* Emotional Trends */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-md font-bold text-amber-500">
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
                              <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
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
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
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
                      <p className="text-sm text-muted-foreground bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                        {selectedReport.riskAssessment}
                      </p>
                    </section>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-muted/20 flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close Portfolio
                </Button>
                <Button
                  className="rounded-lg gap-2"
                  onClick={() =>
                    window.open(selectedReport.contentUrl, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4" />
                  Source Document (JSON)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
