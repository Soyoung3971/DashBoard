// 아이콘: 제목 키워드로 자동 선택 — 목업(dongin-portal.html)의 P / MAP 로직 그대로 (16종 + 기본 globe)

export const ICON_PATHS = {
  apply:
    '<path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z"/><path d="M16 5h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2"/><path d="m9 13 2 2 4-4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M8 3v13"/>',
  lamp: '<path d="M8 3h8l3 8H5z"/><path d="M12 11v7"/><path d="M9 21h6"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3"/><path d="M12 17h.01"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  chart:
    '<path d="M3 20h18"/><rect x="5" y="11" width="3.5" height="6" rx="1"/><rect x="10.2" y="7" width="3.5" height="10" rx="1"/><rect x="15.5" y="13" width="3.5" height="4" rx="1"/>',
  trend: '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
  archive:
    '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/>',
  check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8.5 12 2.4 2.4L15.8 9.5"/>',
  food: '<path d="M6 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M8 13v8"/><path d="M17 3c-1.5 2-2 4-2 6s.7 3 2 3 2-1 2-3-.5-4-2-6z"/><path d="M17 12v9"/>',
  survey:
    '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h4"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  mega: '<path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5.4"/><path d="M18 20a6 6 0 0 0-2.5-4.9"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/>',
} as const;

export type IconKey = keyof typeof ICON_PATHS;

// 위에서부터 차례로 검사해 제목에 키워드가 처음 포함되는 항목의 아이콘을 쓴다.
export const ICON_MAP: ReadonlyArray<readonly [readonly string[], IconKey]> = [
  [["출결", "출석", "출석부"], "check"],
  [["급식", "식단", "도시락", "중식"], "food"],
  [["도서", "독서", "책", "도서관"], "book"],
  [["퀴즈", "게임", "배틀", "대회"], "quiz"],
  [["생기부", "기재", "기록", "작성", "행발", "세특"], "pen"],
  [["상담", "진학", "로드맵", "수시", "정시", "입시"], "compass"],
  [["성적", "분석", "통계", "모의고사", "수능"], "chart"],
  [["경쟁률", "모니터", "추이", "현황"], "trend"],
  [["아카이브", "자료", "저장소", "창고"], "archive"],
  [["설문", "조사", "수요", "투표", "의견"], "survey"],
  [["일정", "캘린더", "학사", "시간표"], "cal"],
  [["공지", "안내", "알림", "소식"], "mega"],
  [["동아리", "명단", "학생회", "모둠"], "users"],
  [["자습", "자기주도", "학습", "공부"], "lamp"],
  [["특강", "강좌", "수업", "방과후"], "book"],
  [["신청", "접수", "등록", "예약"], "apply"],
];

export function iconKey(title: string | null | undefined): IconKey {
  const s = title ?? "";
  for (const [keys, k] of ICON_MAP) if (keys.some((w) => s.includes(w))) return k;
  return "globe";
}
