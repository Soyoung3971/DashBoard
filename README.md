# 동인고 스마트 포털

학교 선생님들이 각자 만든 웹사이트를 한곳에 모아 보여주는 대시보드입니다.
`dongin-portal.html` 목업의 화면·색·애니메이션·문구를 그대로 옮겼고, 자기주도학습·특강 신청 사이트와
같은 기술 스택(Next.js App Router + Supabase Postgres + Drizzle + iron-session)을 씁니다.

- 공개 화면: `/portal` (루트 `/` 는 `/portal` 로 이동)
- 학생용 / 교사용 두 섹션, 카드 클릭 시 새 탭으로 이동
- 아이콘은 제목 키워드로 자동 선택(16종), NEW 배지는 등록 14일 이내
- 관리자 모드(오른쪽 위 톱니 → 비밀번호): 카드 추가 / 수정 / 삭제, 학생용↔교사용 이동

## 처음 설정하는 방법

1. **DB 만들기**: 자습·특강 사이트가 쓰는 기존 Supabase 프로젝트를 그대로 씁니다.
   Supabase 대시보드 → SQL Editor → `supabase_portal_setup.sql` 전체를 붙여넣고 Run
   (기존 테이블은 건드리지 않고 `portal_sites` 표 하나만 추가됩니다. 여러 번 실행해도 안전)
2. **환경 변수**: Vercel 프로젝트 설정에 아래 세 개 등록 (`.env.example` 참고)
   - `DATABASE_URL` : Supabase 연결 문자열 (Transaction Pooler 주소 권장) — 자습·특강 사이트와 같은 값
   - `SESSION_SECRET` : 아무 문자열 32자 이상 — 자습·특강 사이트와 같은 값
   - `ADMIN_PIN` : 관리자 모드 비밀번호 (8자 이상 권장)
3. **배포**: GitHub에 push하면 Vercel이 자동 배포
4. **운영 시작**: `/portal` → 톱니 → `ADMIN_PIN` 입력 → "+ 사이트 추가"로 카드 등록

## 관리자 인증 (구현 지시서 4번)

목업에는 비밀번호가 프런트엔드에 박혀 있었지만, 여기서는 **서버 라우트에서만** 대조합니다.

- `POST /api/portal/auth/login` 이 입력값을 환경변수 `ADMIN_PIN` 과 상수 시간 비교 → 맞으면
  iron-session 쿠키(`dongin_session`)에 `portalAdmin: true` 를 기록
- 카드 추가/수정/삭제 API(`/api/portal/sites*`)는 모두 이 세션 표시가 있어야 통과
- 클라이언트 번들에는 비밀번호 값이 남지 않음 (`ADMIN_PIN` 은 `NEXT_PUBLIC_` 이 아니므로 서버 전용)
- 같은 IP에서 10분에 5번 틀리면 10분 동안 잠금 (서버리스 인스턴스별 메모리 기준의 최소 장치)
- 자습·특강 사이트의 `admin` 계정으로 로그인한 세션도 포털 관리자로 인정 (`isPortalAdmin`)
- DB의 `portal_sites` 는 RLS 로 익명 읽기만 허용. 쓰기 정책은 두지 않아 anon 키로는 수정 불가

## 기존 자습·특강 프로젝트에 합칠 때

이 저장소는 단독으로도 돌아가지만, 파일들은 기존 프로젝트에 그대로 옮겨 넣을 수 있게 나눠 두었습니다.

| 옮길 것 | 위치 | 비고 |
|---|---|---|
| 화면 | `src/app/portal/` | `layout.tsx` 가 글꼴과 `portal.css` 를 불러옴 |
| API | `src/app/api/portal/` | 로그인/로그아웃, 목록/추가/수정/삭제 |
| 컴포넌트 | `src/components/portal/` | `Header` · `SectionGrid` · `SiteCard` · `AdminModal` + `portal.css` |
| 로직 | `src/lib/portal/` | 아이콘 규칙, 검증, DB 조회 |
| 스키마 | `src/lib/db/schema.ts` 의 `portalSites` | 기존 schema.ts 에 이 테이블 정의만 추가 |
| 세션 | `src/lib/session.ts` | 기존 파일은 그대로 두고 `SessionData` 에 `portalAdmin?: boolean` 과 `isPortalAdmin()` 만 추가 |
| 마크 이미지 | `public/portal/mark.png` | |
| SQL | `supabase_portal_setup.sql` | |

- 포털 CSS 는 전부 `.portal` 아래로 한정되어 있어 기존 페이지의 스타일과 섞이지 않습니다.
- 기존 루트 `layout.tsx` 의 `<HomeButton />` 은 `/portal` 에서는 숨기는 편이 좋습니다
  (포털은 왼쪽 위에 자체 홈 버튼이 있음). 예: `if (pathname === "/" || pathname.startsWith("/portal")) return null;`

## 개발 실행

```bash
npm install
cp .env.example .env.local   # 값 채우기
npm run dev
```

http://localhost:3000/portal 에서 확인합니다. `npm run lint`, `npm run typecheck`, `npm run build` 로 검사합니다.
