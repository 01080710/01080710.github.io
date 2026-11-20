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
    "home.about_me":        "About Me",
    // "home.projects_note":   "四個專案屬於同一套系統：先建資料底層，再往上做風控對帳與營運自動化。",
    "home.contact_link":    "前往 Contact →",
    "home.life_link":       "跳傘與潛水 →",
    "about.example":        "例：",
    "about.current":        "現職",
    "about.present":        "現在",
    "about.career_aria":    "職涯時間條",
    "projects.description": "Engineering case studies: business problem, architecture, solution and impact.",
    "projects.lead":        "每個專案都包含業務問題、技術挑戰、個人貢獻、系統架構與實際成果。",
    "projects.filter":      "依技術類型篩選專案",
    "card.read_more":       "Read case study →",
    "case.zone_tech":       "技術選材",
    "case.zone_brief":      "30 秒速讀",
    "case.zone_detail":     "詳細內容",
    "map.focus":            "本專案負責：",
    "period.built":         "開發",
    "period.live":          "上線",
    "contact.title":        "Let's talk",
    "contact.seeking":      "目前在找",
    "contact.reply":        "回覆",
    "contact.hours":        "聯絡時間",
    "contact.topics":       "可以找我聊",
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
    "home.about_me":        "About Me",
    "home.projects_note":   "All four projects belong to one system: build the data foundation first, then risk-control reconciliation and operations automation on top.",
    "home.contact_link":    "Go to Contact →",
    "home.life_link":       "Skydiving and diving →",
    "about.example":        "e.g. ",
    "about.current":        "Current",
    "about.present":        "Present",
    "about.career_aria":    "Career timeline",
    "projects.description": "Engineering case studies: business problem, architecture, solution and impact.",
    "projects.lead":        "Each case study covers the business problem, technical challenges, my contribution, system architecture and real results.",
    "projects.filter":      "Filter projects by technology type",
    "card.read_more":       "Read case study →",
    "case.zone_tech":       "Tech choices",
    "case.zone_brief":      "30-second read",
    "case.zone_detail":     "Details",
    "map.focus":            "This project covers: ",
    "period.built":         "Built",
    "period.live":          "Live",
    "contact.title":        "Let's talk",
    "contact.seeking":      "Looking for",
    "contact.reply":        "Reply",
    "contact.hours":        "Best time",
    "contact.topics":       "Happy to talk about",
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
