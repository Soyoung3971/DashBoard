import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/portal/validators";

// 관리자 모드 진입 (구현 지시서 4번)
// 비밀번호는 클라이언트 코드에 두지 않고, 서버에서 환경변수 ADMIN_PIN 과만 대조한다.

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// 무차별 대입 완화 — 같은 IP에서 10분 안에 5번 틀리면 10분 동안 막는다.
// (서버리스에서는 인스턴스별 메모리라 완벽하진 않지만, 짧은 PIN을 보호하는 최소 장치)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 5;
const globalForLogin = globalThis as unknown as {
  __portalLoginFails?: Map<string, { count: number; until: number }>;
};
const fails = (globalForLogin.__portalLoginFails ??= new Map());

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: "서버에 ADMIN_PIN 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "비밀번호를 입력하세요." }, { status: 400 });
  }

  const key = clientKey(req);
  const now = Date.now();
  const rec = fails.get(key);
  if (rec && rec.until > now && rec.count >= MAX_FAILS) {
    const min = Math.ceil((rec.until - now) / 60000);
    return NextResponse.json(
      { error: `비밀번호를 여러 번 틀렸습니다. ${min}분 후 다시 시도하세요.` },
      { status: 429 },
    );
  }

  if (!safeEqual(parsed.data.password, expected)) {
    const next =
      rec && rec.until > now
        ? { count: rec.count + 1, until: now + WINDOW_MS }
        : { count: 1, until: now + WINDOW_MS };
    fails.set(key, next);
    return NextResponse.json({ error: "비밀번호가 맞지 않습니다." }, { status: 401 });
  }

  fails.delete(key);
  const session = await getSession();
  session.portalAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
