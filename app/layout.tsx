import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "0GP Race",
  description:
    "Compete in timed Old School RuneScape GP races with automatic wealth tracking, fair-play protections and live multiplayer standings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
