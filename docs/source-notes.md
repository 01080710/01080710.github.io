# Source Notes (內容來源與待辦)

網站上的每一個數字與宣稱都要能對回這裡。來源文件（`PeterChang_rv.pdf`、`PeterChang_core.md`）含個人資料，不進 repo。

## Source Mapping (來源對照)

| 網站內容 | 來源 |
|---|---|
| 首頁定位、Engineering Philosophy | `PeterChang_core.md` 二、四、五節（改寫，未原文引用） |
| 經歷、學歷 | PDF〈工作經驗〉〈學歷〉 |
| OP Ticket Data Pipeline (Q4 PoC) | `Desktop/fresh` 程式與 README、`Desktop/db` 的 2026 .db、run.log + Peter 問答確認（2026-11-20）；取代原 0-to-1 Operation Data Infrastructure 頁 |
| Credit Card Anomaly Detection | PDF 專案「信用卡異常出金偵測」+ 海科科技職務描述 4 |
| Account Operation Automation Engine | PDF 專案「營運帳務自動化引擎」+〈工作技能〉 |
| 「與營運端對齊偵測邏輯」 | Peter 口頭說明（2026-11-16） |
| 「約 80% 業務場景可通則化」 | Peter 口頭說明（2026-11-16） |
| Credit Card 頁（六段式框架） | `canva-export/images/Payabl QC new Template - New Data.csv` + `Credit Card Anomaly Detection_1~4.png`（皆不進 repo） |
| Noise Camera Enforcement 頁 | `canva-export/noise-enforcement/`（4 支錄影、2 張簡報圖，皆不進 repo）＋ GitHub：`WeatherAI`、`NoiseDetect_API`、`SoundPhoto_API`（程式與 schema）＋ Peter 說明（2026-11-21） |
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
- 開發期間（frontmatter `phases`，月份顆粒）：入金 2026/03~2026/03、出金 2026/04~2026/09（Peter 確認，2026-11-19）；上線月份同上一行（入金 2026/03~、出金 2026/09~）。整體 `period` 2026/03~2026/09 為兩者合併。
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

## OP Ticket Data Pipeline (Q4 PoC)（2026-11-20）

- 原「0-to-1 Operation Data Infrastructure」頁內容經 Peter 確認不屬實，整頁清除；slug 改為 `ticket-data-mart`，沿用 `slate` 與 `order: 1`。
- **第二版（同日）依實際程式與資料重寫**，取代第一版依 scope（「Fresh 工單數據中台」整合包）寫的內容。第一版的 Freshdesk、`updated_since` + watermark、30 分鐘 Lookback、三張表、WAL 都與實作不符，已移除。
- 來源（皆在 repo 外，只讀，未複製）：
  - 程式與 README：`Desktop/fresh`（`fresh_export.py`、`ticket_db.py`、`freshservice_api.py`、`config.py`、`crontab.txt`、`docker-compose.yml`）。
  - 資料：`Desktop/db/<prefix>_freshservice_2026.db`（唯讀查詢彙總，未輸出任何內文）。
  - 執行紀錄：`Desktop/fresh/output/*/run.log`、`logs/20261119.log`。

### 第三版：資料工程 + PM + 量化價值（2026-11-20）

- Peter 要求依 Claude 的評估重排（資料工程站得住、PM 一半、量化價值站不住）：
  - 標題由「Ticket Data Mart」改為「OP Ticket Data Pipeline」，避免「Data Mart」被追問建模；slug 維持 `ticket-data-mart`。
  - 頁首 metrics 改為價值數字：取得資料「XX 天 → 每日」、節省「XX h/月」、人效對照率 100%（107,412 點）。原本的 47,530（家在 01）、146,814（家在 05）、200/min（家在 01 圖 3）不再放頁首。
  - 01 痛點卡片加入索取成本（XX）；新增「成功標準」投影片（5 項，對應 06 驗收）。
  - 02 新增「範圍決策」表（期間、範圍、儲存、輸出）與 Non-goals。
  - 04 設計重點加入測試：`fresh/tests` 共 195 個 `def test_`（9 個檔案，其中 4 個用 mock／monkeypatch）；只計數，未在本 repo 執行。
  - 05 開頭說明分為可靠性與業務產出；新增「從數據到行動」案例投影片（XX）。
  - 06 Before / After 改為有數字的版本（XX），新增「整理工時」列、移除「全貌」列（併入資料取得），加上合計列。
- **XX 待補清單**（Peter 提供後填入並標「估計」）：每次索取等待天數、來回次數、每月索取次數、每月整理工時與人數、每月人效統計工時、合計節省工時、OP 使用人數與頻率、一個「數據 → 行動」案例、HTTP 404 失敗的成因。

### Freshservice 說明（2026-11-20）

- Peter 選擇 A + B：名詞說明的 Freshservice 定義加上類比（Jira Service Management、Zendesk）與官網連結 `https://www.freshworks.com/freshservice/`（2026-11-20 以 curl 確認回 200）；01 背景加「一張工單的一生」Mermaid（圖 1），後面圖號順延。
- 圖 1 的步驟依據：開單者為 CS、業務等內部單位（`department_name` 多為 CS team、APAC、BD Team）；派單與收口由 OP 負責（Peter 說明）；每步對應的欄位取自 `fresh` README〈輸出內容〉。中間狀態（Pending、Awaiting Approval 等）見 .db 的 `Status` 分布。
- 不嵌入官網圖片、影片或 iframe（授權與載入考量）。

### 數字口徑

| 數字 | 值 | 計算方式 |
|---|---|---|
| 2026/10 建立的工單 | 47,530 張；平均 1,533／天 | `ticket_conversations` 中 `First_ModifyTime` 為 2026-10 的不重複 `ticket_id` |
| 平日／週末 | 平日中位數 1,874（1,534–2,513）；週末中位數 590（418–769） | 同上，依建立日分日計數 |
| 處理群組數 | 2026/10 有 16 個；.db 全部 18 個 | 不重複 `Assigned to`（抓取當下的群組） |
| 2026/10 工單的對話 | 146,814 則（`conversation_id > 0`） | 每張平均約 3.1 則 = 146,814 ÷ 47,496 張有對話的工單 |
| .db 內容 | 75,598 張、234,177 列；`skipped_tickets` 250 | 2026-11-20 查詢 |
| 各群組處理時長（圖 6） | 中位數，例如 Deposit 14.1 h、Withdrawal 14.0 h | 2026/10 建立且 `Resolved_Time` 非空（47,071 張；未解決 459 張）；`Resolved_Time − First_ModifyTime`；只列 ≥ 500 張的群組 |
| 回補統計 | 62 段、完成 61（無失敗 12、有失敗 49）、列數合計 288,998、失敗 293 | `output/20261119_all_views_nolimit/run.log` 的 `View complete/incomplete` 行，截至 2026-11-20 15:14（第 62 段執行中） |
| 失敗原因 | 全部為 `items fail: HTTP 404` | 所有 run.log 的 `FAIL -` 行共 299 次，皆為 404 |
| 429 重試 | 26,479 次 | 所有 run.log 中 `HTTP 429` 出現次數 |
| 額度（圖 3） | 子限制 160/min、帳號 500/min | README〈API 流量限制（實測）〉 |
| 新版速率 | 200/min | `config.py` 的 `RATE_LIMIT_PER_MINUTE`（README 舊段落寫 150，以設定檔為準） |
| 舊版峰值 | ≈1,200/min | README〈與舊版程式的流量比較〉：10 並行、每請求約 0.5 秒推算，頁面標「推算」 |
| 一次實際執行（05 log） | 736 = 732 + 4 + 0；新增 77 則 | `output/20261120_view_<id>_tf20e40_nolimit/run.log`；view ID、執行資料夾已移除，run_id 截 8 碼 |

- 11/1–11/4 建立的工單數偏低（22、145、211、407），疑似未完整回補，統計只用 10 月。

### 人效項目清冊（2026-11-20 加入）

- 來源：Peter 提供、營運主管整理的「人效項目清冊 - Fresh Item」，存於 `canva-export/ticket-data-mart/fresh_item_mapping.csv`（含品牌 workspace 名稱，不進 repo）。只存到 workspace 2 會用到的列；VTJ workspace 的列多數沒有對應欄位，未存。
- 欄位用法：`Item` = 工單的 `service_item`（完全比對）；`負責團隊` = 頁面的「負責團隊」；`Fresh Mapping` 為 `Raise to other department` 者算「轉派」；`Points for OP` = 人效點數。頁面寫「營運的人效項目清冊」，不寫整理者。
- 清冊數字：排除 `TEST` 後 222 項、14 個負責團隊（即 Peter 第一次提供的 14 個部門）；OP 自理 132 項（負責團隊為 OP-*，且非轉派）、轉派 79 項（含 OP-DW 的 W8-1／W8-2 審批）、其他非 OP 且非轉派 11 項（APAC Support、ASIC Support）。點數 2–8。
- 對照結果（2026/10 建立的 47,530 張）：100% 對得到；OP-AC 28,935 張／69,519 點、OP-DW 17,620／35,943、OP-AC,OP-DW 965／1,930、Risk Team 10／20，合計 107,412 點（每張 2.26）。子分類 Account Owner Transfer（3 點）10,983 張。
- 發現：兩個 view 只取 OP 的處理群組，轉派項目的工單只有 25 張在範圍內 → 頁面在 06 寫成限制，擴充路線第 1 項。
- 地圖新增「轉派部門（11）」節點（11 = 14 個負責團隊扣掉 OP-AC、OP-DW、OP-AC,OP-DW）。
- 群組名稱含品牌主體代碼的 3 個群組（清冊 workspace 名稱可證），依品牌規則不出現在頁面與地圖；頁面「16 個處理群組」為計數，含其中 1 個，不列名稱。

### Peter 確認事項（2026-11-20）

- 定位改為「Freshservice 工單回補與每日同步」；停留時間、全量質檢、CRM JOIN 移到擴充路線。
- 地圖使用資料庫 `Assigned to` 的群組全名。
- Before：資料向其他非平行單位索取，曠日費時、維度經常錯置，溝通不良下看不到全貌、難以即時改善（無耗時數字）。
- 使用者：OP。流程：OP 是中樞，依案件主責派給對應部門，最後由 OP 收口。

### 待 Peter 確認

- 人效統計的 Before：過去是否有人工依清冊計算人效？耗時多少？（目前寫「清冊與工單資料分開，無法直接對照」）
- 名詞說明 12 個定義（Claude 草擬）；Role、Stack、Focus（Data Integration、ETL）。
- 03 方案 B「舊版程式」、C「公開 API 篩選」依 README〈與舊版程式的流量比較〉〈技術選擇〉整理。
- 權限範圍：帳號歸屬、核准者、帳密存放方式（頁面為 TODO；目前不在頁面描述帳密現況）。
- 每日排程是否已正式上線（決定是否填 `launch`）。
- 招牌視覺：圖 3 額度對照（新元件 `quota-list`），類型與其他專案不重複。

## Noise Camera Enforcement Data Chain（2026-11-21）

維碩科技（2025/02 ~ 2025/12）「聲音照相科技執法」產品線上的四個零散需求，依執法流程整理成一頁：設備與場域管理 API → 天候查證（CODiS 爬蟲、Weather AI）→ 事件審核 API → 稽核儀表板。影像辨識由影像處理團隊負責，不算在本頁範圍。

### 故事線與 Peter 確認事項（2026-11-21）

- 主線：「零散需求，放回執法流程剛好是同一筆事件的四個斷點」。Peter 同意，並要求依合理故事線鋪陳；邏輯有疑慮處先討論（已討論 7 點，見下）。
- 有效／無效由**人工判定**（Peter 確認）。
- 天氣資料的用途採「審核時需要天候條件，提供快速取得官方天候資料的工具」；不宣稱自動帶入判定、不宣稱提升辨識率（Peter 同意）。
- 期間統一寫 2025/02~2025/12（Peter 指定）；各模組實際上線時間未紀錄。
- `聲音照相科技執法.mp4` 的端點（`/site`、`/site/options`、檔案上傳）不在公開 repo 內，依畫面推論為「設備與場域維護 API」（Peter 授權自行推理）。

### 數字口徑

| 數字 | 來源與口徑 |
|---|---|
| 5,605 件超標事件 | 稽核儀表板錄影畫面（`噪音稽查儀表板.mp4`，趨勢視角）：時間區間 2024-06-21 ~ 2025-09-18、判定進度 100% 的總件數 |
| 236 件有效（4.2%）、5,369 件無效（95.8%） | 同上畫面的有效件、無效件與百分比；未判定 0 件 |
| 4 項現場條件，其中 3 項天候 | `SoundPhoto_API` 的事件 schema：`noise`（前後三秒是否有車）、`wet`（地面乾濕）、`windlevel`（風速是否小於 5 m/s）、`rainday`（最近降雨時間） |
| 判定原因五類、四種證據檔 | 同上 schema：`reason1/2`（通知到檢／直接開罰／非噪音車／無法判定／其他）、`files`（photo、crest、aicam、surcam） |

- **資料期間早於到職**：事件期間起於 2024-06-21，早於 Peter 到職（2025/02）。頁面把 5,605 件寫成「儀表板彙整的資料規模」，不寫成成果。
- 沒有工時、時效、審核人數的紀錄，頁面不估算節省工時。

### 推論而非原始資料的說法（已在頁面降級或改寫）

- 0.5 秒推播來自 README 範例 `.env`，不寫進頁面；只寫「定時推播」。
- 接 C# 工作單產生器的原因未確認，只寫做法（檔案交換、逾時處理），不寫「為了格式合規」以外的理由；「工作單格式不變」是沿用既有產生器的直接結果。
- Before 欄只寫有依據的狀況：天氣「過去多靠人工搜尋」與儀表板「人工報表、熱區難掌握」出自 Peter 的簡報圖；判定證據分散出自程式（資料庫、檔案目錄、C# 檔案交換）。
- Alternative Solutions 的方案是依程式結構與現況整理的取捨，不是會議紀錄。

### 招牌視覺與去識別

- 招牌視覺：**判定證據卡**（02，`evidence-card`）：三類證據 → 判定與原因 → 產出，欄位全部取自 `SoundPhoto_API` schema。
- 系統地圖（2026-11-21 第三版，Peter 選「主幹線」）：一筆事件的主流程由左到右（站點 → 設備與場域 API → 事件資料庫 → 事件審核 API → 稽核儀表板），CODiS 與影像辨識從上方接入、工作單與環保單位從下方接出，箭頭只往右或往下；本人負責的四個節點標階段文字。前兩版（格子、泳道）因線路繞回與穿層被淘汰。
- 第四版（2026-11-21）：階段標籤拿掉 01–04 編號（Peter：會和簡報章節編號對撞）；每條連線加上傳遞的資料內容（Peter 選「連線標上資料內容」），內容依 `SoundPhoto_API` schema 與 `NoiseDetect_API` 路由；節點縮為 140 寬以留出標籤空間，英文節點副標相應縮短。
- 內容精簡（2026-11-21，Peter 要求）：刪 Mermaid（與地圖重複）、Tech Label（與設計重點重複）、「值得投入的理由」（與痛點卡數字重複）；03 表格 6 列併為 3 列並吸收選擇理由；名詞 11 則減為 8 則。
- 儀表板錄影第三版（Peter 要求以解釋力為主軸、遇到個資再去識別，2026-11-21）：`audit-dashboard.mp4` 依「總量與行政區 → 高峰時段 → 重點違規車輛 → 依判定條件篩選與下載」接四段，共 13.8 s：原片 0.4–3.4 s（經典視角）、32.4–36.9 s（熱點分析）、17.0–19.4 s（重點違規排行）、55.0–58.6 s（篩選條件與下載；原設 58.9 s 超過原片長度 58.84 s，最後一格變黑，已更正）。馬賽克（`CIPixellate` + 模糊，整段固定位置，該段畫面不捲動）：重點違規排行的兩條車牌座標軸；篩選段頂端的站號列（含環保局站號代碼）與右下角下載通知（路徑含前公司品牌代號）。保留：行政區名稱與旭日圖中心的城市名（非個資，Peter 確認保留，2026-11-21）。原先的兩張截圖已移除。
- 第四版（2026-11-21，Peter 要求說明是哪四個洞察並在影片圈出）：每段加上磚紅色框線與標籤（洞察 1 判定總量與有效比例＝KPI 列；洞察 2 高峰時段＝熱力圖，該段於 1.3 s 後畫面停穩才出框；洞察 3 重點違規車輛排行＝三張排行圖；洞察 4 依判定結果與條件篩選、下載＝側邊欄篩選）。中文頁用 `audit-dashboard.mp4`、英文頁用 `audit-dashboard-en.mp4`（標籤為英文）。圖說不寫片段秒數（Peter 要求）。
- 設備與場域管理 API 錄影使用測試資料（SAN001、10.0.0.1、帳號 abcde），公開。
- **更正（2026-11-21，Peter 指出邏輯錯誤）**：這支 API 是主檔維護（站點、設備、校正紀錄）與監測查詢、即時推播，**量測值由站點設備直接寫入事件資料庫，不經過它**。改名為「設備與場域管理 API」；地圖主幹線改為「路邊站點 → 量測值 → 事件資料庫」（既有系統），管理 API 改從上方接入資料庫（站點與設備主檔、校正紀錄）；判定證據卡的「設備量測」來源拆成「站點寫入」與「管理 API 主檔」。
- 錄影第二版（Peter 要求比照稽核儀表板框選關鍵部分）：`device-site-api.mp4`／`-en.mp4` 接五段停穩的畫面，共 8.1 s：原片 12.3–13.9 s（步驟 1 POST /site 請求內容）、18.8–19.9 s（步驟 2 GET /site 回傳主檔，含 dba 86 與 IP）、21.6–23.0 s（步驟 3 前端表單與清單同步）、29.9–30.9 s（步驟 4 上傳成功回應）、46.5–49.5 s（步驟 5 PUT 更新狀態）。避開：檔案選擇視窗（本機檔名）、檔案預覽回應（內網 IP 與物件儲存帳號）。
- 三支公開錄影皆移除聲音軌並重新壓縮，並節錄有故事性的片段（Peter 要求，2026-11-21）：
  - `device-site-api.mp4`：原片 12–23 s（新增場域，前端清單出現 SAN001）＋ 30–37 s（上傳文件）＋ 45–52.5 s（改為停用），共 25.5 s。
  - `codis-crawler.mp4`：原片 3–9.2 s（爬蟲操作 CODiS 選測站、取月報表）＋ 10.8–14.4 s（API 回傳 JSON），共 9.8 s；開頭的桌面畫面剪掉。
  - `weather-ai.mp4`：原片 0–9.5 s（一句話 → 分析 → 圖表）＋ 42–47.6 s（PDF 報告），共 15.1 s（原設 47.9 s 等於原片長度，結尾會跳回儀表板首頁，已更正）。
- 天候查證錄影第二版（Peter 要求重新定位、得到最具解釋力的素材，選「合成一支，依資料流框選」，2026-11-21）：`weather-evidence.mp4`／`-en.mp4` 取代原本並排的 `codis-crawler.mp4` 與 `weather-ai.mp4`（已刪除），共 15.3 s：`ai_dashboard.mp4` 0.3–2.4 s（步驟 1 一句話）＋ 2.5–4.3 s（步驟 2 地點、座標、期間）→ `codis_crawler.mp4` 4.2–8.7 s（步驟 3 爬蟲服務選測站、取月報表；桌布畫面剪掉）→ `ai_dashboard.mp4` 6.8–8.4 s（步驟 4 風速含警戒線、降水量）＋ 42.2–47.5 s（步驟 5 PDF 報告）。
  - 步驟 3 的示範查詢是花蓮的測站，與步驟 1 的高雄小港不同，標籤與圖說皆註明「示範」。
  - **去識別**：PDF 段的網址列含 `C:/Users/<前公司品牌代號>01/Downloads/`，已打馬賽克（前一版 `weather-ai.mp4` 未遮，因本頁尚未推送而未外流）。
- **更正（2026-11-21）**：Weather AI 不直接開瀏覽器爬 CODiS，而是以 aiohttp 非同步併發呼叫獨立的 CODiS 爬蟲服務（`/codis?address=&target=`，失敗重試），見 `WeatherAI/StreamlitWeb/models/codis_api.py`。爬蟲服務本身（Selenium）推測在 `CODis-webcrawler` repo（404）。
- 頁面上的 GitHub 出處連到證明該句的檔案：`chat_prompt.py`（語意解析）、`address_logic.py`（Google Maps 地理編碼）、`codis_api.py`（併發呼叫與重試）、`combine_generate.py`（PDF 報告）、`NoiseDetect_API` 的 `sensor/api.py`（風速、噪音、校正查詢）與 `live/api.py`（WebSocket 頻道）。
- 名詞說明 8 則（聲音照相、超標事件、Lmax、L90／fL90、管制標準、有效／無效、通知到檢／直接開罰、CODiS）由 Claude 草擬，**Peter 確認定義正確（2026-11-21）**。

### 待處理（Peter）

- `SoundPhoto_API` 的 `db.py` 有註解掉的資料庫連線資訊（內網 IP、`sa` 帳號與一組看似真實的密碼），`main.py` 有前公司網域的 Email；處理前網站不連結此 repo。
- `CODis-webcrawler` repo 回傳 404（私人或名稱不同），網站不連結。

## Focus 與系統地圖（2026-11-18）

- Stack 差異化採方案 B（Peter 選擇）：新增 `focus`。各頁取自已有內容：Infra = Incremental Sync、Schema Alignment（原 My Contribution 的增量同步與清洗對齊規範）；Credit Card = Amount Reconciliation、Parent / Child Ticket Matching（01 痛點與名詞）；Account Engine = Batch Query Engine、Exclusive Queue Lock（Tech Label）；Drop-Order = Status Reconciliation、Heartbeat Monitoring（判定規則與設計重點）。
- Focus 改為 104／LinkedIn 搜尋關鍵字（Peter 指示，2026-11-18），意思不變：Infra = Data Integration（多平台整合）、Data Standardization（原 Schema Alignment）；Credit Card = Financial Reconciliation（原 Amount Reconciliation）、Anomaly Detection（專案名稱）；Account Engine = Batch Processing（原 Batch Query Engine）、Process Automation（取代人工逐筆查詢）；Drop-Order = Data Reconciliation（原 Status Reconciliation）、Data Quality Monitoring（每小時偵測不一致與心跳列）。
- 系統地圖來源：Peter 提供的 `structure.png`（已移到 `canva-export/`，含品牌名稱，不進 repo），以 SVG 重畫並簡化（省略 FUNDS 圖示，「<品牌> Web/APP」改為「Client Portal（Web / APP）」，新增 Infra 的 Operation Data Layer 區塊）。
- 專案 ↔ 區塊對應經 Peter 確認：Infra = 資料層；Credit Card = 信用卡 PSP ↔ Bridger ↔ CRM；Drop-Order = CRM ↔ CPS ↔ 各渠道；Account Engine = CRM ↔ MetaTrader。
- 呈現方式：2D SVG + 流動虛線動畫（`prefers-reduced-motion` 時停止），不做 3D（Peter 選擇）。放在每頁 Quick Read，Projects 頁不放（避免未來多家公司時混淆）。

## Project Periods (專案期間)

frontmatter `period`（開發）／`launch`（上線）／`phases`（分線）的值與來源，月份顆粒，格式規則見 CLAUDE.md。2026-11-19 改為「開發／上線」分列並統一為 `YYYY/MM~YYYY/MM`（月份補零由 Peter 直接修改 .md）。

| 專案 | 開發 | 上線 | 來源與佐證 |
|---|---|---|---|
| OP Ticket Data Pipeline (Q4 PoC) | 2026/11~ | 無（建置中，未填 `launch`） | Peter 確認（2026-11-20）：資料範圍從 2026-10-01 起，開發 2026/11 開始。 |
| Credit Card Anomaly Detection | 2026/01~2026/02 | 2026/02~2026/08 | 建站初版既有值。上線端佐證：CSV 第一筆執行 2026-02-12；Peter 說明 2026/2 底上線、約 2026/8 隨支付平台停用退場（見 Credit Card 段落）。 |
| Account Operation Automation Engine | 2026/05~2026/06 | 2026/06~ | 開發結束月由初版的 2026/7 改為 2026/06（Peter 直接修改 .md，2026-11-19）。上線端佐證：Record 第一筆 2026-06-09（見 Account Engine 段落）。 |
| Deposit & Withdrawal Drop-Order Monitor | 整體 2026/03~2026/09；入金 2026/03~2026/03、出金 2026/04~2026/09 | 入金 2026/03~、出金 2026/09~ | 上線日 Deposit 2026-03-30、Withdrawal 2026-09-09（Peter 確認，2026-11-18）；分線開發期間 Peter 確認（2026-11-19）。見 Drop-Order 段落口徑。 |

## Key Numbers (關鍵數字)

| 數字 | 專案 | 來源 | 狀態 |
|---|---|---|---|
| 47,530 張、146,814 則、200/min | OP Ticket Data Pipeline | .db 查詢 + config.py（見 OP Ticket Data Pipeline 段落） | 已取代第一版的 2,000+（估計）、14 群組、3 張表 |
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
- [x] ~~6 個平台完整清單~~（原 Infra 頁已移除，2026-11-20）
- [ ] 6-Layer Pipeline 其餘 3 層
- [ ] 956 小時與 95% 的計算基礎
- [x] ~~逆向工程實際遇到的技術難點~~（原 Infra 頁已移除，2026-11-20）
- [x] ~~Infrastructure 排程與儲存層實際工具~~（原 Infra 頁已移除，2026-11-20）
- [ ] 信用卡偵測的告警通知管道
- [ ] 信用卡偵測 Area 3 比對規則：判定流程已補為圖 1（2026-11-22，見下方）；各步驟的比對欄位、金額容許誤差、排除狀態仍待補
- [ ] 信用卡圖 1 的 D／E 定義為推論，待 Peter 確認
- [ ] Drop-Order Monitor：名詞說明定義確認、帳號核准者、進線量與溝通次數的前後統計
- [ ] 專案期間：Credit Card 開發 2026/01~2026/02 尚未對照 PDF 或經 Peter 逐項確認
- [ ] OP Ticket Data Pipeline：見該段〈待 Peter 確認〉；第 62 段回補完成後更新回補統計
- [ ] `profile.ts`／`profile.en.ts` 仍引用舊 Infra 專案（「整合 6 個封閉平台」等），待 Peter 決定改寫內容

## Credit Card 圖 1 比對規則（2026-11-22）

- 位置：01 Problem Assessment 第 2 張「要對的是什麼」（Peter 選擇，2026-11-22；原放 04 系統架構後），讓 Quick Read 之後可直接切入比對脈絡。圖號隨之重排：比對規則 1、痛點 2、架構 3、複核長條 4、Before / After 5。
- 招牌視覺：本圖（比對規則決策樹，Mermaid），類型與其他專案不重複。

- 來源：Peter 提供的專案簡報比對邏輯圖（Assessment：match = A + C、mismatch = B + D），以 Mermaid 重繪；原圖的勾、驚嘆號、叉改為節點文字「一致／寫入 LarkSheet／不輸出」。
- 「數量」= 同一張 Parent Ticket 底下兩邊的 Child Ticket 數（Peter 確認）。
- E = CRM 有、Payabl 沒有，不輸出（Peter 確認）。
- D 的定義（Payabl 有退款，CRM 查無或金額不同；多筆金額不同也歸 D）為 Claude 推論，Peter 不記得細節：依據是公開 CSV 的 570 列輸出 `recon_source` 只有 `Payabl & Crm`（343）與 `Payabl`（227），沒有只在 CRM 的案件，且原圖 mismatch 只含 B + D。

## 海科系統地圖調整（2026-11-22）

- 依 Peter 指示移除兩處 Payabl：「信用卡異常偵測」Credit Card PSP 節點的 Innatech (Payabl) 一行；「掉單監控」渠道中的 Payabl PSP 整塊（含 Applepay · EU Netbanking 與 CPS 連線）。
- 掉單監控的專案頁裁切 `map_crops["drop-order"]` 由高 360 縮為 300。
- 信用卡異常偵測節點標題由「Credit Card PSP」改為「Credit Card Payabl」（Peter 指示，2026-11-22）；Worldpay、Checkout 兩行保留。
- 信用卡段加上方向線（Peter 指示，2026-11-22）：信用卡入金稱充值（Recharge，Payabl → Bridger → CRM），出金稱退款（Refunded，CRM → Bridger → Payabl），比照掉單監控的 Deposit／Withdraw 雙線。Bridger 節點由寬 110 縮為 88，讓左側間距放得下標籤。
- 新增 Client Portal → Credit Card Payabl 虛線（客戶只能在 Client Portal 操作，Peter 確認，2026-11-22）；專案頁裁切 `map_crops["credit-card"]` 改為 `24 56 540 184` 以納入 Client Portal；首頁標籤左移避開新連線。
- 名詞說明：原「Refund」一列改為「充值（Recharge）」「退款（Refunded）」兩列，共 12 個名詞；Payabl 說明改為「實際執行充值與退款」；01 背景第一句改用充值／退款（Peter 指示用語，2026-11-22；定義文字為 Claude 草擬，待 Peter 確認）。
- 01 第 2 張「要對的是什麼」開頭加入問題定位（Peter 口述，2026-11-22）：退款時兩邊後台難對照 → 兩種錯誤（Child Ticket 數量不同而配錯、數量一致但手動打錯金額）→ 要解決的是「退款後沒有逐筆對回兩邊的機制」。兩種錯誤與 CSV 營運備註一致（重複退款、退錯訂單、退錯金額），數字留在 Result。
- 01 第 3 張「對照範例」（Peter 選擇，2026-11-22）：欄位名稱取自公開 CSV（Currency、Refund Amount、Refund_Amount_crm、recon_source），金額取自頁面既有的兩筆實際案件（350 EUR 重複退款、60 vs 30 USD 退錯金額）；Parent／Child Ticket 為示意代碼（原始報表不在 repo）。P-01 的 CRM -350 與 TX-01 歸 C 為示意推定，非原始紀錄。待 Peter 提供原始報表表頭後可換成真實欄位。
- A–E 處理方式三行由 01 移到 04「設計重點」的比對規則項下（Peter 指示，2026-11-22）。
- 「原入原出」加入 01 第 2 張開頭（比對單位是每筆 Child Ticket 的設計理由）與名詞說明（共 13 個名詞）（Peter 指示，2026-11-22）。定義「退回充值時使用的原卡，並對應原本的充值訂單」為 Claude 草擬，依據為 CSV 備註「wrong deposit order」與退錯訂單案件，待 Peter 確認；英文暫譯 same-route rule。對照範例表 Parent Ticket 與 Child Ticket 分成兩欄。
- 對照範例擴充為 A–E 各一例（Peter 指示，2026-11-22）：B（60 vs 30 USD）、D（350 EUR 重複退款）金額取自實際案件；A（100 USD）、C（200／150 GBP）、E（CRM -80 EUR）為示意金額，頁面已註明。

## Drop-Order 故事線補強（2026-11-22，Peter 指示）

- 地圖：掉單監控的 Credit Card 渠道改為「Credit Card PSP」＋「Googlepay · Applepay」，補回信用卡出金經 CPS 到 PSP 的路徑；依 Peter 選擇只在掉單地圖用通稱、不寫 Payabl（信用卡段仍為 Credit Card Payabl）。依據：CSV 的 CreditCard 渠道為 `ApplePay-Payabl-CPS`、`Apple/GooglePay-BridgerPay-CPS`。
- 用語同步：名詞說明「CreditCard 出金」改用充值／退款；新增「原入原出」（共 13 個名詞）；執行統計的「原入金單」改為「原充值單」並點出原入原出。
- 掉單常見原因：渠道回呼失敗、上游系統異常（Peter 確認）。
- 「掉單判定規則」由 02 第 1 張移到 01 第 2 張，開頭加問題定位（Claude 草擬）；02「痛點與解決方向」的「依上表規則」改為「依掉單判定規則（見 Problem）」。
- 01 第 3 張「對照範例」：五種案件類型各一筆 CSV 實際案件，與 Result 輸出格式不重複——Deposit TX-00002（UPI-India，Audit／交易成功，9,641 INR，done）、LBT TX-03772（India-CPS，55,704 INR）、Crypto&Wallet TX-03771（USDT-BEP，提交拒絕，來源無金額）、CreditCard TX-04178（Apple/GooglePay-BridgerPay，CC_EUR 50）、IBT TX-03980（IBT-Australia，审核拒绝，IBT_USD 461.82）。頁面狀態值轉繁體，幣別去前綴。

## Account Engine 故事線補強（2026-11-22，Peter 確認）

- 結構：04「引擎流程」Mermaid 移到 01 第 2 張「要查的是什麼」，改為 LR 並編為圖 1（原 TODO「補上引擎架構圖原圖」移出頁面，仍待補）；後續圖號順延：痛點 2、使用規則 3、錄影 4、每月使用量 5、Before / After 6。
- 01 第 2 張開頭：兩個關鍵概念（一個客戶多個帳戶、清退與轉歸屬為何要先查）＋問題定位（Claude 草擬，Peter 確認方向）。名詞說明的清退、轉歸屬補上「執行前要先確認……」（Claude 草擬，待 Peter 確認）。
- 01 第 3 張「對照範例」：Record R-0055（2026-07-07 15:20:17；68 users、322 accounts、22 countries、33 servers、2 regulators、25 account types、missing 0）；Input 不留存，該列為示意；Output「共 322 列」依每帳戶一列推定。4.7 = 322 ÷ 68。
- 資料取得：CRM 沒有開放 API／DB 權限給 OP，以 API 逆向工程登入各 regulator 的 CRM 後台（Peter 確認）。Stack 加入 API Reverse Engineering。
- 方案表新增 B「請 IT 提供完整欄位報表或 DB 權限」：已提出、交期遙遙無期（Peter 確認）；原 B、C 改為 C、D，選擇理由新增「不必等待 IT」。
- 權限範圍：Peter 的自動化帳號，唯讀（Peter 確認）；核准者與帳密存放方式未提供。
- 地圖：帳務段新增「CRM 後台 × 4／每個 regulator 一套」（4 個 regulator 取自痛點卡的單批涵蓋數），由 MetaTrader 連出；`map_crops.account` 加寬為 `380 138 380 226`。
