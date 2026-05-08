"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "./report-pdf";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface DownloadPDFButtonProps {
  report?: any;
  reportId?: string;
  user?: any;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

export const DownloadPDFButton = ({
  report,
  reportId,
  user,
  variant = "default",
  size = "default",
  className = "",
  showText = true,
}: DownloadPDFButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);

    try {
      let reportData = report;

      // If report is not provided but reportId is, fetch it
      if (!reportData && reportId) {
        const res = await apiClient.get(`/reports/${reportId}`);
        reportData = res.data.data;
      }

      if (!reportData) {
        throw new Error("No report data available");
      }

      // Small delay to show loading state if it's too fast
      await new Promise((resolve) => setTimeout(resolve, 500));

      const doc = <ReportPDF report={reportData} user={user} />;
      const blob = await pdf(doc).toBlob();
      
      const fileName = `session-report-${reportData.sessionId || reportData._id}.pdf`;
      saveAs(blob, fileName);
      
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${showText ? "gap-2" : ""} ${className}`}
      onClick={handleDownload}
      disabled={isGenerating}
      title="Download PDF"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showText && (isGenerating ? "Generating..." : "Download PDF")}
    </Button>
  );
};
