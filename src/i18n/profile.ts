// Pick the profile text for a page language; both objects share the same shape.
import { profile } from "../data/profile";
import { profile_en } from "../data/profile.en";
import type { Lang } from "./ui";

export function get_profile(lang: Lang) {
  return lang === "en" ? profile_en : profile;
}
