import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builders' Circle — Internal · b2venture",
  description: "Internal DRI dashboard for the b2venture investment team.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg-soft)", minHeight: "100vh", margin: 0 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 40px" }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
