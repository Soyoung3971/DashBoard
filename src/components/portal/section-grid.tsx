"use client";

import type { CSSProperties } from "react";
import type { PortalGroup, PortalSite } from "@/lib/portal/types";
import { SiteCard } from "./site-card";

type Props = {
  group: PortalGroup;
  sites: PortalSite[];
  admin: boolean;
  onAdd: (group: PortalGroup) => void;
  onEdit: (site: PortalSite) => void;
  onDelete: (site: PortalSite) => void;
};

const TITLE: Record<PortalGroup, string> = { student: "학생용", teacher: "교사용" };

// 섹션 하나(학생용/교사용): 헤더 + 카드 그리드 + (관리자 모드에서만 보이는) 추가 버튼
export function SectionGrid({ group, sites, admin, onAdd, onEdit, onDelete }: Props) {
  return (
    <section className={`sec ${group}`}>
      <div className="sec-head">
        <span className="bar" />
        <h2>{TITLE[group]}</h2>
        <span className="cnt">{sites.length}개</span>
      </div>
      <div className="grid">
        {sites.map((site, i) => (
          <SiteCard key={site.id} site={site} index={i} admin={admin} onEdit={onEdit} onDelete={onDelete} />
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
