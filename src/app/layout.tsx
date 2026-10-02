import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sagara Dhwani · Taluk Channel Network", template: "%s · TCN" },
  description: "Every taluk publishes every day. Pilot: Sagara, Shimoga district.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}
