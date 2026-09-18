import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// 스마트 포털에 올라가는 웹사이트 카드 (구현 지시서 2번)
// 번호 배지는 DB에 저장하지 않고, 그룹 안에서 sort_order 로 정렬한 뒤 1부터 다시 매긴다.
export const portalSites = pgTable("portal_sites", {
  id: uuid("id").primaryKey().defaultRandom(),
  group: text("group").notNull(), // 'student' | 'teacher'
  title: text("title").notNull(), // 웹사이트 큰 제목
  dept: text("dept").notNull().default(""), // 부서
  teacher: text("teacher").notNull().default(""), // 교사 이름 (표시할 때 "교사 " 접두)
  url: text("url").notNull().default(""), // 링크 주소
  sortOrder: integer("sort_order").notNull().default(0), // 정렬용
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), // NEW 배지 판정
});

export type PortalSiteRow = typeof portalSites.$inferSelect;
