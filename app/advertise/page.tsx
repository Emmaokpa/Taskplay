"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  BarChart3,
  Users,
  Zap,
  Share2,
  Download,
  ShoppingBag,
  ShieldAlert,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AdvertiseDashboard() {
  const [userData, setUserData] = useState<{ isMember: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data() as { isMember: boolean });
          }
        } catch (err) {
          console.error('Error fetching advertiser data:', err);
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

  const isMember = userData?.isMember ?? false;

  const stats = [
    { label: "Active Campaigns", value: "0", icon: <Megaphone className="w-5 h-5 text-primary" /> },
    { label: "Total Views", value: "0", icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: "Total Spent", value: "₦0", icon: <CreditCard className="w-5 h-5 text-orange-400" /> },
  ];

  const adOptions = [
    {
      title: "Social Growth",
      desc: "Get followers, likes, and shares on TikTok, X, and Instagram.",
      icon: <Share2 className="w-6 h-6 text-pink-400" />,
      href: "/advertise/new?type=social",
      tag: "₦30/Task",
      comingSoon: false,
    },
    {
      title: "CPA & App Installs",
      desc: "Drive website signups and positive app store reviews.",
      icon: <Download className="w-6 h-6 text-purple-400" />,
      href: "/advertise/new?type=cpa",
      tag: "₦100/Task",
      comingSoon: false,
    },
    {
      title: "Sales & Subscriptions",
      desc: "Escrow-based ticket, product, and subscription promotion. Coming soon.",
      icon: <ShoppingBag className="w-6 h-6 text-green-400" />,
      href: "#",
      tag: "Escrow Model",
      comingSoon: true,
    }
  ];

  if (loading) return (
    <div className="p-20 text-center text-white/50">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      Loading Hub...
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {isMember === false && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="clay-card p-6 bg-red-500/10 border-red-500/20 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-red-400">
            <ShieldAlert className="w-8 h-8" />
            <div>
              <h4 className="font-black text-sm uppercase tracking-widest">Advertiser Account Restricted</h4>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Membership Fee Required to Post Campaigns</p>
            </div>
          </div>
          <Link href="/upgrade" className="clay-button px-6 py-3 rounded-xl bg-red-500 text-white font-black text-[10px] uppercase tracking-[3px]">Upgrade Now</Link>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Advertiser Hub</h1>
          <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Grow your business with TaskPlay</p>
        </div>
        <Link href="/advertise/new" className="clay-button px-8 py-4 rounded-2xl font-bold flex items-center gap-2  text-white transition-all active:scale-95">
          <Plus className="w-6 h-6" /> Create Campaign
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="clay-card p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl glass">
                {s.icon}
              </div>
              <span className="text-xs font-black text-white/40 uppercase tracking-[2px]">{s.label}</span>
            </div>
            <div className="text-4xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
        <Zap className="w-6 h-6 text-accent fill-accent" /> Start Advertising
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {adOptions.map((opt, i) => {
          const isComingSoon = opt.comingSoon;
          const href = !isComingSoon ? (isMember === false ? '/upgrade' : opt.href) : undefined;

          const content = (
            <motion.div
              whileHover={isComingSoon ? {} : { y: -10 }}
              className={`clay-card p-10 group relative transition-all ${isComingSoon ? 'opacity-60 cursor-not-allowed' : ''} ${isMember === false ? 'grayscale-[0.3] opacity-80' : ''}`}
            >
              {isComingSoon && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                  Coming Soon
                </div>
              )}
              <div className="p-4 rounded-2xl glass mb-8 w-fit transition-colors">
                {opt.icon}
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{opt.title}</h3>
              <p className="text-white/40 leading-relaxed mb-8">{opt.desc}</p>
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black tracking-widest text-primary border border-white/5">
                  {opt.tag}
                </div>
                {!isComingSoon && (
                  <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                )}
              </div>
            </motion.div>
          );

          if (isComingSoon) {
            return (
              <div key={i}>
                {content}
              </div>
            );
          }

          return (
            <Link key={i} href={href!}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Campaign List Placeholder */}
      <div className="clay-card p-12 text-center border-white/5 bg-white/[0.01]">
        <div className="w-20 h-20 rounded-[2rem] glass flex items-center justify-center mx-auto mb-8 border-white/10">
          <BarChart3 className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">No active campaigns</h3>
        <p className="text-white/40 mb-10 max-w-sm mx-auto">Create your first campaign to start reaching thousands of active users in Nigeria.</p>
        <Link href="/advertise/new" className="text-primary font-black uppercase tracking-widest text-xs hover:underline">Get Started Now</Link>
      </div>
    </div>
  );
}
