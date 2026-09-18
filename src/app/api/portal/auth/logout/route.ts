import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// 관리자 모드 종료 — 포털 관리자 표시만 지우고, 같은 쿠키에 있는 다른 로그인 정보(자습·특강)는 그대로 둔다.
export async function POST() {
  const session = await getSession();
  if (session.portalAdmin) {
    delete session.portalAdmin;
    await session.save();
  }
  return NextResponse.json({ ok: true });
}
