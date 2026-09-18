// 스마트 포털 데이터 모델 — 화면·API가 공유

export const PORTAL_GROUPS = ["student", "teacher"] as const;
export type PortalGroup = (typeof PORTAL_GROUPS)[number];

// 새로 추가한 사이트에 NEW 배지가 붙는 기간(일)
export const NEW_DAYS = 14;

export type PortalSite = {
  id: string;
  group: PortalGroup;
  title: string;
  dept: string;
  teacher: string;
  url: string;
  sortOrder: number;
  createdAt: string; // ISO
};

export type PortalSitesByGroup = Record<PortalGroup, PortalSite[]>;

export function isNewSite(site: Pick<PortalSite, "createdAt">, now = Date.now()): boolean {
  const t = new Date(site.createdAt).getTime();
  if (Number.isNaN(t)) return false;
  return now - t < NEW_DAYS * 86400000;
}

// 그룹별로 나누고 sort_order → created_at → id 순으로 정렬 (번호 배지는 이 순서의 index+1)
export function groupSites(rows: PortalSite[]): PortalSitesByGroup {
  const out: PortalSitesByGroup = { student: [], teacher: [] };
  for (const r of rows) {
    if (r.group === "student" || r.group === "teacher") out[r.group].push(r);
  }
  const cmp = (a: PortalSite, b: PortalSite) =>
    a.sortOrder - b.sortOrder ||
    a.createdAt.localeCompare(b.createdAt) ||
    a.id.localeCompare(b.id);
  out.student.sort(cmp);
  out.teacher.sort(cmp);
  return out;
}
