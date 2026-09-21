import "server-only";

// 관리자 모드 비밀번호 (포털 특성상 고정값 사용).
// 이 파일은 서버에서만 불러오므로(server-only) 브라우저로 내려가는 코드에는 포함되지 않는다.
export const PORTAL_ADMIN_PASSWORD = "12116";

// 교사용 카드 열람 비밀번호 (요청에 따라 관리자와 같은 값). 마찬가지로 서버에서만 대조한다.
// 이 표시는 카드 열람만 허용하고, 편집(추가·수정·삭제) 권한은 주지 않는다.
export const PORTAL_TEACHER_PASSWORD = "12116";
