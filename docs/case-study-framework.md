# Case Study Framework (專案頁框架)

新增或改寫一個專案頁（`src/content/projects/<slug>.md`）時，照這份文件進行。範本是已完成的 [credit-card-anomaly-detection.md](../src/content/projects/credit-card-anomaly-detection.md)：遇到不確定的寫法，先看它怎麼做。

## Six-Stage Structure (六段式結構)

每個專案頁固定六個 `##` 章節，順序與標題不可變動（頁標 01–06 與紅黃綠 Badge 都依標題 id 自動產生）：

| # | 標題 | Badge | 這一章要回答的問題 |
|---|---|---|---|
| 01 | `## Problem Assessment` | 🔴 Problem | 痛點是什麼？讓沒操作過的人也能感同身受 |
| 02 | `## Solution Design` | 🟡 Analysis | 每個痛點對應到哪個解決方向？設計時有哪些限制？ |
| 03 | `## Alternative Solutions` | 🟡 Trade-off | 還評估過哪些方案？各自的優缺點？ |
| 04 | `## Selected Solution` | 🟢 Solution | 為什麼選這個？架構長什麼樣？權限範圍？ |
| 05 | `## Result` | 🟢 Result | 實際跑起來的證據：log、輸出格式、執行統計、完整資料 |
| 06 | `## Impact` | 🟢 Impact | Before / After 對照，哪些已驗證、哪些還沒量化 |

固定的 `###` 小標：Impact 底下用 `### 已驗證的成果`（🟢 Verified）與 `### 尚未量化或需要說明的部分`（🟡 Pending）。其他小標自由命名，不會有 Badge。

## Section Checklist (各章必備內容)

### 01 Problem Assessment

- 開頭一段：用業務語言說明問題，不是技術語言。
- **痛點卡片**（`pain-grid`）：每個痛點一張卡，依序是 標題 → Pain → Note → 證據。
  - 先放最能讓讀者「有共感」的痛點，並設為 `pain-wide` 整列寬。
  - 證據要具體：平台截圖（去識別後）、輪班表（姓名改代號）、流程步驟、資料量。
  - 量化人工成本：每輪耗時 × 每日次數 = 每日工時，並標明「估計」。
- `**值得投入解決的理由：**` 編號清單，每點都要有數字或真實案例（案例必須是資料期間內、已確認的）。

### 02 Solution Design

- 表格：`痛點 | 解決方向 | 對應`；「對應」欄放架構圖的分區截圖（非重點區塊模糊化，點擊可放大）。
- `**設計時必須面對的限制：**` 清單。

### 03 Alternative Solutions

- 表格：`方案 | 做法 | 優點 | 缺點`，採用的方案加粗並註明「（採用）」。
- 只列實際評估過的方案。

### 04 Selected Solution

- `**選擇 X 的原因：**` 編號清單，逐點對回其他方案的缺點。
- 架構圖（原圖）＋ Mermaid 文字版。
- `**設計重點：**` 清單，必須包含 **權限範圍**（用什麼帳號、讀或寫、核准者、帳密存放方式）。
- 尚未補齊的細節寫成 `TODO：…`，不要省略。

### 05 Result

- 一次實際執行的 log（轉錄、去識別），接著用清單說明「從這段紀錄可以看到」什麼。
- Tech Label 卡片（`tech-labels`）。
- 輸出格式範例表：範例列取自資料期間內、已確認的真實案例。
- 執行統計表：每個指標都能從公開的 CSV 算出來；開頭寫清楚統計口徑（例如「確認為錯誤」的定義）。
- 完整資料：`<details class="csv-details">` 預設收合，展開才載入 CSV。

### 06 Impact

- `### 已驗證的成果`：Before / After 對照（`ba-table`），每列 After 下方用 `<small>依據：…</small>` 寫來源。
  - 數字用實際資料（例如實際平均每日次數），不用設計值；倍數依實際值計算。
  - Before 沒有紀錄就寫「無紀錄」或「筆數未紀錄」，不要留 `—` 或編造。
- `### 尚未量化或需要說明的部分`：起算點、準確度口徑、財務效益（寫明「涉及金額 ≠ 避免的損失」）、專案性質（例如過渡方案）。

## Data Rules (數據規則)

1. **每個數字都要能對回來源**：寫進 [docs/source-notes.md](source-notes.md)，註明來源（CSV、log、簡報、Peter 口頭說明＋日期）與計算方式。
2. **口徑先定再算**：資料期間（例如只用穩定期）、計數單位（不重複交易，而不是列數）、分類定義；所有欄位都要看過（包含沒有標題的欄位）。
3. **簡報原圖的數字要核對**：與資料或其他說法矛盾時，先問 Peter，再在圖說寫「更正：原圖標示…；實際…」。
4. **估計值要標示**：頁面寫「估計」，source-notes 記錄提供者與日期。
5. **頁面上不寫「依 Peter 確認」**：決策過程記在 source-notes，頁面只寫結論。
6. **不捏造**：缺資料就寫 TODO 或問 Peter；被追問時答不出來的句子不要放。

## De-identification Rules (去識別規則)

| 類型 | 處理方式 |
|---|---|
| 簡報圖片 | 用 `sharp` 只裁安全區域；必要時局部模糊（帳號、品牌 logo、品牌代碼） |
| 瀏覽器截圖 | 一律裁掉網址列 |
| 同事姓名 | 輪班表改代號 A–N；備註中的人名改 `<name>`；姓名欄整欄刪除 |
| 交易／訂單編號 | 交易編號改流水號 `TX-0001`（同一筆保持同一代號）；訂單編號（內含客戶 ID）整欄刪除 |
| 內部系統名稱 | 改通用名稱（例如 `crm`）；公司品牌不寫出 |
| 原始檔 | 放 `canva-export/`（已列在 `.gitignore`），不進 repo |

資料去識別用腳本處理（例如 [scripts/deidentify_cc_csv.py](../scripts/deidentify_cc_csv.py)），附 pytest；輸出後再掃描一次姓名、編號是否殘留。輸出放 `public/data/`（`.gitignore` 已放行 `public/data/*.csv`）。

## Components (可用元件)

Markdown 中直接寫 HTML；樣式都在 [global.css](../src/styles/global.css)。HTML 區塊內不要有空行，要放 Markdown 圖片時前後各留一個空行（Astro 才會處理圖片）。

| 元件 | class | 用在 |
|---|---|---|
| 痛點卡片 | `pain-figure` > `pain-grid` > `pain-card tone-red / tone-grey / tone-yellow`（`pain-wide` 整列寬） | 01 |
| 平台截圖並排 | `pain-shots` > `pain-shot` | 01 |
| 耗時長條 | `pain-timebar`，各段用 `style="flex: <分鐘>"` | 01 |
| 表格內縮圖 | 表格儲存格內直接放 `![]()`，點擊可放大 | 02 |
| Tech Label | `tech-figure` > `tech-labels` > `tech-label` | 05 |
| CSV 表格 | `<details class="csv-details">` 內放 `<div class="csv-viewer" data-src="../../data/<file>.csv">`（附下載連結） | 05 |
| Before / After | `ba-figure` > `ba-table` > `ba-row`（`ba-item` / `ba-before` / `ba-after`） | 06 |

圖片放 `src/assets/projects/<slug>/`，用相對路徑引用；圖說寫在圖片下一行的 `*…*`，或 `<figcaption>`，並說明節錄來源與去識別方式。

## Workflow (進行順序)

1. **收集來源**：簡報圖片、資料 CSV、log；放 `canva-export/`。
2. **核對資料**：讀完所有欄位，定口徑，算出統計；與簡報數字不一致的地方列出來問 Peter。
3. **寫骨架**：六個 `##` 章節＋frontmatter（`metrics` 最多 3 個，都要能對回 source-notes；`accent` 選一個與其他專案不同的強調色：`forest`／`violet`／`ocean`，只改強調色，紅黃綠語意徽章不變）。
4. **補元件**：痛點卡片 → Area 對應截圖 → Tech Label → CSV → Before / After。
5. **去識別**：圖片裁切／模糊、CSV 跑腳本、掃描殘留。
6. **驗證**：`npm run build`、`python -m pytest tests`、桌機與 375px 截圖（無水平溢出）、頁標 01–06 點擊會捲到章節開頭。
7. **同步文件**：source-notes（來源、口徑、Peter 確認事項）、README（若新增腳本或流程）。

## Ask Peter (需要先問的事)

- 簡報與資料互相矛盾的數字（次數、時效、倍數）。
- 欄位意義（例如複核欄 `clear` / `error` 與備註衝突時以哪個為準）。
- 資料期間（哪段是穩定期、為什麼排除其他期間）。
- 人工耗時等只有 Peter 知道的估計值。
- 截圖要公開到什麼程度（裁切、模糊或不放）。
- 專案性質（例如過渡方案、平台停用時間）。
