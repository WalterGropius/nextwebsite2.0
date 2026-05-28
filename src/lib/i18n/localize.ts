// Localized — a text value that may carry per-language variants. Content
// JSON (portfolio, blog, art) stores user-facing strings as
// `{ en, cs, fr }` objects so the language switcher reaches the content,
// not just the chrome. Plain strings are still accepted for back-compat
// and for values that are the same in every language (urls, dates…).

export type Localized =
  | string
  | { en: string; cs?: string; fr?: string; [k: string]: string | undefined }

// pick — resolve a Localized value for the active language, falling back
// to English and finally to the first available variant so a missing
// translation degrades gracefully instead of rendering blank.
export function pick(value: Localized | null | undefined, lang: string): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  return value[lang] || value.en || Object.values(value).find(Boolean) || ""
}
