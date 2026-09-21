"use client";

import { useState, type CSSProperties } from "react";
import type { PortalGroup, PortalSite } from "@/lib/portal/types";
import { SiteCard } from "./site-card";

type Props = {
  group: PortalGroup;
  sites: PortalSite[];
  admin: boolean;
  teacherUnlocked: boolean;
  onAdd: (group: PortalGroup) => void;
  onEdit: (site: PortalSite) => void;
  onDelete: (site: PortalSite) => void;
  onLockedClick: (site: PortalSite) => void;
  onReorder: (group: PortalGroup, ordered: PortalSite[]) => void;
};

const TITLE: Record<PortalGroup, string> = { student: "학생용", teacher: "교사용" };

// 섹션 하나(학생용/교사용): 헤더 + 카드 그리드 + (관리자 모드에서만 보이는) 추가 버튼
// 관리자 모드에서 카드를 드래그해 다른 카드 위에 놓으면 그 자리로 이동한다.
export function SectionGrid({ group, sites, admin, teacherUnlocked, onAdd, onEdit, onDelete, onLockedClick, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function reset() {
    setDragIndex(null);
    setOverIndex(null);
  }

  function drop(to: number) {
    const from = dragIndex;
    reset();
    if (from === null || from === to) return;
    const next = sites.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(group, next);
  }

  return (
    <section className={`sec ${group}`}>
      <div className="sec-head">
        <span className="bar" />
        <h2>{TITLE[group]}</h2>
        <span className="cnt">{sites.length}개</span>
      </div>
      <div className="grid">
        {sites.map((site, i) => (
          <SiteCard
            key={site.id}
            site={site}
            index={i}
            admin={admin}
            teacherUnlocked={teacherUnlocked}
            dragging={dragIndex === i}
            dragOver={overIndex === i && dragIndex !== null && dragIndex !== i}
            onEdit={onEdit}
            onDelete={onDelete}
            onLockedClick={onLockedClick}
            onDragStart={setDragIndex}
            onDragEnter={setOverIndex}
            onDragEnd={reset}
            onDrop={drop}
          />
        ))}
        <button
          type="button"
          className="add"
          style={{ "--d": sites.length } as CSSProperties}
          onClick={() => onAdd(group)}
        >
          <span>+</span>사이트 추가
        </button>
      </div>
    </section>
  );
}
