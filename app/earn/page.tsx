"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
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
  Diamond,
  Send,
  ExternalLink
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
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
    default: return { icon: <Diamond className="w-5 h-5" />, label: 'EARN', color: 'text-primary' };
  }
};

export default function EarnPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data());
          }

          const subsQ = query(collection(db, 'submissions'), where('userId', '==', user.uid));
          const subDocs = await getDocs(subsQ);
          const submittedIds = new Set(subDocs.docs.map(d => d.data().taskId));

          const q = query(
            collection(db, 'tasks'), 
            where('category', '==', 'earn'), 
            where('status', '==', 'active')
          );
          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as any))
            .filter(t => !submittedIds.has(t.id)); 
          
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

  const handleTaskClick = async (task: any) => {
    if (userData && !userData.isMember) {
      router.push('/upgrade');
      return;
    }

    if (task.type === 'direct') {
      const user = auth.currentUser;
      if (!user) return router.push('/login');
      
      setClaimingId(task.id);
      try {
        const res = await fetch('/api/tasks/claim-direct', {
          method: 'POST',
          body: JSON.stringify({ taskId: task.id, userId: user.uid }),
        });
        const data = await res.json();
        
        if (data.success) {
          if (task.actionUrl) window.open(task.actionUrl, '_blank');
          setTasks(prev => prev.filter(t => t.id !== task.id));
        } else {
          alert(data.error || "Claim failed");
        }
      } catch (err) {
        console.error("Claim error", err);
      } finally {
        setClaimingId(null);
      }
    } else {
      router.push(`/tasks/${task.id}`);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
             </div>
             <p className="text-primary text-[10px] font-black tracking-[4px] uppercase">Official Challenges</p>
           </div>
           <h1 className="text-4xl font-black text-white mb-1 tracking-tighter">TaskPlay Earn</h1>
           <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Promote us & Get Paid Directly</p>
        </div>
        <div className="clay-card px-6 py-4 flex items-center gap-4 bg-primary/5 border-primary/20">
           <Diamond className="w-5 h-5 text-primary animate-bounce" />
           <span className="text-xs font-black text-white uppercase tracking-widest">Platform Rewards</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 mx-auto max-w-md">
           <Zap className="w-16 h-16 text-white/10 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight">No New Missions</h3>
           <p className="text-white/40 text-sm mb-10 font-medium leading-relaxed">The platform is currently optimized. Check back later for new promotional tasks.</p>
           <Link href="/dashboard" className="text-primary font-black uppercase text-[11px] tracking-widest hover:underline">Return to Dash</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getPlatformIcon(task.platform);
              const isClaiming = claimingId === task.id;

              return (
                <motion.div 
                   key={task.id}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   exit={{ opacity: 0, x: 20 }}
                   className={`clay-card p-6 !bg-gradient-to-tr from-white/[0.03] to-transparent border-white/5 flex items-center gap-6 hover:border-primary/20 transition-all group cursor-pointer relative overflow-hidden ${isClaiming ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => handleTaskClick(task)}
                >
                   {isClaiming && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                         <Loader className="w-6 h-6 text-primary animate-spin" />
                      </div>
                   )}
                   <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-primary" />
                   </div>

                   <div className="w-20 h-20 rounded-2xl glass flex-shrink-0 flex items-center justify-center relative border border-white/5 shadow-2xl">
                      {task.thumbnailUrl ? (
                         <img src={task.thumbnailUrl} className="w-full h-full object-cover rounded-[inherit]" />
                      ) : (
                         <div className={`${platformInfo.color} opacity-40 group-hover:opacity-100 transition-opacity`}>
                            {platformInfo.icon}
                         </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center border border-black shadow-lg">
                         <Zap className="w-3 h-3" />
                      </div>
                   </div>
                   
                   <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2">
                         <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 ${platformInfo.color}`}>
                            Platform
                         </span>
                         <span className="w-1 h-1 rounded-full bg-white/20" />
                         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Instant Approval</span>
                      </div>
                      <h4 className="text-lg font-black text-white truncate tracking-tight mb-2 group-hover:text-primary transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/10">
                            <span className="text-xs font-black text-green-400">₦{task.userReward?.toLocaleString()}</span>
                         </div>
                         <div className="text-[10px] text-white/20 font-black uppercase tracking-[2px]">
                            {task.maxParticipations - task.currentParticipations} Slots Left
                         </div>
                      </div>
                   </div>

                   <div className="w-12 h-12 rounded-full glass border-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/20 transition-all active:scale-95">
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
