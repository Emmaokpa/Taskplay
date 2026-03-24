"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

import { 
  ShieldCheck, 
  Wallet, 
  Copy, 
  ArrowRight,
  LogOut,
  Settings,
  Shield,
  Gift,
  CheckCircle2
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatSkeleton, Skeleton } from '@/app/components/Skeleton';

interface ProfileData {
  fullName?: string;
  email?: string;
  photoUrl?: string;
  isMember?: boolean;
  balance?: number;
  referralCode?: string;
  totalReferrals?: number;
  earnedFromReferrals?: number;
  [key: string]: unknown;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data() as ProfileData);
          }
        } catch (err) {
          console.error("Fetch error", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const copyRef = () => {
    const link = `${window.location.origin}/signup?ref=${userData?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
       <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-3xl" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <StatSkeleton />
          <StatSkeleton />
       </div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40">
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-accent p-[2px] mb-6 shadow-2xl overflow-hidden">
           <div className="w-full h-full bg-black/40 backdrop-blur-3xl rounded-[inherit] flex items-center justify-center p-[2px]">
              {userData?.photoUrl ? (
                 <Image src={userData.photoUrl} alt="User photo" fill className="rounded-[inherit] object-cover" unoptimized />
              ) : (
                 <div className="w-full h-full rounded-[inherit] bg-white/5 flex items-center justify-center text-3xl font-black text-primary">
                    {userData?.fullName?.charAt(0) || userData?.email?.charAt(0) || 'U'}
                 </div>
              )}
           </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">{userData?.fullName}</h1>
        <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase mb-6">{userData?.email}</p>
        
        {userData?.isMember ? (
          <div className="px-4 py-1.5 rounded-xl glass border-green-500/20 flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-green-400" />
             <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Verified Member</span>
          </div>
        ) : (
          <div className="px-4 py-1.5 rounded-xl glass border-orange-500/20 flex items-center gap-2">
             <Shield className="w-4 h-4 text-orange-400" />
             <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Standard User</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
         {/* Balance Card */}
         <Link href="/withdraw" className="clay-card p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 group">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black text-primary uppercase tracking-[4px]">Wallet Balance</span>
               <Wallet className="w-5 h-5 text-primary/40 group-hover:scale-125 transition-transform" />
            </div>
            <div className="text-5xl font-black text-white mb-2">₦{(userData?.balance || 0).toLocaleString()}</div>
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
               Tap to Cash Out <ArrowRight className="w-3 h-3 translate-x-1" />
            </div>
         </Link>

         {/* Referral Card */}
         <div className="clay-card p-8 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[4px]">Invite Earnings</span>
               <Gift className="w-5 h-5 text-white/20" />
            </div>
            <div className="text-5xl font-black text-white mb-2">₦{(userData?.earnedFromReferrals || 0).toLocaleString()}</div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">From {userData?.totalReferrals || 0} Successful Invites</p>
         </div>
      </div>

      <div className="space-y-4 mb-12">
         <h3 className="text-xs font-black text-white/20 uppercase tracking-[4px] ml-1">Settings & Identity</h3>
         
         {userData?.isMember ? (
            <div className="clay-card p-8 bg-gradient-to-br from-green-500/20 to-emerald-600/5 border-green-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[60px] -mr-16 -mt-16" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-inner">
                        <ShieldCheck className="w-8 h-8" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white tracking-tight">VIP Elite Status</h4>
                        <p className="text-[10px] text-green-400 font-black uppercase tracking-[3px]">Verified Account Verified</p>
                     </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl glass bg-white/5 border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                     Active
                  </div>
               </div>
               <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                     <CheckCircle2 className="w-3 h-3 text-green-500" /> Multi-Tasks
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                     <CheckCircle2 className="w-3 h-3 text-green-500" /> Unlimited Ads
                  </div>
               </div>
            </div>
         ) : (
            <div className="clay-card p-8 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 flex items-center justify-between group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] -mr-16 -mt-16" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-orange-400">
                     <Shield className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                     <h4 className="text-white font-black tracking-tight">Standard Identity</h4>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Upgrade to Unlock Features</p>
                  </div>
               </div>
               <Link 
                  href="/upgrade"
                  className="px-6 py-3 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all relative z-10 shadow-lg shadow-orange-500/20"
               >
                  Verify Now (₦1.5k)
               </Link>
            </div>
         )}

         <div 
           onClick={copyRef}
           className="clay-card p-8 border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer"
         >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Copy className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-white font-black tracking-tight">Invite Link</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate max-w-[150px]">Code: {userData?.referralCode}</p>
               </div>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${copied ? 'text-green-400' : 'text-primary'}`}>
               {copied ? 'Copied ✅' : 'Copy'}
            </span>
         </div>

         <div className="clay-card p-8 border-white/5 bg-white/[0.01] flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-white/20">
                  <Settings className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="text-white font-black tracking-tight">Security Settings</h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Change Password</p>
               </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/20" />
         </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
      >
        Sign Out <LogOut className="w-6 h-6" />
      </button>
    </div>
  );
}