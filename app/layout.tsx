import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkTrack — Employee Time Tracker",
  description: "Track employee hours, tasks, and productivity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#f5f5f7] antialiased font-system">{children}</body>
    </html>
  );
}
