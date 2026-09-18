import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, portalSites } from "@/lib/db";
import { requirePortalAdmin } from "@/lib/portal/admin";
import { dbErrorMessage, listSites, nextSortOrder, toSite } from "@/lib/portal/sites";
import { siteInputSchema } from "@/lib/portal/validators";

export const dynamic = "force-dynamic";

const idSchema = z.uuid();

// 카드 수정 (관리자) — 구분이 바뀌면 목업처럼 새 그룹의 맨 뒤로 보낸다.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requirePortalAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const json = await req.json().catch(() => null);
  const parsed = siteInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." },
      { status: 400 },
    );
  }
  try {
    const [cur] = await db.select().from(portalSites).where(eq(portalSites.id, id)).limit(1);
    if (!cur) {
      return NextResponse.json({ error: "존재하지 않는 사이트입니다." }, { status: 404 });
    }
    const values: typeof parsed.data & { sortOrder?: number } = { ...parsed.data };
    if (cur.group !== parsed.data.group) {
      values.sortOrder = await nextSortOrder(parsed.data.group);
    }
    const [row] = await db
      .update(portalSites)
      .set(values)
      .where(eq(portalSites.id, id))
      .returning();
    return NextResponse.json({ ok: true, site: toSite(row), sites: await listSites() });
  } catch (e) {
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}

// 카드 삭제 (관리자)
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requirePortalAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!idSchema.safeParse(id).success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  try {
    await db.delete(portalSites).where(eq(portalSites.id, id));
    return NextResponse.json({ ok: true, sites: await listSites() });
  } catch (e) {
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}
