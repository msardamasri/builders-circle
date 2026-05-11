import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builders' Circle — b2venture",
  description:
    "An invite-only program by b2venture for ambitious European founders looking for their co-founder.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PublicNav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
