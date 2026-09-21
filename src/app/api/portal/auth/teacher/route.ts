import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/portal/validators";
import { PORTAL_TEACHER_PASSWORD } from "@/lib/portal/auth-constants";
import { listSites } from "@/lib/portal/sites";

export const dynamic = "force-dynamic";

// 교사용 카드 열람 — 비밀번호를 서버에서만 대조하고, 맞으면 세션에 교사 열람 표시를 남긴다.
// 관리자 비밀번호와 값은 같지만 이 표시는 편집 권한을 주지 않는다(portalAdmin 과 별개).
// 성공하면 교사용 실제 URL이 담긴 전체 목록을 함께 돌려줘 화면이 바로 카드를 열 수 있게 한다.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "비밀번호를 입력하세요." }, { status: 400 });
  }
  if (parsed.data.password !== PORTAL_TEACHER_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }
  const session = await getSession();
  session.portalTeacher = true;
  await session.save();
  try {
    return NextResponse.json({ ok: true, sites: await listSites() });
  } catch {
    // 잠금은 풀렸다. 목록을 못 읽었어도 다음 새로고침에 URL이 반영된다.
    return NextResponse.json({ ok: true });
  }
}
