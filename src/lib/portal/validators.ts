import { z } from "zod";
import { PORTAL_GROUPS } from "./types";

// 목업과 같은 규칙: 주소에 http(s):// 가 없으면 https:// 를 붙인다.
export function normalizeUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

const urlField = z
  .string()
  .max(2000)
  .transform(normalizeUrl)
  .refine(
    (u) => {
      if (!u) return true;
      if (/\s/.test(u)) return false;
      try {
        const parsed = new URL(u);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "링크 주소 형식이 올바르지 않습니다." },
  );

// 입력 항목 5개: 구분, 제목, 부서, 교사 이름, 링크 주소 (아이콘은 자동)
export const siteInputSchema = z.object({
  group: z.enum(PORTAL_GROUPS),
  title: z.string().trim().min(1, "제목을 입력하세요.").max(80),
  dept: z.string().trim().max(40).default(""),
  teacher: z.string().trim().max(30).default(""),
  url: urlField.default(""),
});

export type SiteInput = z.infer<typeof siteInputSchema>;

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});
