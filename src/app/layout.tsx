import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Define fonts (renamed for clarity as per Next.js 14+ conventions)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define metadata for your website
export const metadata: Metadata = {
  title: "Profitability Dashboard",
  description:
    "A powerful tool to predict and analyze profitability using XGBoost models for aviation data.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Profitability Dashboard",
    description:
      "Analyze and optimize aviation profitability with advanced machine learning.",
    url: "https://dashboard.bhaweshagrawal.com.np",
    siteName: "Profitability Dashboard",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
