---
title: "Noise Camera Enforcement Data Chain"
subtitle: "聲音照相科技執法：從超標事件到稽查工作單"
summary: "四個零散需求：設備與場域管理 API、天候查證工具、事件審核 API、稽核儀表板。放回聲音照相的執法流程，剛好補上一筆超標事件從被量到、查證、判定到被看見的四個斷點。"
company: "維碩科技股份有限公司"
period: "2025/02~2025/12"
role: "負責資料串接與可視化：設備與場域管理 API、天候查證工具、事件審核 API、噪音事件稽核儀表板（影像辨識由影像處理團隊負責）"
stack: ["Python", "FastAPI", "SQLAlchemy / MSSQL", "Swagger (OpenAPI)", "WebSocket", "Docker", "Selenium", "LangChain", "GPT-4o-mini", "Google Maps API", "Plotly", "Streamlit", "Pillow"]
focus: ["API Development", "Data Visualization"]
system_map: { map: "weishuo", area: "noise-enforcement" }
impact:
  before: "判定一筆事件，要在資料庫、檔案、氣象網站與舊系統之間來回查"
  after: "證據集中在審核 API，判定、改車牌、出工作單一次完成"
tldr:
  problem: "超標不等於違規；每筆事件都要人工查齊設備、影像與天候證據才能判定，資料卻分散在不同地方。"
  approach: "把零散需求放回執法流程：設備主檔管得住、天候證據查得到、事件審得完、結果看得見。"
  result: "審核人員在同一套 API 完成判定與出單，環保單位直接從儀表板看熱區與時段。"
metrics:
  - { value: "5,605", label: "稽核儀表板彙整的超標事件（2024/06/21 ~ 2025/09/18）", on_home: true }
  - { value: "4.2%", label: "人工判定為有效的比例（236 件）", on_home: true }
  - { value: "4", label: "判定一筆事件要確認的現場條件數，其中 3 項是天候" }
story:
  - label: "地圖"
    at: "map"
    beats:
      - "[data-b=\"ws-1\"]"
      - "[data-b=\"ws-2\"]"
      - "[data-b=\"ws-3\"]"
      - "[data-b=\"ws-4\"]"
    line: "這是一筆超標事件走過的主幹線：路邊站點量到聲音、寫進事件資料庫，接著查證天候、由審核人員判定，最後在儀表板被看見。我負責的是標上「量到、查證、判定、看見」的四個服務。"
  - label: "超標不等於違規"
    at: "ch-1-1"
    pick: ":scope > ul"
    beats:
      - "li:nth-child(1)"
      - "li:nth-child(2)"
    line: "聲音照相是取締改裝噪音車的科技執法：噪音計量到超標，攝影機同時拍下車輛。但超標不等於違規，依規定還要確認四項現場條件，才能判定有效或無效。"
  - label: "判定需要什麼"
    at: "ch-1-2"
    pick: ".evidence-card"
    dim: ".evidence-verdict:nth-child(2)"
    beats:
      - ".evidence-group:nth-child(1)"
      - ".evidence-group:nth-child(2)"
      - ".evidence-group:nth-child(3)"
      - ".evidence-verdict:nth-child(1)"
    line: "判定一筆事件需要三類證據：設備量到的數值、現場影像，以及地面乾濕、風速、最近降雨這三項天候條件。查齊之後，審核人員才判定有效或無效。"
  - label: "問題與定位"
    at: "ch-1-2"
    pick: ":scope > p:last-of-type"
    line: "麻煩的是，這些證據散在四個地方：資料庫、檔案目錄、氣象網站和既有的工作單程式。所以要解決的不是判定規則，而是每一件都要人工把證據查齊。"
  - label: "對照範例"
    at: "ch-1-3"
    pick: "table"
    beats:
      - "tbody tr:nth-child(1)"
      - "tbody tr:nth-child(2)"
    line: "看兩筆同樣量到 92 dBA 的示意事件：A 的四項條件都符合，判定有效；B 當時風速超過 5 m/s，就判定無效。"
  - label: "解決方案"
    at: "ch-2-1"
    pick: ":scope > ul"
    beats:
      - "li:nth-child(1)"
      - "li:nth-child(2)"
      - "li:nth-child(3)"
      - "li:nth-child(4)"
    line: "所以我把四個零散的需求放回這條流程：量到靠設備與場域管理 API，查證靠天候查證工具，判定靠事件審核 API，看見靠稽核儀表板。"
  - label: "量到"
    at: "ch-5-1"
    pick: ".video-figure"
    beats:
      - ".video-item"
    line: "量到：設備與場域管理 API 維護站點、設備與校正紀錄的主檔；新增一個場域，前端立刻同步。"
  - label: "查證"
    at: "ch-5-2"
    pick: ".video-figure"
    beats:
      - ".video-item"
    line: "查證：輸入一句話指定地點與期間，AI 解析後呼叫爬蟲服務取回 CODiS 資料，產出風速、降水圖表與 PDF 報告。"
  - label: "判定"
    at: "ch-1-2"
    pick: ".evidence-card"
    beats:
      - ".evidence-verdict:nth-child(1)"
      - ".evidence-verdict:nth-child(2)"
    line: "判定：證據集中在事件審核 API，審核人員在同一處判定；修正車牌時重新壓印照片，並匯出證據與稽查工作單。這一段的系統畫面沒有公開，以判定證據卡說明。"
  - label: "看見"
    at: "ch-5-3"
    pick: ".video-figure"
    beats:
      - ".video-item"
    line: "看見：判定結果彙整到稽核儀表板，環保單位直接看總量與有效比例、高峰時段和重點違規車輛。"
  - label: "成果"
    at: "ch-6-1"
    pick: ".ba-figure"
    beats:
      - ".ba-row:nth-child(2)"
      - ".ba-row:nth-child(3)"
      - ".ba-row:nth-child(4)"
      - ".ba-row:nth-child(5)"
    line: "四個斷點各自補上：主檔有入口、天候一句話查到、判定與出單在同一處、結果直接看得見。這頁沒有工時紀錄，所以不估算節省多少時間。"
tags: ["Backend / API", "Data Visualization", "Gov Tech"]
categories: ["Backend / API", "Crawler", "AI / ML"]
home: true
order: 5
accent: amber
---

## Problem Assessment

<hr data-slide="背景">

- **聲音照相**是取締改裝噪音車的科技執法：路邊噪音計量到超過管制標準的聲音，攝影機同時拍下車輛，形成一筆**超標事件**。
- **超標不等於違規。** 依規定，審核人員還要確認四項現場條件（前後三秒有沒有車、地面乾濕、風速是否小於 5 m/s、最近降雨時間），才能判定**有效**或**無效**。
- 我接到的需求很零散：設備管理 API、天氣查詢、事件審核後台、噪音事件稽核儀表板，放回執法流程看，剛好是同一筆事件**量到、查證、判定、看見**的四個斷點。

<details class="glossary-details">
<summary>名詞說明<span class="mono">8 個名詞 · 點擊展開</span></summary>
<table>
<thead><tr><th>名詞</th><th>說明</th></tr></thead>
<tbody>
<tr><td>聲音照相</td><td>以噪音計搭配攝影機，在路邊自動記錄高噪音車輛的科技執法設備</td></tr>
<tr><td>超標事件</td><td>噪音值超過管制標準時自動產生的紀錄，附照片、聲音波形與影像</td></tr>
<tr><td>Lmax</td><td>事件期間量到的最大噪音值</td></tr>
<tr><td>L90／fL90</td><td>背景音量；fL90 為校正後的背景音量</td></tr>
<tr><td>管制標準（dBA）</td><td>該站點適用的噪音上限</td></tr>
<tr><td>有效／無效</td><td>審核人員依現場條件判定事件能否進入執法流程</td></tr>
<tr><td>通知到檢／直接開罰</td><td>有效事件的兩種後續：通知車主到檢驗站檢驗，或直接舉發</td></tr>
<tr><td>CODiS</td><td>中央氣象署的氣候觀測資料查詢平台</td></tr>
</tbody>
</table>
</details>

<hr data-slide="要判定的是什麼">

超標只代表噪音計量到了超過標準的聲音。依規定，審核人員還要確認四項現場條件，才能判定這筆事件**有效**或**無效**；判定需要的證據分成三類：

<figure class="evidence-figure">
<div class="evidence-card">
<div class="evidence-groups">
<section class="evidence-group">
<p class="evidence-head"><b>設備量測</b><span class="evidence-src">站點寫入・管理 API</span></p>
<ul>
<li>Lmax、L90／fL90、風速、氣溫：站點設備寫入事件資料庫</li>
<li>管制標準、校正紀錄：設備與場域管理 API 維護的主檔</li>
</ul>
</section>
<section class="evidence-group">
<p class="evidence-head"><b>現場影像</b><span class="evidence-src">影像辨識（影像處理團隊）</span></p>
<ul>
<li>照片、聲音波形、AI 攝影機與監視器影像、車牌</li>
<li>前後三秒是否有車</li>
</ul>
</section>
<section class="evidence-group is-weather">
<p class="evidence-head"><b>天候條件</b><span class="evidence-src">天候查證</span></p>
<ul>
<li>地面乾濕、風速是否小於 5 m/s、最近降雨時間</li>
</ul>
</section>
</div>
<span class="evidence-arrow" aria-hidden="true">→</span>
<div class="evidence-result">
<div class="evidence-verdict">
<p><b>判定</b>（審核人員）</p>
<ul class="evidence-chips"><li>有效</li><li>無效</li></ul>
<p style="margin-top:10px">原因</p>
<ul class="evidence-chips"><li>通知到檢</li><li>直接開罰</li><li>非噪音車</li><li>無法判定</li><li>其他</li></ul>
</div>
<div class="evidence-verdict">
<p><b>產出</b></p>
<ul class="evidence-chips"><li>修正車牌並重壓照片</li><li>證據 ZIP</li><li>稽查紀錄工作單</li><li>稽核儀表板</li></ul>
</div>
</div>
</div>
<figcaption>圖 1　判定一筆超標事件需要的證據與產出（欄位取自事件審核 API 的資料結構）</figcaption>
</figure>

這些證據原本散在四個地方：量測值在資料庫、影像在檔案目錄、天候要另外上網查，稽查工作單由既有 C# 程式產生。因此要解決的不是判定規則，而是**判定需要的證據散在四個地方，每一件都要人工查齊**。

<hr data-slide="對照範例">

以兩筆示意事件為例，看同樣超標的聲音，為什麼判定結果不同：

| 事件 | 量測（Lmax／標準） | 前後三秒有沒有車 | 天候（地面／風速／最近降雨） | 判定 |
|---|---|---|---|---|
| A | 92／86 dBA | 符合 | 符合／2.1 m/s／符合 | 有效 |
| B | 92／86 dBA | 符合 | 符合／**6.3 m/s**／符合 | **無效** |

*示意：數值為說明用；只有風速列出數值，因為 5 m/s 是明確的門檻，其餘條件只標是否符合。管制標準 86 dBA 取自設備與場域管理 API 錄影的測試資料；判定由審核人員依規定完成。*

- **A**：四項條件都符合，審核人員判定有效，後續通知到檢或直接開罰。
- **B**：風速超過 5 m/s，不符合條件，判定無效。

<hr data-slide="四個斷點">

<figure class="pain-figure">
<div class="pain-grid">
<section class="pain-card tone-red pain-wide">
<h4 class="pain-title">判定：證據散在四個地方</h4>
<p class="pain-label"><span>Pain</span>每筆事件都要人工查齊才能判定</p>
<ul class="pain-note">
<li>量測值在資料庫、影像在檔案目錄、天候要另外查，稽查工作單由既有 C# 程式產生；車牌辨識錯了，照片上的車牌也要跟著改。</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">證據：審核量（2024/06/21 ~ 2025/09/18，稽核儀表板）</p>
<ul class="pain-flow">
<li><b>5,605 件</b>超標事件中只有 <b>236 件有效（4.2%）</b>；其餘 <b>5,369 件</b>同樣要人工逐件判定。</li>
</ul>
</div>
</section>
<section class="pain-card tone-grey">
<h4 class="pain-title">量到：設備主檔沒有統一管理入口</h4>
<p class="pain-label"><span>Pain</span>噪音計、校正器、風速計、攝影機與場域資料，分在主庫與歷史庫</p>
</section>
<section class="pain-card tone-yellow">
<h4 class="pain-title">查證：天候要人工搜尋</h4>
<p class="pain-label"><span>Pain</span>四項條件有三項是天候，過去靠人工上網查</p>
</section>
<section class="pain-card tone-grey pain-wide">
<h4 class="pain-title">看見：熱區與時段難掌握</h4>
<p class="pain-label"><span>Pain</span>報表靠人工產出，看不出重點區域、高噪音時段與累犯車輛</p>
</section>
</div>
<figcaption>圖 2　一筆超標事件的四個斷點</figcaption>
</figure>

## Solution Design

<hr data-slide="斷點與解決方向">

**斷點 → 解決方向**（對應 Quick Read 的資料流地圖）：

- **量到** → 設備與場域管理 API：站點、設備與校正紀錄的主檔維護（量測值由站點設備直接寫入資料庫），加上監測資料的查詢與即時推播，同時連主庫與歷史庫。
- **查證** → 天候查證：CODiS 爬蟲服務，加上一句話就能查的 Weather AI。
- **判定** → 事件審核 API：證據集中在同一筆事件，判定、改車牌、匯出證據、出工作單都在這裡完成。
- **看見** → 稽核儀表板：判定結果依時間、站點與車牌彙整，可篩選與下載。

**設計限制：** 事件資料分在兩個 SQL Server 資料庫；稽查工作單沿用既有 C# 程式的格式；系統跑在區域網路內。

## Alternative Solutions

| 斷點 | 採用 | 沒有選的方案 | 原因 |
|---|---|---|---|
| 量到 | **FastAPI 服務層** | 前端直接查資料庫 | 多個前端共用同一份資料；SQL 與兩個資料庫的連線只寫一次 |
| 查證 | **爬蟲服務 + 自然語言查詢** | 人工到 CODiS 查詢 | 一句話指定地點與期間，速度跟得上事件數 |
| 判定 | **沿用 C# 產生器，以檔案交換串接** | 用 Python 重寫工作單 | 工作單是執法單位實際使用的表單，格式不能變 |

## Selected Solution

<hr data-slide="四個模組">

- **設備與場域管理 API**：站點、設備與校正紀錄主檔的增修查與檔案上傳；風速、噪音、校正資料的查詢與下載（[sensor/api.py](https://github.com/01080710/NoiseDetect_API/blob/HEAD/app/routers/sensor/api.py)）；即時數據以 WebSocket 推播（[live/api.py](https://github.com/01080710/NoiseDetect_API/blob/HEAD/app/routers/live/api.py)）。
- **天候查證**：Selenium 爬蟲包成「地點 + 月份」的 API 服務。Weather AI 用 GPT-4o-mini 與 LangChain 解析一句話裡的地點與時間（[chat_prompt.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/date/chat_prompt.py)），Google Maps 轉經緯度（[address_logic.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/address/address_logic.py)），再非同步併發呼叫爬蟲、失敗重試（[codis_api.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/codis_api.py)），最後產出圖表與 PDF 報告（[combine_generate.py](https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/pdf_tool/combine_generate.py)）。
- **事件審核 API**：判定只寫入有變動的欄位；改車牌時用 Pillow 重新壓印照片，證據與資料一致；依車牌匯出證據 ZIP；等既有 C# 程式轉出工作單後回傳，逾時會回報錯誤。
- **稽核儀表板**：Streamlit + Plotly，六種檢視模式；依時間、站點、判定結果、噪音標準與風速篩選；超標、累犯與跨區車輛排行；可下載 CSV。
- **權限範圍**：審核 API 對事件表只寫入判定、原因與車牌欄位，其餘唯讀；連線資訊放在環境變數。
- **原始碼**：[01080710/WeatherAI](https://github.com/01080710/WeatherAI)、[01080710/NoiseDetect_API](https://github.com/01080710/NoiseDetect_API)；事件審核 API 與爬蟲服務的 repo 暫不公開。

## Result

<hr data-slide="量到：設備與場域管理 API">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">影片依序框出五個步驟</p>
<video controls muted playsinline preload="metadata" src="../../media/noise-camera-enforcement/device-site-api.mp4"></video>
</div>
</div>
<figcaption>圖 3　設備與場域管理 API 的五個步驟：（1）POST /site 寫入場域主檔；（2）GET /site 讀回主檔，含管制標準與連線 IP；（3）前端同步顯示新場域；（4）上傳場域文件；（5）PUT 將狀態改為停用。畫面為測試資料。原始碼：<a href="https://github.com/01080710/NoiseDetect_API">NoiseDetect_API</a></figcaption>
</figure>

<hr data-slide="查證：天候查證">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">影片依序框出五個步驟</p>
<video controls muted playsinline preload="metadata" src="../../media/noise-camera-enforcement/weather-evidence.mp4"></video>
</div>
</div>
<figcaption>圖 4　天候查證的五個步驟：（1）輸入一句話，指定地點與期間；（2）AI 解析出地點、座標與期間；（3）爬蟲服務自動選測站、取 CODiS 月報表（此段為另一次示範查詢，測站與步驟 1 的地點不同）；（4）判定用得到的天候：風速（含警戒線）與降水量；（5）一鍵輸出 PDF 報告。原始碼：<a href="https://github.com/01080710/WeatherAI">WeatherAI</a>，呼叫爬蟲服務見 <a href="https://github.com/01080710/WeatherAI/blob/HEAD/StreamlitWeb/models/codis_api.py">codis_api.py</a></figcaption>
</figure>

<hr data-slide="看見：稽核儀表板">

<figure class="video-figure">
<div class="video-grid">
<div class="video-item">
<p class="video-label">影片依序框出四個洞察</p>
<video controls muted playsinline preload="metadata" src="../../media/noise-camera-enforcement/audit-dashboard.mp4"></video>
</div>
</div>
<figcaption>圖 5　稽核儀表板的四個洞察：（1）判定總量與有效比例；（2）高峰時段，看星期 × 時段的事件分布；（3）重點違規車輛，依最高音量、累犯次數與跨區數量排行；（4）依判定結果、噪音標準、風速與溫度篩選後下載。車牌、站號與下載路徑已打上馬賽克</figcaption>
</figure>

## Impact

<hr data-slide="已驗證的成果">

### 已驗證的成果

<figure class="ba-figure">
<div class="ba-table">
<div class="ba-row ba-head"><p class="ba-item">斷點</p><p class="ba-before">Before</p><p class="ba-after">After</p></div>
<div class="ba-row"><p class="ba-item">量到</p><p class="ba-before">設備主檔沒有統一管理入口</p><p class="ba-after">一套 API 維護站點、設備與校正紀錄主檔，前端即時同步<small>依據：圖 3</small></p></div>
<div class="ba-row"><p class="ba-item">查證</p><p class="ba-before">人工上網搜尋天氣</p><p class="ba-after">一句話取得 CODiS 資料與報告<small>依據：圖 4</small></p></div>
<div class="ba-row"><p class="ba-item">判定</p><p class="ba-before">證據分散在四個地方</p><p class="ba-after">同一筆事件查齊證據，判定與出單在同一套 API<small>依據：圖 1</small></p></div>
<div class="ba-row"><p class="ba-item">看見</p><p class="ba-before">人工報表，熱區靠經驗</p><p class="ba-after">儀表板直接看總量、熱區、高峰時段與累犯車輛<small>依據：圖 5</small></p></div>
</div>
<figcaption>圖 6　四個斷點的 Before / After</figcaption>
</figure>

<hr data-slide="尚未量化">

### 尚未量化或需要說明的部分

- **沒有工時數據**：單筆判定耗時與天候查詢原本的耗時都沒有紀錄，本頁不估算節省工時。
- **5,605 件是資料規模，不是成果**：事件期間 2024/06/21 起，早於本人到職（2025/02）；判定由審核人員完成。
- **判定沒有系統畫面**：事件審核 API 的畫面未公開，本頁以判定證據卡（圖 1）說明它的輸入與產出。
- **範圍**：影像辨識屬影像處理團隊；四個模組原本是陸續接到的需求，本頁依執法流程整理成一條資料鏈。
