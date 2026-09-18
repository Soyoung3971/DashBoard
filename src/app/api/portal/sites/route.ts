import { NextResponse } from "next/server";
import { db, portalSites } from "@/lib/db";
import { requirePortalAdmin } from "@/lib/portal/admin";
import { dbErrorMessage, listSites, nextSortOrder, toSite } from "@/lib/portal/sites";
import { siteInputSchema } from "@/lib/portal/validators";

export const dynamic = "force-dynamic";

// 목록 (누구나)
export async function GET() {
  try {
    return NextResponse.json({ sites: await listSites() });
  } catch (e) {
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}

// 카드 추가 (관리자)
export async function POST(req: Request) {
  const denied = await requirePortalAdmin();
  if (denied) return denied;

  const json = await req.json().catch(() => null);
  const parsed = siteInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." },
      { status: 400 },
    );
  }
  try {
    const sortOrder = await nextSortOrder(parsed.data.group);
    const [row] = await db
      .insert(portalSites)
      .values({ ...parsed.data, sortOrder })
      .returning();
    return NextResponse.json({ ok: true, site: toSite(row), sites: await listSites() });
  } catch (e) {
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}
