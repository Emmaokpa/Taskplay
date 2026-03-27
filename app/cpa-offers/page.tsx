"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Rocket, 
  Zap, 
  ArrowRight,
  Globe,
  Download,
  Trophy,
  DollarSign,
  Building2,
  Tag,
  ShieldCheck,
  Diamond
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ListSkeleton } from '@/app/components/Skeleton';

const getCpaIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'website': return { icon: <Globe className="w-5 h-5" />, label: 'WEB', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 'app_install': return { icon: <Download className="w-5 h-5" />, label: 'APP', color: 'text-purple-400', bg: 'bg-purple-500/10' };
    case 'betting': return { icon: <Trophy className="w-5 h-5" />, label: 'BET', color: 'text-orange-400', bg: 'bg-orange-400/10' };
    case 'loan': return { icon: <DollarSign className="w-5 h-5" />, label: 'LOAN', color: 'text-green-400', bg: 'bg-green-500/10' };
    case 'bank': return { icon: <Building2 className="w-5 h-5" />, label: 'BANK', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    default: return { icon: <Rocket className="w-5 h-5" />, label: 'CPA', color: 'text-gray-400', bg: 'bg-gray-500/10' };
  }
};

const simplifyTitle = (title: string = '') => {
  if (!title) return "Marketing Offer";
  let clean = title.trim();
  
  const replacements: Record<string, string> = {
    'follow me': 'Follow Account',
    'like my reel': 'Like Content',
    'subscribe to my channel': 'Subscribe',
    'join my group': 'Join Group',
    'visit website': 'Visit Site',
    'app install': 'Install App',
  };

  Object.entries(replacements).forEach(([key, val]) => {
    const regex = new RegExp(key, 'gi');
    clean = clean.replace(regex, val);
  });

  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

export default function CPAOffersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([]); // Using any[] here as it's a generic task list from firestore
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user data to check membership status
          const { getDoc, doc } = await import('firebase/firestore');
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (isMounted) setIsMember(userDoc.exists() && userDoc.data()?.isMember === true);

          // 1. Fetch user's submissions to hide tasks they've already done
          const subsQ = query(collection(db, 'submissions'), where('userId', '==', user.uid));
          const subDocs = await getDocs(subsQ);
          const submittedIds = new Set(subDocs.docs.map(d => d.data().taskId));

          // 2. Fetch Active Tasks (CPA & Sale)
          const q = query(
            collection(db, 'tasks'), 
            where('category', 'in', ['cpa', 'sale']), 
            where('status', '==', 'active')
          );
          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(t => !submittedIds.has(t.id))
            .filter(t => {
              const cur = Number(t.currentParticipations || 0);
              const max = Number(t.maxParticipations || 0);
              return max === 0 || cur < max;
            });
          
          if (isMounted) setTasks(items);
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

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-44 relative">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest leading-none">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-white mb-1 tracking-tight">CPA Offers</h1>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px] leading-relaxed">High-Impact Missions • Premium Payouts</p>
        </div>
        <div className="flex items-center gap-4">
           {!isMember && (
             <Link href="/upgrade" className="flex items-center gap-3 px-6 py-4 rounded-3xl bg-primary hover:bg-blue-600 text-white shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group">
                <ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Verify Account</span>
             </Link>
           )}
           <div className="clay-card px-6 py-4 flex items-center gap-4 border-white/5 bg-white/[0.01]">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{tasks.length} High-Ticket Offers</span>
           </div>
        </div>
      </div>

      {!isMember && !loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-12 overflow-hidden rounded-[3rem] glass p-10 border-white/5 group bg-[#0A0F1E]/40"
        >
           <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[100px] pointer-events-none" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 rounded-[2rem] bg-primary/20 flex items-center justify-center border border-primary/20 shadow-inner">
                 <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                 <h2 className="text-2xl font-black text-white mb-3 tracking-tight italic">Maximize Your Earning Potential</h2>
                 <p className="text-white/40 text-sm font-medium max-w-lg leading-relaxed">
                    Verify your account to unlock high-paying tasks reaching up to <span className="text-white font-black">₦5,000</span> per submission and withdraw your earnings starting from <span className="text-white font-black">₦1,000</span>.
                 </p>
              </div>
              <Link href="/upgrade" className="px-10 py-5 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                 Upgrade Now
              </Link>
           </div>
        </motion.div>
      )}

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="glass p-16 text-center border-white/5 mx-auto max-w-sm rounded-[2.5rem]">
           <Rocket className="w-12 h-12 text-white/5 mx-auto mb-6" />
           <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No Offers Available</h3>
           <p className="text-white/40 text-sm mb-8 font-medium italic">Check back soon for new high-paying offers!</p>
           <Link href="/dashboard" className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">Back to Dashboard</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getCpaIcon(task.platform);
              const cleanTitle = simplifyTitle(task.title);

              return (
                <motion.div 
                   key={task.id}
                   initial={{ y: 15, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="glass p-4 rounded-[2.5rem] flex flex-col justify-between border-white/5 hover:border-primary/20 transition-all group cursor-pointer aspect-[4/5] relative overflow-hidden"
                   onClick={() => isMember ? router.push(`/tasks/${task.id}`) : router.push('/upgrade')}
                >
                   <div>
                      <div className={`w-12 h-12 rounded-2xl glass flex items-center justify-center mb-6 shadow-sm ${platformInfo.color}`}>
                         {platformInfo.icon}
                      </div>
                      <h4 className="text-sm font-black text-white mb-2 line-clamp-2 leading-snug">{cleanTitle}</h4>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">{platformInfo.label}</p>
                   </div>

                   <div className="mt-8 flex items-center justify-between relative">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-white/20 uppercase tracking-[2px] mb-1">Potential</span>
                         <div className="relative">
                            <span className={`text-base font-black text-green-400 transition-all duration-500 ${!isMember ? 'blur-md select-none opacity-40' : ''}`}>
                               ₦{task.userReward?.toLocaleString()}
                            </span>
                            {!isMember && (
                              <div className="absolute inset-x-0 -top-1 bottom-0 flex items-center justify-center">
                                 <ShieldCheck className="w-4 h-4 text-primary/50" />
                              </div>
                            )}
                         </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full glass border-white/10 flex items-center justify-center text-white/20 group-hover:text-white transition-all ${isMember ? 'group-hover:bg-primary' : 'group-hover:bg-white/10'}`}>
                         {isMember ? <ArrowRight className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                   </div>

                   {!isMember && (
                      <div className="absolute top-4 right-4 bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                         <ShieldCheck className="w-3 h-3 text-primary" />
                         <span className="text-[8px] font-black text-primary uppercase tracking-widest">Premium</span>
                      </div>
                   )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
