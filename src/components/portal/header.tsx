"use client";

import Image from "next/image";

type Props = {
  admin: boolean;
  onGear: () => void;
  onExitAdmin: () => void;
};

// 왼쪽 위 홈(맨 위로), 가운데 동인고 마크 + 제목, 오른쪽 위 톱니(관리자). 부제 없음.
export function Header({ admin, onGear, onExitAdmin }: Props) {
  return (
    <div className="top">
      <a
        className="logo"
        href="#"
        title="홈"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5 12 4l9 6.5" />
          <path d="M5 10v9h14v-9" />
          <path d="M9.5 19v-5h5v5" />
        </svg>
      </a>
      <div className="lockup">
        <Image className="mark" alt="동인고 마크" src="/portal/mark.png" width={265} height={133} priority />
        <h1>
          <span className="w">동인고</span> <span className="w">스마트&nbsp;포털</span>
        </h1>
      </div>
      <button type="button" className="admin-chip" onClick={onExitAdmin}>
        관리자 모드 ✕
      </button>
      <button type="button" className="gear" title={admin ? "관리자 모드 종료" : "관리자 모드"} onClick={onGear}>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 15H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.8 4.3V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.1.9z" />
        </svg>
      </button>
    </div>
  );
}
