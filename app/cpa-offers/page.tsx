"use client";

import React, { useState, useEffect } from 'react';
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
  Tag
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ListSkeleton } from '@/app/components/Skeleton';

const getCpaIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'website': return { icon: <Globe className="w-5 h-5" />, label: 'WEB', color: 'text-blue-400' };
    case 'app_install': return { icon: <Download className="w-5 h-5" />, label: 'APP', color: 'text-purple-400' };
    case 'betting': return { icon: <Trophy className="w-5 h-5" />, label: 'BET', color: 'text-orange-400' };
    case 'loan': return { icon: <DollarSign className="w-5 h-5" />, label: 'LOAN', color: 'text-green-400' };
    case 'bank': return { icon: <Building2 className="w-5 h-5" />, label: 'BANK', color: 'text-blue-500' };
    default: return { icon: <Rocket className="w-5 h-5" />, label: 'CPA', color: 'text-gray-400' };
  }
};

export default function CPAOffersPage() {
  const [tasks, setTasks] = useState<any[]>([]);
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
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(t => !submittedIds.has(t.id)); // Hide if already submitted
          
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
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40">
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
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getCpaIcon(task.platform);
              return (
                <motion.div 
                   key={task.id}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="clay-card p-5 !bg-white/[0.02] border-white/5 flex items-center gap-6 hover:!bg-white/5 transition-all group cursor-pointer relative"
                   onClick={() => router.push(`/tasks/${task.id}`)}
                >
                   <div className="w-20 h-20 rounded-2xl bg-white/5 flex-shrink-0 overflow-hidden relative border border-white/5">
                      {task.thumbnailUrl ? (
                        <img src={task.thumbnailUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${platformInfo.color} bg-black/40`}>
                           {platformInfo.icon}
                        </div>
                      )}
                   </div>
                   
                   <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 ${platformInfo.color}`}>
                            {platformInfo.label}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                            {task.category === 'sale' ? 'Escrow Sale' : 'Direct Offer'}
                         </span>
                      </div>
                      <h4 className="text-lg font-black text-white truncate tracking-tight">{task.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-green-400" />
                            <span className="text-sm font-black text-green-400">₦{task.userReward?.toLocaleString()}</span>
                         </div>
                         <div className="text-[10px] text-white/30 font-black uppercase tracking-[2px]">
                            {task.currentParticipations} / {task.maxParticipations} Entries
                         </div>
                      </div>
                   </div>

                   <div className="w-12 h-12 rounded-full glass border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/20 transition-all active:scale-95 shadow-xl">
                      <ArrowRight className="w-6 h-6" />
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
