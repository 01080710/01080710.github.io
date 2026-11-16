// Single source of truth for personal information.
// Every page reads from here; do not hard-code these values in pages.
// Empty string = not provided yet; the UI shows it as TODO.

export const profile = {
  name:      "Peter Chang",
  name_zh:   "張豈愷",
  title:     "Data Engineer & System Builder",
  tagline:   "在沒有 DB 權限、官方 API 與技術文件的環境中，透過逆向分析把封閉系統的資料接出來，並做成可持續運作的自動化服務。",
  intro: [
    "資料工程師，目前在海科科技負責營運資料基礎設施。主導營運資料底層從 0 到 1 的建置，以 API 逆向工程整合 6 個異質平台，並在其上建立風控對帳與營運帳務自動化。",
    "我不交付一次性腳本。逆向得到的解法會被整理成有驗證、有排程、有審計紀錄的服務，讓非技術同仁也能自行操作。",
  ],

  capabilities: [
    { name: "0-to-1 Engineering",         desc: "在沒有既有系統的狀態下，從資料源盤點開始建立完整管線。" },
    { name: "Reverse Engineering",        desc: "缺少官方 API 或文件時，分析封閉平台的介面並建立資料擷取模組。" },
    { name: "Data Engineering",           desc: "ETL、每小時增量同步、跨平台資料清洗與指標對齊。" },
    { name: "System Integration",         desc: "整合 CRM、PSP、CPS 等異質平台，提供統一資料視圖。" },
    { name: "Automation Engineering",     desc: "把人工對帳、人工查核改為排程與一鍵工具。" },
    { name: "System Architecture",        desc: "以入口、編排執行、處理治理分層設計，含輸入驗證與審計。" },
    { name: "Bottom-up Engineering",      desc: "先把底層運作邏輯摸透，再往上建構抽象。" },
    { name: "Product-oriented Thinking",  desc: "從業務痛點出發，找出可通則化的場景，做成他人可直接使用的工具。" },
  ],

  // Rewritten from PeterChang_core.md; each item maps to a real project behaviour.
  philosophy: [
    { title: "交付服務，不交付腳本",
      body:  "逆向得到的解法只是起點。能動的 workaround 會累積技術債，所以要補上驗證、排程與審計紀錄，讓它成為可以長期運作、其他人能接手的服務。" },
    { title: "資源不足不是停工的理由",
      body:  "沒有 DB 權限、沒有官方 API 是常態而不是例外。先用逆向工程打通資料，讓業務先動起來；正式資源到位後，這套系統就是已驗證過的 MVP。" },
    { title: "由下而上理解系統",
      body:  "先把底層運作邏輯摸透再往上抽象。框架之外的異常，只有理解底層的人才排查得了。" },
    { title: "先問脈絡，再投入架構",
      body:  "需求啟動前先對齊商業脈絡與預期指標。脈絡清楚的需求才投入架構設計；脈絡不明的需求只做最小成本的處理。" },
  ],

  approach: [
    { step: "Align",       title: "對齊脈絡",     body: "與需求方確認商業脈絡、判斷規則與預期指標。", example: "信用卡異常出金偵測：偵測規則先與營運端逐條對齊。" },
    { step: "Generalize",  title: "找出通則",     body: "從零散需求中歸納可以共用的流程，而不是逐案處理。", example: "營運帳務自動化引擎：歸納出可涵蓋約 80% 業務場景的共通流程。" },
    { step: "Unblock",     title: "打通資料",     body: "缺少權限或 API 時，用逆向工程建立資料通道。", example: "0-to-1 營運數據基礎設施：整合 6 個封閉平台。" },
    { step: "Systematize", title: "系統化",       body: "補上輸入驗證、排程、正規化與審計，讓解法可以穩定重複執行。", example: "每小時增量同步與每小時對帳管線。" },
    { step: "Deliver",     title: "交付與量化",   body: "包裝成非技術同仁可直接使用的工具，並用數字回報成效。", example: "LarkSheet 批量查詢引擎；累計節省約 4,770 小時（估計）。" },
  ],

  experience: [
    { company: "海科科技有限公司",     role: "資料工程師 (Data Specialist)", period: "2025/12 – 現在",
      note: "營運資料基礎設施、風控對帳管線、營運帳務自動化。" },
    { company: "維碩科技股份有限公司", role: "資料工程師",                   period: "2025/2 – 2025/12",
      note: "設備管理平台 RESTful API（PostgreSQL、ORM、Swagger）；參與智慧監控儀表板。" },
    { company: "三興資訊股份有限公司", role: "資料分析師",                   period: "2023/4 – 2025/2",
      note: "車型資料爬蟲、車身碼查詢系統（Django）、出險平台 OCR + NLP 模組、GCP VM/VPN 管理。" },
  ],

  education: "銘傳大學 生物科技學系（2017–2021）；國立陽明交通大學 食品安全及風險評估研究所（碩士肄業）",

  contact: {
    github:   "https://github.com/01080710",
    linkedin: "https://www.linkedin.com/in/peter-chang-19a55a270/",
    email:    "zxcvbnm951654@kimo.com",
  },
};
