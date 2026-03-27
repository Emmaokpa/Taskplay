"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Share2, 
  Zap, 
  ArrowRight,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Play,
  MessageCircle,
  Globe,
  Smartphone,
  Send,
  ShieldCheck,
  Diamond
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ListSkeleton } from '@/app/components/Skeleton';

interface Task {
  id: string;
  category: string;
  status: string;
  platform: string;
  title: string;
  userReward: number;
  thumbnailUrl?: string;
  currentParticipations: number;
  maxParticipations: number;
  [key: string]: unknown;
}

const getPlatformIcon = (platform: string) => {
  switch (platform?.toLowerCase()) {
    case 'instagram': return { icon: <Instagram className="w-5 h-5" />, label: 'IG', color: 'text-pink-500' };
    case 'tiktok': return { icon: <Play className="w-5 h-5 shrink-0" />, label: 'TK', color: 'text-white' };
    case 'youtube': return { icon: <Youtube className="w-5 h-5" />, label: 'YT', color: 'text-red-500' };
    case 'twitter': return { icon: <Twitter className="w-5 h-5" />, label: 'X', color: 'text-blue-400' };
    case 'facebook': return { icon: <Facebook className="w-5 h-5" />, label: 'FB', color: 'text-blue-600' };
    case 'whatsapp': return { icon: <MessageCircle className="w-5 h-5" />, label: 'WA', color: 'text-green-500' };
    case 'telegram': return { icon: <Send className="w-5 h-5 shrink-0" />, label: 'TG', color: 'text-[#0088CC]' };
    case 'app': return { icon: <Smartphone className="w-5 h-5" />, label: 'App', color: 'text-purple-400' };
    default: return { icon: <Globe className="w-5 h-5" />, label: 'Web', color: 'text-gray-400' };
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

export default function SocialTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

          // 2. Fetch Active Tasks
          const q = query(
            collection(db, 'tasks'), 
            where('category', '==', 'social'), 
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

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm uppercase tracking-widest">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Social Tasks</h1>
           <p className="text-white/40 text-sm font-medium">Earn money by following and liking</p>
        </div>
        <div className="clay-card px-6 py-4 flex items-center gap-4 border-white/5 bg-white/[0.01]">
           <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
           <span className="text-xs font-black text-white/60 uppercase tracking-widest">{tasks.length} New Tasks</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : tasks.length === 0 ? (
        <div className="glass p-16 text-center border-white/5 mx-auto max-w-sm rounded-[2.5rem]">
           <Share2 className="w-12 h-12 text-white/10 mx-auto mb-6" />
           <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No Tasks Available</h3>
           <p className="text-white/40 text-sm mb-8 font-medium">Check back soon for new social media tasks!</p>
           <Link href="/dashboard" className="text-primary font-bold text-xs hover:underline">Return Home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {tasks.map((task, i) => {
              const platformInfo = getPlatformIcon(task.platform);
              const cleanTitle = simplifyTitle(task.title);

              return (
                <motion.div 
                   key={task.id}
                   initial={{ y: 10, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: i * 0.05 }}
                   className="glass p-4 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                   onClick={() => router.push(`/tasks/${task.id}`)}
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
                      <ArrowRight className="w-4 h-4" />
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
