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
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
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
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Premium CPA</h1>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">High-yield marketing tasks</p>
        </div>
        <div className="clay-card px-6 py-4 flex items-center gap-4 border-white/5 bg-white/[0.01]">
           <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
           <span className="text-xs font-black text-white/60 uppercase tracking-widest">{tasks.length} High-Ticket Offers</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 mx-auto max-w-md">
           <Rocket className="w-16 h-16 text-white/10 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tighter">Marketplace Empty</h3>
           <p className="text-white/40 text-sm mb-10 font-medium leading-relaxed">Check back in a few hours or complete any pending tasks in your history.</p>
           <Link href="/advertise" className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">List your app here</Link>
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
                   className="glass p-4 rounded-[2rem] flex flex-col justify-between border-white/5 hover:border-primary/20 transition-all group cursor-pointer aspect-[4/5] relative overflow-hidden"
                   onClick={() => router.push(`/tasks/${task.id}`)}
                >
                   <div>
                      <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 ${platformInfo.color}`}>
                         {platformInfo.icon}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight">{cleanTitle}</h4>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{platformInfo.label}</p>
                   </div>

                   <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">Earn</span>
                         <span className="text-sm font-black text-green-400">₦{task.userReward?.toLocaleString()}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full glass border-white/10 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-primary transition-all">
                         <ArrowRight className="w-4 h-4" />
                      </div>
                   </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
