// UI strings and URL helpers for the two site languages.
// zh (Traditional Chinese) is the default and lives at "/"; en lives at "/en/".
// Case studies: zh in src/content/projects, en text in src/content/projects-en (see i18n/projects.ts).
import { url } from "../lib/url";

export const langs = ["zh", "en"] as const;
export type Lang = (typeof langs)[number];

export const html_lang: Record<Lang, string> = { zh: "zh-Hant", en: "en" };

export const ui = {
  zh: {
    "lang.switch":          "EN",
    "lang.switch_label":    "Switch to English",
    "theme.toggle":         "切換深色／淺色模式",
    "photo.alt":            "的照片",
    "home.view_projects":   "View Projects",
    "home.open_to_work":    "正在尋找新機會",
    "home.contact":         "Contact",
    "home.keywords":        "專長與工具",
    "home.skills":          "專長",
    "home.tools":           "常用工具",
    "home.map_title":       "成果地圖",
    "home.map_note":        "每個專案在公司資金流中的位置，以及它帶來的改變；點卡片看完整案例。",
    "home.map_company":     "公司",
    "home.map_show":        "查看系統地圖",
    "home.before":          "之前",
    "home.after":           "之後",
    "home.building":        "建置中",
    "home.about_link":      "更多關於我 →",
    "home.contact_link":    "前往 Contact →",
    "home.life_link":       "跳傘與潛水 →",
    "home.pipe_result":     "成果",
    "home.pipe_drop":       "丟一筆資料進去，鏡頭會跟著它",
    "home.machine_open":    "點機台進專案頁 →",
    "home.pipeline_view":   "管線視圖",
    "pipeline.title":       "管線視圖",
    "pipeline.hint":        "滑到節點看上下游；點節點回到那一區。",
    "pipeline.run":         "Run",
    "pipeline.close":       "回到閱讀模式",
    "pipeline.col_source":  "來源",
    "pipeline.col_skills":  "能力",
    "pipeline.col_projects": "專案",
    "pipeline.col_sink":    "終點",
    "pipeline.runtime":     "執行環境",
    "pipeline.queued":      "等待",
    "pipeline.running":     "執行中",
    "pipeline.done":        "完成",
    "pipeline.run_done":    "Run 完成",
    "about.example":        "例：",
    "about.current":        "現職",
    "about.present":        "現在",
    "about.career_aria":    "職涯時間條",
    "about.zone_sky":        "天空",
    "about.zone_surface":    "海平面",
    "about.zone_underwater": "水下",
    "about.certs_note":      "點縮圖看證書影像；身分證字號、出生日期、條碼與證號已遮蔽。",
    "about.cert_view":       "看證卡",
    "projects.description": "Engineering case studies: business problem, architecture, solution and impact.",
    "projects.lead":        "每個專案都包含業務問題、技術挑戰、個人貢獻、系統架構與實際成果。",
    "projects.filter":      "依技術類型篩選專案",
    "card.read_more":       "Read case study →",
    "case.zone_tech":       "技術選材",
    "case.zone_brief":      "30 秒速讀",
    "case.story_start":     "照故事線看",
    "case.zone_detail":     "詳細內容",
    "map.focus":            "本專案負責：",
    "map.full":             "看完整地圖 →",
    "period.built":         "開發",
    "period.live":          "上線",
    "contact.title":        "Let's talk",
    "contact.seeking":      "目前在找",
    "contact.reply":        "回覆",
    "contact.hours":        "聯絡時間",
    "contact.topics":       "可以找我聊",
    "contact.topic_pick":   "選一個主題，送一封信給我",
    "contact.topic_go":     "聊這個 →",
    "contact.letter_prefix": "想聊聊：",
    "contact.letter_subject": "主旨",
    "contact.letter_send":  "開始寫信",
    "contact.letter_copy":  "複製主旨",
    "contact.sort":         "分揀",
    "contact.stamp":        "蓋章",
    "contact.copy":         "複製",
    "contact.copied":       "已複製",
    "contact.copy_failed":  "請手動複製",
  },
  en: {
    "lang.switch":          "中文",
    "lang.switch_label":    "切換到繁體中文",
    "theme.toggle":         "Toggle dark / light mode",
    "photo.alt":            "photo of",
    "home.view_projects":   "View Projects",
    "home.open_to_work":    "Open to new roles",
    "home.contact":         "Contact",
    "home.keywords":        "Skills and tools",
    "home.skills":          "Focus",
    "home.tools":           "Tools",
    "home.map_title":       "Impact map",
    "home.map_note":        "Where each project sits in the company's money flow, and what it changed. Click a card for the full case study.",
    "home.map_company":     "Company",
    "home.map_show":        "Show the system map",
    "home.before":          "Before",
    "home.after":           "After",
    "home.building":        "In progress",
    "home.about_link":      "More about me →",
    "home.contact_link":    "Go to Contact →",
    "home.life_link":       "Skydiving and diving →",
    "home.pipe_result":     "Result",
    "home.pipe_drop":       "Drop in a record and follow it",
    "home.machine_open":    "Click the machine to open the case study →",
    "home.pipeline_view":   "Pipeline view",
    "pipeline.title":       "Pipeline view",
    "pipeline.hint":        "Hover a node to trace its lineage; click it to jump back to that section.",
    "pipeline.run":         "Run",
    "pipeline.close":       "Back to reading view",
    "pipeline.col_source":  "Source",
    "pipeline.col_skills":  "Capabilities",
    "pipeline.col_projects": "Projects",
    "pipeline.col_sink":    "Sink",
    "pipeline.runtime":     "Runtime",
    "pipeline.queued":      "Queued",
    "pipeline.running":     "Running",
    "pipeline.done":        "Done",
    "pipeline.run_done":    "Run finished",
    "about.example":        "e.g. ",
    "about.current":        "Current",
    "about.present":        "Present",
    "about.career_aria":    "Career timeline",
    "about.zone_sky":        "Sky",
    "about.zone_surface":    "Sea level",
    "about.zone_underwater": "Underwater",
    "about.certs_note":      "Select a thumbnail to view the certificate. National ID, birth date, barcodes and certificate numbers are masked.",
    "about.cert_view":       "View card",
    "projects.description": "Engineering case studies: business problem, architecture, solution and impact.",
    "projects.lead":        "Each case study covers the business problem, technical challenges, my contribution, system architecture and real results.",
    "projects.filter":      "Filter projects by technology type",
    "card.read_more":       "Read case study →",
    "case.zone_tech":       "Tech choices",
    "case.zone_brief":      "30-second read",
    "case.story_start":     "Follow the storyline",
    "case.zone_detail":     "Details",
    "map.focus":            "This project covers: ",
    "map.full":             "See the full map →",
    "period.built":         "Built",
    "period.live":          "Live",
    "contact.title":        "Let's talk",
    "contact.seeking":      "Looking for",
    "contact.reply":        "Reply",
    "contact.hours":        "Best time",
    "contact.topics":       "Happy to talk about",
    "contact.topic_pick":   "Pick a topic and send me a note",
    "contact.topic_go":     "Talk about this →",
    "contact.letter_prefix": "Let's talk: ",
    "contact.letter_subject": "Subject",
    "contact.letter_send":  "Write the email",
    "contact.letter_copy":  "Copy subject",
    "contact.sort":         "sort",
    "contact.stamp":        "stamp",
    "contact.copy":         "Copy",
    "contact.copied":       "Copied",
    "contact.copy_failed":  "Please copy manually",
  },
} satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)["zh"];

export function use_translations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key];
}

// Phase names in project frontmatter are zh; English cards show these instead.
export const phase_name_en: Record<string, string> = { "入金": "Deposit", "出金": "Withdrawal" };

// For pages under src/pages/[...lang]/: one build per language ("/about/" and "/en/about/").
export function lang_static_paths() {
  return [{ params: { lang: undefined } }, { params: { lang: "en" } }];
}

export function lang_from_param(param: string | undefined): Lang {
  return param === "en" ? "en" : "zh";
}

// Internal link in a given language, e.g. lang_path("about/", "en") -> "/en/about/" (plus deploy base).
export function lang_path(path: string, lang: Lang): string {
  const clean = path.replace(/^\//, "");
  return url(lang === "en" ? `en/${clean}` : clean);
}
