---
title: "Deposit & Withdrawal Drop-Order Monitor"
subtitle: "出入金掉單監控管線"
summary: "每小時自動比對 CRM 與 CPS 的出入金狀態，把「客戶付了款卻沒入帳」「出金失敗卻沒退回」的掉單轉成 LarkSheet 案件；至 2026/11/17 共揭露 15,393 筆，取代 Deposit、Withdrawal 各每日 2 次的人工抽查。"
company: "海科科技有限公司"
period: "2026/03~2026/09"
phases:
  - { name: "入金", period: "2026/03~2026/03", launch: "2026/03~" }
  - { name: "出金", period: "2026/04~2026/09", launch: "2026/09~" }
role: "與營運端對齊掉單判定規則，負責管線設計與實作"
stack: ["Python", "pandas", "SQLAlchemy / MySQL", "API Reverse Engineering", "pyotp (2FA)", "aiohttp", "cron", "LarkSheet API", "Lark Drive API", "JSON Structured Logging"]
focus: ["Data Reconciliation", "Data Quality Monitoring"]
system_map: { map: "hytech", area: "drop-order" }
impact:
  before: "每日人工抽查，掉單常等客訴才發現"
  after: "自動比對兩邊狀態，掉單直接派工"
tldr:
  problem: "CRM 與 CPS 的出入金狀態不同步（掉單），常常等客戶來問才發現，排查還要逐層翻兩個系統。"
  approach: "每小時自動比對兩邊的訂單狀態，依規則判定掉單，去重後寫入營運已在用的 LarkSheet 案件表。"
  result: "掉單從事後客訴變成每小時派工；取數與比對不再需要人工，監控也不再受排班影響。"
metrics:
  - { value: "1 hr", label: "掉單揭露顆粒（原 Deposit、Withdrawal 各每日 2 次抽查）", on_home: true }
  - { value: "≈606 hr", label: "至 2026/11/17 節省的人工監控工時（估計）" }
  - { value: "15,393", label: "至 2026/11/17 自動揭露的掉單案件", on_home: true }
story:
  - label: "地圖"
    at: "map"
    beats:
      - "[data-b=\"do-portal\"], rect[data-b=\"portal\"], text[data-b=\"portal\"]"
      - "[data-b=\"do-ch\"]"
      - "[data-b=\"do-deposit\"]"
      - "[data-b=\"do-payout\"]"
    line: "客戶在 Client Portal 下單後，入金和出金都交給 CPS，由 CPS 對接各國渠道實際收付款；CRM 則記錄客戶看到的帳戶與訂單狀態：入金由 CPS 下入金指令給 CRM，出金由 CRM 下出金指令給 CPS。"
  - label: "入金"
    at: "ch-1-2"
    pick: ".split-figure"
    dim: "[data-b^=\"w-\"]"
    beats:
      - "[data-b=\"cols\"], [data-b=\"d-lane\"]"
      - "[data-b=\"d-cmd\"]"
      - "[data-b=\"d-flow\"]"
      - "[data-b=\"d-cb\"], [data-b=\"d-manual\"]"
      - "[data-b=\"d-stuck\"]"
    line: "錢有沒有真的動，只有 CPS 知道，所以結果都要回寫到 CRM。先看一筆印度的入金 9,301 INR：CPS 先下入金指令給 CRM 建單，客戶在 UPI 付款，UPI 回呼 CPS，CPS 再回寫 CRM。但回呼失敗時，營運手動把 CPS 改成交易成功(人工)，這個修改不會回寫，CRM 停在 Audit，客戶付了錢卻沒入帳。"
  - label: "出金"
    at: "ch-1-2"
    pick: ".split-figure"
    beats:
      - "[data-b=\"w-lane\"], [data-b=\"w-cmd\"]"
      - "[data-b=\"w-flow\"]"
      - "[data-b=\"w-cb\"], [data-b=\"w-manual\"]"
      - "[data-b=\"w-stuck\"]"
    line: "出金反過來，由 CRM 下出金指令給 CPS，CRM 這時已扣款、顯示 Completed。這筆 55,704 INR 走本地銀行轉帳，同樣回呼失敗、營運手動改成交易失敗(人工)，也沒有回寫：錢沒出去，CRM 卻顯示完成、也沒退回。"
  - label: "為什麼難發現"
    at: "ch-1-3"
    pick: ".split-figure"
    beats:
      - "[data-b=\"v-crm\"]"
      - "[data-b=\"v-cps\"]"
      - "[data-b=\"v-cmp\"]"
      - "[data-b=\"v-w\"]"
    line: "麻煩的是兩邊各自看都正常：CRM 的 Audit 是常見的審核中，CPS 的交易成功(人工)也是正常的完成狀態。只有用同一個 Order Number 把兩邊對起來，才看得出不一致；出金那筆也一樣。"
  - label: "做得到嗎"
    at: "ch-1-4"
    pick: ".split-figure"
    beats:
      - "[data-b=\"cols\"], [data-b=\"q1\"]"
      - "[data-b=\"a1\"]"
      - "[data-b=\"q2\"]"
      - "[data-b=\"a2\"]"
      - "[data-b=\"q3\"]"
      - "[data-b=\"a3\"]"
      - "[data-b=\"q4\"]"
      - "[data-b=\"a4\"]"
      - "[data-b=\"go\"]"
    line: "所以要做的是持續核對兩邊。動手前我先想四個問題：自己查得到的自己查，需要營運確認的主動去問；四項都確認了，才開始寫規則。"
  - label: "判定規則"
    at: "ch-1-5"
    pick: "table"
    beats:
      - "tbody tr:nth-child(1)"
      - "tbody tr:nth-child(2)"
      - "tbody tr:nth-child(3)"
    line: "第三項就是規則本身：我和營運逐條對齊「什麼狀態組合算掉單」，分成入金、三類一般出金與信用卡出金。"
  - label: "對照範例"
    at: "ch-1-6"
    pick: "table"
    beats:
      - "tbody tr:nth-child(1)"
      - "tbody tr:nth-child(2)"
      - "tbody tr:nth-child(n+3)"
    line: "套回剛才的兩筆訂單：入金那筆 CPS 交易成功(人工)、CRM 停在 Audit；出金那筆 CRM Completed、CPS 交易失敗(人工)，都符合規則，會被標成掉單。"
  - label: "解決方案"
    at: "ch-4-2"
    pick: ".mermaid"
    beats:
      - "[id*=\"-flowchart-SCH-\"]"
      - "[id*=\"-flowchart-CPS-\"], [id*=\"-flowchart-CRM-\"], [id*=\"-flowchart-CC-\"], [id*=\"-flowchart-REF-\"], [id*=\"-L_SCH_\"], [data-id^=\"L_SCH_\"]"
      - "[id*=\"-flowchart-BK-\"], [id*=\"-flowchart-CMP-\"], [id*=\"-L_CPS_\"], [data-id^=\"L_CPS_\"], [id*=\"-L_CRM_\"], [data-id^=\"L_CRM_\"], [id*=\"-L_CC_\"], [data-id^=\"L_CC_\"], [id*=\"-L_REF_\"], [data-id^=\"L_REF_\"]"
      - "[id*=\"-flowchart-CHK-\"], [id*=\"-flowchart-AP-\"], [id*=\"-flowchart-HB-\"], [id*=\"-flowchart-OPS-\"], [id*=\"-flowchart-REV-\"], [id*=\"-L_CMP_\"], [data-id^=\"L_CMP_\"], [id*=\"-L_CHK_\"], [data-id^=\"L_CHK_\"], [id*=\"-L_AP_\"], [data-id^=\"L_AP_\"], [id*=\"-L_HB_\"], [data-id^=\"L_HB_\"], [id*=\"-L_OPS_\"], [data-id^=\"L_OPS_\"]"
    line: "CRM 沒有開放資料庫，所以我用營運帳號自動下載報表、直接查 CPS，每小時比對一次；同一筆只派工一次，沒有新案件也寫一列心跳，證明監控沒中斷。"
  - label: "操作畫面"
    at: "ch-5-1"
    pick: ".shot-gallery"
    beats:
      - ".shot-item:nth-child(1)"
      - ".shot-item:nth-child(2)"
      - ".shot-item:nth-child(3)"
      - ".shot-item:nth-child(4)"
      - ".shot-item:nth-child(5)"
    line: "這是 LarkSheet 案件表的實際畫面，每種案件類型一個工作表：Handler 處理完在 Status 標 Done 或 Reversed；沒有新案件的時段，每小時仍留一列心跳。"
  - label: "實際運作"
    at: "ch-5-2"
    pick: "pre"
    beats:
      - ".line:nth-child(n+1):nth-child(-n+4)"
      - ".line:nth-child(n+5):nth-child(-n+10)"
      - ".line:nth-child(n+11)"
    line: "這是 2026-11-18 03:00 的一次實際執行：先查 CPS，再下載 CRM 報表與對照表，接著依 5 種案件類型比對，只寫入新案件；沒有新案件的類型，寫一列心跳。"
  - label: "輸出結果"
    at: "ch-5-3"
    pick: "table"
    beats:
      - "tbody tr:nth-child(1)"
      - "tbody tr:nth-child(n+2):nth-child(-n+4)"
      - "tbody tr:nth-child(5)"
    line: "寫進 LarkSheet 的案件長這樣：入金由 Handler 補登後標 done，出金 Reverse 後標 reversed；最後一列是心跳列，代表那次執行沒有新案件。"
  - label: "成果：入金"
    at: "ch-5-4"
    pick: ".split-figure"
    beats:
      - "[data-b=\"t-axis\"], [data-b=\"t-up\"]"
      - "[data-b=\"t-10\"]"
      - "[data-b=\"t-11\"]"
      - "[data-b=\"t-ops\"]"
      - "[data-b=\"t-manual\"]"
    line: "實際案例是 2026/11/6：上游一次上線 85 個渠道、上線前沒有測試，影響到其他管路，下游整合全部卡住，回呼大量失敗。10 點那次執行揭露 450 筆入金掉單，11 點再揭露 483 筆，平常單次最多只有 75 筆；案件直接進 LarkSheet、同一筆只派一次，交給營運接手。如果還是每日兩次的人工抽查，要等下一輪才看得到。"
  - label: "成果：出金"
    at: "ch-5-5"
    pick: ".split-figure"
    beats:
      - "[data-b=\"o-axis\"], [data-b=\"o-up\"]"
      - "[data-b=\"o-pm\"]"
      - "[data-b=\"o-peak\"]"
      - "[data-b=\"o-why\"]"
      - "[data-b=\"o-done\"]"
      - "[data-b=\"o-manual\"]"
    line: "出金的案例是 2026/10/23：英國的發卡行端批次拒絕信用卡退款，營運把 CPS 改成交易失敗(人工)，CRM 卻仍顯示退款成功。管線每小時照常比對，19:09 那次一口氣揭露 117 件，平常單次最多 85 件；當天 329 件，其中 220 件是信用卡出金，大多在英國、原因同為銀行端交易失敗，正是這次批次拒絕。這 329 件最後全部完成 Reverse。"
tags: ["Reconciliation", "Automation", "Operations"]
categories: ["Data Pipeline", "Automation"]
home: true
order: 4
accent: forest
---

## Problem Assessment

<hr data-slide="背景與名詞">

- 客戶入金、出金時，訂單會經過兩個系統：**CPS** 對接各國渠道、實際收付款，**CRM** 記錄客戶帳戶與交易狀態。
- CPS 的結果要回寫到 CRM。當渠道回呼 CPS 失敗（例如上游系統異常），營運會手動更新 CPS 的狀態，但**手動更新不會回寫 CRM**，就形成**掉單**：入金 CPS 已成功、CRM 仍停在審核或處理中，客戶付了錢卻沒入帳；出金 CRM 顯示完成、CPS 實際失敗，錢沒出去也沒退回。
- 掉單落在後置流程，往往是客戶先發現，再透過 CS、Sales、Finance 來詢問。

<details class="glossary-details">
<summary>名詞說明<span class="mono">14 個名詞 · 點擊展開</span></summary>
<table>
<thead><tr><th>名詞</th><th>說明</th></tr></thead>
<tbody>
<tr><td>入金／出金（Deposit／Withdrawal）</td><td>客戶存入／提領資金</td></tr>
<tr><td>CRM</td><td>內部管理客戶帳戶與交易紀錄的系統，客戶與營運看到的訂單狀態以這裡為準</td></tr>
<tr><td>CPS</td><td>內部支付系統，對接各國銀行與支付渠道，實際執行收款與付款</td></tr>
<tr><td>渠道（Channel）</td><td>實際處理款項的外部通道，例如各國銀行轉帳、QR、電子錢包、加密貨幣、信用卡</td></tr>
<tr><td>回呼（Callback）</td><td>渠道處理完款項後，把結果通知 CPS</td></tr>
<tr><td>掉單</td><td>CRM 與 CPS 對同一筆訂單的狀態不一致，且沒有自動同步回來</td></tr>
<tr><td>LBT</td><td>Local Bank Transfer，本地銀行轉帳出金</td></tr>
<tr><td>IBT</td><td>International Bank Transfer，國際電匯出金</td></tr>
<tr><td>Crypto & e-Wallet</td><td>加密貨幣與電子錢包出金</td></tr>
<tr><td>CreditCard 出金</td><td>信用卡充值（Recharge）的客戶出金時，款項以退款（Refunded）退回原卡</td></tr>
<tr><td>原入原出</td><td>信用卡出金須退回充值時使用的原卡，並對應原本的充值訂單</td></tr>
<tr><td>Reverse</td><td>出金失敗時，在 CRM 把已扣除的金額退回客戶帳戶</td></tr>
<tr><td>Handler／Checker</td><td>Handler 依案件到 CRM 補登入金或 Reverse；Checker 是營運人員的事後複盤</td></tr>
<tr><td>心跳列（Heartbeat Row）</td><td>該次執行沒有新案件時，只寫入偵測時間的一列，用來證明管線有正常執行</td></tr>
</tbody>
</table>
</details>

<hr data-slide="一筆訂單的旅程">

錢有沒有真的動，只有 CPS 知道；客戶看到的卻是 CRM。所以每筆訂單在 CPS 處理完之後，結果都要**回寫**到 CRM。以兩筆印度的實際訂單為例：入金 9,301 INR 走 UPI，由 CPS 先下**入金指令**給 CRM 建單；出金 55,704 INR 走本地銀行轉帳，由 CRM 下**出金指令**給 CPS。

正常情況下，渠道處理完會**回呼** CPS，CPS 再回寫 CRM。問題出在回呼失敗的時候：營運會手動把 CPS 改成「交易成功(人工)」或「交易失敗(人工)」，但手動修改不會回寫 CRM，兩邊就停在不同的狀態：

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 326" role="img" aria-labelledby="jr-title"><title id="jr-title">一筆訂單的旅程：入金由 CPS 下入金指令給 CRM 建單，出金由 CRM 下出金指令給 CPS；結果都要從 CPS 回寫 CRM，渠道回呼失敗後的人工修改不會回寫</title><defs><marker id="jr-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><g data-b="cols"><text class="sf-s" x="95" y="22">CRM（客戶看到的狀態）</text><text class="sf-s" x="410" y="22">CPS（實際收付）</text><text class="sf-s" x="665" y="22">渠道</text></g><g data-b="d-lane"><text class="sf-h sf-start" x="20" y="50">入金 · 9,301 INR · UPI</text><rect class="sf-node" x="20" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="95" y="89">CRM</text><rect class="sf-node" x="335" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="410" y="89">CPS</text><rect class="sf-node" x="590" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="665" y="89">UPI</text></g><g data-b="d-cmd"><path class="sf-line" d="M335 74 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="255" y="67">入金指令</text><text class="sf-s" x="95" y="128">建單：Audit（待入帳）</text></g><g data-b="d-flow"><path class="sf-line" d="M590 94 H491" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M335 94 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="540" y="110">回呼</text><text class="sf-s" x="255" y="110">回寫</text><text class="sf-s" x="665" y="128">已收到款項</text></g><g data-b="d-cb"><text class="sf-miss" x="540" y="130">✕ 回呼失敗</text></g><g data-b="d-manual"><text class="sf-s" x="410" y="128">營運手動改成</text><text class="sf-link" x="410" y="146">交易成功(人工)</text></g><g data-b="d-stuck"><text class="sf-miss" x="255" y="130">✕ 沒有回寫</text><text class="sf-bad-t sf-small" x="95" y="146">付了錢卻沒入帳</text></g><line class="sf-sep" x1="20" y1="176" x2="740" y2="176"/><g data-b="w-lane"><text class="sf-h sf-start" x="20" y="210">出金 · 55,704 INR · 本地銀行轉帳</text><rect class="sf-node" x="20" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="95" y="249">CRM</text><rect class="sf-node" x="335" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="410" y="249">CPS</text><rect class="sf-node" x="590" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="665" y="249">本地銀行</text></g><g data-b="w-cmd"><path class="sf-line" d="M170 236 H329" marker-end="url(#jr-arrow)"/><text class="sf-s" x="255" y="230">出金指令</text><text class="sf-s" x="95" y="290">Completed（已扣款）</text></g><g data-b="w-flow"><path class="sf-line" d="M485 236 H584" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M590 256 H491" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M335 256 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="540" y="230">付款</text><text class="sf-s" x="540" y="272">回呼</text><text class="sf-s" x="255" y="272">回寫</text><text class="sf-s" x="665" y="290">轉帳失敗</text></g><g data-b="w-cb"><text class="sf-miss" x="540" y="290">✕ 回呼失敗</text></g><g data-b="w-manual"><text class="sf-s" x="410" y="290">營運手動改成</text><text class="sf-link" x="410" y="308">交易失敗(人工)</text></g><g data-b="w-stuck"><text class="sf-miss" x="255" y="290">✕ 沒有回寫</text><text class="sf-bad-t sf-small" x="95" y="308">錢沒出去，也沒退回</text></g></svg>
</div>
<figcaption>圖 1　一筆訂單的旅程：渠道回呼 CPS 失敗時，營運手動改 CPS 狀態，但手動修改不會回寫 CRM，於是形成掉單（兩筆皆為本頁公開 CSV 的實際案件）</figcaption>
</figure>

<hr data-slide="兩邊各自看都正常">

掉單難發現，是因為 CRM 與 CPS 各自看起來都正常；只有用同一個 Order Number 把兩邊的狀態放在一起，才看得出不一致：

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 270" role="img" aria-labelledby="vw-title"><title id="vw-title">兩邊各自看都正常：CRM 的 Audit 與 CPS 的交易成功(人工)各自都是正常狀態，用同一個 Order Number 對起來才看得出不一致</title><g data-b="v-crm"><text class="sf-s" x="150" y="22">CRM 畫面</text><rect class="sf-box" x="40" y="40" width="220" height="84" rx="6"/><text class="sf-k" x="150" y="64">入金 · 9,301 INR</text><text class="sf-good" x="150" y="88">Audit</text><text class="sf-tag-good-t sf-small" x="150" y="110">審核中，看起來正常</text></g><g data-b="v-cps"><text class="sf-s" x="610" y="22">CPS 畫面</text><rect class="sf-box" x="500" y="40" width="220" height="84" rx="6"/><text class="sf-k" x="610" y="64">入金 · 9,301 INR</text><text class="sf-good" x="610" y="88">交易成功(人工)</text><text class="sf-tag-good-t sf-small" x="610" y="110">已完成，看起來正常</text></g><g data-b="v-cmp"><path class="sf-line" d="M260 82 H500" stroke-dasharray="5 4"/><text class="sf-link" x="380" y="74">同一個 Order Number</text><rect class="sf-bad" x="316" y="90" width="128" height="26" rx="13"/><text class="sf-bad-t sf-small" x="380" y="107">狀態不一致 = 掉單</text></g><g data-b="v-w"><line class="sf-sep" x1="40" y1="146" x2="720" y2="146"/><rect class="sf-box" x="40" y="166" width="220" height="84" rx="6"/><text class="sf-k" x="150" y="190">出金 · 55,704 INR</text><text class="sf-good" x="150" y="214">Completed</text><text class="sf-tag-good-t sf-small" x="150" y="236">已完成，看起來正常</text><rect class="sf-box" x="500" y="166" width="220" height="84" rx="6"/><text class="sf-k" x="610" y="190">出金 · 55,704 INR</text><text class="sf-good" x="610" y="214">交易失敗(人工)</text><text class="sf-tag-good-t sf-small" x="610" y="236">已結案，看起來正常</text><path class="sf-line" d="M260 208 H500" stroke-dasharray="5 4"/><text class="sf-link" x="380" y="200">同一個 Order Number</text><rect class="sf-bad" x="316" y="216" width="128" height="26" rx="13"/><text class="sf-bad-t sf-small" x="380" y="233">狀態不一致 = 掉單</text></g></svg>
</div>
<figcaption>圖 2　兩邊各自看都正常：CRM 與 CPS 的畫面上都是常見狀態，用同一個 Order Number 對起來才看得出掉單（與圖 1 同兩筆訂單）</figcaption>
</figure>

<hr data-slide="做得到嗎">

因此要解決的不是「查得不夠快」，而是**沒有機制持續核對 CRM 與 CPS 上同一筆訂單的狀態**。動手前，我先問自己四個問題：

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 460" role="img" aria-labelledby="fz-title"><title id="fz-title">動手前的可行性檢查：我先想四個問題，自己查得到的自己查，需要營運確認的主動去問；四項都確認後才寫判定規則</title><defs><marker id="fz-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><g data-b="cols"><circle class="sf-person" cx="60" cy="34" r="14"/><path class="sf-person" d="M36 84 a24 22 0 0 1 48 0 z"/><text class="sf-t" x="60" y="102">我（工程）</text><circle class="sf-parent" cx="716" cy="34" r="14"/><path class="sf-parent" d="M692 84 a24 22 0 0 1 48 0 z"/><text class="sf-t" x="716" y="102">營運</text><text class="sf-s" x="206" y="22">腦中的問題</text><text class="sf-s" x="470" y="22">自己查，或去問營運</text></g><g data-b="q1"><circle class="sf-box" cx="80" cy="162" r="3"/><circle class="sf-box" cx="88" cy="151" r="4.5"/><rect class="sf-box" x="96" y="110" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="143">資料拿得到嗎？</text></g><g data-b="a1"><path class="sf-line" d="M322 140 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="132">去問營運</text><rect class="sf-parent" x="470" y="110" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 130 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="134">CPS 你可以直接查</text><text class="sf-small-t" x="575" y="152">CRM 用我們的帳號下載報表</text></g><g data-b="q2"><circle class="sf-box" cx="80" cy="238" r="3"/><circle class="sf-box" cx="88" cy="227" r="4.5"/><rect class="sf-box" x="96" y="186" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="219">兩邊對得到同一筆嗎？</text></g><g data-b="a2"><rect class="sf-child" x="336" y="186" width="264" height="56" rx="10" stroke-dasharray="5 4"/><text class="sf-small-t" x="468" y="210">自己查兩邊的欄位</text><text class="sf-small-t" x="468" y="228">都有 Order Number ✓</text></g><g data-b="q3"><circle class="sf-box" cx="80" cy="314" r="3"/><circle class="sf-box" cx="88" cy="303" r="4.5"/><rect class="sf-box" x="96" y="262" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="295">什麼狀態算掉單？</text></g><g data-b="a3"><path class="sf-line" d="M322 292 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="284">去問營運</text><rect class="sf-parent" x="470" y="262" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 282 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="286">狀態值很多，我們一條條對</text><text class="sf-link" x="575" y="304">→ 下一張的判定規則</text></g><g data-b="q4"><circle class="sf-box" cx="80" cy="390" r="3"/><circle class="sf-box" cx="88" cy="379" r="4.5"/><rect class="sf-box" x="96" y="338" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="371">多久比一次？</text></g><g data-b="a4"><path class="sf-line" d="M322 368 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="360">去問營運</text><rect class="sf-parent" x="470" y="338" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 358 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="371">最好每小時就知道</text></g><g data-b="go"><rect class="sf-tag-good" x="200" y="412" width="360" height="38" rx="19"/><text class="sf-tag-good-t sf-tag" x="380" y="436">四項都確認 → 先寫判定規則</text></g></svg>
</div>
<figcaption>圖 3　動手前的可行性檢查：自己查得到的自己查，要營運確認的主動去問（對話為示意，內容依實際對齊結果；取得方式見 Solution Design 的限制）</figcaption>
</figure>

<hr data-slide="掉單判定規則">

第三件事就是規則本身。我先和營運端逐條對齊「什麼狀態組合算掉單」，再把規則寫成程式。下表是五種案件類型的判定規則：

| 案件類型 | CRM 狀態 | CPS 狀態 | 代表的情況 | 處理動作 |
|---|---|---|---|---|
| Deposit | 尚未成功（Audit、Submit to third party、Processing 等） | 交易成功、交易成功(人工) | 客戶已付款，CRM 未入帳 | Handler 到 CRM 補登入金 |
| Withdraw-LBT／Crypto&Wallet／IBT | Apply Status 為 Completed | 交易狀態或出金狀態為失敗、拒絕 | CRM 已扣款，渠道實際沒有出金 | Handler 到 CRM Reverse，依失敗原因回覆客戶 |
| Withdraw-CreditCard | Success 或 Partial Success，且 Order Status 為 Refunded | 出金失敗 | CRM 已記退款，CPS 實際沒有退回原卡 | 同上 |

<hr data-slide="對照範例">

五種案件類型各舉一筆實際案件，對照 CRM 與 CPS 的狀態；前兩列就是圖 1 的兩筆訂單：

| 案件類型 | CRM 狀態 | CPS 交易／出金狀態 | 金額 | 處理 |
|---|---|---|---|---|
| Deposit | Audit | 交易成功(人工) | 9,301 INR | 補登入金（done） |
| Withdraw-LBT | Completed | 處理完成／交易失敗(人工) | 55,704 INR | Reverse（reversed） |
| Withdraw-Crypto&Wallet | Completed | 提交拒絕 | （空白） | Reverse（reversed） |
| Withdraw-CreditCard | Success | 處理完成／交易失敗(人工) | 50 EUR | Reverse（reversed） |
| Withdraw-IBT | Completed | 審核拒絕／審核拒絕 | 461.82 USD | Reverse（reversed） |

*取自本頁公開 CSV 的實際案件（2026/04 與 2026/09；CSV 保留來源系統的簡體字）。Crypto&Wallet 這筆在來源資料中沒有金額；幣別去掉 CC_、IBT_ 前綴。*

- **Deposit**：營運已把 CPS 手動改成交易成功，CRM 仍停在 Audit，客戶付了錢卻沒入帳。
- **出金四類**：CRM 已顯示完成或成功，CPS 實際失敗或被拒絕，錢沒出去也沒退回，由 Handler 到 CRM Reverse。

<hr data-slide="痛點與證據">

<figure class="pain-figure">
<div class="pain-grid">
<section class="pain-card tone-red pain-wide">
<h4 class="pain-title">掉單後置發現，客戶先等</h4>
<p class="pain-label"><span>Pain</span>發現時已經太遲，只能事後補救</p>
<ul class="pain-note">
<li>人工每日只能各抽查 Deposit、Withdrawal 約 2 次，兩次之間發生的掉單要等下一輪才看得到。</li>
<li>CS、Finance 詢問資金狀態時，回應速度跟不上，增加等待與來回確認。</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">一次人工抽查的耗時（估計）</p>
<div class="pain-timebar">
<span class="seg-platform" style="flex: 33">下載 CRM、CPS 兩份報表　約 30–35 分</span>
<span class="seg-excel" style="flex: 27">Excel 運算、整理與搬移</span>
</div>
<p class="pain-caption">合計每次約 <b>1 小時</b>；Deposit、Withdrawal 每日各抽查 2 次。</p>
</div>
</section>
<section class="pain-card tone-grey">
<h4 class="pain-title">排查要逐層定位</h4>
<p class="pain-label"><span>Pain</span>卡點出現後仍要人工層層追</p>
<ul class="pain-note">
<li>一筆訂單要分別在 CRM 與 CPS 查狀態，再判斷卡在哪個渠道、什麼原因。</li>
<li>渠道多、類型雜，比對規則不容易靠人記住。</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">證據：要比對的範圍</p>
<ul class="pain-flow">
<li>資料期間內的掉單涵蓋 <b>181 種渠道類型</b>、<b>136 個國家</b>、<b>64 種幣別</b>。</li>
<li>出金分成 LBT、Crypto & e-Wallet、CreditCard、IBT 四大類，各自的失敗狀態不同。</li>
<li>出金失敗原因有 6 大類、33 種子類別（見 Result）。</li>
</ul>
</div>
</section>
<section class="pain-card tone-yellow">
<h4 class="pain-title">人力難以釋放</h4>
<p class="pain-label"><span>Pain</span>依賴熟悉完整架構的人</p>
<ul class="pain-note">
<li>判斷掉單要同時懂 CRM 狀態、CPS 狀態與渠道特性。</li>
<li>人員請假、交接或疏漏時，監控就出現空窗。</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">證據：人工監控的成本是固定的</p>
<ul class="pain-flow">
<li>每次抽查約 1 小時，頻率提高幾倍，人力就要增加幾倍。</li>
<li>要做到每小時檢查一次，在人力上不可行。</li>
</ul>
</div>
</section>
</div>
<figcaption>圖 4　原流程的三個痛點（工時為估計值；比對範圍取自本頁公開 CSV）</figcaption>
</figure>

<hr data-slide="值得投入的理由">

**值得投入解決的理由：**

1. **掉單是日常，不是偶發**：Deposit 上線後的 233 天中有 220 天出現掉單；Withdrawal 的 70 天中有 67 天。
2. **上游故障時會瞬間爆量**：2026/11/6 上游系統異常，客戶大量卡單，兩次執行揭露的入金掉單遠超過平常（案例見 Result）；每日 2 次的人工抽查無法及時看到這種規模。
3. **人工成本無法隨頻率擴充**：每次抽查約 1 小時（圖 4），頻率提高幾倍，人力就要增加幾倍。

## Solution Design

<hr data-slide="痛點與解決方向">

**痛點 → 解決方向**（對應圖 5 的架構）：

- **掉單後置發現** → 排程每小時自動比對，新掉單在下一次整點執行就會出現。
- **排查要逐層定位** → 一次取齊 CRM 報表、CPS 資料與信用卡明細，依掉單判定規則（見 Problem）判定；出金案件自動帶出原因類別與狀態軌跡。
- **依賴熟悉架構的人** → 判定規則寫進程式，案件寫入 LarkSheet；Handler 只處理已判定的案件。
- **監控中斷沒人知道** → 沒有新案件時也寫入心跳列，區分「沒有掉單」和「管線沒跑」。

**設計時必須面對的限制：**

- CRM 沒有開放資料庫權限，只能用營運帳號登入（含 2FA）下載報表，且報表要先觸發產生、再下載。
- 4 個監管主體（regulator）的報表分開產生，要各自下載再合併。
- CRM 與 CPS 有時間差與時區差，訂單狀態也會在數天內持續變動，所以 CRM 出入金報表回看 4 天、信用卡明細與 CPS 回看 7 天。
- 同一筆掉單在處理完之前，每小時都會被比對出來，必須去重，否則同一筆會被重複派工。

## Alternative Solutions

當時評估過四個方案，前三個為替代方案：

| 方案 | 做法 | 優點 | 缺點 |
|---|---|---|---|
| A. 直接查 CRM 資料庫 | 以 SQL 直接查詢 CRM 的訂單狀態 | 資料最即時、最完整 | 沒有 CRM 資料庫權限，申請時程無法掌握 |
| B. 請 CPS 加上主動通知 | 由 CPS 在訂單狀態異常時主動推送 | 從源頭通知，延遲最短 | 需要 CPS 端排入開發，時程與規格不在我們手上 |
| C. 共同表單通知 | 透過跨部門的共同表單回報與追蹤掉單 | 不需開發 | Owner 不是我們，欄位與流程難以控管 |
| **D. 跨系統掉單管線（採用）** | 每小時自動下載 CRM 報表、查詢 CPS 資料，依規則判定後寫入 LarkSheet | 不必等其他團隊；規則、輸出欄位與去重都由我們掌握 | CRM 報表下載要處理 2FA 與非同步產生；上游格式變動時要跟著調整 |

## Selected Solution

<hr data-slide="選擇理由">

**選擇 D：跨系統掉單管線**

1. **不需要新權限**：A 卡在 CRM 資料庫權限。CRM 報表本來就是營運每天在下載的，改成程式下載即可；CPS 端已有資料庫讀取權限，直接查詢。
2. **不必等待外部團隊**：B 的時程不可控，D 可以先上線；未來若 CPS 提供主動通知，只需要替換擷取層。
3. **輸出由我們控管**：C 的 owner 不是我們。D 的案件寫入我們維護的 LarkSheet，欄位、去重規則與處理狀態都由我們定義，Handler 與 Checker 直接在上面作業。
4. **分階段降低風險**：第一階段先讓掉單「被看見、被派工」；運行穩定約 3–6 個月後，第二階段才做自動點擊，讓人員免除到 CRM 手動處理的負擔。

<hr data-slide="系統架構">

每小時一次的完整流程：

```mermaid
flowchart LR
    SCH["Schedule<br/>cron 每小時整點"] --> CPS["CPS Database<br/>入金、出金 · 近 7 天"]
    SCH --> CRM["CRM 出入金報表<br/>4 個 regulator · 近 4 天"]
    SCH --> CC["CRM 信用卡明細<br/>近 7 天"]
    SCH --> REF["對照表<br/>Reason Table · WithdrawType Table"]
    CPS --> BK["Backup<br/>CPS 原始資料存到 Lark Drive 當日資料夾"]
    CPS --> CMP["compare_logic<br/>依 5 種案件類型套用判定規則"]
    CRM --> CMP
    CC --> CMP
    REF --> CMP
    CMP --> CHK{"LarkSheet 是否<br/>已有這筆訂單"}
    CHK -->|"有新案件"| AP["Append 新案件"]
    CHK -->|"沒有新案件"| HB["Append 心跳列<br/>只寫偵測時間"]
    AP --> OPS["Handler 處理<br/>補登入金或 Reverse"]
    OPS --> REV["Checker 複盤"]
```

*圖 5　出入金掉單監控管線（依專案程式碼整理）*

<hr data-slide="設計重點">

**設計重點：**

- **去重**：以 Order Number 為 Unique Key（信用卡為 Merchant Order + Deposit Order Number），每次先查 LarkSheet 已有的訂單，只追加新案件，同一筆掉單只派工一次。
- **還在回寫中的訂單**：判定前沒有設等待時間，剛成功、尚未回寫的訂單也可能被標出，由 Handler 確認後略過。
- **心跳列**：某類案件沒有新掉單時，仍寫入一列只有偵測時間的紀錄。表上「沒有新案件」和「管線停了」因此可以區分。
- **狀態軌跡與原因**：出金案件把 CRM 與 CPS 的狀態串成一條 Status Workflow（例如 `Risk Audit -> Accepted -> Completed -> 處理完成 -> 交易失敗(人工)`），並由 Reason Table 帶出原因類別與子類別，Handler 不必再開兩個後台對照，可以直接依原因回覆客戶。
- **可追溯**：每次執行產生一個 `uid`，JSON log 帶 `service`、`stage`、`status`；CPS 原始資料每次備份到 Lark Drive，事後可以查核當時比對的資料。
- **權限範圍**：CRM 使用營運的既有帳號（含 2FA），只下載報表、不寫入；CPS 只執行 SELECT 查詢；Lark 透過自建 App 寫入案件表與備份資料夾。CRM 與 CPS 的帳密從唯讀掛載的設定檔讀取，不寫在程式碼中。

## Result

<hr data-slide="操作畫面">

### 操作畫面：LarkSheet 案件表

每種案件類型一個工作表。Handler 處理完在 `Status` 標 Done（已補登）或 Reversed（已退回），出金並附上回覆客戶的原因；沒有新案件的時段，每小時仍留下一列只有偵測時間的心跳列：

<figure class="shot-gallery">
<div class="shot-strip">
<div class="shot-item">
<p class="shot-label"><span class="mono">1 / 5</span>Deposit：Handler 補登入金後標 Done</p>

![Deposit 工作表：每列一筆入金掉單，Status 為 Done](../../assets/projects/drop-order-monitor/larksheet-deposit.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">2 / 5</span>Withdraw - Crypto&Wallet：Reverse 後標 Reversed，並寫明回覆客戶的原因</p>

![Crypto&Wallet 工作表：Status 為 Reversed，右側為回覆客戶的原因](../../assets/projects/drop-order-monitor/larksheet-crypto-wallet.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">3 / 5</span>Withdraw - LBT：同一小時揭露多筆，逐筆 Reverse</p>

![LBT 工作表：同一時段多筆交易失敗(人工)，Status 皆為 Reversed](../../assets/projects/drop-order-monitor/larksheet-lbt.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">4 / 5</span>Withdraw - CreditCard：一筆案件夾在心跳列之間</p>

![CreditCard 工作表：一筆 Refunded 案件，其餘為每小時的心跳列](../../assets/projects/drop-order-monitor/larksheet-creditcard.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">5 / 5</span>Withdraw - IBT：沒有新案件時，每小時仍寫一列心跳</p>

![IBT 工作表：整頁都是只有偵測時間的心跳列](../../assets/projects/drop-order-monitor/larksheet-ibt.png)

</div>
</div>
<figcaption>圖 6　LarkSheet 案件表實際畫面（左右滑動看 5 個工作表；已裁掉瀏覽器與文件路徑，客戶 ID、帳號、訂單編號與 Handler 姓名已模糊；點擊圖片可放大）</figcaption>
</figure>

<hr data-slide="一次實際執行">

### 一次實際執行的紀錄

- 以下是 2026-11-18 03:00 那次執行的 log 節錄，原始格式為 JSON，這裡只保留時間、stage 與訊息。
- 重複的下載紀錄已省略；CRM 的內部系統名稱改為 `CRM`，工作表 ID、檔名前綴與網址已移除。

```text
03:00:02  Lark Init and Connect     Lark Access Token acquired
03:00:06  Download DataSource       Successfully connected to CPS database.
03:00:27  Download DataSource       Deposit query finished, rows=195438.
03:06:13  Download DataSource       CPS report downloaded successfully. deposit_rows=195438, withdraw_rows=1037
03:06:15  Download DataSource       Login successful
03:06:15  Download DataSource       Token obtained successfully
03:07:55  Download DataSource       Finish downloading CRM DW Report for all brands, total rows: 322159
   ...    (CRM 信用卡明細，3 個 regulator × 近 7 天)
03:10:43  Download DataSource       共取得 7078 筆 Records                      <- Reason Table
03:10:52  Upload Failed DataSource  Upload success (file_name=<cps_withdraw_failed_cc>.csv)
03:10:55  Compare Existing Data - Deposit                 Total unique keys in LarkSheet: 6492, Total new mismatch cases to upload: 1
03:10:57  Compare Existing Data - Withdraw_CryptoWallet   Total unique keys in LarkSheet: 1080, Total new mismatch cases to upload: 1
03:11:00  Compare Existing Data - Withdraw_LBT            Total unique keys in LarkSheet: 7717, Total new mismatch cases to upload: 10
03:11:01  Compare Existing Data - Withdraw_IBT            Total unique keys in LarkSheet: 47, Total new mismatch cases to upload: 0
03:11:02  Upload Detection Time - Withdraw_IBT            Append success (total_rows=1)
03:11:02  Compare Existing Data - Withdraw_CreditCard     Total unique keys in LarkSheet: 1028, Total new mismatch cases to upload: 0
03:11:03  Upload Detection Time - Withdraw_CreditCard     Append success (total_rows=1)
03:11:03  LarkSheet Upload Complete Upload total data to LarkSheet Finish
```

從這段紀錄可以看到：

- **一次完整執行約 11 分鐘**，其中約 6 分鐘花在 CPS 出金查詢，CRM 報表下載約 4 分半。
- 五種案件類型各自先查 LarkSheet 已有的訂單，只寫入新案件：這次 Deposit 1 筆、Crypto&Wallet 1 筆、LBT 10 筆。
- IBT 與 CreditCard 沒有新案件，各寫入一列心跳列，而不是什麼都不寫。

<figure class="tech-figure">
<div class="tech-labels">
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Hourly Cross-System Reconciliation</p>
<p class="tech-label-desc">每小時整合 CRM 報表與 CPS 資料，依案件類型套用掉單判定規則。</p>
</div>
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Case Ledger with Heartbeat</p>
<p class="tech-label-desc">去重後只追加新案件；沒有案件時寫入心跳列，證明監控沒有中斷。</p>
</div>
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">JSON Logging Design</p>
<p class="tech-label-desc">每次執行一個 uid，每個階段皆有 structured log。</p>
</div>
</div>
</figure>

<hr data-slide="輸出格式">

### 輸出格式

案件寫入 LarkSheet，每種案件類型一個工作表。以下取自 2026/11 的實際案件與一列心跳列，已去除客戶 ID、帳號、訂單編號與人員姓名；表中只列判定用的狀態與處理結果，偵測時間、渠道與金額見下方公開 CSV（CSV 保留來源系統的簡體字）：

| Case Type | CRM Status | CPS 狀態（交易／出金） | 原因（類別／子類別） | 處理狀態 |
|---|---|---|---|---|
| Deposit | Processing | 交易成功 | — | done |
| Withdraw-LBT | Completed | 處理完成／交易失敗(人工) | 渠道問題／限額問題 | reversed |
| Withdraw-CreditCard | Success | 處理完成／交易失敗(人工) | 客戶問題／銀行端交易失敗 | reversed |
| Withdraw-IBT | Completed | 處理完成／交易失敗(人工) | 客戶問題／SWIFT 錯誤 | reversed |
| Withdraw-IBT | - | - | 只有偵測時間 2026-11-17 23:11:40 | |

- 最後一列是心跳列：該次執行沒有新案件，只留下偵測時間。
- `處理狀態` 由 Handler 填寫：入金為 done（已補登），出金為 reversed（已退回）。

<hr data-slide="入金案例：11/6">

### 入金案例：2026/11/6 上游系統異常

這天上游一次上線 85 個渠道，上線前沒有測試對其他管路的影響，結果連帶讓下游整合的訂單全部卡住，渠道回呼大量失敗，客戶大量卡單。管線照常每小時執行，掉單在下一次整點就出現在案件表上：

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 310" role="img" aria-labelledby="tl-title"><title id="tl-title">2026/11/6 上游一次上線 85 個渠道、未經測試，下游整合全部卡住：10:00 執行揭露 450 筆入金掉單、11:00 再揭露 483 筆，平常單次最多 75 筆；案件寫入 LarkSheet 後交給營運接手</title><g data-b="t-axis"><text class="sf-h sf-start" x="40" y="22">管線（11/6 全天 24 次執行，每小時一次）</text><line class="sf-line" x1="40" y1="232" x2="470" y2="232"/><line class="sf-line" x1="80" y1="232" x2="80" y2="238"/><line class="sf-line" x1="210" y1="232" x2="210" y2="238"/><line class="sf-line" x1="340" y1="232" x2="340" y2="238"/><line class="sf-line" x1="470" y1="232" x2="470" y2="238"/><text class="sf-s" x="80" y="254">09:00</text><text class="sf-s" x="210" y="254">10:00 執行</text><text class="sf-s" x="340" y="254">11:00 執行</text><text class="sf-s" x="470" y="254">12:00</text></g><g data-b="t-up"><rect class="sf-bad" x="100" y="36" width="350" height="26" rx="13"/><text class="sf-bad-t sf-small" x="275" y="53">上游一次上線 85 個渠道、未經測試 · 下游全部卡住</text></g><g data-b="t-10"><rect class="sf-trx" x="188" y="92" width="44" height="140" rx="3"/><text class="sf-t" x="210" y="84">450</text></g><g data-b="t-11"><rect class="sf-trx" x="318" y="82" width="44" height="150" rx="3"/><text class="sf-t" x="340" y="74">483</text><line class="sf-sep" x1="40" y1="209" x2="470" y2="209"/><text class="sf-s sf-start" x="44" y="203">平常單次最多 75 筆</text><text class="sf-k" x="255" y="276">兩次合計 933 筆 · 85 種渠道 · 61 個國家</text></g><g data-b="t-ops"><defs><marker id="tl-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><path class="sf-line" d="M478 150 H519" marker-end="url(#tl-arrow)"/><rect class="sf-box" x="525" y="96" width="215" height="108" rx="6"/><text class="sf-t" x="632" y="128">寫入 LarkSheet</text><text class="sf-s" x="632" y="152">同一筆只派工一次</text><text class="sf-good" x="632" y="182">營運 Handler 接手</text></g><g data-b="t-manual"><line class="sf-sep" x1="40" y1="288" x2="740" y2="288"/><text class="sf-k sf-start" x="40" y="304">如果是人工抽查：每日 2 次，兩次之間的掉單要等下一輪才看得到</text></g></svg>
</div>
<figcaption>圖 7　2026/11/6 上游異常時，每次執行揭露的入金掉單筆數（長條高度依筆數比例；平常單次最多 75 筆發生在 2026/09/22；取自本頁公開 CSV）</figcaption>
</figure>

<hr data-slide="出金案例：10/23">

### 出金案例：2026/10/23 英國信用卡退款大量失敗

這天英國的發卡行端批次拒絕信用卡退款，退款大量失敗，營運把 CPS 手動改成交易失敗(人工)，但 CRM 仍顯示退款成功。管線每小時照常比對，失敗的退款在下一次整點就成為案件：

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 312" role="img" aria-labelledby="wd-title"><title id="wd-title">2026/10/23 出金：19:09 那次執行揭露 117 件，平常單次最多 85 件；220 件為信用卡出金、集中在英國、原因同為銀行端交易失敗（發卡行端批次拒絕退款）；當天 329 件最後全部 Reverse</title><g data-b="o-axis"><text class="sf-h sf-start" x="40" y="22">管線（10/23 全天 24 次執行，每小時一次）</text><line class="sf-line" x1="40" y1="240" x2="522" y2="240"/><text class="sf-s" x="51" y="258">00:00</text><text class="sf-s" x="171" y="258">06:00</text><text class="sf-s" x="291" y="258">12:00</text><text class="sf-s" x="411" y="258">18:00</text><rect class="sf-node" x="44" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="84" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="104" y="233.6" width="14" height="6.4" rx="2"/><rect class="sf-node" x="124" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="144" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="164" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="184" y="223.3" width="14" height="16.7" rx="2"/><rect class="sf-node" x="204" y="216.9" width="14" height="23.1" rx="2"/><rect class="sf-node" x="224" y="237.4" width="14" height="2.6" rx="2"/><rect class="sf-node" x="264" y="232.3" width="14" height="7.7" rx="2"/><rect class="sf-node" x="284" y="231.0" width="14" height="9.0" rx="2"/><rect class="sf-node" x="304" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="444" y="227.2" width="14" height="12.8" rx="2"/><rect class="sf-node" x="464" y="225.9" width="14" height="14.1" rx="2"/><rect class="sf-node" x="484" y="224.6" width="14" height="15.4" rx="2"/><rect class="sf-node" x="504" y="237.4" width="14" height="2.6" rx="2"/></g><g data-b="o-up"><rect class="sf-bad" x="90" y="36" width="380" height="26" rx="13"/><text class="sf-bad-t sf-small" x="280" y="53">英國發卡行端批次拒絕退款 · 信用卡退款大量失敗</text></g><g data-b="o-pm"><rect class="sf-trx" x="324" y="200.3" width="14" height="39.7" rx="2"/><text class="sf-t sf-small" x="331" y="193.3">31</text><rect class="sf-trx" x="344" y="166.9" width="14" height="73.1" rx="2"/><text class="sf-t sf-small" x="351" y="159.9">57</text><rect class="sf-trx" x="364" y="210.5" width="14" height="29.5" rx="2"/><text class="sf-t sf-small" x="371" y="203.5">23</text></g><g data-b="o-peak"><rect class="sf-trx" x="424" y="90.0" width="14" height="150.0" rx="2"/><text class="sf-t sf-small" x="431" y="83.0">117</text><line class="sf-sep" x1="40" y1="131.0" x2="522" y2="131.0"/><text class="sf-s sf-start" x="44" y="125.0">平常單次最多 85 件</text></g><g data-b="o-why"><rect class="sf-box" x="536" y="36" width="214" height="104" rx="6"/><text class="sf-t" x="643" y="62">信用卡出金 220 件</text><text class="sf-s" x="643" y="80">平常每日約 12 件</text><text class="sf-s" x="643" y="104">189 件在英國</text><text class="sf-s" x="643" y="122">197 件為銀行端交易失敗</text></g><g data-b="o-done"><rect class="sf-box" x="536" y="174" width="214" height="66" rx="6"/><text class="sf-t" x="643" y="201">寫入 LarkSheet · 當天 329 件</text><text class="sf-good" x="643" y="225">全部 Reverse 完成</text></g><g data-b="o-manual"><line class="sf-sep" x1="40" y1="280" x2="750" y2="280"/><text class="sf-k sf-start" x="40" y="300">如果是人工抽查：每日 2 次，兩次之間的掉單要等下一輪才看得到</text></g></svg>
</div>
<figcaption>圖 8　2026/10/23 每次執行揭露的出金掉單件數（長條高度依件數比例；平常單次最多 85 件發生在 2026/11/08，已排除停機後第一次執行的累積量；取自本頁公開 CSV）</figcaption>
</figure>

<hr data-slide="失敗原因">

### 出金失敗原因

出金案件由 Reason Table 帶出原因類別，Handler 依原因回覆客戶。四類出金合計 8,898 件：

<figure class="bar-figure">
<ul class="bar-list">
<li class="is-peak" style="--v: 100%"><span class="bar-label">客戶問題</span><span class="bar"></span><span class="bar-value">6,649</span></li>
<li style="--v: 10.1%"><span class="bar-label">渠道問題</span><span class="bar"></span><span class="bar-value">669</span></li>
<li style="--v: 1.5%"><span class="bar-label">商戶問題</span><span class="bar"></span><span class="bar-value">102</span></li>
<li style="--v: 0.4%"><span class="bar-label">銀行問題</span><span class="bar"></span><span class="bar-value">27</span></li>
<li style="--v: 0.1%"><span class="bar-label">CPS 問題、內部疏失</span><span class="bar"></span><span class="bar-value">7</span></li>
<li style="--v: 21.7%"><span class="bar-label">未分類（原因欄位空白）</span><span class="bar"></span><span class="bar-value">1,444</span></li>
</ul>
<figcaption>圖 9　出金失敗原因類別（Withdrawal 2026-09-09 ~ 11-17，取自本頁公開 CSV）</figcaption>
</figure>

- **客戶問題**的子類別以銀行端交易失敗、帳號錯誤、無效帳戶、姓名錯誤為主。
- **渠道問題**的子類別以渠道維護、系統異常、合規/風控問題為主。

<hr data-slide="執行統計">

### 執行統計（Deposit 2026-03-30 ~ 11-17；Withdrawal 2026-09-09 ~ 11-17）

資料來源：管線寫入 LarkSheet 的完整紀錄（公開 CSV）。「案件」指 Tx 不是 `-` 的列；信用卡出金依原入原出，一張出金單可能對應多筆原充值單，以「出金單 × 原充值單」計為一件，與管線的去重單位相同。「執行次數」指不重複的 Comparison Time。

| 案件類型 | 案件 | 日均 | 執行次數 | 有新案件的執行 | 處理狀態 |
|---|---|---|---|---|---|
| Deposit | 6,495 | 27.9 | 4,808 | 2,585 | done 5,540、未標記 942、其他 13 |
| Withdraw-LBT | 6,833 | 97.6 | 1,466 | 1,055 | 全部 reversed |
| Withdraw-Crypto&Wallet | 992 | 14.2 | 1,466 | 552 | 全部 reversed |
| Withdraw-CreditCard | 1,027（出金單 590 張） | 14.9 | 1,436 | 93 | 全部 reversed |
| Withdraw-IBT | 46 | 0.7 | 1,466 | 43 | 全部 reversed |
| **合計** | **15,393** | | | | |

- **執行間隔**：中位數 1.00 小時、P90 1.03 小時。
- **未標記的 942 筆**中，930 筆是 11/6 上游故障當天揭露的入金案件。

<details class="csv-details">
<summary>完整資料（已去識別化）<span class="mono">21,707 列 · 點擊展開</span></summary>
<div class="csv-viewer" data-src="../../data/drop-order-cases-2026.csv">
<p><a href="../../data/drop-order-cases-2026.csv" download>下載去識別化 CSV（Deposit 2026-03-30 ~ 11-17、Withdrawal 2026-09-09 ~ 11-17，21,707 列，含心跳列）</a></p>
</div>
</details>

## Impact

<hr data-slide="已驗證的成果">

### 已驗證的成果

<figure class="ba-figure">
<div class="ba-table">
<div class="ba-row ba-head"><p class="ba-item">項目</p><p class="ba-before">Before：人工抽查</p><p class="ba-after">After：掉單監控管線</p></div>
<div class="ba-row"><p class="ba-item">監控頻率</p><p class="ba-before">Deposit、Withdrawal 各每日 2 次；等下一輪抽查或客戶詢問才發現</p><p class="ba-after">排程每小時 1 次，新掉單在下一次整點寫入 LarkSheet；實際平均每日 20.6 次（Deposit）、20.9 次（Withdrawal）<small>依據：執行次數 ÷ 天數（Deposit 233 天、Withdrawal 70 天），執行次數與間隔見 Result</small></p></div>
<div class="ba-row"><p class="ba-item">人力</p><p class="ba-before">Deposit、Withdrawal 各每日約 2 小時</p><p class="ba-after">取數與比對 0 人工；Handler 只處理已判定的案件<small>依據：每次約 1 小時 × 每日 2 次（見 Problem）；至 11/17 約節省 606 小時（Deposit 233 天 × 2 小時 = 466、Withdrawal 70 天 × 2 小時 = 140），估計值</small></p></div>
<div class="ba-row"><p class="ba-item">比對範圍</p><p class="ba-before">人工 Excel 比對，筆數未紀錄</p><p class="ba-after">每次比對 CPS 入金約 19.5 萬筆、CRM 出入金約 32.2 萬筆<small>依據：Result 的執行 log</small></p></div>
<div class="ba-row"><p class="ba-item">監控連續性</p><p class="ba-before">依賴人工排班，請假、交接時有空窗</p><p class="ba-after">每次執行都留下紀錄：有新案件寫案件，沒有就寫心跳列，共 6,314 列心跳<small>依據：公開 CSV 中 Tx 為 - 的列</small></p></div>
</div>
<figcaption>圖 10　Before / After 對照（人工工時為估計值）</figcaption>
</figure>

<hr data-slide="尚未量化">

### 尚未量化或需要說明的部分

- **進線量**：目標是降低 CS、Sales、Finance 因資金狀態不明而產生的查詢與追單；目前沒有導入前後的進線統計，尚未量化。
- **溝通次數降低 ≥ 50%、渠道定位 ≤ 1 小時**：是設計目標，目前沒有量測資料。
- **揭露時間的意思**：1 小時是排程的檢查顆粒。從掉單發生到揭露，還取決於 CRM 與 CPS 資料何時可以取得，不是端到端的保證。
- **執行次數少於每日 24 次**：上表的實際平均低於排程上限，原因是部分整點沒有執行紀錄。
- **工時是估計**：人工每次約 1 小時是估算值，不是計時紀錄（見 Problem 的耗時長條）；起算日為各自的上線日。
- **處理仍靠人**：第一階段只做到「看見並派工」，補登入金與 Reverse 仍由 Handler 在 CRM 手動操作。第二階段在運行穩定約 3–6 個月後，規劃以自動點擊取代這段人工操作。
