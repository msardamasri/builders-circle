import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builders Circle — b2venture",
  description: "Co-founder matchmaking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "var(--gray-50)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Nav />
        <main style={{ paddingTop: 52, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}