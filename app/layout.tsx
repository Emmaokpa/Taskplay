import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";   
import { GeistMono } from "geist/font/mono";   
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: "TaskPlay Nigeria | Turn Your Online Activity Into Real Cash Rewards",
  description: "The simplest way to make money online in Nigeria. Complete simple tasks like following social accounts and get paid instantly to your bank account. Join 15,000+ active earners today.",
  keywords: ["earn money online nigeria", "paid tasks nigeria", "make money with phone", "taskplay", "social mining nigeria", "cpa offers nigeria"],
  authors: [{ name: "TaskPlay Team" }],
  publisher: "TaskPlay Nigeria",
  openGraph: {
    title: "TaskPlay Nigeria - Monetize Your Online Activity",
    description: "Your phone is now your office. Complete simple gigs and get paid instantly to your bank account. The most trusted rewards platform in Nigeria.",
    url: "https://taskplay.ng",
    siteName: "TaskPlay",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskPlay Nigeria | Real Cash for Simple Tasks",
    description: "Turn your idle time into a consistent revenue stream. Join the elite earners community today.",
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TaskPlay',
  },
};

export const viewport = {
  themeColor: '#8b5cf6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased overflow-x-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
