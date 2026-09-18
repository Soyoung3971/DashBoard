"use client";

import type { CSSProperties } from "react";
import { isNewSite, type PortalSite } from "@/lib/portal/types";
import { SiteIcon } from "./icon";

type Props = {
  site: PortalSite;
  index: number; // 그룹 안 순서 (0부터) — 번호 배지는 index+1
  admin: boolean;
  onEdit: (site: PortalSite) => void;
  onDelete: (site: PortalSite) => void;
};

// 왼쪽 위 번호 배지, 오른쪽 위 NEW 배지, 가운데 아이콘 → 큰 제목 → "부서 · 교사 이름". 클릭 시 새 탭.
export function SiteCard({ site, index, admin, onEdit, onDelete }: Props) {
  const sub = [site.dept, site.teacher && `교사 ${site.teacher}`].filter(Boolean).join(" · ");
  return (
    <a
      className="card"
      style={{ "--d": index } as CSSProperties}
      href={site.url || "#"}
      target="_blank"
      rel="noopener"
      onClick={(e) => {
        if (admin) e.preventDefault();
      }}
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
    </a>
  );
}
