import { redirect } from "next/navigation";

// 이 저장소는 포털 전용 — 루트는 /portal 로 보낸다.
export default function Home() {
  redirect("/portal");
}
