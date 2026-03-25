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
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40 relative">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-4xl font-black text-white mb-1 tracking-tight">TaskPlay Earn</h1>
           <p className="text-white/40 text-[10px] font-black tracking-[3px] uppercase">Deploy your influence & earn</p>
        </div>
        <div className="clay-card px-6 py-4 flex items-center gap-4 border-white/5 bg-white/[0.01]">
           <Zap className="w-5 h-5 text-primary animate-pulse" />
           <span className="text-xs font-black text-white/60 uppercase tracking-widest">{tasks.length} Direct Tasks</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 mx-auto max-w-md">
           <Zap className="w-16 h-16 text-white/10 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-white mb-3 tracking-tight uppercase">Mission Silence</h3>
           <p className="text-white/40 text-sm mb-10 font-medium">No active tasks in this sector right now. Check back shortly.</p>
           <Link href="/dashboard" className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Return to core</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getPlatformIcon(task.platform);
              const isClaiming = claimingId === task.id;
              const cleanTitle = simplifyTitle(task.title);

              return (
                <motion.div 
                   key={task.id}
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className={`glass p-4 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/5 transition-all group cursor-pointer ${isClaiming ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => handleTaskClick(task)}
                >
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center ${platformInfo.color}`}>
                         {platformInfo.icon}
                      </div>
                      <div>
                         <h4 className="text-sm font-bold text-white mb-0.5 tracking-tight">{cleanTitle}</h4>
                         <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{platformInfo.label} • ₦{task.userReward}</p>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                      {isClaiming ? (
                        <Loader className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
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
