// Project machines: each project drawn as a machine on the Home hero pipeline (one production line per company),
// and, exploded into its layers, at the top of its case study page.
// `kind` = what the machine visibly does, i.e. the project's real logic:
//   match    two reports side by side, paired record by record; mismatches go to the outlet tray
//   align    two lanes lined up by a key; a mismatch raises a flag and goes to the outlet tray
//   query    a validation gate, then a query on one of several back offices; success and failure both logged
//   stages   one record through consecutive stages; invalid ones go to the outlet tray
//   scaffold in progress: housing drawn as scaffolding, no packets
// Text drafted from each project's TL;DR and confirmed by Peter (2026-11-23, see docs/source-notes.md).
// No numbers here: numbers live in each case study's Result chapter (single-source rule).
import type { MapArea } from "./system-maps";

export type MachineKind = "match" | "align" | "query" | "stages" | "scaffold";
interface Text { zh: string; en: string }
export interface Machine {
  kind: MachineKind;
  name: Text;          // short name on the machine (Home hero)
  note: Text;          // one mono line under the name
  parts: Text[];       // mechanism labels, shown when the housing is opened (hover)
  outlet?: Text;       // where flagged records go (tray label)
  layers: { name: Text; text: Text }[];   // exploded view on the case study page, top to bottom
}

export const machines: Record<MapArea, Machine> = {
  "credit-card": {
    kind: "match",
    name: { zh: "信用卡異常偵測", en: "Card anomaly" },
    note: { zh: "Payabl ↔ CRM · 每小時對帳", en: "Payabl ↔ CRM · hourly" },
    parts: [{ zh: "Payabl", en: "Payabl" }, { zh: "CRM", en: "CRM" }],
    outlet: { zh: "LarkSheet", en: "LarkSheet" },
    layers: [
      { name: { zh: "來源", en: "Sources" }, text: { zh: "Payabl、CRM 兩邊的信用卡出金報表（API 擷取）", en: "Card payout reports from Payabl and CRM, pulled via API" } },
      { name: { zh: "比對", en: "Match" },   text: { zh: "每小時全量對帳（原入原出）", en: "Full reconciliation every hour (refunds go back to the original card)" } },
      { name: { zh: "產出", en: "Output" },  text: { zh: "不一致的交易寫入 LarkSheet，營運複核撤銷", en: "Mismatches go to LarkSheet for ops to review and reverse" } },
    ],
  },
  "drop-order": {
    kind: "align",
    name: { zh: "掉單監控", en: "Drop-order monitor" },
    note: { zh: "CRM ↔ CPS · Order Number", en: "CRM ↔ CPS · Order Number" },
    parts: [{ zh: "CRM", en: "CRM" }, { zh: "CPS", en: "CPS" }],
    outlet: { zh: "LarkSheet", en: "LarkSheet" },
    layers: [
      { name: { zh: "來源", en: "Sources" }, text: { zh: "CRM、CPS 兩邊的出入金訂單", en: "Deposit and withdrawal orders on both CRM and CPS" } },
      { name: { zh: "比對", en: "Match" },   text: { zh: "用 Order Number 對齊狀態，依規則判定掉單、去重", en: "Statuses lined up by Order Number; drop-orders judged by rule and de-duplicated" } },
      { name: { zh: "產出", en: "Output" },  text: { zh: "寫入 LarkSheet 案件表，營運派工", en: "Written to the LarkSheet case table for ops to dispatch" } },
    ],
  },
  "account": {
    kind: "query",
    name: { zh: "帳務自動化引擎", en: "Account engine" },
    note: { zh: "LarkSheet 名單 → regulator 後台", en: "LarkSheet list → regulator back offices" },
    parts: [{ zh: "驗證", en: "validate" }, { zh: "regulator 後台", en: "regulator back offices" }],
    layers: [
      { name: { zh: "來源", en: "Sources" }, text: { zh: "OP 在 LarkSheet 填的帳戶名單", en: "Account lists OP fills in LarkSheet" } },
      { name: { zh: "查詢", en: "Query" },   text: { zh: "驗證輸入，排程到各 regulator 的 CRM 後台查詢", en: "Input validated, then queried on each regulator's CRM back office on a schedule" } },
      { name: { zh: "紀錄", en: "Log" },     text: { zh: "成功與失敗都留紀錄，每次申請可追溯", en: "Every success and failure is logged; each request can be traced" } },
    ],
  },
  "ticket": {
    kind: "scaffold",
    name: { zh: "工單資料管線", en: "Ticket pipeline" },
    note: { zh: "建置中", en: "In progress" },
    parts: [],
    layers: [
      { name: { zh: "來源", en: "Sources" }, text: { zh: "Freshservice 工單與對話（共用 API 額度）", en: "Freshservice tickets and conversations (shared API quota)" } },
      { name: { zh: "寫入", en: "Store" },   text: { zh: "逐則比對，寫入每年一檔 SQLite", en: "Compared one by one, written to one SQLite file per year" } },
      { name: { zh: "產出", en: "Output" },  text: { zh: "依處理群組分頁的 Excel 給 OP", en: "Excel for OP, one sheet per handling group" } },
    ],
  },
  "noise-enforcement": {
    kind: "stages",
    name: { zh: "聲音照相資料鏈", en: "Noise camera chain" },
    note: { zh: "量到 → 查證 → 判定 → 看見", en: "Measured → Verified → Judged → Seen" },
    parts: [{ zh: "量到", en: "Measured" }, { zh: "查證", en: "Verified" }, { zh: "判定", en: "Judged" }, { zh: "看見", en: "Seen" }],
    outlet: { zh: "無效", en: "Invalid" },
    layers: [
      { name: { zh: "量到", en: "Measured" }, text: { zh: "設備與場域管理 API", en: "Device & site management API" } },
      { name: { zh: "查證", en: "Verified" }, text: { zh: "天候證據", en: "Weather evidence" } },
      { name: { zh: "判定", en: "Judged" },   text: { zh: "事件審核 API", en: "Event review API" } },
      { name: { zh: "看見", en: "Seen" },     text: { zh: "稽核儀表板", en: "Audit dashboard" } },
    ],
  },
};
