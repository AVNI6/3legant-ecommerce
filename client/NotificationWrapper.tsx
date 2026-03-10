"use client";

import dynamic from "next/dynamic";

const NotificationBar = dynamic(
  () => import("@/components/NotificationBar"),
  { ssr: false }
);

export default function NotificationWrapper() {
  return <NotificationBar />;
}