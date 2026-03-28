"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Zap, 
  ArrowRight,
  Loader,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Play,
  MessageCircle,
  Diamond,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ListSkeleton } from '@/app/components/Skeleton';

interface Task {
  id: string;
  type: string;
  category: string;
  platform: string;
  title: string;
  userReward: number;
  thumbnailUrl?: string;
  actionUrl?: string;
  maxParticipations: number;
  currentParticipations: number;
  status: string;
  [key: string]: unknown; // For other potential fields
}

interface UserData {
  isMember?: boolean;
  [key: string]: unknown; // For other potential user data fields
}

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return { icon: <Instagram className="w-5 h-5" />, label: 'IG', color: 'text-pink-500', bg: 'bg-pink-500/10' };
    case 'tiktok': return { icon: <Play className="w-5 h-5 shrink-0" />, label: 'TK', color: 'text-white', bg: 'bg-white/10' };
    case 'youtube': return { icon: <Youtube className="w-5 h-5" />, label: 'YT', color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'twitter': return { icon: <Twitter className="w-5 h-5" />, label: 'X', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    case 'facebook': return { icon: <Facebook className="w-5 h-5" />, label: 'FB', color: 'text-blue-600', bg: 'bg-blue-600/10' };
    case 'whatsapp': return { icon: <MessageCircle className="w-5 h-5" />, label: 'WA', color: 'text-green-500', bg: 'bg-green-500/10' };
    case 'telegram': return { icon: <Send className="w-5 h-5 shrink-0" />, label: 'TG', color: 'text-[#0088CC]', bg: 'bg-[#0088CC]/10' };
    default: return { icon: <Diamond className="w-5 h-5" />, label: 'EARN', color: 'text-primary', bg: 'bg-primary/10' };
  }
};

const simplifyTitle = (title: string = '') => {
  if (!title) return "Task";
  let clean = title.trim();
  
  const replacements: Record<string, string> = {
    'follow me': 'Follow Account',
    'like my reel': 'Like Content',
    'subscribe to my channel': 'Subscribe',
    'join my group': 'Join Group',
    'follow my instagram': 'Follow Instagram',
    'like my post': 'Like Post',
    'retweet': 'Retweet/Repost',
  };

  Object.entries(replacements).forEach(([key, val]) => {
    const regex = new RegExp(key, 'gi');
    clean = clean.replace(regex, val);
  });

  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

export default function EarnPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

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
            .map(d => ({ id: d.id, ...d.data() } as Task))
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

  const handleTaskClick = async (task: Task) => {
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
          if (task.actionUrl) {
            const finalUrl = task.actionUrl.startsWith('http') ? task.actionUrl : `https://${task.actionUrl}`;
            window.open(finalUrl, '_blank');
          }
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
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-44 relative z-10">
      <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/40 hover:text-white mb-16 transition-all font-black text-xs uppercase tracking-[4px] group">
        <div className="p-2.5 rounded-xl glass border-white/5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
           <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Hub
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-20">
        <div>
           <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase italic">Earn Rewards</h1>
           <p className="text-white/30 text-xs font-black uppercase tracking-[4px]">Verified Social Missions</p>
        </div>
        <div className="glass px-8 py-5 flex items-center gap-4 border-white/5 rounded-[2rem] bg-blue-500/5 shadow-2xl">
           <Zap className="w-6 h-6 text-blue-400 animate-pulse" />
           <span className="text-[11px] font-black text-white/60 uppercase tracking-widest leading-none">{tasks.length} Active Tasks</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="glass p-20 text-center border-white/5 mx-auto max-w-md rounded-[3rem] shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-blue-500/5 opacity-50 blur-3xl rounded-full" />
           <div className="relative z-10">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:scale-110 transition-transform duration-700">
                 <CheckCircle2 className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase italic">Complete Clearing</h3>
              <p className="text-white/40 text-base mb-12 font-medium leading-relaxed italic">You've finished all available missions for your tier. New tasks refresh every 24 hours.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-[4px] hover:tracking-[6px] transition-all">
                 Return Home <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getPlatformIcon(task.platform);
              const isClaiming = claimingId === task.id;
              const cleanTitle = simplifyTitle(task.title);

              return (
                <motion.div 
                   key={task.id}
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className={`glass p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between border-white/5 hover:bg-white/[0.03] transition-all group cursor-pointer relative overflow-hidden ${isClaiming ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => handleTaskClick(task)}
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="flex items-center gap-6 relative z-10 w-full mb-6 sm:mb-0">
                      <div className="w-16 h-16 rounded-[1.5rem] glass flex items-center justify-center border border-white/5 shadow-inner">
                         <div className={`${platformInfo.color} group-hover:scale-110 transition-transform duration-500`}>
                            {platformInfo.icon}
                         </div>
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="text-lg font-black text-white mb-1.5 tracking-tight group-hover:text-blue-400 transition-colors truncate uppercase italic">{cleanTitle}</h4>
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[2px] px-2 py-0.5 rounded-md border border-white/5">{platformInfo.label}</span>
                            <span className="text-[10px] text-blue-400/60 font-black uppercase tracking-[3px] italic">Reward: ₦{task.userReward}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center justify-between sm:justify-end gap-6 relative z-10">
                      <div className="text-right hidden md:block">
                         <div className="text-[8px] font-black text-white/20 uppercase tracking-[4px] mb-1">Instant Payout</div>
                         <div className="text-sm font-black text-white tracking-widest italic leading-none">VERIFIED</div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-xl">
                         {isClaiming ? (
                           <Loader className="w-6 h-6 animate-spin" />
                         ) : (
                           <ArrowRight className="w-6 h-6" />
                         )}
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
