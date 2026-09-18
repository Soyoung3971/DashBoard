import "server-only";
import { NextResponse } from "next/server";
import { getSession, isPortalAdmin } from "@/lib/session";

// 관리자 전용 API 공통 가드 — 세션 쿠키에 포털 관리자 표시가 있어야 통과
export async function requirePortalAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!isPortalAdmin(session)) {
    return NextResponse.json({ error: "관리자 확인이 필요합니다." }, { status: 401 });
  }
  return null;
}
