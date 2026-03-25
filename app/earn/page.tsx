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
            .filter(t => (t.currentParticipations || 0) < (t.maxParticipations || 0)); // Only show available
          
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
    <div className="p-4 sm:p-6 md:p-12 max-w-5xl mx-auto pb-44 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      
      <Link href="/dashboard" className="inline-flex items-center gap-3 text-white/20 hover:text-white mb-12 transition-all font-black text-[10px] uppercase tracking-[5px] group">
         <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         </div>
         Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-[1.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                 <Zap className="w-5 h-5 text-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter">TaskPlay Earn</h1>
           <p className="text-white/30 text-[10px] font-black tracking-[5px] uppercase italic">Deploy your influence • Get paid instant rewards</p>
        </div>
        <div className="clay-card py-4 px-5 sm:py-5 sm:px-8 flex items-center gap-4 sm:gap-5 bg-primary/5 border-primary/20 shadow-[0_20px_40px_rgba(139,92,246,0.1)] group hover:border-primary/40 transition-all cursor-default">
           <div className="relative">
              <Diamond className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <span className="text-xs font-black text-white uppercase tracking-[4px]">Direct Rewards</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <motion.div 
           initial={{ scale: 0.95, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="clay-card p-8 sm:p-10 md:p-20 text-center border-white/5 mx-auto max-w-xl bg-[#0A0F1E]/20 backdrop-blur-3xl relative overflow-hidden"
        >
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
           <div className="w-24 h-24 rounded-[2.5rem] glass flex items-center justify-center mx-auto mb-10 border-white/10 shadow-2xl group transition-transform hover:scale-110">
              <Zap className="w-12 h-12 text-white/10 group-hover:text-primary transition-colors" />
           </div>
           <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">Mission Silence</h3>
           <p className="text-white/30 text-sm mb-12 font-medium leading-relaxed uppercase tracking-widest max-w-xs mx-auto">No active challenges in the sector. Command is synchronizing new data. Check back soon.</p>
           <Link href="/dashboard" className="text-primary font-black uppercase text-[10px] tracking-[5px] hover:text-white transition-colors flex items-center justify-center gap-3">
              Return to Core <ArrowRight className="w-4 h-4" />
           </Link>
        </motion.div>
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
                   className={`glass p-5 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-white/5 hover:bg-white/5 transition-all group cursor-pointer ${isClaiming ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => handleTaskClick(task)}
                >
                   <div className="flex items-center gap-3 sm:gap-5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl glass flex items-center justify-center ${platformInfo.color}`}>
                         {platformInfo.icon}
                      </div>
                      <div>
                         <h4 className="text-base md:text-lg font-bold text-white mb-1 tracking-tight">{cleanTitle}</h4>
                         <div className="flex items-center gap-3">
                             <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${platformInfo.color}`}>
                               {platformInfo.label} Network
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">₦{task.userReward} Earn</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                      {isClaiming ? (
                        <Loader className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/20 group-hover:text-white group-hover:bg-primary transition-all">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
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
