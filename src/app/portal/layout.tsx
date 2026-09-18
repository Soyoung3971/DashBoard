import type { Metadata } from "next";
import "@/components/portal/portal.css";

export const metadata: Metadata = {
  title: "동인고 스마트 포털",
  description: "부산 동인고등학교 선생님들이 만든 웹사이트 모음",
};

// 목업과 같은 글꼴(Noto Sans KR, Do Hyeon). React 19가 <link>를 <head>로 끌어올린다.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- 포털 화면에서만 쓰는 글꼴 */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Do+Hyeon&display=swap"
        precedence="default"
      />
      {children}
    </>
  );
}
