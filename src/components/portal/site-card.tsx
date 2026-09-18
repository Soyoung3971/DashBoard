"use client";

import type { CSSProperties, DragEvent } from "react";
import { isNewSite, type PortalSite } from "@/lib/portal/types";
import { SiteIcon } from "./icon";

type Props = {
  site: PortalSite;
  index: number; // 그룹 안 순서 (0부터) — 번호 배지는 index+1
  admin: boolean;
  dragging: boolean; // 지금 끌고 있는 카드
  dragOver: boolean; // 끌고 있는 카드를 올려놓은 자리
  onEdit: (site: PortalSite) => void;
  onDelete: (site: PortalSite) => void;
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
  dragging,
  dragOver,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: Props) {
  const sub = [site.dept, site.teacher && `교사 ${site.teacher}`].filter(Boolean).join(" · ");
  const cls = ["card", dragging && "dragging", dragOver && "drag-over"].filter(Boolean).join(" ");

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
        if (admin) e.preventDefault();
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
      {isNewSite(site) && <span className="new">NEW</span>}
      <SiteIcon title={site.title} />
      <div className="t">{site.title}</div>
      <div className="s">{sub}</div>
      {admin && <span className="drag-tip">드래그하면 순서 변경 가능합니다.</span>}
    </a>
  );
}
