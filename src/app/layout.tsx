import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sora = Sora({
  subsets: ["latin"],
  variable: '--font-sora', // Toto je stále klíčové
});

export const metadata: Metadata = {
  title: "StudentHub",
  description: "Platforma pro studenty a startupy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={sora.className}>
        <Header />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}