import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, portalSites } from "@/lib/db";
import { requirePortalAdmin } from "@/lib/portal/admin";
import { dbErrorMessage, listSites } from "@/lib/portal/sites";
import { PORTAL_GROUPS } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

const reorderSchema = z.object({
  group: z.enum(PORTAL_GROUPS),
  ids: z.array(z.uuid()).min(1).max(200),
});

// 카드 순서 저장 (관리자) — 드래그로 정한 순서대로 sort_order 를 1부터 다시 매긴다.
export async function PUT(req: Request) {
  const denied = await requirePortalAdmin();
  if (denied) return denied;

  const json = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }
  const { group, ids } = parsed.data;
  try {
    await db.transaction(async (tx) => {
      for (const [i, id] of ids.entries()) {
        await tx
          .update(portalSites)
          .set({ sortOrder: i + 1 })
          .where(and(eq(portalSites.id, id), eq(portalSites.group, group)));
      }
    });
    return NextResponse.json({ ok: true, sites: await listSites() });
  } catch (e) {
    return NextResponse.json({ error: dbErrorMessage(e) }, { status: 500 });
  }
}
