import "server-only";
import { eq, sql } from "drizzle-orm";
import { db, portalSites, type PortalSiteRow } from "@/lib/db";
import { groupSites, type PortalGroup, type PortalSite, type PortalSitesByGroup } from "./types";

export function toSite(row: PortalSiteRow): PortalSite {
  return {
    id: row.id,
    group: row.group === "teacher" ? "teacher" : "student",
    title: row.title,
    dept: row.dept,
    teacher: row.teacher,
    url: row.url,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listSites(): Promise<PortalSitesByGroup> {
  const rows = await db.select().from(portalSites);
  return groupSites(rows.map(toSite));
}

// 그룹 맨 뒤에 붙일 때 쓰는 다음 sort_order (목업의 push 와 같은 동작)
export async function nextSortOrder(group: PortalGroup): Promise<number> {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${portalSites.sortOrder}), 0)` })
    .from(portalSites)
    .where(eq(portalSites.group, group));
  return Number(row?.max ?? 0) + 1;
}

// DB 오류를 화면에서 바로 원인을 알 수 있는 문구로 바꿔 준다. (특강 사이트와 같은 방식)
export function dbErrorMessage(e: unknown): string {
  const err = e as { message?: string; code?: string };
  const raw = err?.message ?? String(e);
  if (err?.code === "42P01" || /relation .* does not exist/i.test(raw)) {
    return `DB에 portal_sites 표가 없습니다. supabase_portal_setup.sql 을 실행해 주세요. (원인: ${raw})`;
  }
  if (err?.code === "42703" || /column .* does not exist/i.test(raw)) {
    return `DB에 필요한 칸이 없습니다. supabase_portal_setup.sql 을 실행해 주세요. (원인: ${raw})`;
  }
  return `저장 중 오류가 발생했습니다: ${raw}`;
}
