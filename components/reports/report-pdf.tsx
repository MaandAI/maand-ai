import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    paddingBottom: 60,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#374151",
  },

  // ─── Top Banner
  topBanner: {
    backgroundColor: "#1c2b25",
    paddingHorizontal: 50,
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 3,
  },
  brandSub: {
    fontSize: 7.5,
    color: "#10b981",
    letterSpacing: 2,
    marginTop: 4,
  },
  docMetaLine: {
    fontSize: 7.5,
    color: "#86efac",
    marginBottom: 2,
    textAlign: "right",
  },

  // ─── Green stripe
  stripe: {
    height: 4,
    backgroundColor: "#059669",
  },

  // ─── Body
  body: {
    paddingHorizontal: 50,
    paddingTop: 28,
  },

  // ─── Title block
  titleBlock: {
    borderLeft: 3,
    borderLeftColor: "#059669",
    paddingLeft: 12,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0a0f0d",
    marginBottom: 3,
  },
  titleSub: {
    fontSize: 8,
    color: "#6b7280",
    letterSpacing: 0.3,
  },

  // ─── Meta strip
  metaStrip: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderTop: 1,
    borderTopColor: "#a7f3d0",
    borderBottom: 1,
    borderBottomColor: "#a7f3d0",
    marginBottom: 24,
  },
  metaCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRight: 1,
    borderRightColor: "#d1fae5",
  },
  metaCellLast: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: {
    fontSize: 6.5,
    letterSpacing: 1.5,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    color: "#1c2b25",
    fontFamily: "Helvetica-Bold",
  },

  // ─── Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionDot: {
    width: 5,
    height: 5,
    backgroundColor: "#059669",
    borderRadius: 3,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    letterSpacing: 1.8,
  },
  sectionLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: "#e5e7eb",
    marginLeft: 10,
  },

  section: {
    marginBottom: 20,
  },

  // ─── Summary
  summaryBox: {
    backgroundColor: "#f0fdf4",
    borderLeft: 4,
    borderLeftColor: "#059669",
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 22,
  },
  summaryText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Oblique",
    color: "#1c2b25",
    lineHeight: 1.7,
  },

  // ─── Two-column
  twoCol: {
    flexDirection: "row",
    marginBottom: 22,
  },
  colLeft: {
    flex: 1,
    marginRight: 20,
  },
  col: {
    flex: 1,
  },

  // ─── Badges
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: "#ecfdf5",
    border: 0.5,
    borderColor: "#6ee7b7",
    borderRadius: 20,
    fontSize: 8,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
    marginRight: 5,
    marginBottom: 5,
  },

  // ─── Bullet list
  listItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  listBullet: {
    width: 14,
    color: "#059669",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  listText: {
    flex: 1,
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.5,
  },

  // ─── Recommendations
  recItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    borderLeft: 2,
    borderLeftColor: "#10b981",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 6,
  },
  recIndex: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginRight: 10,
    width: 14,
  },
  recText: {
    flex: 1,
    fontSize: 9.5,
    color: "#374151",
    lineHeight: 1.5,
  },

  // ─── Risk block
  riskBlock: {
    backgroundColor: "#fff7f7",
    borderLeft: 4,
    borderLeftColor: "#dc2626",
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 14,
  },
  riskTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#7f1d1d",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  riskText: {
    fontSize: 9.5,
    color: "#991b1b",
    lineHeight: 1.5,
  },

  // ─── Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1c2b25",
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 50,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#86efac",
  },
});

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionDot} />
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.sectionLine} />
  </View>
);

interface ReportPDFProps {
  report: any;
  user?: any;
}

export const ReportPDF = ({ report, user }: ReportPDFProps) => {
  const date = report.createdAt ? new Date(report.createdAt) : new Date();
  const docId = report._id?.substring(0, 8).toUpperCase() ?? "—";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Banner */}
        <View style={styles.topBanner}>
          <View>
            <Text style={styles.brandName}>MAAND</Text>
            <Text style={styles.brandSub}>Clinical Session Portfolio</Text>
          </View>
          <View>
            <Text style={styles.docMetaLine}>DOC — {docId}</Text>
            <Text style={styles.docMetaLine}>
              Issued {format(new Date(), "dd MMM yyyy")}
            </Text>
          </View>
        </View>

        {/* Stripe */}
        <View style={styles.stripe} />

        {/* Body */}
        <View style={styles.body}>
          {/* Title */}
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>{report.title}</Text>
            <Text style={styles.titleSub}>
              Therapeutic Evaluation · Session Record
            </Text>
          </View>

          {/* Meta Strip */}
          <View style={styles.metaStrip}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>SESSION DATE</Text>
              <Text style={styles.metaValue}>
                {format(date, "MMMM d, yyyy")}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>PATIENT</Text>
              <Text style={styles.metaValue}>
                {user?.displayName || "Confidential"}
              </Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>FOCUS AREA</Text>
              <Text style={styles.metaValue}>Therapeutic Evaluation</Text>
            </View>
            <View style={styles.metaCellLast}>
              <Text style={styles.metaLabel}>DOCUMENT ID</Text>
              <Text style={styles.metaValue}>{docId}</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <SectionHeader title="Executive Summary" />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>"{report.summary}"</Text>
            </View>
          </View>

          {/* Two columns */}
          <View style={styles.twoCol}>
            <View style={styles.colLeft}>
              <SectionHeader title="Topics of Discussion" />
              <View style={styles.badgeWrap}>
                {report.keyTopics?.map((topic: string, i: number) => (
                  <Text key={i} style={styles.badge}>
                    {topic}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.col}>
              <SectionHeader title="Emotional Trends" />
              {report.emotionalTrends?.map((trend: string, i: number) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>›</Text>
                  <Text style={styles.listText}>{trend}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <SectionHeader title="Clinical Recommendations" />
            {report.recommendations?.map((rec: string, i: number) => (
              <View key={i} style={styles.recItem}>
                <Text style={styles.recIndex}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Risk */}
          {report.riskAssessment && (
            <View style={styles.section}>
              <SectionHeader title="Risk Assessment" />
              <View style={styles.riskBlock}>
                <Text style={styles.riskTitle}>CLINICAL OBSERVATIONS</Text>
                <Text style={styles.riskText}>{report.riskAssessment}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Confidential · Maand AI Clinical Insights
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};
