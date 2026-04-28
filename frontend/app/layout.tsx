import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Builders Circle — b2venture",
  description: "Co-founder matchmaking platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen`} style={{ backgroundColor: "#f9fafb" }}>
        <Nav />
        <main className="ml-56 min-h-screen">
          <div className="max-w-5xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}