# CLAUDE.md

Peter Chang 的作品集網站（Astro 7 + Markdown + Mermaid，部署到 GitHub Pages）。使用方式與目錄見 [README.md](README.md)。

## 新增或改寫專案頁

- **MUST**：依 [docs/case-study-framework.md](docs/case-study-framework.md) 進行：六段式結構、各章必備內容、數據規則、去識別規則、可用元件、驗證步驟。
- 範本：[src/content/projects/credit-card-anomaly-detection.md](src/content/projects/credit-card-anomaly-detection.md)。
- 每個數字的來源與口徑寫進 [docs/source-notes.md](docs/source-notes.md)。
- 範本補充：名詞說明收合頁籤、規則圖在上表格在下、Result 操作錄影並排，見 [src/content/projects/account-automation-engine.md](src/content/projects/account-automation-engine.md)。
- **MUST**：網站頁面不放 emoji 或圓圈數字（①②），語意顏色交給既有元件（章節徽章、`tone-*`、`ba-before`／`ba-after`）；README 與 docs 不受此限。
- **MUST**：每個專案在第一章加「名詞說明」收合頁籤（`glossary-details`），定義經 Peter 確認後才放上，不確定的名詞先問。
- **MUST**：frontmatter 填 `categories`（技術類型，至少一個），可選值只來自 [src/data/project-categories.ts](src/data/project-categories.ts)；新類型先加進該檔。Projects 頁只顯示有專案的分類按鈕。
- 長章節用 `<hr data-slide="小標">` 切成章內投影片（一張約一個螢幕、說明與它的圖表同一張），切法見框架文件〈Components〉。

## 網站設計慣例

- **配色**：品牌色只用 `global.css` 的 token：`--accent`（深藍，主色）、`--accent-2`（磚紅，章節編號與 hover）、`--blob`（照片色塊）。不在頁面或元件寫死色碼；新增 token 必須同時在 `:root` 與 `:root[data-theme="dark"]` 各定義一次。紅黃綠只用於語意徽章，不當裝飾色。
- **深淺色**：`<html data-theme>` 由 [Base.astro](src/layouts/Base.astro) 的 inline script 在首次繪製前設定（訪客選擇優先，否則跟隨系統）。CSS 一律寫 `[data-theme="dark"]`，不寫 `@media (prefers-color-scheme)`；JS 繪製的內容（例如 Mermaid）監聽 `themechange` 事件重畫。
- **個人照片**：只用 [ProfilePhoto.astro](src/components/ProfilePhoto.astro)（不規則色塊 + 右下小點，不加手繪線條），目前用在首頁 hero 與 Contact。檔案為 `public/media/peter-photo.jpg`（560px 寬）；原始大圖與設計參考圖不留在 repo。
- **外部設計素材**（Canva 等）：不直接放上網站，只沿用色票與形狀，用 CSS／SVG 重畫，避免授權問題。
- **文案語氣**：首頁一句話介紹與 Introduction 先講使用者價值與為人（熱忱、從使用者角度出發、團隊合作、深耕資料工程與 AI），不以「逆向工程」「沒有權限」開場；技術手段放在能力列表與專案頁。所有個人文案集中在 [profile.ts](src/data/profile.ts)。
- **Contact**：獨立頁 `/contact/`（照片 + 一句邀請、聯絡方式卡片含複製 Email、可以找我聊），首頁只留一行邀請連過去。文案在 `profile.ts` 的 `contact_invite`、`talk_topics`。求職狀態等個人資訊只放 Peter 提供的內容，不自行編寫；網站是靜態站，不做需要外部服務的聯絡表單。
- **新增互動元件**：沒有 JS 時內容仍要完整可讀（漸進增強）；鍵盤可操作、有 `focus-visible` 樣式、尊重 `prefers-reduced-motion`。

## 機敏資料

- `canva-export/`、`PeterChang_rv.pdf`、`PeterChang_core.md` 含同事姓名、內部網址、交易編號與個人資料，只能讀，不可複製進 `src/` 或 `public/`。
- 公開前一律去識別：圖片裁切／模糊、CSV 經腳本處理並掃描殘留。

## 驗證

```bash
npm run build
python -m pytest tests
```

- 版面變更另外用 headless Edge 截圖檢查：桌面 1280px、窄版 500px（headless 最窄約 500px，更窄會被裁切而誤判溢出）、深色模式。
- 點擊類互動（篩選、翻頁、複製、深淺色切換）無法在 headless 截圖中操作；回報時標「未驗證」並請 Peter 實際點過。
