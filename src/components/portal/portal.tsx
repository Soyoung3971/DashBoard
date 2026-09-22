"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PortalGroup, PortalSite, PortalSitesByGroup } from "@/lib/portal/types";
import { Header } from "./header";
import { SectionGrid } from "./section-grid";
import { EditModal, PasswordModal, type EditTarget, type SiteFormValues } from "./admin-modal";

type Props = {
  initialSites: PortalSitesByGroup;
  initialAdmin: boolean; // 세션 쿠키에 관리자 표시가 있으면 새로고침해도 관리자 모드 유지
  initialTeacherUnlocked: boolean; // 교사용 카드를 열람할 수 있는지 (새로고침해도 유지)
  loadError: string | null;
};

type ApiResult = { ok?: boolean; error?: string; sites?: PortalSitesByGroup };

async function api(path: string, init?: RequestInit): Promise<ApiResult> {
  try {
    const res = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    });
    const data = (await res.json().catch(() => ({}))) as ApiResult;
    if (!res.ok) return { error: data.error ?? `요청 실패 (${res.status})` };
    return data;
  } catch {
    return { error: "네트워크 오류" };
  }
}

export function Portal({ initialSites, initialAdmin, initialTeacherUnlocked, loadError }: Props) {
  const [sites, setSites] = useState<PortalSitesByGroup>(initialSites);
  const [admin, setAdmin] = useState(initialAdmin);
  const [teacherUnlocked, setTeacherUnlocked] = useState(initialTeacherUnlocked);
  const [pwOpen, setPwOpen] = useState(false);
  const [teacherPwOpen, setTeacherPwOpen] = useState(false);
  const pendingTeacherId = useRef<string | null>(null); // 잠금 해제 후 열어 줄, 방금 누른 카드
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  // ── 토스트 ── (서버에서 목록을 못 읽었으면 첫 화면부터 토스트를 띄운 채로 시작)
  const [toastMsg, setToastMsg] = useState(loadError ? `목록을 불러오지 못했어요 (${loadError})` : "");
  const [toastOn, setToastOn] = useState(Boolean(loadError));
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((m: string) => {
    setToastMsg(m);
    setToastOn(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 2600);
  }, []);
  useEffect(() => {
    if (!loadError) return;
    const h = setTimeout(() => setToastOn(false), 2600);
    return () => clearTimeout(h);
  }, [loadError]);

  // ── 관리자 진입/종료 ──
  function onGear() {
    if (admin) {
      exitAdmin();
      return;
    }
    setPwOpen(true);
  }

  async function exitAdmin() {
    setAdmin(false);
    await api("/api/portal/auth/logout", { method: "POST" });
  }

  async function tryPw(password: string): Promise<string | null> {
    const r = await api("/api/portal/auth/login", { method: "POST", body: JSON.stringify({ password }) });
    if (r.error) return r.error;
    setAdmin(true);
    setPwOpen(false);
    toast("관리자 모드입니다. 카드를 수정·삭제할 수 있어요.");
    return null;
  }

  // ── 교사용 카드 열람 (비밀번호) ──
  // 잠긴 교사용 카드를 누르면 어떤 카드였는지 기억해 두고 비밀번호 모달을 연다.
  function requestTeacher(site: PortalSite) {
    pendingTeacherId.current = site.id;
    setTeacherPwOpen(true);
  }

  async function tryTeacherPw(password: string): Promise<string | null> {
    const r = await api("/api/portal/auth/teacher", { method: "POST", body: JSON.stringify({ password }) });
    if (r.error) return r.error;
    setTeacherUnlocked(true);
    setTeacherPwOpen(false);
    if (r.sites) setSites(r.sites);
    // 방금 누른 카드를 새 탭으로 연다. (클릭 활성화가 잠깐 유지되어 팝업이 허용된다)
    const id = pendingTeacherId.current;
    pendingTeacherId.current = null;
    const url = id && r.sites ? r.sites.teacher.find((s) => s.id === id)?.url : "";
    if (url) {
      const w = window.open(url, "_blank");
      if (w) w.opener = null;
      else toast("교사용 잠금을 해제했어요. 카드를 다시 누르면 열립니다.");
    } else {
      toast("교사용 잠금을 해제했어요.");
    }
    return null;
  }

  // ── 추가 / 수정 / 삭제 ──
  function openAdd(group: PortalGroup) {
    setEditTarget({ group, site: null });
  }
  function openEdit(site: PortalSite) {
    setEditTarget({ group: site.group, site });
  }

  async function save(values: SiteFormValues, editing: PortalSite | null): Promise<string | null> {
    const r = editing
      ? await api(`/api/portal/sites/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await api("/api/portal/sites", { method: "POST", body: JSON.stringify(values) });
    if (r.error) {
      if (r.error.includes("관리자 확인")) setAdmin(false);
      return r.error;
    }
    if (r.sites) setSites(r.sites);
    setEditTarget(null);
    return null;
  }

  async function remove(site: PortalSite) {
    if (!window.confirm(`「${site.title}」을(를) 삭제할까요?`)) return;
    const r = await api(`/api/portal/sites/${site.id}`, { method: "DELETE" });
    if (r.error) {
      if (r.error.includes("관리자 확인")) setAdmin(false);
      toast(`저장하지 못했어요 (${r.error})`);
      return;
    }
    if (r.sites) setSites(r.sites);
  }

  // 드래그로 정한 순서를 화면에 먼저 반영하고, 서버에 저장한다. 실패하면 서버 목록으로 되돌린다.
  async function reorder(group: PortalGroup, ordered: PortalSite[]) {
    const before = sites;
    setSites({ ...sites, [group]: ordered.map((s, i) => ({ ...s, sortOrder: i + 1 })) });
    const r = await api("/api/portal/sites/reorder", {
      method: "PUT",
      body: JSON.stringify({ group, ids: ordered.map((s) => s.id) }),
    });
    if (r.error) {
      if (r.error.includes("관리자 확인")) setAdmin(false);
      setSites(before);
      toast(`순서를 저장하지 못했어요 (${r.error})`);
      return;
    }
    if (r.sites) setSites(r.sites);
  }

  return (
    <div className={`portal${admin ? " admin" : ""}`}>
      <div className="bg">
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="wrap">
        <Header admin={admin} onGear={onGear} onExitAdmin={exitAdmin} />
        <SectionGrid group="student" sites={sites.student} admin={admin} teacherUnlocked={teacherUnlocked} onAdd={openAdd} onEdit={openEdit} onDelete={remove} onLockedClick={requestTeacher} onReorder={reorder} />
        <SectionGrid group="teacher" sites={sites.teacher} admin={admin} teacherUnlocked={teacherUnlocked} onAdd={openAdd} onEdit={openEdit} onDelete={remove} onLockedClick={requestTeacher} onReorder={reorder} />
        <p className="foot">
          부산 동인고등학교 ·{" "}
          <a href="https://www.dongin.hs.kr" target="_blank" rel="noopener noreferrer">
            www.dongin.hs.kr
          </a>
        </p>
      </div>

      <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSubmit={tryPw} />
      <PasswordModal
        open={teacherPwOpen}
        onClose={() => setTeacherPwOpen(false)}
        onSubmit={tryTeacherPw}
        title="교사용 확인"
        desc="교사용 사이트를 열려면 비밀번호를 입력하세요."
      />
      <EditModal target={editTarget} onClose={() => setEditTarget(null)} onSave={save} />

      <div className={`toast${toastOn ? " on" : ""}`} role="status" aria-live="polite">
        {toastMsg}
      </div>
    </div>
  );
}
