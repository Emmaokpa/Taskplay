import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";   // Changed to named import
import { GeistMono } from "geist/font/mono";   // Named import for mono
import "./globals.css";
import Link from "next/link"; // Import Link
import Script from "next/script"; // Import the Next.js Script component
import Sidebar from "./components/Sidebar"; // Assuming Sidebar.tsx is in app/components/
import BottomNavBar from "./components/BottomNavBar"; // Assuming BottomNavBar.tsx is in app/components/
import Header from '@/components/Header'
    import { ThemeProvider } from "@/components/ThemeProvider"; // Import ThemeProvider

export const metadata: Metadata = {
  title: "TaskPlay App",
  description: "Your TaskPlay application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Standard meta tags and links are handled by Next.js metadata API */}
        <Script
          src='//libtl.com/sdk.js'
          data-zone='9431679'
          data-sdk='show_9431679'
          strategy="beforeInteractive" // This strategy injects into the <head>
          // async // Add async if the script supports it and doesn't need to block
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Force dark theme
          enableSystem={false} // No need to check system if always dark
          disableTransitionOnChange // Good to keep
        >
          <div className="flex flex-col min-h-screen">
            <Header /> {/* The global header at the top */}
            <div className="flex flex-1"> {/* This container allows sidebar and main content to be side-by-side */}
              <Sidebar /> {/* Desktop sidebar, hidden on mobile via its own CSS */}
              {/* Main content area */}
              {/*
                The md:ml-64 on main content pushes it to the right of the sidebar on medium screens and up.
                The Sidebar component itself should handle its visibility (e.g., hidden on mobile, visible on md+).
                The Header component handles its own mobile menu for navigation on small screens.
              */}
              <main className="flex-1 md:ml-64 bg-background text-foreground p-0"> {/* Use shadcn's bg-background and text-foreground */}
                {children}
              </main>
            </div>
            <BottomNavBar /> {/* Mobile bottom navigation, hidden on desktop via its own CSS */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
