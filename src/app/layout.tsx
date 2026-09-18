import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "동인고 스마트 포털",
  description: "부산 동인고등학교 선생님들이 만든 웹사이트 모음",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
