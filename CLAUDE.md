# CLAUDE.md

Peter Chang 的作品集網站（Astro 7 + Markdown + Mermaid，部署到 GitHub Pages）。使用方式與目錄見 [README.md](README.md)。

## 新增或改寫專案頁

- **MUST**：依 [docs/case-study-framework.md](docs/case-study-framework.md) 進行：六段式結構、閱讀節奏、各章必備內容、數據規則、去識別規則、可用元件、驗證步驟。
- 範本：[src/content/projects/drop-order-monitor.md](src/content/projects/drop-order-monitor.md)（閱讀節奏改版後的完整示範）。
- 每個數字的來源與口徑寫進 [docs/source-notes.md](docs/source-notes.md)。
- 範本補充：平台截圖當痛點證據、架構圖分區截圖，見 [src/content/projects/credit-card-anomaly-detection.md](src/content/projects/credit-card-anomaly-detection.md)；規則圖在上表格在下、Result 操作錄影並排，見 [src/content/projects/account-automation-engine.md](src/content/projects/account-automation-engine.md)。

### 故事線（讓 Quick Read 之後能直接講到核心邏輯）

每個專案都要能用約 20 秒講完「地圖 → 關鍵概念 → 問題 → 定位 → 邏輯」，頁面順序配合這條線。各專案的口說版本在 [docs/story.md](docs/story.md)（完整版、20 秒版、畫面對照、被追問時），改頁面時一起更新。

- **標準步驟**（導覽與口說稿都照這個順序）：地圖 → 關鍵概念（先講來由）→ 問題 → 為什麼難發現 → 定位 → 做得到嗎（可行性）→ 規則圖 → 對照範例 → 解決方案 → 操作畫面 → 實際運作（log）→ 輸出結果 → 成果（案例）。
- **動手前先檢查**：寫一個專案的故事線前，先列出邏輯出入（成因說不通、例子不一致、會被追問卻答不出的數字、頁面上的矛盾），連同規劃一起交給 Peter 確認。**事實不確定一律給選項討論**，不自行補成事實；Peter 選擇後記在 source-notes。

- **01 第 1 張「背景與名詞」**：問題發生在地圖的哪一段，加上名詞說明。問題的常見成因要寫出來（例如掉單：渠道回呼失敗、上游系統異常），否則被問「為什麼會這樣」時答不出來。
- **01 第 2 張：核心邏輯**（標題用「要對的是什麼」「要查的是什麼」這類問句）。
  - 開頭先補外人不懂的**關鍵概念**（例如原入原出、掉單、一個客戶多個帳戶、清退與轉歸屬），再寫**問題定位**，句型為「要解決的不是……，而是**……**」（粗體）。
  - 接著放規則圖或規則表（Credit Card 比對規則圖、Drop-Order 判定規則表、Account Engine 引擎流程）。這張圖就是該專案的招牌視覺，不再藏在 04。
  - 規則依錯誤類型設計時，要在文字裡把「錯誤類型 ↔ 圖上路徑」對起來。
- **一條線講完再講下一條**：同一張圖有兩條以上的流程（例如入金、出金）時，導覽一步只講一條，從正常流程一路講到出問題，講完才換下一條；講第一條時用 `dim` 把其他條整條壓暗。
- **為什麼難發現要有圖**：不能只用文字。畫「各自看都正常、對起來才不一致」的對照圖（例如 Drop-Order 圖 2：CRM 畫面、CPS 畫面 → 用 Order Number 對齊 → 不一致），沿用貫穿全頁的同一個例子。
- **做得到嗎（Think → Check → Decision）**：在規則圖之前放一張人物對話圖。左邊「我（工程）」冒思考雲提出問題，右邊是相關人員（例如營運），用對話框回答；自己查得到的題目放中間虛線卡，需要對方確認的畫「去問 ×× 」箭頭。每題兩拍（先想、再查證），最後一拍是結論膠囊，並接到下一張規則。誰回答哪一題要經 Peter 確認；對方的話是示意改寫，圖說註明「對話為示意，內容依實際對齊結果」。技術設計（例如回看天數）不放進對方的回答。人像用 `sf-person`（我）與 `sf-parent`（對方，和對方的對話框同色）。
- **01 第 3 張「對照範例」**：規則裡的每一類（A–E、每種案件類型、每個步驟）都要有一列實際的欄位與值。
  - 優先取公開 CSV 的真實案件，避開 Result 已經用過的列。
  - 沒有真實資料的列標「示意」，並在註腳說明哪些是真的、哪些是示意。
  - 數字遵守單一出處，例子用的金額不算新統計。
- **關鍵概念要有來由**：不要直接丟出規則或術語，先講出讓它成立的那件事（Credit Card：先講 Bridger 替每筆充值發流水號，原入原出才是「所以退款要指定退回哪一個」的自然結果）。
- **一個例子貫穿全頁**：故事線、01 第 2 張、01 第 3 張對照範例、故事線導覽都用同一組數字（Credit Card：充值 30、40、30 USD → 退 100 USD），對照範例寫成「同一個例子的幾種變化」，真實案件放在註腳指回 Result。故事線的每個段落之間要有因果銜接（「所以」「但」「因此」），同一件事不重複講兩次。
- **動畫用的概念圖**：關鍵概念或資料落差沒有現成圖時，在 Markdown 內嵌 SVG（`figure.split-figure step-figure`，樣式類別 `sf-*`），每個可逐拍亮起的群組加 `data-b`。`step-figure` 讓當拍用主題色、箭頭畫出來、講過的淡化；框架群組命名為 `cols`、`*-lane` 或 `t-axis` 就不會淡化。三頁（Drop-Order、Credit Card、Account Engine）的 SVG 圖都已套用。一張圖只服務一兩步；四個階段塞不下一屏時拆成兩張、各放一張投影片（例如 Credit Card 的「流水號與原入原出」「兩邊各記了什麼」）。圖要能脫離導覽獨立閱讀，靜態畫面就是完整內容。
- **成果用案例講**：成果不要只列數字，要寫成事件：那天發生什麼 → 管線看到什麼 → 誰接手 → 結果 → 對照人工會怎樣。畫成時間軸 SVG（`step-figure`），一條管線一個案例、一張投影片、導覽一步（例如 Drop-Order 的「成果：入金」「成果：出金」）。同一頁的案例圖是同源的，版面要一致：左上角都寫「管線（<日期> 全天 N 次執行，每小時一次）」，上方都有紅色原因帶（`sf-bad` 膠囊），改一張就同步另一張。案例日從公開 CSV 挑真正單一小時內的爆量，排除停機後第一次執行的累積量（和前一次執行間隔超過 2 小時），「平常單次最多」也用同一個口徑。原因經 Peter 確認後寫肯定句；沒確認的不寫，或給選項討論。CSV 沒有的事（處理耗時、客訴）不畫，時間軸停在有資料的地方（例如「營運接手」）。
- **示意值要誠實**：只有明確門檻（例如風速 5 m/s）才寫數字，門檻不明的條件只標「符合」，不推定；示意數值寫明出處（例如管制標準取自測試資料）。真實案件優先取公開 CSV，挑和機制吻合的列（例如掉單選「交易成功(人工)」的入金）。
- **地圖註記只給本專案**：解說用的地圖註記（例如「有 Child 明細，無 Parent」）用 `area === "<本專案>"` 條件顯示，首頁全圖與其他專案頁不出現。
- **插入圖或投影片後重新編號**：圖號依頁面順序重排，正文、Before / After 的「依據：圖 N」、`at: "ch-N-S"` 一起改，中英文都要；改完用驗證腳本走一遍導覽。
- **細節往後放**：圖下的逐類處理方式（例如 A–E 各自輸出與否）放 04「設計重點」，不留在 01。
- **故事線導覽（`story`）**：frontmatter 填 `story: [{ label, line, at, pick }]`，Quick Read 右上會出現「照故事線看」，底部導覽列依序帶讀者走每一步。`at` 是 `map`（Quick Read 地圖）或 `ch-N-S`（第 N 章第 S 張）；`pick` 是該投影片內要加框的元件（CSS 選擇器，例如 `.mermaid`、`table`、`img`、`:scope > ul`），省略時框整張投影片。每句 `line` 用銜接詞接上一步；導覽要包含解決方案（04 架構）那一步，不要從範例直接跳到成果。只多一層導覽，不搬動內容；`line` 一句、對應 docs/story.md。英文檔填同數量的 `story: [{ label, line }]`，數量不符 build 擋。投影片順序或內容改動後，重新確認每一步框到的元件。目前 Credit Card、Drop-Order、Account Engine、Noise Camera 有；OP Ticket 尚未製作。
  - **拍點（`beats`、`dim`）**：一步可以拆成幾拍，每拍一個 CSS 選擇器（在 `pick` 元件內），講的人按「繼續」、→ 或空白鍵才亮下一組；`dim` 把屬於後面步驟的部分先壓暗。只由講的人控制，不自動播放；離開該步驟就還原，所以靜態頁面就是最後一拍。地圖的可亮元件用 `data-b`（例如 `portal`、`recharge`、`refund`、`notes`）標記；Mermaid 用 `[id*="-flowchart-節點-"]`、`[id*="-L_起點_"]`、`[data-id^="L_起點_"]` 選取；表格用 `tbody tr:nth-child(n)`；長條用 `li:nth-child(n)`（長條會從 0 長出來，數字不跳動）。改 Mermaid 節點名稱、表格列數或地圖元素後，要重走一遍導覽確認每一拍都有東西亮。執行 log 的程式碼區塊每行是 `span.line`，可用 `.line:nth-child(n+a):nth-child(-n+b)` 分段；拍內的 `<video>` 會在走到該拍時自動靜音從頭播放、離開時暫停。
  - **成果要有實際運作的佐證**：導覽在數據之前先走「實際運作」（操作錄影或截圖 → 執行 log → 輸出表），證明真的在跑，再給數字。截圖或錄影先放 `canva-export/<專案>/`，去識別後才進網站：裁掉瀏覽器分頁、網址、文件路徑、資料夾名與頭像（分頁標題常含品牌名稱）；編號類欄位（User ID、帳號、訂單編號，VU／V2U 開頭疑似品牌代碼）與人員姓名欄（例如 Handler）只模糊資料列、保留表頭；Peter 本人的浮水印保留；輸出寬 1600px 放 `src/assets/projects/<專案>/`，做法記在 source-notes。不是操作畫面的素材（例如簡報文字截圖）不當佐證。多張截圖用 `shot-gallery` > `shot-strip` > `shot-item` 做成左右滑動的圖組，導覽每拍一張（`.shot-item:nth-child(n)`），走到該拍時圖組會自動滑過去。
- **頁面上不留 TODO**：資料取得方式、替代方案（例如「請 IT 提供報表」）、權限範圍，都是故事線一講就會被問的；缺資料就問 Peter，未補的項目記在 source-notes 的待辦。

### 閱讀節奏（避免四頁看起來一樣）

- **頁面分區**：模板 [[slug].astro](src/pages/[...lang]/projects/[slug].astro) 自動排成以下順序，Markdown 不必處理；標題、公司、期間留在區塊外，右側是該專案的機台爆炸圖（見〈專案機台〉）。區塊標籤只用英文。
  1. **Tech Choices**：Role → Focus → Stack。
  2. **Quick Read**：系統地圖的放大裁切（只看本專案區域與相鄰節點；左上「看完整地圖 →」連回首頁，右上「本專案負責：…」）→ TL;DR 三格（Problem／Approach／Result）→ metrics。
  3. **Deep Dive**：六章內容。
  - 底色透明度只在 `global.css` 的 `--zone-tech-alpha`、`--zone-brief-alpha`、`--zone-detail-alpha` 調整，淺色與深色各一組。
- **MUST**：frontmatter 填 `focus`（1–2 個），用 104／LinkedIn 常見的搜尋關鍵字（通用職能詞，例如 Data Integration、Financial Reconciliation），意思須與該頁內容一致；不用暗示特定工具或意思不同的詞（例如 CDC、RPA、Transaction Monitoring）。Stack 維持工具清單。
- **MUST**：frontmatter 填 `system_map: { map, area }`。地圖一家公司一張，在 [SystemMap.astro](src/components/SystemMap.astro)；完整地圖只出現在首頁成果地圖，專案頁顯示 [system-maps.ts](src/data/system-maps.ts) 的 `map_crops` 裁切範圍，避免四頁重複同一張大圖；「本專案負責」標籤放在地圖框外右上角，不疊在圖上。海科的地圖由 `canva-export/structure.png` 用 SVG 重畫：不放品牌名稱，PSP 與渠道名稱保留；重畫來源只記在 source-notes，頁面不加圖說。海科地圖的線要畫出**方向與流動的東西**：客戶的入口一律從 Client Portal 拉虛線（信用卡到 Payabl、其他渠道到 CPS）；雙向的資金流畫成兩條帶標籤的箭頭（信用卡段 Recharge／Refunded、掉單段「入金指令」（CPS→CRM）／「出金指令」（CRM→CPS））。Payabl 這個名字只出現在信用卡段（「Credit Card Payabl」），掉單段的信用卡渠道用通稱「Credit Card PSP」。帳務段的「CRM 後台 × 4」表示每個 regulator 各一套後台。維碩的地圖（`weishuo`）是主幹線圖：一筆事件的主流程由左到右，外部來源從上方接入、產出從下方接出，箭頭只往右或往下；每條連線標上傳遞的資料（例如「量測值」「乾濕、風速、降雨」「判定結果」）；本人負責的節點以主題色框線並標上階段文字（量到、查證、判定、看見，不加 01–04 編號，避免和專案頁的章節編號混淆），左下角附圖例。新增維碩專案時接到主幹線上，不畫回頭線、不另畫一張。換公司時新增一張地圖與 `map` 名稱，不把不同公司的專案畫在同一張圖；Projects 頁目前不放地圖。新公司的專案填好 `system_map` 後，首頁成果地圖會自動多一家（名稱取自該公司專案的 `company`，顯示時去掉「（股份）有限公司」或 Ltd.）。
- **MUST**：frontmatter 填 `tldr: { problem, approach, result }`，每行一句、約 40 字以內、不放數字（數字交給 `metrics`）。`summary` 保留給 Projects 卡片與 meta description。
- **MUST**：數字單一出處。每個數字只在證明它的那一章完整出現一次，其他章寫「（見 Result）」；01 放證明問題存在的數字，05 放執行結果與統計，06 只放 Before / After 對照，不重抄 05。
- **MUST**：元件預算。一張投影片一個主元件（表格、卡片、長條、Mermaid、log、Before / After、錄影擇一；Tech Label、名詞說明、CSV 收合區不計），相鄰投影片的主元件盡量不同；每章 Markdown 表格最多 2 張；分布型資料用 `bar-list`、兩欄對應用清單，不用表格；痛點卡片只用在 01。
- **招牌視覺**：每個專案一個只有它才有的主視覺，放在 01 或 02（錄影類可放 05 開頭），類型不與其他專案重複，記在 source-notes。
- 頁面上的解讀句只寫資料撐得住的事實；推論或建議沒有依據就不放。
- **MUST**：網站以繁體中文為主（`/`），英文版在 `/en/`，全站頁面（含專案頁）都有兩種語言。中文頁面內文一律繁體中文。來源系統的簡體欄位名稱與狀態值（交易状态、处理完成、客户问题…）在頁面上轉成繁體，「账号」寫成台灣慣用的「帳號」；公開 CSV 可保留來源原貌，頁面上註明「CSV 保留來源系統的簡體字」。用 OpenCC 等工具判斷時，異體字（台、才、查核、吃、群、折、佣、准、表）不要改。
- **MUST**：網站頁面不放 emoji 或圓圈數字（①②），語意顏色交給既有元件（章節徽章、`tone-*`、`ba-before`／`ba-after`）；README 與 docs 不受此限。
- **MUST**：每個專案在第一章加「名詞說明」收合頁籤（`glossary-details`），定義經 Peter 確認後才放上，不確定的名詞先問。
  - 海科專案的信用卡用語統一：信用卡入金稱**充值（Recharge）**、出金稱**退款（Refunded）**，退款遵守**原入原出**（退回充值時使用的原卡，並對應原本的充值訂單）。Credit Card 與 Drop-Order 兩頁的名詞說明要一致。
- **MUST**：frontmatter 填 `categories`（技術類型，至少一個），可選值只來自 [src/data/project-categories.ts](src/data/project-categories.ts)；新類型先加進該檔。Projects 頁只顯示有專案的分類按鈕。
- **MUST**：期間欄位只寫日期，格式 `YYYY/MM~YYYY/MM`（月份補零）；仍在運作的寫 `YYYY/MM~`。「開發」「上線」標籤由 [ProjectPeriod.astro](src/components/ProjectPeriod.astro) 加上，Markdown 不寫標籤或括號說明。
  - `period` 填開發期間；`launch` 填上線期間，沒有上線資訊就省略。卡片與專案頁顯示成兩欄對齊的「開發／上線」兩行，編號與公司名稱另起一行。
  - 同一專案有多條線、各自開發與上線（例如 Drop-Order 的入金／出金）時改填 `phases: [{ name, period, launch }]`，顯示成「列 = 線別、欄 = 開發／上線」的表格；`period` 保留整體期間但不顯示，也不再填 `launch`。線別用中文（入金／出金）。
  - 日期需經 Peter 確認，來源記在 source-notes。
- 長章節用 `<hr data-slide="小標">` 切成章內投影片（一張約一個螢幕、說明與它的圖表同一張），切法見框架文件〈Components〉。
  - Mermaid 流程圖預設 `flowchart LR`；由上往下排超過一個螢幕高時，一律改成由左往右。
  - Markdown 表格在桌面 1280px 不可橫向捲動：最多約 5 欄；過寬時拿掉可以寫進下方說明的欄、合併同類欄（例如幣別併入金額），長表頭用 `<br>` 斷行，短的路徑或代碼用 `&nbsp;` 防止斷行。窄版 500px 允許表格內橫向捲動。

## 網站設計慣例

- **配色**：品牌色只用 `global.css` 的 token：`--accent`（深藍，主色）、`--accent-2`（磚紅，章節編號、hover 與長條的高亮列）、`--blob`（照片色塊）。不在頁面或元件寫死色碼；新增 token 必須同時在 `:root` 與 `:root[data-theme="dark"]` 各定義一次。紅黃綠只用於語意徽章（含 TL;DR 三格頂線：紅 Problem、黃 Approach、綠 Result），不當裝飾色。
- **專案主題色**（frontmatter `accent`）：每個專案一色、不重複。目前 Drop-Order = `forest`、Credit Card = `violet`、Account Engine = `ocean`、OP Ticket Data Pipeline = `slate`、Noise Camera Enforcement = `amber`；新專案需要新色時，在 [content.config.ts](src/content.config.ts) 的 enum 與 `global.css` 淺色、深色各加一組。
- **深淺色**：`<html data-theme>` 由 [Base.astro](src/layouts/Base.astro) 的 inline script 在首次繪製前設定（訪客選擇優先，否則跟隨系統）。CSS 一律寫 `[data-theme="dark"]`，不寫 `@media (prefers-color-scheme)`；JS 繪製的內容（例如 Mermaid）監聽 `themechange` 事件重畫。
- **個人照片**：只用 [ProfilePhoto.astro](src/components/ProfilePhoto.astro)（不規則色塊 + 右下小點，不加手繪線條），目前只用在首頁 hero（Contact 不放照片，第一屏留給 Email）。檔案為 `public/media/peter-photo.jpg`（560px 寬）；原始大圖與設計參考圖不留在 repo。
- **外部設計素材**（Canva 等）：不直接放上網站，只沿用色票與形狀，用 CSS／SVG 重畫，避免授權問題。
- **文案語氣**：首頁大標與 hero 介紹段先講使用者價值與為人（熱忱、從使用者角度出發、團隊合作、深耕資料工程與 AI），不以「逆向工程」「沒有權限」開場；技術手段放在能力列表與專案頁。所有個人文案集中在 [profile.ts](src/data/profile.ts)。
- **雙語同步 MUST**：改 `profile.ts` 的文字時同步改 [profile.en.ts](src/data/profile.en.ts)（日期、標籤、連結只寫在 `profile.ts`）；新增介面字串放 [ui.ts](src/i18n/ui.ts) 的 `zh`、`en` 兩邊；專案頁的英文版在 [src/content/projects-en/](src/content/projects-en/)（同檔名，只放文字：summary、role、metric_labels、tldr 與內文），日期、Stack、數字與系統地圖只寫在中文檔；改中文專案頁的內文或數字時同步改英文檔，缺檔或 metric_labels 數量不符時 build 會失敗。英文 Markdown 裡的影片與 CSV 連結比中文多一層 `../`（網址多了 `/en/`）。英文文案為 Claude 草稿，經 Peter 審稿後才算定稿。
- **Contact**：獨立頁 `/contact/`（置中標題與一句邀請 → 主視覺數位名片：P 標誌、姓名職稱、Email 含複製、GitHub／LinkedIn、求職資訊 `contact_facts`，兩側管線流入（名片是首頁產線的終點：寬版由 contact.astro 依實際尺寸畫成管子，左側一家公司一條管線、標公司簡稱，流入的是已蓋章、該公司已上線專案顏色的圓（`get_production_lines`）；每個工作階段第一次進站時從外側伸過來、停在名片前、再卡上接通；滑過名片會微微浮起、疊層展開；按「複製」會有磚紅色的封包沿右側管線送出；900px 以下兩側管線隱藏，改在名片上方放同樣產線的靜態插圖，可左右捲動）→ 可以找我聊＝**主題分揀寄信機**：名片下方一條藍圖管線，四張主題卡（`talk_topics`）是投入口，點一張就有封包經分揀、蓋章升進名片，名片出現「主旨＋開始寫信（mailto 帶主旨）＋複製主旨」；沒有 JS 時主題卡本身就是帶主旨的 mailto 連結，窄版或減少動態時點了直接填入名片；第一次進站管線線稿畫出、投入口卡上；按「複製」名片壓下、右側管線射出光跡；字串在 `ui.ts` 的 `contact.topic_*`、`contact.letter_*`；生活照只放 About），首頁結尾放迷你名片連過去。文案在 `profile.ts` 的 `contact_invite`、`contact_facts`、`talk_topics`。求職狀態等個人資訊只放 Peter 提供的內容，不自行編寫；網站是靜態站，不做需要外部服務的聯絡表單。
- **首頁（30 秒介紹）**：hero（價值句 `tagline` 當大標 → `intro[0]` → 職稱與「正在尋找新機會」→ 按鈕 → 「更多關於我」「跳傘與潛水」各一行）→ 專長與工具關鍵字列（由專案自動產生）→ 成果地圖（[ImpactMap.astro](src/components/ImpactMap.astro)：公司控制項依家數自動切換：1 家不顯示、公司簡稱寫進標題「成果地圖 · 海科科技」，2–4 家用分頁標籤，5 家以上用下拉選單；每家公司一張系統地圖全區亮起、各區用專案主題色並標上專案短名，建置中的區域變淡；下方每個專案一張卡：之前 → 之後 ＋ 最多 2 個數字，已上線的照地圖由左到右排、建置中的排最後；窄版地圖收進「查看系統地圖」）→ 迷你名片。動態：hero 下方是**專案機台產線**，畫成軸測藍圖（見〈藍圖語言〉與〈專案機台〉；需 JS，寬度 900px 以上由 index.astro 依實際版面繪製，以下改成可左右捲動的靜態插圖；封包共用 [pipe-packets.ts](src/lib/pipe-packets.ts)）：一家公司一條產線（`--hp-lines` 依家數撐開 hero 下緣），一個專案一台機台，從主幹沿深度方向接支管進機台；機台做的事就是專案的邏輯，好的資料蓋成專案顏色的圓、往上打進照片（色塊每接一顆回彈），對不上的進機台旁的托盤；建置中的專案畫成鷹架、不跑封包。滑過機台：鏡頭就地放大 2.1 倍（`HOVER_S`，限制在 hero 文字下方的管線帶內；字級除以縮放倍率，所以字不變大、彼此拉開）、外殼微微浮起（保持立體，不淡出）、標出機構，旁邊出現該專案的之前／之後卡片；點機台：鏡頭推近後飛進專案頁（跨頁 View Transition，見〈專案機台〉）；訪客可按「丟一筆資料進去」或點空白處投入自己的封包（磚紅色、一定通過），鏡頭會跟著它走到照片前。每個工作階段第一次進站時管件逐節卡上再湧入封包，同時大標與職稱的字從散落各處依閱讀順序飛回原位、像蓋章一樣就位（[scatter-text.ts](src/lib/scatter-text.ts)：真文字留在原位只是先隱形，逐字複本飛完即移除，版面不跳動；介紹段不動，維持可讀）；hero 按鈕列的「管線視圖」開啟 [PipelineView.astro](src/components/PipelineView.astro)：首頁各區用 View Transitions 變形成 DAG 節點（hero → 來源、能力群組 → 能力、成果地圖的專案卡 → 專案節點（全部公司、每家一條泳道）、迷你名片 → 終點、常用工具 → 執行環境軌道），連線是資料血緣（專案的 `focus` 落在哪個能力群組就接哪個），打開後自動 Run 一次（等待 → 執行中 → 完成，建置中的專案停在「建置中」），滑到節點追溯上下游，點節點變回閱讀模式並停在那一區；節點只放標題與狀態，不放數字，之後直接顯示運轉中的狀態；減少動態時顯示同一場景的靜止畫面；機台的名稱、註記、機構標籤與各層文字在 `src/data/machines.ts`，hero 的固定字串在 `ui.ts` 的 `home.pipe_*`、`home.machine_open`；成果地圖第一次進入畫面時，區域與卡片依卡片順序逐一亮起，滑到地圖區域會亮對應卡片、點擊進專案頁。About 寬版（1100px 以上、未開減少動態）是**捲動參觀工廠**（[about-factory.ts](src/lib/about-factory.ts)）：左側固定一座藍圖工廠，一個區塊一站，輸送帶由上往下蛇行（每列由左往右，回程管下到下一列）；捲到哪一區鏡頭就飛到哪一站（目前這站在上方約三分之一、其他站變淡），該站第一次到達時線稿一筆筆畫出再啟動；第一次進站時骨架先畫出、站名滑入；讀者的封包隨捲動沿輸送帶前進，捲到頁尾時鏡頭帶出「Contact →」出口；點某一站會捲到該區。各站依頁面順序：職涯產線、方法機台、證照蓋章機、能力模組架（名稱斜放成註記）、原則控制台（標題在逗號處斷行）、升降機（天空 → 海平面 → 水下，車廂跟著 Off the Clock 的捲動）；站與區塊的對應在 `POS`。窄版或減少動態時不顯示工廠，改回各區塊自己的職涯產線與方法機台。區塊或站的順序要一致（`data-station` 與 `factory_data.titles`）。About 的區塊順序：01 Background → 02 Problem-solving Approach → 03 Certifications → 04 Core Capabilities → 05 Engineering Philosophy → 06 Off the Clock（興趣補充放最後，Peter 決定）。01 Background 在時間軸上方放**職涯產線**（取代舊的職涯時間條）：一份工作一台機台、寬度依月數、地板標年份，封包在第一份工作蓋章、在現職換成磚紅色，最後流進「正在尋找新機會」虛線鷹架（點了到 Contact）；滑過機台放大並顯示職稱、期間、作品與標籤（`profile.ts` 的 `experience`：`works` 有 `project` 的連到該專案頁、名稱取自專案（中文用副標題），其餘寫 `name`；`tags` 對齊專案的 Focus 與主要工具）；時間軸清單由近到遠，產線由舊到新。02 Problem-solving Approach 在清單上方放**方法機台**（步驟名稱前不加編號，避免和章節編號混淆）：一格一個步驟（`approach` 的 `step`、`title`），封包逐格通過、點亮下方清單對應的那一步，滑過某格放大並固定點亮。兩者共用 [bp-scene.ts](src/lib/bp-scene.ts)（放大時字級不變；900px 以下為可左右捲動的靜態插圖）。About 的 Off the Clock 是「天空 → 海平面 → 水下」垂直軸，每張照片在 `profile.ts` 的 `life.photos[].zone` 歸區，不標高度或深度數字；新增照片要填 `zone`。About 的 03 Certifications 依領域分組（`profile.ts` 的 `certifications`，組內依日期新到舊），每張是縮圖＋名稱＋發證單位＋年月，點開是遮蔽後的證書圖；潛水等生活類證照不放這裡，放 Off the Clock 對應區（`life.cert`）。Core Capabilities 只放 About；專案卡片清單只放 Projects 頁。成果呈現沿用自己的系統地圖與管線風格，不用漸層、光暈、閃爍圓點、數字跳動這類通用儀表板元素。首頁與 Contact 不加章節編號（01、02），專案頁與 About 保留。
- **藍圖語言（3D）**：全站視覺是「工程藍圖」。3D 只給管線與容器，文字、表格、規則圖、log 一律正面平放。
  - **場景**（首頁 hero 的專案機台、專案頁頁首的機台、Contact 管線、管線視圖）：軸測線稿。管子是外框線加點劃中心線，接頭是橢圓圈；機台是玻璃殼（看得到的面半透明，看不到的稜線用虛線），封包在殼內看得見；地板是格線紙。所有管線與封包都在同一個正面平面上，深度只往右上退（`src/lib/blueprint.ts` 的 `View`：角度 40°、深度半比例）。
  - **系統地圖**：正面藍圖。座標、`map_crops`、`tag_at`、故事線拍點都不動，只換畫法：格線紙底、線稿節點加上 [Base.astro](src/layouts/Base.astro) 的 `#bp-extrude` 濾鏡（往右上的厚度）、連線標籤用等寬字。
  - **卡片與按鈕**：背後往右上疊薄層（D 疊層），用 `box-shadow` 畫（`global.css` 檔尾「Blueprint layers」），滑過展開、按下收合。新增卡片類元件時把選擇器加進那一段；疊層方向由 `--lx-k`、`--ly-k` 控制。
  - **互動**：滑過 hero 機台時外殼浮起；游標在 hero、Contact 舞台、管線視圖上移動時，深度方向跟著微轉（`tilt()`），疊層方向也一起轉。減少動態時不轉、不浮起動畫。
  - 顏色只用 `--bp-line`（線）、`--bp-grid`（格線）、`--bp-glass`（玻璃面）、`--bp-side`（厚度側面）四個 token，不用漸層、光暈或柔和陰影。
- **專案機台**（[machines.ts](src/data/machines.ts)）：每個系統地圖區域一台機台，中英文都要填：`kind`（`match` 兩份報表逐筆配對、`align` 兩條線用鍵值對齊、`query` 驗證後到各後台查詢、`stages` 連續關卡、`scaffold` 建置中）、`name`、`note`（掀開時才顯示）、`parts`（機構標籤）、`outlet`（托盤名稱）、`layers`（專案頁頁首爆炸圖，由上往下）。文字只寫專案頁撐得住的事實、不放數字，經 Peter 確認後記在 source-notes。
  - 專案頁頁首右側是 [MachineView.astro](src/components/MachineView.astro)：同一台機台拆成各層，建置時就畫好（沒有 JS 也完整），JS 只加封包穿層、滑過亮層與微轉。幾何在 [machine-geom.ts](src/lib/machine-geom.ts)，伺服端與瀏覽器共用。
  - 跨頁轉場只給「點機台」：首頁在放大的機台上放一個 `view-transition-name: machine-fly` 的框並設 `sessionStorage`，Base.astro 讓到達頁的 `.machine-view` 取同名；其他換頁一律在 `pageswap` 跳過轉場。`@view-transition` 寫在 Base.astro 的 inline `<style>`，不要搬回外部 CSS（新頁可能在外部 CSS 解析前就被判定沒有 opt-in，轉場時有時無），也不要包在 `@media` 裡（同樣會中止）；減少動態時首頁直接換頁、不放框，自然不會轉場。
- **新增互動元件**：沒有 JS 時內容仍要完整可讀（漸進增強）；鍵盤可操作、有 `focus-visible` 樣式、尊重 `prefers-reduced-motion`。

## 連動關係（改 A 時必須一起檢查 B）

標「build 擋」的會讓 `npm run build` 失敗；其餘只能靠人工對照，改完照這張表逐項檢查。

### 個人文案（`profile.ts`）

| 改動 | 一起檢查 | 檢查方式 |
|---|---|---|
| `profile.ts` 任何文字 | `profile.en.ts` 對應欄位 | 人工 |
| `tagline` | 首頁大標、About 頁首、全站 meta description 與社群預覽描述（Base.astro 的 `og:description`） | 人工看長度：首頁大標中文約 4 行內 |
| `title` | 首頁 hero、Contact 名片、頁尾、Base.astro 的 `<title>` 與 `og:title`、社群預覽圖 `public/og.png` | 圖要重新產生（見下方品牌表） |
| `intro`（陣列） | 首頁 hero 只顯示 `intro[0]`，About 顯示全部；改第一段兩頁都會變 | 人工 |
| `contact_invite` | 首頁迷你名片、Contact 頁首、Contact meta description | 人工 |
| `contact_facts`（求職資訊） | 首頁 hero 的「正在尋找新機會」（`ui.ts` 的 `home.open_to_work`）；不再求職時兩者一起拿掉 | 人工 |
| `life.photos` 新增、刪除、調順序 | `profile.en.ts` 的 `life_photo_text` 同順序同數量；有 `video` 的項目要有同名 jpg 封面 | 數量不符 build 擋；順序人工 |
| `certifications` 新增、刪除、調順序 | `profile.en.ts` 的 `certification_text` 同組、同順序、同數量；`public/media/certs/` 要有遮蔽後的 `<slug>.jpg` 與 `<slug>-thumb.jpg`；來源與遮蔽做法記在 source-notes | 數量不符 build 擋；身分證格式字串 pytest 擋（圖片內文字只能人工看） |
| `experience`（新增、改日期或職稱） | About 職涯產線的機台數、寬度（月數）、年份刻度與滑過卡片；時間軸文字 | 人工：截圖看機台標籤有沒有擠在一起（短期工作的機台很窄） |
| About 區塊新增、刪除或調順序 | `about.astro` 的 `data-station` 與 `factory_data.titles`、[about-factory.ts](src/lib/about-factory.ts) 的站（`ROW`）| 人工：寬版從頭捲到尾，看每一站鏡頭與點亮 |
| `certifications`、`capabilities`、`philosophy` 數量 | About 工廠的證照卡數、模組數、控制台單元數 | 人工 |
| `approach` 新增或刪除步驟 | About 方法機台的格數（一格一步，與清單同順序） | 人工 |
| `capabilities`、`principles`、`approach` 的例子 | 例子裡的數字要和專案頁一致（例如 Unblock 的平台數） | 人工 |

### 專案頁（`src/content/projects/<id>.md`）

| 改動 | 一起檢查 | 檢查方式 |
|---|---|---|
| `metrics` 的數值 | `docs/source-notes.md` 的來源與口徑；專案頁內文出現該數字的章節 | 人工 |
| `metrics` 新增、刪除、調順序 | `projects-en/<id>.md` 的 `metric_labels` 同順序同數量 | 數量不符 build 擋；順序人工 |
| `metrics` 含 `XX` 佔位 | 不得設定 `home`（首頁不放未定稿數字）；定稿後再加回 `home` | build 擋 |
| `home: true` | 有：成果地圖卡片顯示數字；沒有：卡片與地圖區域都標「建置中」並排最後 | 人工 |
| `metrics` 的 `on_home: true` | 成果地圖卡片上顯示的數字（每個專案最多 2 個），數值與說明直接讀 `metrics` | 超過 2 個 build 擋 |
| `system_map.area`、`accent` | 成果地圖上該區的位置與顏色，要和卡片同色；卡片順序依 [system-maps.ts](src/data/system-maps.ts) 的 `map_area_order` | 人工 |
| 專案改名或新增區域 | [system-maps.ts](src/data/system-maps.ts) 的 `map_tags`（地圖上的短名，中英文各一）、`map_crops`（專案頁的裁切範圍）＋ SystemMap.astro 的 `tag_at` 座標 | 人工 + 截圖（首頁全圖與該專案頁都要看） |
| `focus`、`stack` | 首頁管線視圖的連線（專案接到哪個能力節點）與執行環境軌道；首頁專長與工具列：專長依 [focus-groups.ts](src/data/focus-groups.ts) 收成 3 個能力群組（群組名稱＋該組的 focus 小字）；工具 = 出現在 3 個以上專案的 `stack`，用得多的在前 | 新的 `focus` 沒有歸到任何群組時 build 擋；群組名稱與歸屬人工；新增專案後截圖看長度 |
| 新增一家公司 | `content.config.ts` 的 `system_map.map` 與 `area` enum、[system-maps.ts](src/data/system-maps.ts) 的型別、`map_area_order`、`map_tags`、[SystemMap.astro](src/components/SystemMap.astro) 新增該公司的圖、`global.css` 的 `.impact-company:has(...)` 補上新 `area` 名稱；下拉選單與卡片分組自動產生 | enum 不符 build 擋；圖與 CSS 人工 |
| 同一家公司的專案 `company` 名稱 | 成果地圖的標題／分頁只取該公司第一個專案的 `company`（去掉法人字尾），各專案要寫成一模一樣 | 人工 |
| 系統地圖的圖形（[SystemMap.astro](src/components/SystemMap.astro)） | 首頁成果地圖（全圖）與專案頁 Quick Read（裁切）共用同一張；節點移動後檢查 `map_crops` 與 `tag_at` 是否還框得到 | 人工 + 截圖 |
| `impact: { before, after }` | 首頁成果地圖卡片的「之前／之後」，一句、不放數字；`projects-en` 也要有一份 | 地圖上的專案缺 `impact` build 擋；英文人工 |
| `story`（故事線導覽） | `projects-en` 的 `story` 同順序同數量；每步的 `at`／`pick` 在投影片增刪、調順序後是否仍指到對的元件；docs/story.md 的口說稿 | 數量不符 build 擋；指向人工（點一遍導覽） |
| `summary` | Projects 頁卡片、專案頁 meta description、`projects-en` 的 `summary` | 人工 |
| 內文、`role`、`tldr` | `projects-en/<id>.md` 對應段落；英文影片與 CSV 連結多一層 `../` | 缺檔 build 擋；內容人工 |
| `accent` 新色 | `content.config.ts` 的 enum ＋ `global.css` 淺色、深色各一組 | enum 不符 build 擋；CSS 人工 |
| `categories` 新類型 | `src/data/project-categories.ts` | build 擋 |
| `order` | Projects 頁順序與卡片編號（首頁順序另由 `home.order` 決定） | 人工 |

### 品牌與共用元件

| 改動 | 一起檢查 | 檢查方式 |
|---|---|---|
| P 標誌的圖形 | `public/favicon.svg` 與 [BrandMark.astro](src/components/BrandMark.astro) 同一組座標（導覽列、Contact 名片、首頁迷你名片都用 BrandMark） | 人工 |
| `--accent`、`--accent-2` 色值 | `favicon.svg` 寫死了淺色 `--accent`（#2f4f8f）與深色 `--accent-2`（#e09a83），favicon 讀不到 CSS token | 人工 |
| 品牌色、P 標誌、姓名或職稱 | 社群預覽圖：改 [scripts/og/og.html](scripts/og/og.html)（色碼寫死，對照 `global.css` 淺色 token），再依檔案開頭的指令重新產生 `public/og.png` | 人工 |
| 新增任何 CSS token（含 `--shadow`） | `:root` 與 `:root[data-theme="dark"]` 各定義一次 | 人工 |
| 複製 Email 的行為或文字 | [CopyEmail.astro](src/components/CopyEmail.astro)（首頁、Contact 共用）＋ `ui.ts` 的 `contact.copy*` 兩種語言 | 人工 |
| 新增專案（新的 `system_map.area`） | [machines.ts](src/data/machines.ts) 要有該區的機台（中英文）；首頁 hero 自動多一台、專案頁頁首自動出現爆炸圖 | 缺項時首頁建置失敗；文字經 Peter 確認、記 source-notes |
| 專案的 `accent`、`home`（上線與否） | Contact 左側管線的封包顏色（只取已上線專案）與公司管線數 | 人工 |
| 專案的 `title`、`accent`、`impact`、`home` | 首頁 hero 機台的顏色、滑過卡片的之前／之後、建置中鷹架（`home` 未設）；專案頁頁首機台的顏色 | 人工：滑過每台機台各一次 |
| [machines.ts](src/data/machines.ts) 的 `layers` 數量或文字 | 專案頁頁首爆炸圖的層數與標籤（英文長句最多約三行，否則會疊到下一層） | 人工：中英文各截圖一次 |
| 新增卡片或按鈕類元件 | `global.css` 檔尾「Blueprint layers」的選擇器清單（疊層）；系統地圖新增節點用 `.node` 就會自動有厚度 | 人工：截圖看疊層有沒有被父層 `overflow` 裁掉 |
| `src/lib/blueprint.ts` 的 `View` 或 `tilt()` | 首頁 hero、Contact、管線視圖三處的轉動；`#bp-extrude` 與疊層的方向（右上）要一致 | 人工：三處各移動游標看一次 |
| GitHub／LinkedIn／Email 圖示 | [SocialIcon.astro](src/components/SocialIcon.astro)；品牌圖示來自 Simple Icons（CC0），換版本時更新註解 | 人工 |
| `ui.ts` 新增或刪除字串 | `zh`、`en` 兩邊同時改 | 人工 |
| 頁面結構（首頁、Contact、About 的區塊順序） | 本檔〈網站設計慣例〉對應的描述 | 人工 |
| 首頁 hero 的結構（`.hero-scene` 包 `.hero-pipes`、`.hero-drop`、`.hero-machine-card`） | index.astro 的腳本與 `global.css` 的 `.hero > :not(...)` 排除清單：新的絕對定位元素要加進排除清單，否則會被推進版面 | 人工 |
| 首頁區塊的 class（`.hero-text`、`.hero-photo`、`.focus-groups > li`、`.impact-card[data-area]`、`.home-contact`、工具列 `ul`） | [PipelineView.astro](src/components/PipelineView.astro) 的 `data-morph`／`data-target` 選擇器：對不到時變形與「點節點回到那一區」會失效，不會報錯 | 人工：打開管線視圖、點每種節點各一次 |
| 生活影片 | 原始檔放 `canva-export/life/`（不進 git），網站用剪好的 `public/media/life/*.mp4`＋同名 jpg 封面 | 人工 |

## 機敏資料

- `canva-export/`、`PeterChang_rv.pdf`、`PeterChang_core.md` 含同事姓名、內部網址、交易編號與個人資料，只能讀，不可複製進 `src/` 或 `public/`。Peter 新給的原始素材（xlsx、README、架構圖等）先移到 `canva-export/<專案>/` 再處理，不留在 repo 根目錄。
- 公司品牌名稱與品牌代碼不出現在網站、公開 CSV 與 repo 的任何檔案（含 docs、CLAUDE.md）；去識別腳本的品牌字詞只從環境變數 `DEID_BRAND_WORDS` 讀取。外部專案的 config、log、token、sheet ID 不得複製進本 repo。
- 公開前一律去識別：圖片裁切／模糊、CSV 經腳本處理並掃描殘留。
- 證書與證照：身分證字號（含條碼）、出生日期、證書序號／License ID、角落控制編號一律用實心色塊遮蔽（不用模糊）；第三方（教練、助教）的姓名與會員編號也要遮。原檔與遮蔽腳本只放 `canva-export/certificates/`，因為腳本內含證號與第三方姓名。輸出後要逐張目視檢查。

## 驗證

```bash
npm run build
python -m pytest tests
```

- 版面變更另外用 headless Chrome（本機沒有 Edge）截圖檢查：桌面 1280px、窄版 500px（headless 最窄約 500px，更窄會被裁切而誤判溢出）、深色模式。截圖要看「導覽框到的元件」而不只是整頁：表格不可橫向溢出、圖要在導覽列上方完整出現。
- 故事線導覽改動後，用腳本逐拍走過中英文兩版（每拍有元件亮、只框一個元件、關閉後無殘留、無 console error）：`npm run build && npx astro preview`，再執行 `uv run --with playwright python scripts/story_walk.py <slug> [base_url] [--shots DIR]`。
- 其他點擊類互動（篩選、複製、深淺色切換）可以用 Playwright 操作驗證；無法驗證的項目回報時標「未驗證」並請 Peter 實際點過。
