import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BugReportButton } from "@/components/BugReportButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Detox AI - Clean thinking. Powerful answers.",
  description:
    "A premium AI workspace for thinking, coding, studying, writing, and building.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/detox-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <BugReportButton />
      </body>
    </html>
  );
}
