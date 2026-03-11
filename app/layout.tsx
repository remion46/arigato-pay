import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "arigato-pay",
  description: "二人の感謝を可視化するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
