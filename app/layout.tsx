import type { Metadata } from "next";
import { Inter, Tiro_Devanagari_Sanskrit } from "next/font/google";
import Nav from "@/components/Nav";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const tiro = Tiro_Devanagari_Sanskrit({
  weight: "400",
  subsets: ["devanagari", "latin", "latin-ext"],
  variable: "--font-tiro",
});

export const metadata: Metadata = {
  title: "Saṃskṛtam — Learn Sanskrit",
  description: "Learn the Devanagari alphabet, vocabulary, grammar and shlokas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${tiro.variable}`}>
      <body className="min-h-screen">
        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:pt-10 md:pb-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
