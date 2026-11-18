# Source Notes (內容來源與待辦)

網站上的每一個數字與宣稱都要能對回這裡。來源文件（`PeterChang_rv.pdf`、`PeterChang_core.md`）含個人資料，不進 repo。

## Source Mapping (來源對照)

| 網站內容 | 來源 |
|---|---|
| 首頁定位、Engineering Philosophy | `PeterChang_core.md` 二、四、五節（改寫，未原文引用） |
| 經歷、學歷 | PDF〈工作經驗〉〈學歷〉 |
| 0-to-1 Operation Data Infrastructure | PDF 專案「營運數據基礎設施架構 0-to-1」+ 海科科技職務描述 1、2、3 |
| Credit Card Anomaly Detection | PDF 專案「信用卡異常出金偵測」+ 海科科技職務描述 4 |
| Account Operation Automation Engine | PDF 專案「營運帳務自動化引擎」+〈工作技能〉 |
| 「與營運端對齊偵測邏輯」 | Peter 口頭說明（2026-11-16） |
| 「約 80% 業務場景可通則化」 | Peter 口頭說明（2026-11-16） |
| Credit Card 頁（六段式框架） | `canva-export/images/Payabl QC new Template - New Data.csv` + `Credit Card Anomaly Detection_1~4.png`（皆不進 repo） |
| Drop-Order Monitor 頁 | `canva-export/drop-order/<品牌> Task (CRM - CPS Report).xlsx`、`README_DE.md`、`README_OP.md`（皆不進 repo）＋ 原專案程式與 `logs/20261118.log` + Peter 說明（2026-11-18） |

## Credit Card Anomaly Detection (資料分析)

CSV 為對帳管線的輸出紀錄：每列 `Comparison` = 一次執行時間；全 `-` 列 = 該次無異常；第 14 欄 `clear`/`error` = 營運複核結果（確認無誤／確有登打錯誤；Peter 確認 2026-11-16：複核為 clear 但備註寫明錯誤並已撤銷者，算錯誤），第 15 欄為複核人員姓名（不公開）。

| 數字（2026-03-01 ~ 2026-07-31，Peter 指定的穩定期） | 值 |
|---|---|
| 執行次數 | 3,162 |
| 執行間隔 | 中位數 1.00 h、P90 1.02 h |
| 無新異常的執行 | 3,042（96.2%） |
| 標記交易（不重複） | 523：`Payabl & Crm` 307、`Payabl` 216 |
| 確認為錯誤（複核 `error*`，或第 13、16 欄備註寫明 wrong amount／double・duplicate refund／wrong deposit order／over-/underpaid） | 29：退錯金額 19、重複退款 9、退錯訂單 1 |
| 其中偵測後撤銷或要求 Payabl 取消 | 28 |
| 已知的非錯誤標記原因（第 16 欄） | USC 幣別單位換算 17 筆、MID negative balance 6 筆 |
| 錯誤退款涉及金額 | EUR 1,409.46、GBP 1,510.03、USD 849.73（撤銷的 28 筆：EUR 1,409.46、GBP 1,510.03、USD 799.73） |

全期間（2026-02-12 ~ 2026-11-06）共 4,189 次執行；8 月後執行覆蓋率下降（8 月 47%、9 月 33%、10 月 15%），依 Peter 指示不納入成效數據。程式為過渡方案：2026/2 底上線，約 2026/8 隨支付平台停用退場。

**與原始簡報不一致之處（已在網站上修正或說明）**
- 圖 4「4 次/日、↑600%」：Peter 確認實際為每日 5 輪（2026-11-16）。自動化排程每小時 1 次，但 3–7 月實際 3,162 次 ÷ 153 天 = 平均每日 20.7 次（中位數 23；跑滿 24 次 36 天、無執行 5 天），5 → 20.7 約 4.1 倍。
- 圖 4「>24 小時」：與每日 5 輪矛盾，Peter 確認改為「最長約 5 小時」（兩輪間隔，2026-11-16）。
- 圖 4「100% 精準對帳」：CSV 顯示 523 筆標記中 29 筆確認為錯誤，因此改寫為「100% 覆蓋比對 + 人工複核」。
- 「<1 小時預警」：依 Peter 說明，是指資料可取得後 1 小時內；`Createtime` → 首次偵測的端到端中位數為 19 小時（報表本身有 T-2 ~ T-4 延遲）。
- 履歷的「95% 人工減少」：CSV 與圖片都無法驗證，本頁不使用。

**圖片處理**：以 `sharp` 只裁切安全區域，不做模糊。
- 圖 1：改以 HTML 重繪三欄痛點卡片（不再使用圖檔）。輪班表姓名以代號 A–N 取代（一週 5 時段、14 人）；Payabl／CRM 截圖改為文字註記，不公開內部網址。
  - 輪班表 5 個時段 = 每日 5 輪比對（Peter 確認 2026-11-16，取代先前「每日 4 次」的說法）。
  - 平台截圖（`platform-payabl.png`、`platform-crm.png`）：裁掉網址列，模糊 Payabl 登入帳號、CRM 品牌 logo 與品牌代碼。CRM 畫面上的淡浮水印未處理（低解析度下難以辨識）。
  - Parent／Child Ticket 說明依 Peter 確認的理解撰寫（2026-11-16）。
- 圖 2：完整架構圖保留於 Selected Solution；Solution Design 另有 4 張 Area 截圖（`area-1~4.png`），每張只保留該 Area 圈起的元件與說明，其餘區塊模糊＋淡化以聚焦（非去識別用途，原圖此區無機敏資訊）。產生腳本放在 scratchpad，未進 repo。
- 圖 3：Tech Label 改以 HTML 重繪；log 改為去識別後的文字轉錄。
- 圖 4：Before / After 改以 HTML 重繪並取代原表格，數字使用更正後的值（每日 5 → 20.7 次約 4.1 倍、Reverse API Automation）；「準確程度」一列不納入。

## Account Operation Automation Engine (資料分析)

來源：LarkSheet「Account Operations Automation Engine」，以 `lark_get_info.py` 於 2026-11-16 抓取（原始 JSON 不進 repo）。工作表：Rule（使用規則）、VIG_Input／VTJ_Input（申請入口，抓取時為空）、Record（上線至今每次申請一列摘要）、Output（當天的逐帳戶明細，隔天刪除）。

口徑：
- 期間：Record 全部資料，2026-06-09 11:31:09 ~ 2026-11-16 09:57:45。
- 成功執行：`return_msg` 以 `Success` 開頭；驗證失敗列的數值欄位皆為 `-`，不計入。
- 帳戶數：各批 `total_accounts` 加總（同一帳戶在不同批次會重複計算，每次查詢對應一次人工作業）。
- 節省工時：`total_accounts` × 45 秒 ÷ 3,600，與 Record 的 `estimated_hours_saved` 逐列一致（差異 0 列）。
- 成本：工時 × NT$400。逐列 `estimated_twd_saved` 加總為 1,908,092；以總工時直接計算為 1,908,145（差異來自逐列四捨五入），頁面寫 ≈NT$1.91M。
- 45 秒／帳戶、NT$400／小時、80% 涵蓋率：Peter 提供的估計（2026-11-16）。

| 數字 | 值 |
|---|---|
| 申請總數 | 563 |
| 成功／驗證失敗 | 531（94.3%）／32（缺 Requestor 23、缺 Account／UserId 9） |
| 累計帳戶 | 381,629 |
| 節省工時 | 4,770.36 小時 |
| 單批帳戶 | 中位數 89、平均 718.7、最大 17,416（2026-10-21 15:11:58，749 users、28 servers、39 account types） |
| 超過 2,000 帳戶的批次 | 65；超過 2,000 users 的批次 16 |
| 單批最大涵蓋（各欄獨立取最大） | countries 179、servers 40、regulators 4、account types 48 |
| 有使用的天數 | 112 |
| 每月成功次數／帳戶 | 6 月 39／58,805、7 月 95／64,060、8 月 83／21,757、9 月 69／92,890、10 月 207／113,659、11 月（至 16 日）38／30,458 |

**與 Peter 提供的草稿不一致之處（頁面已改用 Record 實際值）**
- 草稿「累計 236,209 Accounts、2,952.61 人時、NT$1.18M」→ 實際 381,629、4,770.36、≈NT$1.91M。推測草稿為較早期的快照，待 Peter 確認。
- 草稿「單批最高 13,114 Accounts」→ 該批（2026-06-24）為第三大；10 月有 17,416 與 16,976 兩批更大。
- 舊版頁面（PDF）「75,340+ 帳戶、956+ 小時、TWD 382K+」已全部改用 Record 實際值。

**待 Peter 確認**
- Rule「單次最多 2,000 筆」的計算單位：Record 有 65 批超過 2,000 accounts、16 批超過 2,000 users。
- `total_missing` 的意義：例如某批 75 users、127 accounts，但 missing 115；頁面只寫「查無資料會收集」，不引用數字。
- `requestor` 是自由輸入（同一人有多種寫法，也有整句話），無法計算使用人數，頁面不寫。
- CRM 資料取得方式、權限範圍（帳號、唯讀、核准者、帳密存放）、Alternative Solutions 實際評估過的方案。

**Peter 確認（2026-11-17）**
- Problem Assessment 名詞說明（OP、CRM 後台、regulator、UID、Account、Account Server、Trading／Rebate Account、Balance 等欄位、清退、轉歸屬）的定義由 Claude 草擬，Peter 確認全部正確。
- 影片 `crm_manual.mp4`（57 秒，人工查詢）與 `crm_system.mp4`（68 秒，引擎執行）屬於本專案，Peter 確認畫面可直接公開，未做裁切或模糊；原樣複製到 `public/media/account-automation-engine/`。

**名詞說明（2026-11-18）**
- 三個專案頁的名詞說明改為收合頁籤（`glossary-details`）。定義由 Claude 草擬，Peter 確認全部正確（Credit Card：入金／出金、PSP、Payabl、CRM、Refund、Parent／Child Ticket、QC、對帳、T ~ T-4、Mismatch；Infra：CRM、PSP、DB 權限、API 逆向工程、資料孤島、增量同步、ETL、統一資料視圖）。
- CPS = 內部渠道支付平台（Peter 說明，2026-11-18）。

**公開資料處理**：`scripts/deidentify_account_record.py` 產生 `public/data/account-engine-record-2026-06-11.csv`。刪除 requestor、`total_users_list`／`total_missing_list`（客戶 ID）、`total_balance`／`total_equity`／`total_credit`（客戶資金總額）與 3 個空欄；輸出後掃描姓名與 6 位數以上 ID。Output 範例列移除 user_id、帳號、客戶與 IB 姓名、group（含品牌代碼）。品牌代碼 VIG／VTJ 不出現在頁面上。圖 2 只裁切 `rule.png` 的中文區塊（浮水印為 Peter 本人姓名，保留）。

## Deposit & Withdrawal Drop-Order Monitor (資料分析)

來源：LarkSheet 案件表匯出的 `<品牌> Task (CRM - CPS Report).xlsx`（10 個工作表）。依 Peter 指示只追蹤 5 個：Deposit、Withdraw - LBT、Withdraw - Crypto&Wallet、Withdraw - CreditCard、Withdraw - IBT（2026-11-18）。其餘（BT.Wallet.Crypto 優化中、CC Archived、Manual sync from CPS、公式用、11-06 issue orders）不納入。

口徑：
- 期間：Deposit 2026-03-30 起、Withdrawal 2026-09-09 起（Peter 確認上線日，2026-11-18），皆至 2026-11-17（不含 11-18 的不完整日）。CreditCard 第一筆 Comparison Time 為 09-10。
- 案件：Tx ≠ `-` 的列；心跳列（除 Comparison Time 外全為 `-`）= 該次執行沒有新案件。
- CreditCard 計數單位：管線去重單位「Merchant Order + Deposit Order Number」，1,027 件；不重複出金單 590 張（Peter 選用前者，2026-11-18）。
- 執行次數：不重複 Comparison Time。日均分母：Deposit 233 天、Withdrawal 70 天（CreditCard 69 天）。
- 揭露時間「1 小時」= 排程每小時一次的檢查顆粒（Peter 說明，2026-11-18），不是端到端時效。
- 統計全部可由 `public/data/drop-order-cases-2026.csv` 重算。

| 數字 | 值 |
|---|---|
| 案件 | Deposit 6,495、LBT 6,833、Crypto&Wallet 992、CreditCard 1,027、IBT 46，合計 15,393（Withdrawal 8,898） |
| 日均 | Deposit 27.9（每日中位數 23）、LBT 97.6、Crypto&Wallet 14.2、CreditCard 14.9、IBT 0.7 |
| 執行次數 | Deposit 4,808（平均每日 20.6）、Withdrawal 1,466（平均每日 20.9）；間隔中位數 1.00 h、P90 1.03 h |
| 心跳列 | 6,314 |
| 2026-11-06 | Deposit 951 件，其中 10:00–11:59 兩次執行 933 件，85 種渠道、61 國；CRM 狀態 930 件為 Submit to third party |
| Deposit 處理狀態 | done 5,540、空白 942（其中 930 為 11-06）、pending 8、system issue 4、rejected 1 |
| 出金原因類別 | 客户问题 6,649、渠道问题 669、商户问题 102、银行问题 27、CPS 问题 4、内部疏失 3、空白 1,444；子類別 33 種 |
| 範圍 | 181 種渠道類型、136 國、64 種幣別 |
| 一次執行（2026-11-18 03:00 log） | 約 11 分鐘；CPS 入金 195,438 筆、出金 1,037 筆；CRM 出入金 322,159 筆；Reason Table 7,078 筆 |
| 節省工時（估計） | 每次約 1 小時（兩份報表下載 30–35 分 + Excel 運算、整理、搬移）× 每日 2 次，Deposit、Withdrawal 各自計算（Peter 確認，2026-11-18）：233 × 2 = 466、70 × 2 = 140，合計 606 小時。起訖算法沿用 Peter 原稿（03/30 → 10/01 = 185 天 → 370 小時），延長至 11/18 |

**Peter 說明（2026-11-18）**
- 專案定位：系統端的掉單資料管線；與 Credit Card 頁（單一 PSP 的退款金額對帳）區隔，本頁主軸是 CRM × CPS 的訂單狀態不同步。
- 第一階段：跨系統掉單管線（現況）；第二階段：運行穩定約 3–6 個月後做自動點擊。
- Alternative Solutions：直接查 DB（指 CRM DB，沒有權限）、請 CPS 加主動通知、共同表單通知（owner 不是我們，難以控管）。
- 11-06 案例可公開：上游系統問題導致客戶大量卡單。
- 「進線降低」「溝通次數 ≥ 50%」「渠道定位 ≤ 1 小時」沒有資料，放「尚未量化」。
- README_OP「涵蓋 90% 以上異常」沒有來源，不使用。部署位置不揭露。
- Handler 依案件到 CRM 補登；Checker = 營運人員複盤。

**權限範圍（依原專案程式碼整理）**
- CRM：營運帳號 + 密碼 + TOTP（`pyotp`），呼叫報表 API 觸發產生後下載，只讀不寫。
- CPS：MySQL 連線只執行 SELECT（Deposit／Withdraw 兩段查詢，近 7 天）。
- Lark：自建 App，寫入案件表（append）與 Drive 備份資料夾。
- CRM／CPS 帳密從唯讀掛載的 `credentials.env` 讀取。Lark App 憑證寫在原專案 `config.py`，且出現在原 repo 的 git 歷史中（已告知 Peter，建議輪替），頁面不宣稱 Lark 憑證的存放方式。

**頁面上的 log 轉錄**：取自 `logs/20261118.log` 03:00 那次執行（uid 開頭 `3bd9043c`）。保留時間、stage、訊息；省略重複下載紀錄；`Davinci` 改為 `CRM`；移除 sheet_id、Lark Base table id、folder／file token、檔名前綴（品牌代碼）與網址。

**待 Peter 確認**
- 名詞說明 12 個定義（Claude 草擬）：特別是 LBT = Local Bank Transfer、CPS 的描述、Reverse 的定義。
- Deposit `Correct?` 欄：Peter 說明 1 = 有案件須做標籤、0 = 該小時偵測無掉單；但資料中 `Correct?` = 0 的 423 列都有訂單資料（不是心跳列），其中 419 列在 11 月、主要是 11-06 事件。頁面不使用此欄。
- Deposit 處理狀態空白 942 件中 930 件為 11-06 事件：是否為批次處理、未逐筆標記？
- 平均每日約 21 次而非 24 次：原專案 crontab 有一行已註解的舊排程 `30 0-7,10-14,17-23`（註記 cooperate with QC department，每日 21 次）；頁面只寫「部分整點沒有執行紀錄」。
- 帳號使用的核准者（頁面 TODO）。

**閱讀節奏改版（2026-11-18，示範頁）**
- 招牌視覺：圖 2 為 11/6 單次執行揭露筆數長條（10:00 450、11:00 483；其他日子單次執行最多 75，發生於 2026-09-22 00:13；11/6 其餘 22 次執行合計 18）。
- 01 理由改用「有掉單的天數」：Deposit 233 天中 220 天、Withdrawal 70 天中 67 天，避免與 05 的日均重複。
- 05 移除每月案件表；出金原因改為長條（圖 4）。06 移除「揭露案件」「突發事件」兩列（已在 05、01）。

**公開資料處理**：`scripts/deidentify_drop_order.py` 產生 `public/data/drop-order-cases-2026.csv`（21,707 列，含 6,314 列心跳）。輸出只保留分類欄位：Case Type、Comparison Time、Tx（訂單編號改 `TX-00001` 流水號，信用卡以 Merchant Order 編號）、Channel Type、CRM／CPS 狀態、幣別、金額、國家、原因類別、子類別、處理狀態。刪除 User ID、Account、所有訂單編號、Handler／Checker／Sales／Operator 姓名、錢包地址／卡號、渠道名稱（含品牌代碼）、Regulator／Server、自由文字（Comment、CRM Reverse Reason、交易叙述）。腳本最後一步檢查輸出不含任何原始 ID、完整人員姓名與品牌字；另外手動掃描 6 位數以上數字、Email（0 筆）。

## Reading Rhythm 改版（2026-11-18，四頁統一）

依 Peter 指示，把 Drop-Order 的閱讀節奏套用到其他三頁。只重排與刪除重複，沒有新增未經來源支持的數字；新增的數字如下。

- **Account Engine**
  - TL;DR 新增。01 理由改為「上線 24 週，每一週都有成功的批量申請」（由公開 CSV 計算：2026-06-09 ~ 11-16 共 24 個週次，每週都有 `Success` 列）。
  - 移除重複：531（01 痛點卡片、理由）、381,629／4,770（01 理由）、17,416／218 小時（03、05、06）、179／40／4／48（05、06）、32（04、06）、207（06）。
  - 每月使用量由表格改為長條（圖 4）。
- **Credit Card**
  - TL;DR 新增。01 理由 3（2.1 萬／2.2 萬筆）併入痛點卡片，改為指向 Result 的 log。
  - 05 新增「複核結果」長條（523 → 29 → 28，圖 3），原統計表只保留執行次數、間隔、無新異常的執行。
  - 06 不再重抄 29／28、5.5 分鐘、2.1 萬筆，改寫「見 Result」。
  - Peter 先前註解掉的〈尚未量化〉段落維持註解。
- **Infra**
  - 由舊的 8 章改為六段式，內容沿用原頁面與 PDF。主題色改為新增的 `slate`（原本未設定，預設 forest 與 Drop-Order 重複）。
  - 03 的方案 A（維持人工調取）、B（等待 DB 權限或官方 API）依原頁面「取代人工調取」「不等 DB 權限或官方 API 開放」整理，待 Peter 確認是否為當時實際評估的方案。
  - 招牌視覺、05 的 log 與統計、權限範圍、排程與儲存工具、其餘 3 個平台皆為 TODO。

## Focus 與系統地圖（2026-11-18）

- Stack 差異化採方案 B（Peter 選擇）：新增 `focus`。各頁取自已有內容：Infra = Incremental Sync、Schema Alignment（原 My Contribution 的增量同步與清洗對齊規範）；Credit Card = Amount Reconciliation、Parent / Child Ticket Matching（01 痛點與名詞）；Account Engine = Batch Query Engine、Exclusive Queue Lock（Tech Label）；Drop-Order = Status Reconciliation、Heartbeat Monitoring（判定規則與設計重點）。
- Focus 改為 104／LinkedIn 搜尋關鍵字（Peter 指示，2026-11-18），意思不變：Infra = Data Integration（多平台整合）、Data Standardization（原 Schema Alignment）；Credit Card = Financial Reconciliation（原 Amount Reconciliation）、Anomaly Detection（專案名稱）；Account Engine = Batch Processing（原 Batch Query Engine）、Process Automation（取代人工逐筆查詢）；Drop-Order = Data Reconciliation（原 Status Reconciliation）、Data Quality Monitoring（每小時偵測不一致與心跳列）。
- 系統地圖來源：Peter 提供的 `structure.png`（已移到 `canva-export/`，含品牌名稱，不進 repo），以 SVG 重畫並簡化（省略 FUNDS 圖示，「<品牌> Web/APP」改為「Client Portal（Web / APP）」，新增 Infra 的 Operation Data Layer 區塊）。
- 專案 ↔ 區塊對應經 Peter 確認：Infra = 資料層；Credit Card = 信用卡 PSP ↔ Bridger ↔ CRM；Drop-Order = CRM ↔ CPS ↔ 各渠道；Account Engine = CRM ↔ MetaTrader。
- 呈現方式：2D SVG + 流動虛線動畫（`prefers-reduced-motion` 時停止），不做 3D（Peter 選擇）。放在每頁 Quick Read，Projects 頁不放（避免未來多家公司時混淆）。

## Key Numbers (關鍵數字)

| 數字 | 專案 | 來源 | 狀態 |
|---|---|---|---|
| 6 個異質平台、100% 自動化攝入 | Infrastructure | PDF | 平台清單只列出 CRM、PSP、CPS |
| 10+ 頁面人工查找 | Infrastructure | PDF | — |
| 每日 5 → 20.7 次（實際平均）、最長 5 小時 → 1 小時內、95%+ | Credit Card | PDF + CSV + Peter 確認 | PDF 原寫 4 次、>24 小時，已更正；95% 計算基礎待補 |
| 每輪人工約 45 分鐘（平台 35 + Excel 10）、每日 5 輪 ≈ 3.75 小時；3–7 月 153 天 ≈ 574 小時；年化 × 365 ≈ 1,369 小時 | Credit Card | Peter 口頭說明（2026-11-16） | 估計值 |
| 45 秒/帳戶、381,629 帳戶、≈4,770 小時、≈NT$1.91M | Automation Engine | Record 工作表 + Peter 估計（45 秒、NT$400） | 已取代 PDF 的 75,340+／956+／382K+ |
| 1 hr 揭露顆粒、≈606 小時、15,393 件 | Drop-Order Monitor | 排程設定 + Peter 估計（每次 1 小時 × 每日 2 次 × 各自）+ CSV | 工時為估計值；Peter 原稿 414 小時（至 10/01）已延長至 11/17 |

## Redaction (去識別化)

- 不公開：手機、市話、住址、年齡、駕照、PDF 上的 Email。
- 第三方支付商名稱：系統地圖與專案頁可保留 PSP 與渠道名稱（Worldpay、Checkout、Payabl、Bridger、Xpay、Zota 等），公司品牌名稱不出現（Peter 確認，2026-11-18；取代先前「以 PSP 支付端代稱」的規則）。
- 公司名稱：依 Peter 指示公開（2026-11-16）。

## TODO

- [x] GitHub / LinkedIn / Email 連結 → `src/data/profile.ts`（2026-11-16）
- [ ] 6 個平台完整清單
- [ ] 6-Layer Pipeline 其餘 3 層
- [ ] 956 小時與 95% 的計算基礎
- [ ] 逆向工程實際遇到的技術難點（可公開的抽象描述）
- [ ] Infrastructure 排程與儲存層實際工具（是否用 Airflow / Superset）
- [ ] 信用卡偵測的告警通知管道
- [ ] 信用卡偵測 Area 3 比對規則（Prepare／Build Logic／Separate Types／Regularity）
- [ ] Drop-Order Monitor：名詞說明定義確認、帳號核准者、進線量與溝通次數的前後統計
