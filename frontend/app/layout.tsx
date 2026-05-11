import type { Metadata } from "next";
<<<<<<< HEAD
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builders Circle — b2venture",
  description: "Co-founder matchmaking platform",
=======
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builders' Circle — Internal · b2venture",
  description: "Internal DRI dashboard for the b2venture investment team.",
>>>>>>> origin/feat/amat
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body style={{ margin: 0, background: "var(--gray-50)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Nav />
        <main style={{ paddingTop: 52, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px" }}>
=======
      <body style={{ background: "var(--bg-soft)", minHeight: "100vh", margin: 0 }}>
        <Sidebar />
        <main style={{ marginLeft: 220, minHeight: "100vh" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 40px" }}>
>>>>>>> origin/feat/amat
            {children}
          </div>
        </main>
      </body>
    </html>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/feat/amat
