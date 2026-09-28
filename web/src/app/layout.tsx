import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Job Hunting Agent — Personal AI Assistant",
  description: "Automated Job Scouting, Matching, and Truth-Preserving CV Optimizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body
        className="antialiased selection:bg-terracotta-soft selection:text-terracotta-accent"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
