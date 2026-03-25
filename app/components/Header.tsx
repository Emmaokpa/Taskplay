"use client";

import { Bell, Menu, Wallet } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserData {
  balance?: number;
  photoUrl?: string;
  fullName?: string;
  email?: string;
  [key: string]: unknown;
}

const Header = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    let unsubscribeSnap: () => void;
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Real-time listener for user data (balance, membership, etc.)
        unsubscribeSnap = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) {
            setUserData(snap.data() as UserData);
          }
        }, (err) => {
          console.error("Header snapshot error:", err);
        });
      } else {
        setUserData(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnap) unsubscribeSnap();
    };
  }, []);

  return (
    <header className="sticky top-0 z-[50] bg-black/40 backdrop-blur-3xl border-b border-white/5 px-6 py-4 flex items-center justify-between pointer-events-auto md:pl-72">
      {/* Brand area with Hamburger for mobile */}
      <div className="flex items-center gap-3 transition-all">
        <div 
           className="md:hidden glass p-2 rounded-xl text-white/60 active:scale-95 transition-all cursor-pointer"
           onClick={() => onMenuClick?.()}
        >
           <Menu className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Stats Summary Mobile/Desktop */}
        <div className="flex items-center gap-3">
           <button className="hidden sm:flex glass p-2.5 rounded-xl hover:bg-white/10 transition-colors relative">
             <Bell className="w-5 h-5 text-white/60" />
             <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border border-black" />
           </button>
           
           <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3 border-white/10 bg-white/[0.02] shadow-inner">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                 <Wallet className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm font-black text-white tracking-widest">₦{userData?.balance?.toLocaleString() || "0"}</span>
           </div>

           <div className="w-10 h-10 rounded-2xl glass p-0.5 border border-white/5 flex items-center justify-center overflow-hidden">
              {userData?.photoUrl ? (
                <Image src={userData.photoUrl} alt="Avatar" fill className="rounded-[inherit] object-cover" unoptimized />
              ) : (
                <span className="text-xl font-black text-primary uppercase">
                  {userData?.fullName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
                </span>
              )}
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;