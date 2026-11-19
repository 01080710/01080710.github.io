---
title: "0-to-1 Operation Data Infrastructure"
subtitle: "營運數據基礎設施從 0 到 1"
summary: "在沒有 DB 權限、沒有標準化 API 文件的環境下，以 API 逆向工程整合 6 個封閉平台，建立每小時增量同步的資料攝入管線與統一資料視圖。"
company: "海科科技有限公司"
period: "2026/02~2026/03"
role: "主導規劃與建置（0-to-1）"
stack: ["Python", "API Reverse Engineering", "ETL Pipeline", "Automated Scheduling", "Data Normalization"]
focus: ["Data Integration", "Data Standardization"]
system_map: { map: "hytech", area: "infra" }
metrics:
  - { value: "6", label: "異質平台整合" }
  - { value: "100%", label: "自動化資料攝入" }
  - { value: "Hourly", label: "增量同步" }
tldr:
  problem: "營運資料散落在多個封閉平台，沒有 DB 權限也沒有 API 文件，查一筆資料要在多個頁面之間人工切換。"
  approach: "以 API 逆向工程為每個平台建立擷取模組，清洗並對齊欄位後，每小時增量同步到統一資料視圖。"
  result: "營運人員從單一入口查詢；後續的風控對帳與帳務自動化都建立在這層資料之上。"
tags: ["Reverse Engineering", "0-to-1", "Data Engineering"]
categories: ["Data Pipeline", "Crawler"]
featured: true
order: 1
accent: slate
---

## Problem Assessment

<hr data-slide="背景與名詞">

- 營運資料散落在多個封閉平台（CRM、PSP、CPS 等），公司內部沒有可以直接查詢的資料庫。
- 這個專案從 0 開始建立營運資料底層，後續的[信用卡異常出金偵測](../credit-card-anomaly-detection/)與[營運帳務自動化引擎](../account-automation-engine/)都建立在這層之上。

<details class="glossary-details">
<summary>名詞說明<span class="mono">9 個名詞 · 點擊展開</span></summary>
<table>
<thead><tr><th>名詞</th><th>說明</th></tr></thead>
<tbody>
<tr><td>CRM</td><td>內部管理客戶與交易帳戶的系統</td></tr>
<tr><td>PSP</td><td>Payment Service Provider，外部支付服務商</td></tr>
<tr><td>CPS</td><td>內部渠道支付平台</td></tr>
<tr><td>DB 權限</td><td>直接查詢資料庫的權限</td></tr>
<tr><td>API 逆向工程</td><td>分析網頁背後呼叫的 API，改由程式直接取得資料</td></tr>
<tr><td>資料孤島（Data Silos）</td><td>資料分散在彼此不互通的系統</td></tr>
<tr><td>增量同步</td><td>每次只抓上次之後新增或變動的資料</td></tr>
<tr><td>ETL</td><td>Extract、Transform、Load：擷取、轉換、載入</td></tr>
<tr><td>統一資料視圖</td><td>多平台資料整理成同一格式後的集中查詢入口</td></tr>
</tbody>
</table>
</details>

<hr data-slide="痛點">

<figure class="pain-figure">
<div class="pain-grid">
<section class="pain-card tone-grey pain-wide">
<h4 class="pain-title">查一筆資料要切換多個頁面</h4>
<p class="pain-label"><span>Pain</span>資料孤島，只能人工查找</p>
<ul class="pain-note">
<li>資料分散在多個封閉平台，彼此不互通。</li>
<li>以 CRM 平台為例，查一筆資料需要切換 10 個以上的頁面。</li>
</ul>
</section>
<section class="pain-card tone-red">
<h4 class="pain-title">拿不到資料源</h4>
<p class="pain-label"><span>Pain</span>沒有 DB 權限，也沒有 API 文件</p>
<ul class="pain-note">
<li>沒有可用的 DB 資料源。</li>
<li>平台沒有標準化的 API 文件，資料只能從 Web 介面取得。</li>
</ul>
</section>
<section class="pain-card tone-yellow">
<h4 class="pain-title">報表數字對不齊</h4>
<p class="pain-label"><span>Pain</span>欄位與指標定義各自為政</p>
<ul class="pain-note">
<li>各系統的欄位命名與格式不一致。</li>
<li>各部門產出的報表數字無法對齊。</li>
</ul>
</section>
</div>
<figcaption>圖 1　原狀態的三個痛點（依履歷專案描述整理）</figcaption>
</figure>

<hr data-slide="值得投入的理由">

**值得投入解決的理由：**

1. **影響所有營運查詢**：資料分散在 6 個平台，任何跨平台的問題都要人工拼湊。
2. **它是後續自動化的前提**：信用卡異常出金偵測與帳務自動化引擎，都需要穩定、格式一致的資料來源。

TODO：補充可以量化問題的數字（例如每日查詢次數、單次查詢耗時）。

## Solution Design

**痛點 → 解決方向**（對應圖 2 的架構）：

- **拿不到資料源** → 分析各平台 Web 介面背後的 API，為每個平台建立獨立的擷取模組。
- **查一筆資料要切換多個頁面** → 擷取後的資料集中到統一資料視圖，營運從單一入口查詢。
- **報表數字對不齊** → 先制定跨平台的清洗與對齊規範，統一欄位格式與指標邏輯，再提供給下游。
- **資料需要接近即時** → 排程每小時增量同步，取代人工定期匯出。

**設計時必須面對的限制：**

- 沒有官方介面：資料只能透過平台的 Web 介面取得。
- 異質資料源：6 個平台的資料結構、欄位命名與指標定義各不相同。
- 資料即時性：營運決策需要接近即時的資料，不能依賴人工定期匯出。
- TODO：補充逆向過程中實際遇到的技術難點（例如驗證機制、分頁、速率限制）。

## Alternative Solutions

| 方案 | 做法 | 優點 | 缺點 |
|---|---|---|---|
| A. 維持人工調取 | 需要時由營運各自到平台查詢、匯出 | 不需開發 | 要切換多個頁面；資料無法即時；各部門數字對不齊 |
| B. 等待 DB 權限或官方 API | 向系統負責單位申請正式資料介面 | 最穩定、有官方支援 | 取決於外部單位，時程無法掌握 |
| **C. API 逆向工程 + ETL（採用）** | 分析平台介面背後的 API，自建擷取模組與每小時同步管線 | 不必等待權限；資料格式由我們統一 | 平台介面變動時要跟著調整 |

> TODO：確認當時實際評估過的方案；目前 A、B 依原頁面「取代人工調取」「不等 DB 權限或官方 API 開放」整理。

## Selected Solution

<hr data-slide="選擇理由">

**選擇 C：API 逆向工程 + ETL**

1. **取代等待權限**：不等 DB 權限或官方 API 開放（B），直接分析各平台介面，為每個平台建立獨立的擷取模組。
2. **取代人工調取**：擷取、轉換、載入集中在同一條管線，以每小時增量同步取代人工匯出（A）。
3. **標準化先於應用**：先統一欄位格式與指標邏輯，再提供給下游使用，避免每個應用各自解讀原始資料。

<hr data-slide="系統架構">

```mermaid
flowchart LR
    subgraph SRC["封閉平台（6 個）"]
        CRM["CRM"]
        PSP["PSP 支付端"]
        CPS["CPS"]
        OTH["其他 3 個平台（TODO）"]
    end

    SCH["Automated Scheduling<br/>每小時觸發"]
    EXT["Custom Data Extraction Modules<br/>API Reverse Engineering"]
    TRF["Cleaning & Alignment<br/>統一格式與指標邏輯"]
    UDV["Unified Data View"]
    OPS["營運團隊即時查詢"]
    DOWN["下游應用<br/>風控對帳 / 帳務自動化"]

    SCH --> EXT
    CRM --> EXT
    PSP --> EXT
    CPS --> EXT
    OTH --> EXT
    EXT --> TRF --> UDV
    UDV --> OPS
    UDV --> DOWN
```

*圖 2　營運資料底層架構（依履歷專案描述整理）*

<hr data-slide="設計重點">

**設計重點：**

- **分層**：
  - Extraction：Python、API Reverse Engineering、Custom Data Extraction Modules。
  - Orchestration：Automated Scheduling，每小時增量同步。
  - Transformation：Data Cleaning、Data Normalization、指標對齊。
  - Serving：Unified Data View。
- **我負責的範圍**：主導從 0 到 1 的完整規劃；開發客製化擷取模組；獨立設計 100% 自動化的資料攝入管線；制定跨平台資料清洗與對齊規範。
- TODO：確認排程與儲存層實際使用的工具（職務標籤列有 Apache Airflow、Apache Superset，尚未確認是否用於本專案）。
- **權限範圍**：TODO：補充使用的帳號、讀寫範圍、核准者與帳密存放方式。

## Result

這層基礎設施目前作為兩個下游專案的資料來源：

- [信用卡異常出金偵測](../credit-card-anomaly-detection/)：每小時擷取 PSP 與 CRM 的信用卡報表進行對帳。
- [營運帳務自動化引擎](../account-automation-engine/)：跨 regulator 批量查詢 CRM 帳戶狀態。

<figure class="tech-figure">
<div class="tech-labels">
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Custom Extraction Modules</p>
<p class="tech-label-desc">每個封閉平台一個擷取模組，以逆向分析的 API 取代人工操作介面。</p>
</div>
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Hourly Incremental Sync</p>
<p class="tech-label-desc">每小時只同步新增或變動的資料，取代人工定期匯出。</p>
</div>
</div>
</figure>

TODO：補充一次實際執行的 log、輸出格式範例與執行統計。

## Impact

### 已驗證的成果

<figure class="ba-figure">
<div class="ba-table">
<div class="ba-row ba-head"><p class="ba-item">項目</p><p class="ba-before">Before：建置前</p><p class="ba-after">After：建置後</p></div>
<div class="ba-row"><p class="ba-item">資料來源</p><p class="ba-before">6 個封閉平台各自查詢</p><p class="ba-after">統一資料視圖<small>依據：履歷專案描述</small></p></div>
<div class="ba-row"><p class="ba-item">查詢方式</p><p class="ba-before">切換多個頁面人工查找（見 Problem）</p><p class="ba-after">單一入口查詢<small>依據：履歷專案描述</small></p></div>
<div class="ba-row"><p class="ba-item">資料攝入</p><p class="ba-before">人工調取</p><p class="ba-after">100% 自動化、每小時增量同步<small>依據：履歷專案描述</small></p></div>
<div class="ba-row"><p class="ba-item">資料一致性</p><p class="ba-before">各部門報表數字有落差</p><p class="ba-after">統一格式與指標邏輯<small>依據：履歷專案描述</small></p></div>
</div>
<figcaption>圖 3　Before / After 對照</figcaption>
</figure>

### 尚未量化或需要說明的部分

- **查詢耗時**：沒有建置前後單次查詢的耗時紀錄。TODO：補充可量化的前後對照。
- **平台清單**：6 個平台中目前只列出 CRM、PSP、CPS，其餘 3 個待補。
