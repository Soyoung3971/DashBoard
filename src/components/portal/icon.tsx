import { ICON_PATHS, iconKey } from "@/lib/portal/icons";

// 제목을 받아 자동 선택된 아이콘 SVG를 그린다. (경로 문자열은 코드 안의 상수만 사용)
export function SiteIcon({ title }: { title: string }) {
  const key = iconKey(title);
  return (
    <div className="ic">
      <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON_PATHS[key] }} />
    </div>
  );
}
