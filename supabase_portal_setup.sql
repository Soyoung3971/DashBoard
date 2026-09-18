-- ============================================================
-- 동인고 스마트 포털 DB 설치 SQL (자습·특강 사이트와 같은 Supabase 프로젝트에 추가)
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ★ 기존 테이블(students, teachers, lectures …)은 아무것도 건드리지 않고 portal_sites 만 추가합니다.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "portal_sites" (
  "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "group"      text NOT NULL CHECK ("group" IN ('student', 'teacher')),  -- 학생용 / 교사용
  "title"      text NOT NULL,                                              -- 웹사이트 큰 제목
  "dept"       text NOT NULL DEFAULT '',                                   -- 부서
  "teacher"    text NOT NULL DEFAULT '',                                   -- 교사 이름 (화면에서 "교사 " 접두)
  "url"        text NOT NULL DEFAULT '',                                   -- 링크 주소
  "sort_order" integer NOT NULL DEFAULT 0,                                 -- 카드 순서 (번호 배지는 화면에서 1부터 다시 매김)
  "created_at" timestamptz NOT NULL DEFAULT now()                          -- NEW 배지 판정 (14일)
);

CREATE INDEX IF NOT EXISTS "portal_sites_group_sort_idx" ON "portal_sites" ("group", "sort_order");

-- RLS: 익명 사용자는 읽기만. 쓰기는 서버 라우트(관리자 세션 확인 후, DATABASE_URL 의 서비스 접속)로만 한다.
ALTER TABLE "portal_sites" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "portal_sites_public_read" ON "portal_sites";
CREATE POLICY "portal_sites_public_read" ON "portal_sites"
  FOR SELECT TO anon, authenticated USING (true);
-- insert/update/delete 정책은 일부러 만들지 않는다 → anon/authenticated 키로는 수정 불가.

-- (선택) 목업에 있던 예시 카드. 실제 주소로 바꿔서 쓰거나, 관리자 모드에서 직접 추가해도 된다.
-- INSERT INTO "portal_sites" ("group","title","dept","teacher","url","sort_order") VALUES
--   ('student','2026학년도 자기주도학습 온라인 신청','학년부','박소영','https://example.com/self-study',1),
--   ('student','방과후 특강 신청','교무부','김○○','https://example.com/teukgang',2),
--   ('teacher','생기부 작성 도우미','교무부','박소영','https://example.com/saengbu',1);
