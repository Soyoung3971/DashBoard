import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/portal/validators";
import { PORTAL_ADMIN_PASSWORD } from "@/lib/portal/auth-constants";

// 관리자 모드 진입 — 비밀번호는 서버에서만 대조하고, 맞으면 세션 쿠키에 관리자 표시를 남긴다.
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "비밀번호를 입력하세요." }, { status: 400 });
  }
  if (parsed.data.password !== PORTAL_ADMIN_PASSWORD) {
    return NextResponse.json({ error: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }
  const session = await getSession();
  session.portalAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
