"use client";

import type { CSSProperties, DragEvent } from "react";
import { isNewSite, type PortalSite } from "@/lib/portal/types";
import { SiteIcon } from "./icon";

type Props = {
  site: PortalSite;
  index: number; // 그룹 안 순서 (0부터) — 번호 배지는 index+1
  admin: boolean;
  teacherUnlocked: boolean; // 교사용 카드를 열람할 수 있는지
  dragging: boolean; // 지금 끌고 있는 카드
  dragOver: boolean; // 끌고 있는 카드를 올려놓은 자리
  onEdit: (site: PortalSite) => void;
  onDelete: (site: PortalSite) => void;
  onLockedClick: (site: PortalSite) => void; // 잠긴 교사용 카드를 눌렀을 때 (비밀번호 요청)
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
};

// 왼쪽 위 번호 배지, 오른쪽 위 NEW 배지, 가운데 아이콘 → 큰 제목 → "부서 · 교사 이름". 클릭 시 새 탭.
// 관리자 모드에서는 카드를 드래그해 같은 그룹 안에서 순서를 바꿀 수 있다.
export function SiteCard({
  site,
  index,
  admin,
  teacherUnlocked,
  dragging,
  dragOver,
  onEdit,
  onDelete,
  onLockedClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: Props) {
  const sub = [site.dept, site.teacher && `교사 ${site.teacher}`].filter(Boolean).join(" · ");
  // 교사용 카드는 비밀번호 열람 전까지 잠긴다(관리자는 예외). 잠금 상태에선 URL도 비어 있다.
  const locked = site.group === "teacher" && !admin && !teacherUnlocked;
  const cls = ["card", locked && "locked", dragging && "dragging", dragOver && "drag-over"]
    .filter(Boolean)
    .join(" ");

  function handleDragStart(e: DragEvent<HTMLAnchorElement>) {
    if (!admin) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", site.id);
    onDragStart(index);
  }

  return (
    <a
      className={cls}
      style={{ "--d": index } as CSSProperties}
      href={site.url || "#"}
      target="_blank"
      rel="noopener"
      draggable={admin}
      onClick={(e) => {
        if (admin) {
          e.preventDefault();
          return;
        }
        if (locked) {
          e.preventDefault(); // 링크로 이동하지 않고 비밀번호부터 받는다
          onLockedClick(site);
        }
      }}
      onDragStart={handleDragStart}
      onDragEnter={(e) => {
        if (!admin) return;
        e.preventDefault();
        onDragEnter(index);
      }}
      onDragOver={(e) => {
        if (!admin) return;
        e.preventDefault(); // 놓을 수 있게 허용
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        if (!admin) return;
        e.preventDefault();
        onDrop(index);
      }}
      onDragEnd={onDragEnd}
    >
      <div className="tools">
        <button
          type="button"
          className="tool ed"
          title="수정"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(site);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
          </svg>
        </button>
        <button
          type="button"
          className="tool del"
          title="삭제"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(site);
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 7h16" />
            <path d="M9 7V5h6v2" />
            <path d="M6 7l1 13h10l1-13" />
          </svg>
        </button>
      </div>
      <span className="num">{index + 1}</span>
      {locked ? (
        <span className="lock" title="비밀번호가 필요합니다" aria-label="비밀번호가 필요합니다">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
      ) : (
        isNewSite(site) && <span className="new">NEW</span>
      )}
      <SiteIcon title={site.title} />
      <div className="t">{site.title}</div>
      <div className="s">{sub}</div>
      {admin && <span className="drag-tip">드래그하면 순서 변경 가능합니다.</span>}
    </a>
  );
}
