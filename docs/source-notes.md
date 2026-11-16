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
- 影片 `canva-export/vedio/*.mp4`：環境沒有 ffmpeg，無法檢視內容與去識別，頁面未使用。

**公開資料處理**：`scripts/deidentify_account_record.py` 產生 `public/data/account-engine-record-2026-06-11.csv`。刪除 requestor、`total_users_list`／`total_missing_list`（客戶 ID）、`total_balance`／`total_equity`／`total_credit`（客戶資金總額）與 3 個空欄；輸出後掃描姓名與 6 位數以上 ID。Output 範例列移除 user_id、帳號、客戶與 IB 姓名、group（含品牌代碼）。品牌代碼 VIG／VTJ 不出現在頁面上。圖 2 只裁切 `rule.png` 的中文區塊（浮水印為 Peter 本人姓名，保留）。

## Key Numbers (關鍵數字)

| 數字 | 專案 | 來源 | 狀態 |
|---|---|---|---|
| 6 個異質平台、100% 自動化攝入 | Infrastructure | PDF | 平台清單只列出 CRM、PSP、CPS |
| 10+ 頁面人工查找 | Infrastructure | PDF | — |
| 每日 5 → 20.7 次（實際平均）、最長 5 小時 → 1 小時內、95%+ | Credit Card | PDF + CSV + Peter 確認 | PDF 原寫 4 次、>24 小時，已更正；95% 計算基礎待補 |
| 每輪人工約 45 分鐘（平台 35 + Excel 10）、每日 5 輪 ≈ 3.75 小時；3–7 月 153 天 ≈ 574 小時；年化 × 365 ≈ 1,369 小時 | Credit Card | Peter 口頭說明（2026-11-16） | 估計值 |
| 45 秒/帳戶、381,629 帳戶、≈4,770 小時、≈NT$1.91M | Automation Engine | Record 工作表 + Peter 估計（45 秒、NT$400） | 已取代 PDF 的 75,340+／956+／382K+ |

## Redaction (去識別化)

- 不公開：手機、市話、住址、年齡、駕照、PDF 上的 Email。
- 第三方支付商名稱以「PSP 支付端」代稱。
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
