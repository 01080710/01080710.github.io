# CLAUDE.md

Peter Chang 的作品集網站（Astro 7 + Markdown + Mermaid，部署到 GitHub Pages）。使用方式與目錄見 [README.md](README.md)。

## 新增或改寫專案頁

- **MUST**：依 [docs/case-study-framework.md](docs/case-study-framework.md) 進行：六段式結構、閱讀節奏、各章必備內容、數據規則、去識別規則、可用元件、驗證步驟。
- 範本：[src/content/projects/drop-order-monitor.md](src/content/projects/drop-order-monitor.md)（閱讀節奏改版後的完整示範）。
- 每個數字的來源與口徑寫進 [docs/source-notes.md](docs/source-notes.md)。
- 範本補充：平台截圖當痛點證據、架構圖分區截圖，見 [src/content/projects/credit-card-anomaly-detection.md](src/content/projects/credit-card-anomaly-detection.md)；規則圖在上表格在下、Result 操作錄影並排，見 [src/content/projects/account-automation-engine.md](src/content/projects/account-automation-engine.md)。

### 閱讀節奏（避免四頁看起來一樣）

- **頁面分區**：模板 [[slug].astro](src/pages/[...lang]/projects/[slug].astro) 自動排成以下順序，Markdown 不必處理；標題、公司、期間留在區塊外。區塊標籤只用英文。
  1. **Tech Choices**：Role → Focus → Stack。
  2. **Quick Read**：系統地圖（右上角「本專案負責：…」）→ TL;DR 三格（Problem／Approach／Result）→ metrics。
  3. **Deep Dive**：六章內容。
  - 底色透明度只在 `global.css` 的 `--zone-tech-alpha`、`--zone-brief-alpha`、`--zone-detail-alpha` 調整，淺色與深色各一組。
- **MUST**：frontmatter 填 `focus`（1–2 個），用 104／LinkedIn 常見的搜尋關鍵字（通用職能詞，例如 Data Integration、Financial Reconciliation），意思須與該頁內容一致；不用暗示特定工具或意思不同的詞（例如 CDC、RPA、Transaction Monitoring）。Stack 維持工具清單。
- **MUST**：frontmatter 填 `system_map: { map, area }`。地圖一家公司一張，在 [SystemMap.astro](src/components/SystemMap.astro)；「本專案負責」標籤放在地圖框外右上角，不疊在圖上。海科的地圖由 `canva-export/structure.png` 用 SVG 重畫：不放品牌名稱，PSP 與渠道名稱保留；重畫來源只記在 source-notes，頁面不加圖說。換公司時新增一張地圖與 `map` 名稱，不把不同公司的專案畫在同一張圖；Projects 頁目前不放地圖。
- **MUST**：frontmatter 填 `tldr: { problem, approach, result }`，每行一句、約 40 字以內、不放數字（數字交給 `metrics`）。`summary` 保留給 Projects 卡片與 meta description。
- **MUST**：數字單一出處。每個數字只在證明它的那一章完整出現一次，其他章寫「（見 Result）」；01 放證明問題存在的數字，05 放執行結果與統計，06 只放 Before / After 對照，不重抄 05。
- **MUST**：元件預算。一張投影片一個主元件（表格、卡片、長條、Mermaid、log、Before / After、錄影擇一；Tech Label、名詞說明、CSV 收合區不計），相鄰投影片的主元件盡量不同；每章 Markdown 表格最多 2 張；分布型資料用 `bar-list`、兩欄對應用清單，不用表格；痛點卡片只用在 01。
- **招牌視覺**：每個專案一個只有它才有的主視覺，放在 01 或 02（錄影類可放 05 開頭），類型不與其他專案重複，記在 source-notes。
- 頁面上的解讀句只寫資料撐得住的事實；推論或建議沒有依據就不放。
- **MUST**：網站以繁體中文為主（`/`），英文版在 `/en/`，全站頁面（含專案頁）都有兩種語言。中文頁面內文一律繁體中文。來源系統的簡體欄位名稱與狀態值（交易状态、处理完成、客户问题…）在頁面上轉成繁體，「账号」寫成台灣慣用的「帳號」；公開 CSV 可保留來源原貌，頁面上註明「CSV 保留來源系統的簡體字」。用 OpenCC 等工具判斷時，異體字（台、才、查核、吃、群、折、佣、准、表）不要改。
- **MUST**：網站頁面不放 emoji 或圓圈數字（①②），語意顏色交給既有元件（章節徽章、`tone-*`、`ba-before`／`ba-after`）；README 與 docs 不受此限。
- **MUST**：每個專案在第一章加「名詞說明」收合頁籤（`glossary-details`），定義經 Peter 確認後才放上，不確定的名詞先問。
- **MUST**：frontmatter 填 `categories`（技術類型，至少一個），可選值只來自 [src/data/project-categories.ts](src/data/project-categories.ts)；新類型先加進該檔。Projects 頁只顯示有專案的分類按鈕。
- **MUST**：期間欄位只寫日期，格式 `YYYY/MM~YYYY/MM`（月份補零）；仍在運作的寫 `YYYY/MM~`。「開發」「上線」標籤由 [ProjectPeriod.astro](src/components/ProjectPeriod.astro) 加上，Markdown 不寫標籤或括號說明。
  - `period` 填開發期間；`launch` 填上線期間，沒有上線資訊就省略。卡片與專案頁顯示成兩欄對齊的「開發／上線」兩行，編號與公司名稱另起一行。
  - 同一專案有多條線、各自開發與上線（例如 Drop-Order 的入金／出金）時改填 `phases: [{ name, period, launch }]`，顯示成「列 = 線別、欄 = 開發／上線」的表格；`period` 保留整體期間但不顯示，也不再填 `launch`。線別用中文（入金／出金）。
  - 日期需經 Peter 確認，來源記在 source-notes。
- 長章節用 `<hr data-slide="小標">` 切成章內投影片（一張約一個螢幕、說明與它的圖表同一張），切法見框架文件〈Components〉。

## 網站設計慣例

- **配色**：品牌色只用 `global.css` 的 token：`--accent`（深藍，主色）、`--accent-2`（磚紅，章節編號、hover 與長條的高亮列）、`--blob`（照片色塊）。不在頁面或元件寫死色碼；新增 token 必須同時在 `:root` 與 `:root[data-theme="dark"]` 各定義一次。紅黃綠只用於語意徽章（含 TL;DR 三格頂線：紅 Problem、黃 Approach、綠 Result），不當裝飾色。
- **專案主題色**（frontmatter `accent`）：每個專案一色、不重複。目前 Drop-Order = `forest`、Credit Card = `violet`、Account Engine = `ocean`、OP Ticket Data Pipeline = `slate`；新專案需要新色時，在 [content.config.ts](src/content.config.ts) 的 enum 與 `global.css` 淺色、深色各加一組。
- **深淺色**：`<html data-theme>` 由 [Base.astro](src/layouts/Base.astro) 的 inline script 在首次繪製前設定（訪客選擇優先，否則跟隨系統）。CSS 一律寫 `[data-theme="dark"]`，不寫 `@media (prefers-color-scheme)`；JS 繪製的內容（例如 Mermaid）監聽 `themechange` 事件重畫。
- **個人照片**：只用 [ProfilePhoto.astro](src/components/ProfilePhoto.astro)（不規則色塊 + 右下小點，不加手繪線條），目前用在首頁 hero 與 Contact。檔案為 `public/media/peter-photo.jpg`（560px 寬）；原始大圖與設計參考圖不留在 repo。
- **外部設計素材**（Canva 等）：不直接放上網站，只沿用色票與形狀，用 CSS／SVG 重畫，避免授權問題。
- **文案語氣**：首頁一句話介紹與 Introduction 先講使用者價值與為人（熱忱、從使用者角度出發、團隊合作、深耕資料工程與 AI），不以「逆向工程」「沒有權限」開場；技術手段放在能力列表與專案頁。所有個人文案集中在 [profile.ts](src/data/profile.ts)。
- **雙語同步 MUST**：改 `profile.ts` 的文字時同步改 [profile.en.ts](src/data/profile.en.ts)（日期、標籤、連結只寫在 `profile.ts`）；新增介面字串放 [ui.ts](src/i18n/ui.ts) 的 `zh`、`en` 兩邊；專案頁的英文版在 [src/content/projects-en/](src/content/projects-en/)（同檔名，只放文字：summary、role、metric_labels、tldr 與內文），日期、Stack、數字與系統地圖只寫在中文檔；改中文專案頁的內文或數字時同步改英文檔，缺檔或 metric_labels 數量不符時 build 會失敗。英文 Markdown 裡的影片與 CSV 連結比中文多一層 `../`（網址多了 `/en/`）。英文文案為 Claude 草稿，經 Peter 審稿後才算定稿。
- **Contact**：獨立頁 `/contact/`（照片 + 一句邀請、聯絡方式卡片含複製 Email、可以找我聊），首頁只留一行邀請連過去。文案在 `profile.ts` 的 `contact_invite`、`talk_topics`。求職狀態等個人資訊只放 Peter 提供的內容，不自行編寫；網站是靜態站，不做需要外部服務的聯絡表單。
- **新增互動元件**：沒有 JS 時內容仍要完整可讀（漸進增強）；鍵盤可操作、有 `focus-visible` 樣式、尊重 `prefers-reduced-motion`。

## 機敏資料

- `canva-export/`、`PeterChang_rv.pdf`、`PeterChang_core.md` 含同事姓名、內部網址、交易編號與個人資料，只能讀，不可複製進 `src/` 或 `public/`。Peter 新給的原始素材（xlsx、README、架構圖等）先移到 `canva-export/<專案>/` 再處理，不留在 repo 根目錄。
- 公司品牌名稱與品牌代碼不出現在網站、公開 CSV 與 repo 的任何檔案（含 docs、CLAUDE.md）；去識別腳本的品牌字詞只從環境變數 `DEID_BRAND_WORDS` 讀取。外部專案的 config、log、token、sheet ID 不得複製進本 repo。
- 公開前一律去識別：圖片裁切／模糊、CSV 經腳本處理並掃描殘留。

## 驗證

```bash
npm run build
python -m pytest tests
```

- 版面變更另外用 headless Edge 截圖檢查：桌面 1280px、窄版 500px（headless 最窄約 500px，更窄會被裁切而誤判溢出）、深色模式。
- 點擊類互動（篩選、翻頁、複製、深淺色切換）無法在 headless 截圖中操作；回報時標「未驗證」並請 Peter 實際點過。
