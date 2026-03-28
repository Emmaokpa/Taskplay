import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";   
import { GeistMono } from "geist/font/mono";   
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AppShell from "@/app/components/AppShell";
import AmbientBackground from "@/app/components/AmbientBackground";

export const metadata: Metadata = {
  title: "TaskPlay Nigeria | Easiest Way To Earn Daily Cash Rewards",
  description: "The most trusted way to earn daily in Nigeria. Complete simple social tasks like following accounts and get paid instantly to your bank account.",
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
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

  return (
    <html lang="en">
      <head>
        {pixelId && (
          <>
            <Script
              id="fb-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${pixelId}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased overflow-x-hidden bg-[#05070A]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AmbientBackground />
          <AppShell>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
