"use client";

import { usePathname } from 'next/navigation';
import Header from '@/app/components/Header';
import Sidebar from "@/app/components/Sidebar";
import BottomNavBar from "@/app/components/BottomNavBar";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const publicPages = ['/', '/login', '/signup', '/about', '/privacy-policy', '/terms', '/forgot-password'];
  const isPublicPage = publicPages.includes(pathname);

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header can now receive toggle */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar (Fixed) */}
        <div className="hidden md:block">
           <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] md:hidden"
              />
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="fixed left-0 top-0 bottom-0 w-3/4 max-w-sm bg-background border-r border-white/5 z-[151] md:hidden overflow-y-auto"
              >
                 <div className="p-6 flex justify-end">
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 glass rounded-xl text-white/40">
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 <Sidebar mobile onLinkClick={() => setIsSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 md:ml-64 bg-background text-foreground p-0">
          {children}
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
}
