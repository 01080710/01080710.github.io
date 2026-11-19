// Month arithmetic for the About timeline and career bar.
// Periods use "YYYY/MM"; an empty end means the current job, counted to the build date
// (the site must be rebuilt for the current job's duration to advance).
import type { Lang } from "../i18n/ui";

export function to_months(ym: string): number {
  const [y, m] = ym.split("/").map(Number);
  return y * 12 + (m - 1);
}

const build_date = new Date();
export const now_ym = `${build_date.getFullYear()}/${String(build_date.getMonth() + 1).padStart(2, "0")}`;

export function months_between(start: string, end: string): number {
  return to_months(end || now_ym) - to_months(start);
}

export function format_months(total: number, lang: Lang): string {
  const years = Math.floor(total / 12), months = total % 12;
  const parts = lang === "en"
    ? [years ? `${years} yr${years > 1 ? "s" : ""}` : "", months ? `${months} mo${months > 1 ? "s" : ""}` : ""]
    : [years ? `${years} 年` : "", months ? `${months} 個月` : ""];
  return parts.filter(Boolean).join(" ");
}

export function format_duration(start: string, end: string, lang: Lang): string {
  return format_months(months_between(start, end), lang);
}
