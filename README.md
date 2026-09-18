# 동인고 스마트 포털

학교 선생님들이 각자 만든 웹사이트를 한곳에 모아 보여주는 대시보드입니다.
`dongin-portal.html` 목업의 화면·색·애니메이션·문구를 그대로 옮겼고, 자기주도학습·특강 신청 사이트와
같은 기술 스택(Next.js App Router + Supabase Postgres + Drizzle + iron-session)을 씁니다.

- 공개 화면: `/portal` (루트 `/` 는 `/portal` 로 이동)
- 학생용 / 교사용 두 섹션, 카드 클릭 시 새 탭으로 이동
- 아이콘은 제목 키워드로 자동 선택(16종), NEW 배지는 등록 14일 이내
- 관리자 모드(오른쪽 위 톱니 → 비밀번호 12116): 카드 추가 / 수정 / 삭제, 학생용↔교사용 이동, 드래그로 순서 변경

## 처음 설정하는 방법 (처음 하는 분 기준으로 차근차근)

**1단계. Supabase 에 표 만들기** (한 번만)
1. https://supabase.com 에 로그인 → 자습·특강 사이트가 쓰는 프로젝트를 클릭
2. 왼쪽 메뉴에서 **SQL Editor** → **New query**
3. 이 저장소의 `supabase_portal_setup.sql` 파일을 열어 내용 전체를 복사해 붙여넣고 **Run**
4. 아래에 "Success" 가 나오면 끝. (기존 표는 건드리지 않고 `portal_sites` 표 하나만 생김. 두 번 실행해도 괜찮음)

**2단계. Supabase 연결 주소 복사하기**
1. Supabase 프로젝트 → 위쪽 **Connect** 버튼 → **Transaction pooler** 탭
2. `postgresql://postgres.xxxx:[YOUR-PASSWORD]@…:6543/postgres` 형태의 주소를 복사
3. `[YOUR-PASSWORD]` 자리를 DB 비밀번호로 바꿔 둔다 (자습·특강 사이트 Vercel 에 이미 넣어 둔 `DATABASE_URL` 값과 같으니 거기서 복사해도 됨)

**3단계. Vercel 에 배포하기**
1. https://vercel.com → **Add New… → Project** → GitHub 의 `DashBoard` 저장소 **Import**
2. **Environment Variables** 칸에 두 개 추가
   - `DATABASE_URL` = 2단계에서 만든 주소
   - `SESSION_SECRET` = 아무 글자 32자 이상 (자습·특강 사이트와 같은 값을 쓰면 관리자 로그인이 공유됨)
3. **Deploy** → 1~2분 뒤 주소가 나옴. `https://<주소>/portal` 로 접속

**4단계. 카드 등록하기**
1. `/portal` 접속 → 오른쪽 위 톱니 → 비밀번호 **12116** → 확인
2. "+ 사이트 추가" 로 제목·부서·교사 이름·링크 입력 → 저장 (아이콘은 제목 보고 자동)
3. 카드를 마우스로 끌어다 놓으면 순서가 바뀜. 연필은 수정, 휴지통은 삭제
4. 다 했으면 왼쪽 위 노란 "관리자 모드 ✕" 를 눌러 나가기

## 관리자 모드 동작

- 비밀번호는 `12116` 으로 고정 (`src/lib/portal/auth-constants.ts`). 바꾸고 싶으면 그 파일의 값만 고쳐서 push
- 비밀번호는 서버에서만 대조하므로 브라우저로 내려가는 코드에는 들어 있지 않음
- 맞으면 8시간짜리 세션 쿠키에 관리자 표시를 남기고, 추가/수정/삭제/순서 저장 API 는 그 표시가 있어야 통과
- 카드 순서: 관리자 모드에서 카드를 드래그해 다른 카드 위에 놓으면 그 자리로 이동하고 바로 저장됨 (PC 마우스 기준)
- DB 의 `portal_sites` 는 RLS 로 익명 읽기만 허용. 쓰기 정책은 두지 않아 anon 키로는 수정 불가

## 기존 자습·특강 프로젝트에 합칠 때

이 저장소는 단독으로도 돌아가지만, 파일들은 기존 프로젝트에 그대로 옮겨 넣을 수 있게 나눠 두었습니다.

| 옮길 것 | 위치 | 비고 |
|---|---|---|
| 화면 | `src/app/portal/` | `layout.tsx` 가 글꼴과 `portal.css` 를 불러옴 |
| API | `src/app/api/portal/` | 로그인/로그아웃, 목록/추가/수정/삭제/순서 저장 |
| 컴포넌트 | `src/components/portal/` | `Header` · `SectionGrid` · `SiteCard` · `AdminModal` + `portal.css` |
| 로직 | `src/lib/portal/` | 아이콘 규칙, 검증, DB 조회, 관리자 비밀번호 |
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
cp .env.example .env.local   # DATABASE_URL, SESSION_SECRET 채우기
npm run dev
```

http://localhost:3000/portal 에서 확인합니다. `npm run lint`, `npm run typecheck`, `npm run build` 로 검사합니다.
