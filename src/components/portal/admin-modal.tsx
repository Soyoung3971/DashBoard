"use client";

import { useState } from "react";
import type { PortalGroup, PortalSite } from "@/lib/portal/types";
import { SiteIcon } from "./icon";

/* ───────── 관리자 확인(비밀번호) 모달 ─────────
   비밀번호는 서버(/api/portal/auth/login)에서만 대조한다.
   열릴 때마다 폼을 새로 마운트해서 입력값·오류가 초기화되게 한다. */
export function PasswordModal({
  open,
  onClose,
  onSubmit,
  title = "관리자 확인",
  desc = "사이트를 추가·수정·삭제하려면 관리자 비밀번호를 입력하세요.",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<string | null>; // 실패 시 오류 문구
  title?: string;
  desc?: string;
}) {
  if (!open) return null;
  return (
    <div className="ov on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* key 로 열 때마다 폼을 새로 마운트 → 입력값·오류가 초기화된다 */}
      <PasswordForm key={title} onClose={onClose} onSubmit={onSubmit} title={title} desc={desc} />
    </div>
  );
}

function PasswordForm({
  onClose,
  onSubmit,
  title,
  desc,
}: {
  onClose: () => void;
  onSubmit: (password: string) => Promise<string | null>;
  title: string;
  desc: string;
}) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    const e = await onSubmit(pw);
    setBusy(false);
    if (e) setErr(e);
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="pwTitle">
      <h3 id="pwTitle">{title}</h3>
      <p className="desc">{desc}</p>
      <label htmlFor="pw">비밀번호</label>
      <input
        type="password"
        id="pw"
        autoComplete="off"
        autoFocus
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <div className="err">{err}</div>
      <div className="acts">
        <button type="button" className="ghost" onClick={onClose}>
          취소
        </button>
        <button type="button" className="primary" onClick={submit} disabled={busy}>
          확인
        </button>
      </div>
    </div>
  );
}

/* ───────── 사이트 추가/수정 모달 ─────────
   입력 항목 5개: 구분, 제목, 부서, 교사 이름, 링크 주소. 아이콘은 제목으로 자동 → 아래 미리보기에 실시간 표시. */
export type EditTarget = { group: PortalGroup; site: PortalSite | null };

export type SiteFormValues = {
  group: PortalGroup;
  title: string;
  dept: string;
  teacher: string;
  url: string;
};

export function EditModal({
  target,
  onClose,
  onSave,
}: {
  target: EditTarget | null; // null이면 닫힘
  onClose: () => void;
  onSave: (values: SiteFormValues, editing: PortalSite | null) => Promise<string | null>; // 실패 시 오류 문구
}) {
  if (!target) return null;
  return (
    <div className="ov on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* key 로 대상이 바뀔 때마다 폼을 새로 마운트 → 값이 초기화된다 */}
      <EditForm key={target.site?.id ?? `new-${target.group}`} target={target} onClose={onClose} onSave={onSave} />
    </div>
  );
}

function EditForm({
  target,
  onClose,
  onSave,
}: {
  target: EditTarget;
  onClose: () => void;
  onSave: (values: SiteFormValues, editing: PortalSite | null) => Promise<string | null>;
}) {
  const s = target.site;
  const [group, setGroup] = useState<PortalGroup>(target.group);
  const [title, setTitle] = useState(s?.title ?? "");
  const [dept, setDept] = useState(s?.dept ?? "");
  const [teacher, setTeacher] = useState(s?.teacher ?? "");
  const [url, setUrl] = useState(s?.url ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    const values: SiteFormValues = {
      group,
      title: title.trim(),
      dept: dept.trim(),
      teacher: teacher.trim(),
      url: url.trim(),
    };
    if (!values.title) {
      setErr("제목을 입력하세요.");
      return;
    }
    setBusy(true);
    const e = await onSave(values, s);
    setBusy(false);
    if (e) setErr(e);
  }

  const previewSub = [dept, teacher && `교사 ${teacher}`].filter(Boolean).join(" · ");

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edTitle">
      <h3 id="edTitle">{s ? "사이트 수정" : "사이트 추가"}</h3>
      <p className="desc">
        아이콘은 제목을 보고 자동으로 정해지고, 새로 추가한 사이트에는 2주 동안 NEW 표시가 붙습니다.
      </p>
      <label>구분</label>
      <div className="seg">
        {(["student", "teacher"] as const).map((g) => (
          <button key={g} type="button" className={group === g ? "on" : undefined} onClick={() => setGroup(g)}>
            {g === "student" ? "학생용" : "교사용"}
          </button>
        ))}
      </div>
      <label htmlFor="fT">웹사이트 제목</label>
      <input
        type="text"
        id="fT"
        placeholder="예) 방과후 특강 신청"
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="fD">부서</label>
      <input type="text" id="fD" placeholder="예) 교무부" value={dept} onChange={(e) => setDept(e.target.value)} />
      <label htmlFor="fN">교사 이름</label>
      <input type="text" id="fN" placeholder="예) 박소영" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
      <label htmlFor="fU">링크 주소</label>
      <input type="url" id="fU" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="prev">
        <SiteIcon title={title} />
        <div>
          <div className="pt">{title || "웹사이트 제목"}</div>
          <div className="ps">{previewSub || "부서 · 교사 이름"}</div>
        </div>
      </div>
      <div className="err">{err}</div>
      <div className="acts">
        <button type="button" className="ghost" onClick={onClose}>
          취소
        </button>
        <button type="button" className="primary" onClick={submit} disabled={busy}>
          저장
        </button>
      </div>
    </div>
  );
}
