---
# English version of src/content/projects/drop-order-monitor.md (draft translation, pending Peter's review).
# Dates, phases, stack, categories, metric values and the system map come from the zh file.
summary: "Compares deposit and withdrawal statuses between the CRM and CPS every hour and turns drop orders, such as a payment made but never credited or a failed withdrawal never returned, into LarkSheet cases; it surfaced 15,393 cases through 2026/11/17, replacing manual spot checks run twice a day each for Deposit and Withdrawal."
role: "Aligned drop-order rules with operations; designed and built the pipeline"
metric_labels:
  - "Drop-order detection interval (previously manual checks twice a day each for Deposit and Withdrawal)"
  - "Manual monitoring hours saved through 2026/11/17 (estimate)"
  - "Drop-order cases surfaced automatically through 2026/11/17"
story:
  - { label: "Map", line: "After a client places an order in the Client Portal, deposits and withdrawals go to CPS, which works with channels in each country to actually move the money; CRM keeps what the client sees: for a deposit, CPS sends a deposit order to CRM; for a withdrawal, CRM sends a payout order to CPS." }
  - { label: "Deposit", line: "Only CPS knows whether money actually moved, so results have to be written back to CRM. Start with a 9,301 INR deposit from India: CPS first sends a deposit order that creates the order in CRM, the client pays via UPI, UPI calls back CPS, and CPS writes back to CRM. But when the callback fails, operations set CPS to Success (manual) by hand; that change is not written back, CRM stays at Audit, and the client paid but was not credited." }
  - { label: "Withdrawal", line: "A withdrawal runs the other way: CRM sends a payout order to CPS, and CRM has already deducted the money and shows Completed. This 55,704 INR local bank transfer also had a failed callback, operations set it to Failed (manual) by hand, and nothing was written back: the money never went out, yet CRM shows it completed and nothing was returned." }
  - { label: "Why it's hard to see", line: "The catch is that each side looks fine on its own: Audit in CRM is an ordinary in-review status, and Success (manual) in CPS is a normal finished status. Only lining up both sides by the same Order Number shows the mismatch; the withdrawal is the same." }
  - { label: "Can it be done", line: "So what's needed is continuous checking of both sides. Before building, I thought through four questions: what I could check, I checked myself; what needed operations, I went and asked. Only when all four were confirmed did I start on the rules." }
  - { label: "Rules", line: "The third check is the rules themselves: operations and I agreed, rule by rule, on which status combinations count as a drop order, covering deposits, three kinds of ordinary withdrawals and card withdrawals." }
  - { label: "Worked example", line: "Back to the two orders: the deposit has CPS at Success (manual) and CRM at Audit; the withdrawal has CRM at Completed and CPS at Failed (manual). Both match the rules and are flagged as drop orders." }
  - { label: "Solution", line: "CRM has no database access, so the pipeline downloads its reports with an operations account and queries CPS directly, comparing every hour; each order is assigned once, and a heartbeat row is written even when nothing is new, proving monitoring never stopped." }
  - { label: "Rules as code", line: "In the code the rule table is these parts: CPS failures and rejections are already filtered in SQL; deposits check that CPS succeeded and CRM has not; cards check that CRM booked a refund; the other three withdrawal types share one rule with only the channel category changed; and finally the CRM and CPS statuses are chained into one trail, so the Handler need not open two back offices." }
  - { label: "Error handling", line: "But with incomplete data, \"no new cases\" would be false and would write a fake heartbeat. So failures are handled at three levels: a failed request is retried, while no data is not; a day is given up only when both reports fail, and the next run fills it in; if CPS is unreachable or the login fails, the whole run stops without writing, and a missing heartbeat row tells someone to look." }
  - { label: "Error-handling code", line: "In the code: SELECT 1 first checks CPS is reachable; a failed query is retried 5 times and then raised, stopping the run; each CRM report day is one task that waits 60 seconds between up to 10 tries; status: error from the API means no data and is skipped; if both reports fail, the day returns None and is given up." }
  - { label: "Screens", line: "These are the LarkSheet case sheets as they really look, one per case type: a Handler marks Status as Done or Reversed; a period with nothing new still gets a heartbeat row every hour." }
  - { label: "Running for real", line: "This is a real run at 03:00 on 2026-11-18: query CPS, download the CRM reports and lookup tables, then compare by the five case types and write only new cases; a type with nothing new gets a heartbeat row." }
  - { label: "Status combinations", line: "Laid out as status combinations, the cases flagged since launch show deposits almost all stuck in Audit, Submit to third party or Processing, while withdrawal failure patterns differ by channel: LBT is mostly 交易失敗(人工), Crypto&Wallet mostly 提交拒絕." }
  - { label: "A run with failures", line: "This is what a real failure looks like: in the 15:00 run on 2026-10-20, the CPS withdrawal query failed once and succeeded on the 2nd try; the CRM card report returned 524 and succeeded after 60 seconds; the run still wrote 10 new cases. Of the 1,418 runs since 9/12, 1,404 finished and 14 stopped before writing anything." }
  - { label: "Output", line: "Cases in LarkSheet look like this: a deposit is marked done once a Handler credits it, a withdrawal reversed once it is reversed; the last row is a heartbeat, meaning that run found nothing new." }
  - { label: "Result: deposits", line: "A real case, 2026/11/6: the upstream side launched 85 channels at once without testing, which hit other routes and left every downstream integration stuck, so callbacks failed en masse. The 10:00 run surfaced 450 deposit drop orders and the 11:00 run another 483, against at most 75 in a single run normally; the cases went straight into LarkSheet, each assigned once, and were handed to operations. With twice-daily manual checks, they would have waited for the next round." }
  - { label: "Result: withdrawals", line: "The withdrawal case is 2026/10/23: UK card issuers rejected refunds in a batch; operations set CPS to Failed (manual), yet CRM still showed the refunds as successful. The pipeline kept comparing every hour, and the 19:09 run surfaced 117 cases at once, against a normal single-run max of 85; of the 329 cases that day, 220 were card withdrawals, mostly in the UK with the same bank-side failure reason: that batch rejection. All 329 were reversed." }
impact:
  before: "Manual spot checks; drop orders often surfaced only after complaints"
  after: "Statuses are compared automatically and drop orders go straight out as cases"
tldr:
  problem: "Deposit and withdrawal statuses in the CRM and CPS fall out of sync (drop orders), often found only when a client asks, and tracing them means digging through two systems."
  approach: "Compare order statuses on both sides every hour, flag drop orders by rule, de-duplicate and write them to the LarkSheet case sheet operations already uses."
  result: "Drop orders went from after-the-fact complaints to hourly assignments; pulling and comparing data needs no manual work, and monitoring no longer depends on shifts."
---

## Problem Assessment

<hr data-slide="Background and terms">

- When a client deposits or withdraws, the order passes through two systems: **CPS** connects to channels in each country and actually collects and pays out, and the **CRM** records the client's account and transaction status.
- CPS results have to be written back to the CRM. When a channel's callback to CPS fails (for example during an upstream outage), operations update the CPS status by hand, but **a manual update is not written back to the CRM**, and that becomes a **drop order**: for a deposit, CPS has succeeded but the CRM is still in review or processing, so the client paid but was not credited; for a withdrawal, the CRM shows completed but CPS actually failed, so the money neither went out nor came back.
- Drop orders sit late in the process, so clients often notice first and then ask through CS, Sales or Finance.

<details class="glossary-details">
<summary>Glossary<span class="mono">14 terms · click to expand</span></summary>
<table>
<thead><tr><th>Term</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>Deposit / Withdrawal</td><td>A client putting money in / taking money out</td></tr>
<tr><td>CRM</td><td>Internal system that manages client accounts and transaction records; the order status clients and operations see comes from here</td></tr>
<tr><td>CPS</td><td>Internal payment system that connects to banks and payment channels in each country and actually collects and pays out</td></tr>
<tr><td>Channel</td><td>The external route that actually moves the money, such as local bank transfer, QR, e-wallet, crypto or credit card</td></tr>
<tr><td>Callback</td><td>The channel telling CPS the result once it has handled the money</td></tr>
<tr><td>Drop order</td><td>The CRM and CPS disagree on the status of the same order, and it is not synced back automatically</td></tr>
<tr><td>LBT</td><td>Local Bank Transfer withdrawal</td></tr>
<tr><td>IBT</td><td>International Bank Transfer withdrawal</td></tr>
<tr><td>Crypto &amp; e-Wallet</td><td>Crypto and e-wallet withdrawals</td></tr>
<tr><td>CreditCard withdrawal</td><td>When a client who recharged by credit card withdraws, the money is refunded to the original card</td></tr>
<tr><td>Same-route rule</td><td>A credit card withdrawal must go back to the card used for the recharge and be tied to the original recharge order</td></tr>
<tr><td>Reverse</td><td>When a withdrawal fails, returning the deducted amount to the client's account in the CRM</td></tr>
<tr><td>Handler / Checker</td><td>The Handler credits the deposit or reverses the withdrawal in the CRM for each case; the Checker is the operations staff member who reviews afterwards</td></tr>
<tr><td>Heartbeat row</td><td>When a run finds no new case, a row with only the detection time, proving the pipeline ran normally</td></tr>
</tbody>
</table>
</details>

<hr data-slide="An order's journey">

Only CPS knows whether money actually moved, yet the client looks at the CRM. So once CPS has handled an order, its result has to be **written back** to the CRM. Take two real orders from India: a 9,301 INR deposit via UPI, where CPS first sends a **deposit order** that creates the order in CRM; and a 55,704 INR withdrawal via local bank transfer, where CRM sends a **payout order** to CPS.

Normally the channel sends a **callback** to CPS when it is done, and CPS writes the result back to the CRM. The trouble comes when the callback fails: operations set CPS to "Success (manual)" or "Failed (manual)" by hand, but a manual change is not written back to the CRM, so the two systems are left in different states:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 326" role="img" aria-labelledby="jr-title"><title id="jr-title">An order's journey: for a deposit CPS sends a deposit order that creates the CRM order, for a withdrawal CRM sends a payout order to CPS; results must be written back from CPS to CRM, and manual fixes after a failed callback are not</title><defs><marker id="jr-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><g data-b="cols"><text class="sf-s" x="95" y="22">CRM (what the client sees)</text><text class="sf-s" x="410" y="22">CPS (actual payment)</text><text class="sf-s" x="665" y="22">Channel</text></g><g data-b="d-lane"><text class="sf-h sf-start" x="20" y="50">Deposit · 9,301 INR · UPI</text><rect class="sf-node" x="20" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="95" y="89">CRM</text><rect class="sf-node" x="335" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="410" y="89">CPS</text><rect class="sf-node" x="590" y="60" width="150" height="48" rx="6"/><text class="sf-t" x="665" y="89">UPI</text></g><g data-b="d-cmd"><path class="sf-line" d="M335 74 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="255" y="67">deposit order</text><text class="sf-s" x="95" y="128">Created: Audit (pending)</text></g><g data-b="d-flow"><path class="sf-line" d="M590 94 H491" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M335 94 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="540" y="110">callback</text><text class="sf-s" x="255" y="110">write-back</text><text class="sf-s" x="665" y="128">Money received</text></g><g data-b="d-cb"><text class="sf-miss" x="540" y="130">✕ callback failed</text></g><g data-b="d-manual"><text class="sf-s" x="410" y="128">Set by hand to</text><text class="sf-link" x="410" y="146">Success (manual)</text></g><g data-b="d-stuck"><text class="sf-miss" x="255" y="130">✕ not written back</text><text class="sf-bad-t sf-small" x="95" y="146">Paid, not credited</text></g><line class="sf-sep" x1="20" y1="176" x2="740" y2="176"/><g data-b="w-lane"><text class="sf-h sf-start" x="20" y="210">Withdrawal · 55,704 INR · local bank transfer</text><rect class="sf-node" x="20" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="95" y="249">CRM</text><rect class="sf-node" x="335" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="410" y="249">CPS</text><rect class="sf-node" x="590" y="220" width="150" height="48" rx="6"/><text class="sf-t" x="665" y="249">Local bank</text></g><g data-b="w-cmd"><path class="sf-line" d="M170 236 H329" marker-end="url(#jr-arrow)"/><text class="sf-s" x="255" y="230">payout order</text><text class="sf-s" x="95" y="290">Completed (deducted)</text></g><g data-b="w-flow"><path class="sf-line" d="M485 236 H584" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M590 256 H491" marker-end="url(#jr-arrow)"/><path class="sf-line" d="M335 256 H176" marker-end="url(#jr-arrow)"/><text class="sf-s" x="540" y="230">pay out</text><text class="sf-s" x="540" y="272">callback</text><text class="sf-s" x="255" y="272">write-back</text><text class="sf-s" x="665" y="290">Transfer failed</text></g><g data-b="w-cb"><text class="sf-miss" x="540" y="290">✕ callback failed</text></g><g data-b="w-manual"><text class="sf-s" x="410" y="290">Set by hand to</text><text class="sf-link" x="410" y="308">Failed (manual)</text></g><g data-b="w-stuck"><text class="sf-miss" x="255" y="290">✕ not written back</text><text class="sf-bad-t sf-small" x="95" y="308">Not paid out, not returned</text></g></svg>
</div>
<figcaption>Figure 1　An order's journey: when a channel's callback to CPS fails, operations fix the CPS status by hand, but that manual fix is not written back to CRM, so a drop order forms (both are real cases from the public CSV on this page)</figcaption>
</figure>

<hr data-slide="Each side looks fine">

Drop orders are hard to spot because CRM and CPS each look normal on their own; the mismatch only shows when both sides' statuses are lined up by the same Order Number:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 270" role="img" aria-labelledby="vw-title"><title id="vw-title">Each side looks fine: Audit in CRM and Success (manual) in CPS are both ordinary statuses; only matching them by the same Order Number shows the mismatch</title><g data-b="v-crm"><text class="sf-s" x="150" y="22">CRM screen</text><rect class="sf-box" x="40" y="40" width="220" height="84" rx="6"/><text class="sf-k" x="150" y="64">Deposit · 9,301 INR</text><text class="sf-good" x="150" y="88">Audit</text><text class="sf-tag-good-t sf-small" x="150" y="110">In review, looks normal</text></g><g data-b="v-cps"><text class="sf-s" x="610" y="22">CPS screen</text><rect class="sf-box" x="500" y="40" width="220" height="84" rx="6"/><text class="sf-k" x="610" y="64">Deposit · 9,301 INR</text><text class="sf-good" x="610" y="88">Success (manual)</text><text class="sf-tag-good-t sf-small" x="610" y="110">Done, looks normal</text></g><g data-b="v-cmp"><path class="sf-line" d="M260 82 H500" stroke-dasharray="5 4"/><text class="sf-link" x="380" y="74">same Order Number</text><rect class="sf-bad" x="306" y="90" width="148" height="26" rx="13"/><text class="sf-bad-t sf-small" x="380" y="107">Mismatch = drop order</text></g><g data-b="v-w"><line class="sf-sep" x1="40" y1="146" x2="720" y2="146"/><rect class="sf-box" x="40" y="166" width="220" height="84" rx="6"/><text class="sf-k" x="150" y="190">Withdrawal · 55,704 INR</text><text class="sf-good" x="150" y="214">Completed</text><text class="sf-tag-good-t sf-small" x="150" y="236">Done, looks normal</text><rect class="sf-box" x="500" y="166" width="220" height="84" rx="6"/><text class="sf-k" x="610" y="190">Withdrawal · 55,704 INR</text><text class="sf-good" x="610" y="214">Failed (manual)</text><text class="sf-tag-good-t sf-small" x="610" y="236">Closed, looks normal</text><path class="sf-line" d="M260 208 H500" stroke-dasharray="5 4"/><text class="sf-link" x="380" y="200">same Order Number</text><rect class="sf-bad" x="306" y="216" width="148" height="26" rx="13"/><text class="sf-bad-t sf-small" x="380" y="233">Mismatch = drop order</text></g></svg>
</div>
<figcaption>Figure 2　Each side looks fine: both CRM and CPS show ordinary statuses, and only matching them by the same Order Number reveals the drop order (the same two orders as Figure 1)</figcaption>
</figure>

<hr data-slide="Can it be done">

So the problem to solve is not "checking faster" but that **nothing keeps checking the same order's status in CRM against CPS**. Before building, I asked four questions:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 460" role="img" aria-labelledby="fz-title"><title id="fz-title">Feasibility check before building: I thought through four questions, checked what I could myself and asked operations to confirm the rest; only then were the rules written</title><defs><marker id="fz-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><g data-b="cols"><circle class="sf-person" cx="60" cy="34" r="14"/><path class="sf-person" d="M36 84 a24 22 0 0 1 48 0 z"/><text class="sf-t" x="60" y="102">Me (engineer)</text><circle class="sf-parent" cx="716" cy="34" r="14"/><path class="sf-parent" d="M692 84 a24 22 0 0 1 48 0 z"/><text class="sf-t" x="716" y="102">Operations</text><text class="sf-s" x="206" y="22">Questions in my head</text><text class="sf-s" x="470" y="22">Checked myself, or asked operations</text></g><g data-b="q1"><circle class="sf-box" cx="80" cy="162" r="3"/><circle class="sf-box" cx="88" cy="151" r="4.5"/><rect class="sf-box" x="96" y="110" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="143">Can we get the data?</text></g><g data-b="a1"><path class="sf-line" d="M322 140 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="132">ask operations</text><rect class="sf-parent" x="470" y="110" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 130 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="134">CPS: query it directly</text><text class="sf-small-t" x="575" y="152">CRM: download with our account</text></g><g data-b="q2"><circle class="sf-box" cx="80" cy="238" r="3"/><circle class="sf-box" cx="88" cy="227" r="4.5"/><rect class="sf-box" x="96" y="186" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="219">Same order on both sides?</text></g><g data-b="a2"><rect class="sf-child" x="336" y="186" width="264" height="56" rx="10" stroke-dasharray="5 4"/><text class="sf-small-t" x="468" y="210">Checked both sides myself:</text><text class="sf-small-t" x="468" y="228">both have the Order Number ✓</text></g><g data-b="q3"><circle class="sf-box" cx="80" cy="314" r="3"/><circle class="sf-box" cx="88" cy="303" r="4.5"/><rect class="sf-box" x="96" y="262" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="295">What is a drop order?</text></g><g data-b="a3"><path class="sf-line" d="M322 292 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="284">ask operations</text><rect class="sf-parent" x="470" y="262" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 282 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="280">Many statuses;</text><text class="sf-small-t" x="575" y="295">let's agree them one by one</text><text class="sf-link" x="575" y="310">→ the rules on the next slide</text></g><g data-b="q4"><circle class="sf-box" cx="80" cy="390" r="3"/><circle class="sf-box" cx="88" cy="379" r="4.5"/><rect class="sf-box" x="96" y="338" width="220" height="56" rx="28"/><text class="sf-good" x="206" y="371">How often?</text></g><g data-b="a4"><path class="sf-line" d="M322 368 H462" marker-end="url(#fz-arrow)"/><text class="sf-s" x="392" y="360">ask operations</text><rect class="sf-parent" x="470" y="338" width="210" height="56" rx="14"/><path class="sf-parent" d="M679 358 l15 7 l-15 7"/><text class="sf-small-t" x="575" y="371">We need to know every hour</text></g><g data-b="go"><rect class="sf-tag-good" x="200" y="412" width="360" height="38" rx="19"/><text class="sf-tag-good-t sf-tag" x="380" y="436">All four confirmed → write the rules first</text></g></svg>
</div>
<figcaption>Figure 3　Feasibility check before building: what I could check, I checked myself; what needed operations, I went and asked (the dialogue is illustrative, based on what was actually agreed; how the data is pulled is under the constraints in Solution Design)</figcaption>
</figure>

<hr data-slide="Drop-order rules">

The third check is the rules themselves. First, operations and I agreed rule by rule on "which status combinations count as a drop order"; then the rules were written into code. The table shows the rules for the five case types:

| Case type | CRM status | CPS status | What it means | Action |
|---|---|---|---|---|
| Deposit | Not yet successful (Audit, Submit to third party, Processing, etc.) | Success, Success (manual) | Client paid, CRM not credited | Handler credits the deposit in the CRM |
| Withdraw-LBT / Crypto&Wallet / IBT | Apply Status is Completed | Transaction or payout status is failed or rejected | CRM deducted the money, the channel never paid out | Handler reverses in the CRM and replies to the client based on the failure reason |
| Withdraw-CreditCard | Success or Partial Success, and Order Status is Refunded | Payout failed | CRM recorded the refund, CPS never returned it to the card | Same as above |

<hr data-slide="Worked example">

One real case for each of the five case types, comparing the status in CRM and CPS; the first two rows are the two orders in Figure 1:

| Case type | CRM status | CPS transaction / payout status | Amount | Handling |
|---|---|---|---|---|
| Deposit | Audit | Success (manual) | 9,301 INR | Deposit credited (done) |
| Withdraw-LBT | Completed | Completed / Failed (manual) | 55,704 INR | Reverse (reversed) |
| Withdraw-Crypto&Wallet | Completed | Submission rejected | (blank) | Reverse (reversed) |
| Withdraw-CreditCard | Success | Completed / Failed (manual) | 50 EUR | Reverse (reversed) |
| Withdraw-IBT | Completed | Review rejected / Review rejected | 461.82 USD | Reverse (reversed) |

*Real cases from the public CSV on this page (April and September 2026; CPS statuses translated, the CSV keeps the source system's Chinese). The Crypto&Wallet case has no amount in the source data; the CC_ and IBT_ currency prefixes are dropped.*

- **Deposit**: operations set CPS to success by hand, but CRM is still at Audit, so the client paid and was not credited.
- **The four withdrawal types**: CRM shows completed or success, but CPS actually failed or rejected it, so the money neither went out nor came back; a Handler reverses it in CRM.

<hr data-slide="Pain points and evidence">

<figure class="pain-figure">
<div class="pain-grid">
<section class="pain-card tone-red pain-wide">
<h4 class="pain-title">Found late, clients wait first</h4>
<p class="pain-label"><span>Pain</span>By the time it's found, it's too late; only after-the-fact fixes</p>
<ul class="pain-note">
<li>Manual spot checks ran only about twice a day each for Deposit and Withdrawal; a drop order between two checks waited for the next round.</li>
<li>When CS or Finance asked about a payment, answers were slow, adding waiting and back-and-forth.</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">Time for one manual spot check (estimate)</p>
<div class="pain-timebar">
<span class="seg-platform" style="flex: 33">Download the CRM and CPS reports　~30–35 min</span>
<span class="seg-excel" style="flex: 27">Excel calculation, tidying and moving data</span>
</div>
<p class="pain-caption">About <b>1 hour</b> per check in total; Deposit and Withdrawal were each checked twice a day.</p>
</div>
</section>
<section class="pain-card tone-grey">
<h4 class="pain-title">Tracing means digging layer by layer</h4>
<p class="pain-label"><span>Pain</span>Once something is stuck, people still trace it by hand</p>
<ul class="pain-note">
<li>Each order had to be checked in both the CRM and CPS, then traced to the channel and reason it got stuck.</li>
<li>With many channels of many kinds, the matching rules were hard to keep in anyone's head.</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">Evidence: what has to be compared</p>
<ul class="pain-flow">
<li>Drop orders in the data period span <b>181 channel types</b>, <b>136 countries</b> and <b>64 currencies</b>.</li>
<li>Withdrawals fall into four groups (LBT, Crypto &amp; e-Wallet, CreditCard, IBT), each with its own failure statuses.</li>
<li>Withdrawal failures have 6 main reason categories and 33 subcategories (see Result).</li>
</ul>
</div>
</section>
<section class="pain-card tone-yellow">
<h4 class="pain-title">Staff can't be freed up</h4>
<p class="pain-label"><span>Pain</span>Depends on people who know the whole architecture</p>
<ul class="pain-note">
<li>Spotting a drop order requires knowing CRM statuses, CPS statuses and channel behavior all at once.</li>
<li>When someone is on leave, hands over or misses something, monitoring has a gap.</li>
</ul>
<div class="pain-evidence">
<p class="pain-evidence-title">Evidence: manual monitoring has a fixed cost</p>
<ul class="pain-flow">
<li>Each check takes about 1 hour; checking N times as often needs N times the staff.</li>
<li>Checking every hour is not feasible with people.</li>
</ul>
</div>
</section>
</div>
<figcaption>Figure 4　Three pain points in the original process (hours are estimates; coverage from the public CSV on this page)</figcaption>
</figure>

<hr data-slide="Why it was worth solving">

**Why it was worth solving:**

1. **Drop orders are routine, not rare**: after Deposit went live, 220 of 233 days had drop orders; for Withdrawal, 67 of 70 days.
2. **Upstream failures cause sudden spikes**: on 2026/11/6 an upstream system failed and many client orders got stuck; two runs surfaced far more deposit drop orders than usual (the case is in Result); manual checks twice a day could not have seen something this big in time.
3. **Manual cost can't scale with frequency**: each check takes about 1 hour (Figure 4); checking N times as often needs N times the staff.

## Solution Design

<hr data-slide="Pain points and solutions">

**Pain point → solution** (matches the architecture in Figure 5):

- **Found late** → an hourly scheduled comparison; a new drop order appears on the next top-of-the-hour run.
- **Tracing layer by layer** → pull the CRM report, CPS data and credit card details together and apply the drop-order rules (see Problem); withdrawal cases automatically carry the reason category and status trail.
- **Depends on people who know the architecture** → the rules live in code and cases go to LarkSheet; Handlers only work on cases already identified.
- **Nobody knows when monitoring stops** → write a heartbeat row even when there are no new cases, so "no drop orders" can be told apart from "the pipeline didn't run".

**Constraints the design had to handle:**

- The CRM has no database access; reports can only be downloaded by logging in with an operations account (with 2FA), and each report must be triggered first and then downloaded.
- Reports for the 4 regulators are generated separately and must be downloaded one by one and merged.
- The CRM and CPS differ in timing and time zone, and order statuses keep changing for several days, so the CRM deposit/withdrawal report looks back 4 days and the credit card details and CPS look back 7 days.
- Until a drop order is handled, it shows up in every hourly comparison, so it must be de-duplicated or the same order gets assigned again and again.

## Alternative Solutions

Four options were evaluated at the time; the first three were the alternatives:

| Option | Approach | Pros | Cons |
|---|---|---|---|
| A. Query the CRM database directly | Query CRM order statuses with SQL | Most timely and complete data | No CRM database access; request timeline out of our control |
| B. Ask CPS to add proactive alerts | CPS pushes a notice when an order status looks wrong | Alerts at the source, lowest delay | Needs CPS to schedule the work; timeline and spec not in our hands |
| C. Shared form | Report and track drop orders through a cross-department shared form | No development | We don't own it; fields and process are hard to control |
| **D. Cross-system drop-order pipeline (chosen)** | Download the CRM reports and query CPS data every hour, apply the rules, write to LarkSheet | No waiting on other teams; we control the rules, output fields and de-duplication | CRM downloads must handle 2FA and asynchronous report generation; must adapt when upstream formats change |

## Selected Solution

<hr data-slide="Why this option">

**Chosen: D, a cross-system drop-order pipeline**

1. **No new access needed**: A was blocked on CRM database access. Operations already downloads the CRM reports every day, so code can do the same; on the CPS side there was already read access to the database, queried directly.
2. **No waiting on outside teams**: B's timeline was uncontrollable, while D could go live first; if CPS adds proactive alerts later, only the extraction layer needs replacing.
3. **We control the output**: C was owned by another team. D writes cases to a LarkSheet we maintain, where we define the fields, de-duplication rules and handling statuses, and Handlers and Checkers work directly on it.
4. **Lower risk in phases**: phase one makes drop orders "visible and assigned"; only after about 3–6 months of stable running does phase two add automated clicking, so staff no longer have to fix things by hand in the CRM.

<hr data-slide="Architecture">

The full hourly flow:

```mermaid
flowchart LR
    SCH["Schedule<br/>cron at the top of every hour"] --> CPS["CPS Database<br/>deposits, withdrawals · last 7 days"]
    SCH --> CRM["CRM deposit/withdrawal report<br/>4 regulators · last 4 days"]
    SCH --> CC["CRM credit card details<br/>last 7 days"]
    SCH --> REF["Lookup tables<br/>Reason Table · WithdrawType Table"]
    CPS --> BK["Backup<br/>raw CPS data saved to the day's Lark Drive folder"]
    CPS --> CMP["compare_logic<br/>apply rules for the 5 case types"]
    CRM --> CMP
    CC --> CMP
    REF --> CMP
    CMP --> CHK{"Order already<br/>in LarkSheet?"}
    CHK -->|"New cases"| AP["Append new cases"]
    CHK -->|"No new cases"| HB["Append heartbeat row<br/>detection time only"]
    AP --> OPS["Handler<br/>credits deposit or reverses"]
    OPS --> REV["Checker review"]
```

*Figure 5　Deposit and withdrawal drop-order monitoring pipeline (summarized from the project code)*

<hr data-slide="Design notes">

**Design notes:**

- **De-duplication**: Order Number is the unique key (Merchant Order + Deposit Order Number for credit cards). Each run first reads the orders already in LarkSheet and appends only new cases, so each drop order is assigned once.
- **Orders still being written back**: there is no waiting period before the check, so an order that has just succeeded but not yet been written back can be flagged too; a Handler confirms and skips it.
- **Heartbeat row**: when a case type has no new drop orders, a row with only the detection time is still written, so the sheet shows the difference between "no new cases" and "the pipeline stopped".
- **Status trail and reason**: withdrawal cases chain the CRM and CPS statuses into one Status Workflow (for example `Risk Audit -> Accepted -> Completed -> Processed -> Failed (manual)`), and the Reason Table adds the reason category and subcategory, so Handlers can reply to the client by reason without opening both back offices.
- **Traceability**: each run gets a `uid`, and JSON logs carry `service`, `stage` and `status`; raw CPS data is backed up to Lark Drive on every run, so the data compared at the time can be audited later.
- **Access scope**: the CRM is accessed with an existing operations account (with 2FA), only downloading reports and never writing; CPS runs only SELECT queries; Lark writes to the case sheet and backup folder through a self-built app. CRM and CPS credentials are read from a read-only mounted config file, not written in code.

<hr data-slide="Rules as code">

**Rules as code:** each row of the matching-rule table in 01 maps to one part of the code below. CPS "failure" is already filtered in SQL, so the comparison only has to judge status combinations:

```python
# losttrader_crawler.py: CPS withdrawals are filtered to failed or rejected orders in SQL
w_query_update = """SELECT ...
    WHERE w1.update_time >= %s AND w1.update_time < %s
      AND (w.WITHDRAWAL_STATUS LIKE '%%審核拒絕%%' OR w.WITHDRAWAL_STATUS LIKE '%%提交拒絕%%'
           OR w.WITHDRAWAL_STATUS LIKE '%%交易失敗%%')"""      # a second query checks APPROVE_STATUS

def compare_logic(crm_report, cps_report, cc_report, cps_type, ...):    # losttrader_basiclogic.py
    if cps_type == 'Deposit':                     # CPS succeeded, CRM has not
        df = crm_report.merge(cps_report, left_on='Order Number', right_on='商戶訂單號', how='left')
        return df[df['交易狀態'].isin(['交易成功', '交易成功(人工)']) & ~df['Status'].str.contains('Succ')]
    elif cps_type == 'Withdraw_CreditCard':       # CRM booked a refund; CPS side is a failed payout
        df = cps_report.merge(cc_report, left_on='商戶訂單號', right_on='CPS Order ID', how='inner')
        return df.query("`Status`.str.contains('Completed|Partial Success|Success') "
                        "and `Order Status`.str.contains('Refunded')")
    elif cps_type == 'Withdraw_LBT':              # LBT, Crypto&Wallet and IBT share one rule
        return process_withdraw_report(cps_report, crm_report, ..., category_filter='LBT')
def process_withdraw_report(cps_report, crm_report, ..., category_filter):   # CRM done, CPS failed/rejected
    df['status_rank'] = df['Status'].map({'Risk Audit': 1, 'Accepted': 2}).fillna(99)
    workflow = (df.sort_values(['商戶訂單號', 'status_rank', 'Last Update Time']).groupby('商戶訂單號')
                ['Status'].agg(lambda x: ' -> '.join(dict.fromkeys(x))))   # trail, then both CPS statuses
    return df_out[df_out['Category'].str.contains(category_filter)
                  & df_out['Apply Status'].str.contains('Completed|Partial Success|Success')
                  & (df_out['交易狀態'].str.contains(transaction_status)
                     | df_out['出金狀態'].str.contains(withdrawal_status))]
```

*Excerpt from `losttrader_crawler.py` (the CPS withdrawal query) and `losttrader_basiclogic.py` (`compare_logic`, `process_withdraw_report`), simplified: column lists, empty-data checks and the Reason Table merge are left out; the Crypto&Wallet and IBT branches differ only in `category_filter` (`'Ewallet|Crypto'`, `'IBT'`) and are not listed. Field names and status values are shown in Traditional Chinese (the source uses Simplified); other identifiers are as in the source.*

<hr data-slide="Error handling">

**Error handling:** with incomplete data, "no new cases" would be a false result, and it would write a fake heartbeat row. So failures are handled at three levels by how far they reach, and only the outermost one stops the run:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 300" role="img" aria-labelledby="de-title-en"><title id="de-title-en">Errors are handled at three levels: a failed request is retried, a day whose reports all fail is given up, and a run with incomplete data stops without writing</title><defs><marker id="de-arrow-en" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><g data-b="run"><rect class="sf-box" x="20" y="16" width="300" height="268" rx="10"/><text class="sf-t sf-start" x="36" y="40">The run</text><text class="sf-s sf-start" x="36" y="58">once an hour</text><path class="sf-line" d="M320 44 H344" marker-end="url(#de-arrow-en)"/><text class="sf-t sf-start" x="352" y="40">Stop: no comparison, no writes</text><text class="sf-s sf-start" x="352" y="58">CPS unreachable or out of retries; CRM login fails 5 times</text><text class="sf-note sf-start" x="352" y="76">A missing heartbeat row for that hour tells someone to look</text></g><g data-b="day"><rect class="sf-box" x="40" y="80" width="260" height="190" rx="8"/><text class="sf-t sf-start" x="56" y="104">One day's reports</text><text class="sf-s sf-start" x="56" y="122">one task per day, up to 5 at once</text><path class="sf-line" d="M300 108 H344" marker-end="url(#de-arrow-en)"/><text class="sf-t sf-start" x="352" y="112">Give up that day, the rest go on</text><text class="sf-s sf-start" x="352" y="130">only when both reports run out of retries; logs an ERROR</text><text class="sf-s sf-start" x="352" y="148">filled in when the next run re-fetches the last 4 days</text></g><g data-b="req"><rect class="sf-parent" x="60" y="140" width="220" height="116" rx="6"/><text class="sf-t sf-start" x="76" y="166">One request</text><text class="sf-s sf-start" x="76" y="186">CRM report generate / download</text><text class="sf-s sf-start" x="76" y="204">CPS deposit / withdrawal query</text><path class="sf-line" d="M280 190 H344" marker-end="url(#de-arrow-en)"/><text class="sf-t sf-start" x="352" y="186">Retry</text><text class="sf-s sf-start" x="352" y="204">CRM report: up to 10 times, 60 s apart</text><text class="sf-s sf-start" x="352" y="222">CPS query: up to 5 times, 3 s apart</text></g><g data-b="nodata"><path class="sf-line" d="M280 236 H344" marker-end="url(#de-arrow-en)"/><text class="sf-t sf-start" x="352" y="250">No data: no retry</text><text class="sf-s sf-start" x="352" y="268">an API reply of status: error is skipped</text></g></svg>
</div>
<figcaption>Figure 6　Three levels of error handling: retry the request, give up one day, stop the run (how often each happened is in Result)</figcaption>
</figure>

<hr data-slide="Error-handling code">

**Error-handling code:** the three levels on the last slide map to these parts of `losttrader_crawler.py`:

```python
# losttrader_crawler.py: CPS database, check the connection first, retry failed queries
conn.execute(text("SELECT 1"))                        # unreachable: raise, the run stops
def read_database_with_retry(*, query, ..., max_retry=5, retry_interval=3):
    for attempt in range(1, max_retry + 1):
        try:
            return pl.read_database(query=query, connection=connection, ...)
        except Exception:
            logger.exception(f"{query_name} query failed (attempt {attempt}/{max_retry})")
            if attempt == max_retry:
                raise                                 # out of retries: stop, no fake heartbeat
            time.sleep(retry_interval)
async with SEM:                                       # CRM reports: one task per day, 5 at once
    for attempt in range(1, MAX_RETRIES + 1):         # up to 10 times, RETRY_SLEEP = 60 s
        try:
            data = await resp.json()
            if data.get("status") == "error":         # the API's way of saying "no data"
                no_data = True
                break                                 # no retry
        except Exception as e:
            logger.warning(f"POST failed ({report_name} DW {brand} {day}) attempt {attempt}: {e}")
            if attempt < MAX_RETRIES:
                await asyncio.sleep(RETRY_SLEEP)
    if not dfs:
        return None                                   # both reports failed: ERROR, drop this day
```

*Excerpt from `losttrader_crawler.py` (`Cps_reports`, `read_database_with_retry`, `fetch_one_day_dw`), simplified: the connection string, the download step's retries (written the same way), timing and log details are left out; URLs and database names removed; function and variable names are as in the source.*

## Result

<hr data-slide="Screens">

### Screens: the LarkSheet case sheets

There is one sheet per case type. Once a Handler is done, `Status` is set to Done (credited) or Reversed (returned), and withdrawals also carry the reason sent to the client; a period with no new case still gets a heartbeat row each hour, holding only the detection time:

<figure class="shot-gallery">
<div class="shot-strip">
<div class="shot-item">
<p class="shot-label"><span class="mono">1 / 5</span>Deposit: marked Done once a Handler credits it</p>

![Deposit sheet: one deposit drop order per row, Status Done](../../assets/projects/drop-order-monitor/larksheet-deposit.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">2 / 5</span>Withdraw - Crypto&Wallet: marked Reversed, with the reason sent to the client</p>

![Crypto&Wallet sheet: Status Reversed, with the reply to the client on the right](../../assets/projects/drop-order-monitor/larksheet-crypto-wallet.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">3 / 5</span>Withdraw - LBT: many cases in one hour, each reversed</p>

![LBT sheet: several Failed (manual) transactions in the same period, all Reversed](../../assets/projects/drop-order-monitor/larksheet-lbt.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">4 / 5</span>Withdraw - CreditCard: one case among heartbeat rows</p>

![CreditCard sheet: one Refunded case, the rest are hourly heartbeat rows](../../assets/projects/drop-order-monitor/larksheet-creditcard.png)

</div>
<div class="shot-item">
<p class="shot-label"><span class="mono">5 / 5</span>Withdraw - IBT: with no new case, a heartbeat row every hour</p>

![IBT sheet: the whole page is heartbeat rows with only the detection time](../../assets/projects/drop-order-monitor/larksheet-ibt.png)

</div>
</div>
<figcaption>Figure 7　The LarkSheet case sheets as they really look (swipe to see all 5 sheets; browser and document path cropped; client IDs, account numbers, order numbers and Handler names blurred; click an image to enlarge)</figcaption>
</figure>

<hr data-slide="One real run">

### A real run

- Below is a log excerpt from the run at 2026-11-18 03:00. The original is JSON; only the time, stage and message are kept here.
- Repeated download lines are omitted; the CRM's internal system name is replaced with `CRM`, and sheet IDs, file name prefixes and URLs are removed. One Chinese log message is shown in English.

```text
03:00:02  Lark Init and Connect     Lark Access Token acquired
03:00:06  Download DataSource       Successfully connected to CPS database.
03:00:27  Download DataSource       Deposit query finished, rows=195438.
03:06:13  Download DataSource       CPS report downloaded successfully. deposit_rows=195438, withdraw_rows=1037
03:06:15  Download DataSource       Login successful
03:06:15  Download DataSource       Token obtained successfully
03:07:55  Download DataSource       Finish downloading CRM DW Report for all brands, total rows: 322159
   ...    (CRM credit card details, 3 regulators × last 7 days)
03:10:43  Download DataSource       Fetched 7078 Records                       <- Reason Table
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

What this log shows:

- **A full run takes about 11 minutes**; about 6 minutes go to the CPS withdrawal query and about 4.5 minutes to downloading the CRM reports.
- Each of the five case types first reads the orders already in LarkSheet and writes only new cases: this time 1 Deposit, 1 Crypto&Wallet and 10 LBT.
- IBT and CreditCard had no new cases, so each got a heartbeat row instead of nothing.

<figure class="tech-figure">
<div class="tech-labels">
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Hourly Cross-System Reconciliation</p>
<p class="tech-label-desc">Combines CRM reports and CPS data every hour and applies drop-order rules by case type.</p>
</div>
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">Case Ledger with Heartbeat</p>
<p class="tech-label-desc">Appends only new cases after de-duplication; writes a heartbeat row when there are none, proving monitoring never stopped.</p>
</div>
<div class="tech-label">
<p class="tech-label-kicker">Tech Label</p>
<p class="tech-label-name">JSON Logging Design</p>
<p class="tech-label-desc">One uid per run, with a structured log for every stage.</p>
</div>
</div>
</figure>

<hr data-slide="Status combinations">

### Status combinations flagged (Deposit 2026-03-30 ~ 11-17; Withdrawal 2026-09-09 ~ 11-17)

Cases since launch, grouped by their CRM and CPS status combination (from the public CSV):

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 440" role="img" aria-labelledby="dm-title-en"><title id="dm-title-en">Status combinations flagged: deposits are CRM status × CPS transaction status, withdrawals are CPS failure pattern × case type; each cell is a case count</title><g data-b="dep"><text class="sf-h sf-start" x="20" y="20">Deposits: CPS succeeded, CRM has not</text><text class="sf-k sf-start" x="20" y="50">CRM status</text><text class="sf-k" x="350" y="50">交易成功</text><text class="sf-k" x="480" y="50">交易成功(人工)</text><text class="sf-f sf-start" x="20" y="78">Audit</text><rect class="sf-parent" x="290" y="60" width="120" height="28" rx="4"/><text class="sf-t" x="350" y="78">3,412</text><rect class="sf-node" x="420" y="60" width="120" height="28" rx="4"/><text class="sf-t" x="480" y="78">533</text><text class="sf-f sf-start" x="20" y="110">Submit to third party</text><rect class="sf-parent" x="290" y="92" width="120" height="28" rx="4"/><text class="sf-t" x="350" y="110">1,443</text><rect class="sf-node" x="420" y="92" width="120" height="28" rx="4"/><text class="sf-t" x="480" y="110">2</text><text class="sf-f sf-start" x="20" y="142">Processing</text><rect class="sf-parent" x="290" y="124" width="120" height="28" rx="4"/><text class="sf-t" x="350" y="142">1,027</text><rect class="sf-node" x="420" y="124" width="120" height="28" rx="4"/><text class="sf-t" x="480" y="142">6</text><text class="sf-f sf-start" x="20" y="174">5 others (Wait for MT4 deposit, etc.)</text><rect class="sf-node" x="290" y="156" width="120" height="28" rx="4"/><text class="sf-t" x="350" y="174">65</text><rect class="sf-node" x="420" y="156" width="120" height="28" rx="4"/><text class="sf-t" x="480" y="174">7</text></g><line class="sf-sep" x1="20" y1="200" x2="740" y2="200"/><g data-b="wd"><text class="sf-h sf-start" x="20" y="226">Withdrawals: CRM done (Success for cards), CPS failed or rejected</text><text class="sf-k sf-start" x="20" y="256">CPS transaction / payout status</text><text class="sf-k" x="342.5" y="256">LBT</text><text class="sf-k" x="457.5" y="256">Crypto&Wallet</text><text class="sf-k" x="572.5" y="256">IBT</text><text class="sf-k" x="687.5" y="256">CreditCard</text><text class="sf-f sf-start" x="20" y="284">處理完成／交易失敗(人工)</text><rect class="sf-parent" x="290" y="266" width="105" height="26" rx="4"/><text class="sf-t" x="342.5" y="283">6,350</text><rect class="sf-node" x="405" y="266" width="105" height="26" rx="4"/><text class="sf-t" x="457.5" y="283">163</text><rect class="sf-node" x="520" y="266" width="105" height="26" rx="4"/><text class="sf-t" x="572.5" y="283">10</text><rect class="sf-parent" x="635" y="266" width="105" height="26" rx="4"/><text class="sf-t" x="687.5" y="283">1,027</text><text class="sf-f sf-start" x="20" y="313">處理完成／交易失敗(銀行退款)</text><rect class="sf-node" x="290" y="295" width="105" height="26" rx="4"/><text class="sf-t" x="342.5" y="312">106</text><rect class="sf-node" x="405" y="295" width="105" height="26" rx="4"/><text class="sf-s" x="457.5" y="312">—</text><rect class="sf-node" x="520" y="295" width="105" height="26" rx="4"/><text class="sf-t" x="572.5" y="312">12</text><rect class="sf-node" x="635" y="295" width="105" height="26" rx="4"/><text class="sf-s" x="687.5" y="312">—</text><text class="sf-f sf-start" x="20" y="342">處理完成／交易失敗</text><rect class="sf-node" x="290" y="324" width="105" height="26" rx="4"/><text class="sf-t" x="342.5" y="341">100</text><rect class="sf-node" x="405" y="324" width="105" height="26" rx="4"/><text class="sf-t" x="457.5" y="341">14</text><rect class="sf-node" x="520" y="324" width="105" height="26" rx="4"/><text class="sf-s" x="572.5" y="341">—</text><rect class="sf-node" x="635" y="324" width="105" height="26" rx="4"/><text class="sf-s" x="687.5" y="341">—</text><text class="sf-f sf-start" x="20" y="371">審核拒絕／審核拒絕</text><rect class="sf-node" x="290" y="353" width="105" height="26" rx="4"/><text class="sf-t" x="342.5" y="370">276</text><rect class="sf-node" x="405" y="353" width="105" height="26" rx="4"/><text class="sf-t" x="457.5" y="370">71</text><rect class="sf-node" x="520" y="353" width="105" height="26" rx="4"/><text class="sf-t" x="572.5" y="370">24</text><rect class="sf-node" x="635" y="353" width="105" height="26" rx="4"/><text class="sf-s" x="687.5" y="370">—</text><text class="sf-f sf-start" x="20" y="400">提交拒絕／—</text><rect class="sf-node" x="290" y="382" width="105" height="26" rx="4"/><text class="sf-s" x="342.5" y="399">—</text><rect class="sf-node" x="405" y="382" width="105" height="26" rx="4"/><text class="sf-t" x="457.5" y="399">740</text><rect class="sf-node" x="520" y="382" width="105" height="26" rx="4"/><text class="sf-s" x="572.5" y="399">—</text><rect class="sf-node" x="635" y="382" width="105" height="26" rx="4"/><text class="sf-s" x="687.5" y="399">—</text><text class="sf-f sf-start" x="20" y="429">2 others</text><rect class="sf-node" x="290" y="411" width="105" height="26" rx="4"/><text class="sf-t" x="342.5" y="428">1</text><rect class="sf-node" x="405" y="411" width="105" height="26" rx="4"/><text class="sf-t" x="457.5" y="428">4</text><rect class="sf-node" x="520" y="411" width="105" height="26" rx="4"/><text class="sf-s" x="572.5" y="428">—</text><rect class="sf-node" x="635" y="411" width="105" height="26" rx="4"/><text class="sf-s" x="687.5" y="428">—</text></g></svg>
</div>
<figcaption>Figure 8　Status combinations flagged: each cell is a case count, cells in the thousands are outlined in the theme colour; status values are shown in Traditional Chinese (the CSV keeps the source system's Simplified characters)</figcaption>
</figure>

- **Deposits cluster in 3 CRM statuses**: Audit, Submit to third party and Processing, all cases where CPS succeeded and CRM is still midway.
- **Withdrawal failure patterns differ by channel**: LBT is mostly "處理完成／交易失敗(人工)" and Crypto&Wallet mostly "提交拒絕", which is why the three withdrawal types share one rule but each gets its own sheet and its own reasons.

<hr data-slide="A run with failures">

### A run with failures: retried, then finished as usual

- Below is a log excerpt from the run at 2026-10-20 15:00, taken from the original JSON log file; time, level, stage and message are kept.
- Repeated download lines are left out; internal URLs and report file names are removed, and error messages keep only the HTTP status code.

```text
15:00:06  INFO   Download DataSource  Successfully connected to CPS database.
15:00:18  INFO   Download DataSource  Deposit query finished, rows=159927.
15:03:01  ERROR  Download DataSource  Withdraw query failed (attempt 1/5)
15:03:04  INFO   Download DataSource  Executing Withdraw query (attempt 2/5)
15:05:31  INFO   Download DataSource  CPS report downloaded successfully. deposit_rows=159927, withdraw_rows=939
   ...                         (CRM deposit/withdrawal reports, 4 regulators × last 4 days, all succeeded)
15:10:18  INFO   Download DataSource  No data found (fcs-cc-detail CC VFSC 2026-10-18), skip retry
15:13:17  WARN   Download DataSource  POST failed (cc-detail CC VFSC2 2026-10-15) attempt 1: 524, took 125.1s
15:14:19  INFO   Download DataSource  Download success (CC VFSC2 2026-10-15): <report>.csv, rows=10578
15:15:15  INFO   Compare Existing Data - Deposit        Total new mismatch cases to upload: 4
15:15:19  INFO   Compare Existing Data - Withdraw_LBT   Total new mismatch cases to upload: 6
15:15:22  INFO   LarkSheet Upload Complete              Upload total data to LarkSheet Finish
```

What this log shows:

- **The CPS withdrawal query failed on the 1st try** and succeeded on the 2nd, 3 seconds later; **the CRM card report returned 524** and succeeded after waiting 60 seconds; the FCS report had no data and was skipped without retrying.
- The run still finished the comparison and wrote 4 new Deposit and 6 new LBT cases.
- **Across the 1,418 runs from 2026-09-12 to 11-17**: 1,404 finished; all 9 runs with a failed CPS query succeeded on retry within the same run; 229 CRM report steps succeeded after retrying; a day's reports ran out of retries 46 times, and all 46 were filled in by the next hourly run; 14 runs stopped before writing, and those hours have no heartbeat row.

<hr data-slide="Output format">

### Output format

Cases are written to LarkSheet, one sheet per case type. Below are real cases from 2026/11 plus one heartbeat row, with client IDs, account numbers, order numbers and staff names removed. The table shows only the statuses used for the check and the handling result; detection time, channel and amount are in the public CSV below (status and reason values are translated here; the CSV keeps the source system's Simplified Chinese):

| Case Type | CRM Status | CPS Status (tx / payout) | Reason (category / sub) | Handling |
|---|---|---|---|---|
| Deposit | Processing | Success | — | done |
| Withdraw-LBT | Completed | Processed / Failed (manual) | Channel / Limit issue | reversed |
| Withdraw-CreditCard | Success | Processed / Failed (manual) | Client / Bank-side failure | reversed |
| Withdraw-IBT | Completed | Processed / Failed (manual) | Client / SWIFT error | reversed |
| Withdraw-IBT | - | - | Detection time only: 2026-11-17 23:11:40 | |

- The last row is a heartbeat row: that run found no new case and only left the detection time.
- `Handling` is filled in by the Handler: done (credited) for deposits, reversed (returned) for withdrawals.

<hr data-slide="Deposit case: 11/6">

### Deposit case: the 2026/11/6 upstream failure

That day the upstream side launched 85 channels at once without testing the effect on other routes; it left every downstream integration stuck, channel callbacks failed en masse and many client orders got stuck. The pipeline kept running every hour, and the drop orders showed up in the case sheet at the next top of the hour:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 310" role="img" aria-labelledby="tl-title"><title id="tl-title">2026/11/6, 85 channels launched upstream without testing left everything downstream stuck: the 10:00 run surfaced 450 deposit drop orders and the 11:00 run another 483, against at most 75 in a normal single run; cases were written to LarkSheet and handed to operations</title><g data-b="t-axis"><text class="sf-h sf-start" x="40" y="22">Pipeline (24 runs on 11/6, one every hour)</text><line class="sf-line" x1="40" y1="232" x2="470" y2="232"/><line class="sf-line" x1="80" y1="232" x2="80" y2="238"/><line class="sf-line" x1="210" y1="232" x2="210" y2="238"/><line class="sf-line" x1="340" y1="232" x2="340" y2="238"/><line class="sf-line" x1="470" y1="232" x2="470" y2="238"/><text class="sf-s" x="80" y="254">09:00</text><text class="sf-s" x="210" y="254">10:00 run</text><text class="sf-s" x="340" y="254">11:00 run</text><text class="sf-s" x="470" y="254">12:00</text></g><g data-b="t-up"><rect class="sf-bad" x="85" y="36" width="380" height="26" rx="13"/><text class="sf-bad-t sf-small" x="275" y="53">85 channels launched untested upstream · all stuck downstream</text></g><g data-b="t-10"><rect class="sf-trx" x="188" y="92" width="44" height="140" rx="3"/><text class="sf-t" x="210" y="84">450</text></g><g data-b="t-11"><rect class="sf-trx" x="318" y="82" width="44" height="150" rx="3"/><text class="sf-t" x="340" y="74">483</text><line class="sf-sep" x1="40" y1="209" x2="470" y2="209"/><text class="sf-s sf-start" x="44" y="203">Normal single-run max: 75</text><text class="sf-k" x="255" y="276">933 in two runs · 85 channels · 61 countries</text></g><g data-b="t-ops"><defs><marker id="tl-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path class="sf-head" d="M0,0 L8,4 L0,8 z"/></marker></defs><path class="sf-line" d="M478 150 H519" marker-end="url(#tl-arrow)"/><rect class="sf-box" x="525" y="96" width="215" height="108" rx="6"/><text class="sf-t" x="632" y="128">Written to LarkSheet</text><text class="sf-s" x="632" y="152">Each order assigned once</text><text class="sf-good" x="632" y="182">Handlers take over</text></g><g data-b="t-manual"><line class="sf-sep" x1="40" y1="288" x2="740" y2="288"/><text class="sf-k sf-start" x="40" y="304">With manual checks twice a day, drop orders between checks wait for the next round</text></g></svg>
</div>
<figcaption>Figure 9　Deposit drop orders surfaced per run during the 2026/11/6 upstream failure (bar heights proportional to counts; the normal single-run max of 75 was on 2026/09/22; from the public CSV on this page)</figcaption>
</figure>

<hr data-slide="Withdrawal case: 10/23">

### Withdrawal case: UK card refunds failing en masse on 2026/10/23

That day, UK card issuers rejected refunds in a batch, so card refunds failed en masse; operations set CPS to Failed (manual) by hand, but CRM still showed the refunds as successful. The pipeline kept comparing every hour, and each failed refund became a case at the next top of the hour:

<figure class="split-figure step-figure">
<div class="split-scroll">
<svg viewBox="0 0 760 312" role="img" aria-labelledby="wd-title"><title id="wd-title">2026/10/23 withdrawals: the 19:09 run surfaced 117 cases against a normal single-run max of 85; 220 were card withdrawals, concentrated in the UK with the same bank-side failure reason (an issuer-side batch rejection); all 329 cases that day were reversed</title><g data-b="o-axis"><text class="sf-h sf-start" x="40" y="22">Pipeline (24 runs on 10/23, one every hour)</text><line class="sf-line" x1="40" y1="240" x2="522" y2="240"/><text class="sf-s" x="51" y="258">00:00</text><text class="sf-s" x="171" y="258">06:00</text><text class="sf-s" x="291" y="258">12:00</text><text class="sf-s" x="411" y="258">18:00</text><rect class="sf-node" x="44" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="84" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="104" y="233.6" width="14" height="6.4" rx="2"/><rect class="sf-node" x="124" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="144" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="164" y="238.7" width="14" height="1.3" rx="2"/><rect class="sf-node" x="184" y="223.3" width="14" height="16.7" rx="2"/><rect class="sf-node" x="204" y="216.9" width="14" height="23.1" rx="2"/><rect class="sf-node" x="224" y="237.4" width="14" height="2.6" rx="2"/><rect class="sf-node" x="264" y="232.3" width="14" height="7.7" rx="2"/><rect class="sf-node" x="284" y="231.0" width="14" height="9.0" rx="2"/><rect class="sf-node" x="304" y="234.9" width="14" height="5.1" rx="2"/><rect class="sf-node" x="444" y="227.2" width="14" height="12.8" rx="2"/><rect class="sf-node" x="464" y="225.9" width="14" height="14.1" rx="2"/><rect class="sf-node" x="484" y="224.6" width="14" height="15.4" rx="2"/><rect class="sf-node" x="504" y="237.4" width="14" height="2.6" rx="2"/></g><g data-b="o-up"><rect class="sf-bad" x="90" y="36" width="380" height="26" rx="13"/><text class="sf-bad-t sf-small" x="280" y="53">UK issuers rejected refunds in a batch · card refunds failing</text></g><g data-b="o-pm"><rect class="sf-trx" x="324" y="200.3" width="14" height="39.7" rx="2"/><text class="sf-t sf-small" x="331" y="193.3">31</text><rect class="sf-trx" x="344" y="166.9" width="14" height="73.1" rx="2"/><text class="sf-t sf-small" x="351" y="159.9">57</text><rect class="sf-trx" x="364" y="210.5" width="14" height="29.5" rx="2"/><text class="sf-t sf-small" x="371" y="203.5">23</text></g><g data-b="o-peak"><rect class="sf-trx" x="424" y="90.0" width="14" height="150.0" rx="2"/><text class="sf-t sf-small" x="431" y="83.0">117</text><line class="sf-sep" x1="40" y1="131.0" x2="522" y2="131.0"/><text class="sf-s sf-start" x="44" y="125.0">Normal single-run max: 85</text></g><g data-b="o-why"><rect class="sf-box" x="536" y="36" width="214" height="104" rx="6"/><text class="sf-t" x="643" y="62">220 card withdrawals</text><text class="sf-s" x="643" y="80">usually about 12 a day</text><text class="sf-s" x="643" y="104">189 in the UK</text><text class="sf-s" x="643" y="122">197 bank-side failures</text></g><g data-b="o-done"><rect class="sf-box" x="536" y="174" width="214" height="66" rx="6"/><text class="sf-t" x="643" y="201">To LarkSheet · 329 that day</text><text class="sf-good" x="643" y="225">All reversed</text></g><g data-b="o-manual"><line class="sf-sep" x1="40" y1="280" x2="750" y2="280"/><text class="sf-k sf-start" x="40" y="300">With manual checks twice a day, drop orders between checks wait for the next round</text></g></svg>
</div>
<figcaption>Figure 10　Withdrawal drop orders surfaced per run on 2026/10/23 (bar heights proportional to counts; the normal single-run max of 85 was on 2026/11/08, excluding the backlog in the first run after a stop; from the public CSV on this page)</figcaption>
</figure>

<hr data-slide="Failure reasons">

### Withdrawal failure reasons

Withdrawal cases get a reason category from the Reason Table, and Handlers reply to clients based on it. The four withdrawal types total 8,898 cases:

<figure class="bar-figure">
<ul class="bar-list">
<li class="is-peak" style="--v: 100%"><span class="bar-label">Client issue</span><span class="bar"></span><span class="bar-value">6,649</span></li>
<li style="--v: 10.1%"><span class="bar-label">Channel issue</span><span class="bar"></span><span class="bar-value">669</span></li>
<li style="--v: 1.5%"><span class="bar-label">Merchant issue</span><span class="bar"></span><span class="bar-value">102</span></li>
<li style="--v: 0.4%"><span class="bar-label">Bank issue</span><span class="bar"></span><span class="bar-value">27</span></li>
<li style="--v: 0.1%"><span class="bar-label">CPS issue, internal error</span><span class="bar"></span><span class="bar-value">7</span></li>
<li style="--v: 21.7%"><span class="bar-label">Uncategorized (reason blank)</span><span class="bar"></span><span class="bar-value">1,444</span></li>
</ul>
<figcaption>Figure 11　Withdrawal failure reason categories (Withdrawal 2026-09-09 ~ 11-17, from the public CSV on this page)</figcaption>
</figure>

- **Client issue** subcategories are mostly bank-side transaction failures, wrong account numbers, invalid accounts and wrong names.
- **Channel issue** subcategories are mostly channel maintenance, system errors and compliance / risk-control issues.

<hr data-slide="Run statistics">

### Run statistics (Deposit 2026-03-30 ~ 11-17; Withdrawal 2026-09-09 ~ 11-17)

Source: the full records the pipeline wrote to LarkSheet (public CSV). A "case" is a row whose Tx is not `-`; under the same-route rule, one credit card withdrawal can map to several original recharges, and each "withdrawal × original recharge" pair counts as one case, the same unit the pipeline de-duplicates on. "Runs" means distinct Comparison Times.

| Case type | Cases | Per day | Runs | Runs with new cases | Handling status |
|---|---|---|---|---|---|
| Deposit | 6,495 | 27.9 | 4,808 | 2,585 | done 5,540, unmarked 942, other 13 |
| Withdraw-LBT | 6,833 | 97.6 | 1,466 | 1,055 | all reversed |
| Withdraw-Crypto&Wallet | 992 | 14.2 | 1,466 | 552 | all reversed |
| Withdraw-CreditCard | 1,027 (590 withdrawals) | 14.9 | 1,436 | 93 | all reversed |
| Withdraw-IBT | 46 | 0.7 | 1,466 | 43 | all reversed |
| **Total** | **15,393** | | | | |

- **Run interval**: median 1.00 h, P90 1.03 h.
- **Of the 942 unmarked**, 930 are deposit cases surfaced on 11/6, the day of the upstream failure.

<details class="csv-details">
<summary>Full data (de-identified)<span class="mono">21,707 rows · click to expand</span></summary>
<div class="csv-viewer" data-src="../../../data/drop-order-cases-2026.csv">
<p><a href="../../../data/drop-order-cases-2026.csv" download>Download the de-identified CSV (Deposit 2026-03-30 ~ 11-17, Withdrawal 2026-09-09 ~ 11-17, 21,707 rows including heartbeat rows)</a></p>
</div>
</details>

## Impact

<hr data-slide="Verified results">

### Verified results

<figure class="ba-figure">
<div class="ba-table">
<div class="ba-row ba-head"><p class="ba-item">Item</p><p class="ba-before">Before: manual spot checks</p><p class="ba-after">After: drop-order monitoring pipeline</p></div>
<div class="ba-row"><p class="ba-item">Check frequency</p><p class="ba-before">Twice a day each for Deposit and Withdrawal; found at the next check or when a client asked</p><p class="ba-after">Scheduled once an hour; new drop orders reach LarkSheet on the next top-of-the-hour run; actual average 20.6 runs a day (Deposit) and 20.9 (Withdrawal)<small>Basis: runs ÷ days (Deposit 233 days, Withdrawal 70 days); runs and interval in Result</small></p></div>
<div class="ba-row"><p class="ba-item">Staff time</p><p class="ba-before">About 2 hours a day each for Deposit and Withdrawal</p><p class="ba-after">Zero manual work to pull and compare data; Handlers only work on identified cases<small>Basis: ~1 hour per check × 2 a day (see Problem); about 606 hours saved through 11/17 (Deposit 233 days × 2 h = 466, Withdrawal 70 days × 2 h = 140), estimate</small></p></div>
<div class="ba-row"><p class="ba-item">Coverage</p><p class="ba-before">Manual Excel comparison, volume not recorded</p><p class="ba-after">Each run compares about 195,000 CPS deposits and about 322,000 CRM deposit/withdrawal records<small>Basis: run log in Result</small></p></div>
<div class="ba-row"><p class="ba-item">Monitoring continuity</p><p class="ba-before">Depends on shifts; gaps during leave and handovers</p><p class="ba-after">Every run leaves a record: cases when there are new ones, a heartbeat row when not, 6,314 heartbeat rows in total<small>Basis: rows with Tx = - in the public CSV</small></p></div>
</div>
<figcaption>Figure 12　Before / After (manual hours are estimates)</figcaption>
</figure>

<hr data-slide="Not yet quantified">

### Not yet quantified, or needing explanation

- **Inbound inquiries**: the goal is fewer questions and follow-ups from CS, Sales and Finance about unclear payment statuses; there are no before/after inquiry statistics yet, so this is not quantified.
- **≥ 50% fewer back-and-forths, channel located within 1 hour**: these are design goals with no measurements yet.
- **What "detection time" means**: 1 hour is the schedule's check interval. The time from a drop order happening to it being surfaced also depends on when CRM and CPS data becomes available; it is not an end-to-end guarantee.
- **Fewer than 24 runs a day**: the actual averages above are below the schedule's maximum because some hours have no run record.
- **Hours are estimates**: about 1 hour per manual check is an estimate, not timed (see the time bar in Problem); counting starts from each line's launch date.
- **Handling is still manual**: phase one only makes drop orders visible and assigned; crediting deposits and reversing withdrawals are still done by Handlers in the CRM. Phase two, after about 3–6 months of stable running, plans to replace this manual work with automated clicking.
