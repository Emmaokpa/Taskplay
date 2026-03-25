import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";   
import { GeistMono } from "geist/font/mono";   
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/app/components/AppShell";

export const metadata: Metadata = {
  title: "People Are Getting Paid Daily… Why Aren’t You? | TaskPlay Nigeria",
  description: "Join thousands earning real money by completing simple tasks online. No experience. No stress. Just results. The most trusted rewards platform for Nigerians.",
  keywords: ["earn money online nigeria", "paid tasks nigeria", "make money with phone", "taskplay", "social mining nigeria", "cpa offers nigeria"],
  authors: [{ name: "TaskPlay Team" }],
  publisher: "TaskPlay Nigeria",
  openGraph: {
    title: "Start Earning Daily with TaskPlay Nigeria",
    description: "Your phone is now your office. Complete simple gigs and get paid instantly to your bank account.",
    url: "https://taskplay.ng",
    siteName: "TaskPlay",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskPlay - Legit Earning for Nigerians",
    description: "Stop searching, start earning. Join the elite earners community today.",
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
