"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  Zap, 
  ArrowRight,
  Loader,
  Search,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Play,
  MessageCircle,
  Globe,
  Smartphone,
  Send
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ListSkeleton } from '@/app/components/Skeleton';

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return { icon: <Instagram className="w-5 h-5" />, label: 'IG', color: 'text-pink-500' };
    case 'tiktok': return { icon: <Play className="w-5 h-5 shrink-0" />, label: 'TK', color: 'text-white' };
    case 'youtube': return { icon: <Youtube className="w-5 h-5" />, label: 'YT', color: 'text-red-500' };
    case 'twitter': return { icon: <Twitter className="w-5 h-5" />, label: 'X', color: 'text-blue-400' };
    case 'facebook': return { icon: <Facebook className="w-5 h-5" />, label: 'FB', color: 'text-blue-600' };
    case 'whatsapp': return { icon: <MessageCircle className="w-5 h-5" />, label: 'WA', color: 'text-green-500' };
    case 'telegram': return { icon: <Send className="w-5 h-5 shrink-0" />, label: 'TG', color: 'text-[#0088CC]' };
    case 'app': return { icon: <Smartphone className="w-5 h-5" />, label: 'App', color: 'text-gray-400' };
    default: return { icon: <Globe className="w-5 h-5" />, label: 'Web', color: 'text-gray-400' };
  }
};

export default function SocialTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isMounted) setUser(user);
        try {
          // 1. Fetch user's submissions to hide tasks they've already done
          const subsQ = query(collection(db, 'submissions'), where('userId', '==', user.uid));
          const subDocs = await getDocs(subsQ);
          const submittedIds = new Set(subDocs.docs.map(d => d.data().taskId));

          // 2. Fetch Active Tasks
          const q = query(
            collection(db, 'tasks'), 
            where('category', '==', 'social'), 
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
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Social Gigs</h1>
           <p className="text-white/40 text-[10px] font-black tracking-[3px] uppercase">Monetize your screen time</p>
        </div>
        <div className="clay-card px-6 py-4 flex items-center gap-4 border-white/5 bg-white/[0.01]">
           <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
           <span className="text-xs font-black text-white/60 uppercase tracking-widest">{tasks.length} New Tasks</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 mx-auto max-w-md">
           <Share2 className="w-16 h-16 text-white/10 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-white mb-3 tracking-tight uppercase">No active social tasks</h3>
           <p className="text-white/40 text-sm mb-10 font-medium">Check back later or try CPA offers to keep earning.</p>
           <Link href="/advertise" className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Launch your own ad</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getPlatformIcon(task.platform);
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
                        <div className={`w-full h-full flex items-center justify-center ${platformInfo.color} bg-black/20`}>
                           {platformInfo.icon}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   
                   <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1.5">
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 ${platformInfo.color}`}>
                            {platformInfo.label}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-white/10" />
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{task.category}</span>
                      </div>
                      <h4 className="text-lg font-black text-white truncate tracking-tight">{task.title}</h4>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-green-400">₦{task.userReward}</span>
                            <span className="text-[8px] font-bold text-green-400/40 uppercase">Earning</span>
                         </div>
                         <div className="text-[10px] text-white/20 font-black uppercase tracking-[2px] truncate max-w-[150px]">
                            {task.currentParticipations} / {task.maxParticipations}
                         </div>
                      </div>
                   </div>

                   <div className="w-12 h-12 rounded-full glass border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/20 transition-all active:scale-95 shadow-lg">
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
