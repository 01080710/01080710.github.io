// Home keyword strip: every project's `focus` terms are grouped into a few capability themes so the strip
// reads as 3 strengths instead of a flat list of 10+ chips. The terms stay visible (recruiters search for them).
// Every `focus` value used by a project must appear in exactly one group; get_keywords() fails the build otherwise.

export interface FocusGroup {
  zh:    string;
  en:    string;
  focus: string[];
}

export const focus_groups: FocusGroup[] = [
  { zh: "資料對帳與監控", en: "Reconciliation & monitoring",
    focus: ["Financial Reconciliation", "Data Reconciliation", "Anomaly Detection", "Data Quality Monitoring"] },
  { zh: "資料整合與 ETL", en: "Data integration & ETL",
    focus: ["Data Integration", "ETL", "Batch Processing"] },
  { zh: "自動化與系統開發", en: "Automation & system building",
    focus: ["Process Automation", "API Development", "Data Visualization"] },
];
