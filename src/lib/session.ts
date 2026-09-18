import "server-only";
import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";

// 자습·특강 사이트의 src/lib/session.ts 와 같은 쿠키(dongin_session)·비밀키(SESSION_SECRET)를 쓴다.
// 기존 프로젝트에 합칠 때는 이 파일을 통째로 두지 말고, 기존 SessionData 에
// `portalAdmin?: boolean` 한 줄만 추가하면 된다.
export type SessionData = {
  role?: "student" | "teacher" | "admin";
  name?: string;
  // 스마트 포털 관리자 모드 (ADMIN_PIN 확인 후 true)
  portalAdmin?: boolean;
};

const password =
  process.env.SESSION_SECRET ??
  "dev-only-insecure-password-please-change-me-0000"; // 최소 32자

export const sessionOptions = {
  password,
  cookieName: "dongin_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8시간
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// 포털 관리자 여부 — PIN으로 들어왔거나, 기존 사이트의 admin 계정으로 로그인한 경우
export function isPortalAdmin(session: SessionData): boolean {
  return session.portalAdmin === true || session.role === "admin";
}
