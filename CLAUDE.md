# CLAUDE.md

Peter Chang 的作品集網站（Astro 7 + Markdown + Mermaid，部署到 GitHub Pages）。使用方式與目錄見 [README.md](README.md)。

## 新增或改寫專案頁

- **MUST**：依 [docs/case-study-framework.md](docs/case-study-framework.md) 進行：六段式結構、各章必備內容、數據規則、去識別規則、可用元件、驗證步驟。
- 範本：[src/content/projects/credit-card-anomaly-detection.md](src/content/projects/credit-card-anomaly-detection.md)。
- 每個數字的來源與口徑寫進 [docs/source-notes.md](docs/source-notes.md)。

## 機敏資料

- `canva-export/`、`PeterChang_rv.pdf`、`PeterChang_core.md` 含同事姓名、內部網址、交易編號與個人資料，只能讀，不可複製進 `src/` 或 `public/`。
- 公開前一律去識別：圖片裁切／模糊、CSV 經腳本處理並掃描殘留。

## 驗證

```bash
npm run build
python -m pytest tests
```
