import { getSession, isPortalAdmin } from "@/lib/session";
import { listSites } from "@/lib/portal/sites";
import { Portal } from "@/components/portal/portal";
import type { PortalSitesByGroup } from "@/lib/portal/types";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await getSession();
  let sites: PortalSitesByGroup = { student: [], teacher: [] };
  let loadError: string | null = null;
  try {
    sites = await listSites();
  } catch (e) {
    // DB가 아직 준비되지 않았어도 화면은 뜨게 하고, 원인은 토스트로 알린다.
    loadError = e instanceof Error ? e.message : String(e);
  }
  return <Portal initialSites={sites} initialAdmin={isPortalAdmin(session)} loadError={loadError} />;
}
