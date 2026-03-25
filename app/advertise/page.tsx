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
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-44 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      
      {isMember === false && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="clay-card p-8 md:p-10 bg-red-500/10 border-red-500/20 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(239,68,68,0.1)]"
        >
          <div className="flex items-center gap-6 text-red-500">
            <div className="w-16 h-16 rounded-[1.5rem] bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-xl">
               <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-black text-lg md:text-xl tracking-tighter uppercase mb-1">Advertiser Account Restricted</h4>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-[4px]">Membership synchronization required to deploy campaigns</p>
            </div>
          </div>
          <Link href="/upgrade" className="clay-button px-10 py-5 rounded-[1.5rem] bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-[3px] shadow-2xl shadow-red-500/40 italic">
             Upgrade Protocol
          </Link>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tighter">Advertiser Hub</h1>
          <p className="text-white/30 text-[10px] font-black tracking-[5px] uppercase flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
             Engaging 100K+ Active Nodes
          </p>
        </div>
        <Link href="/advertise/new" className="clay-button px-12 py-5 rounded-[2rem] font-black flex items-center gap-3 text-white shadow-2xl shadow-primary/30 active:scale-95 transition-all text-sm uppercase tracking-tighter italic">
          <Plus className="w-6 h-6" /> Create Campaign
        </Link>
      </div>

      {/* Stats Summary - REFINED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="clay-card p-10 bg-[#0A0F1E]/40 backdrop-blur-3xl border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-5 mb-8">
              <div className="p-4 rounded-2xl glass-dark group-hover:text-white transition-colors">
                {s.icon}
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[4px]">{s.label}</span>
            </div>
            <div className="text-5xl font-black text-white tracking-tighter group-hover:scale-[1.02] transition-transform origin-left">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-10">
         <div className="h-px flex-1 bg-white/5" />
         <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[10px] flex items-center gap-4">
            Available Objectives
         </h2>
         <div className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {adOptions.map((opt, i) => {
          const isComingSoon = opt.comingSoon;
          const href = !isComingSoon ? (isMember === false ? '/upgrade' : opt.href) : undefined;

          const content = (
            <motion.div
              whileHover={isComingSoon ? {} : { y: -12, scale: 1.02 }}
              className={`clay-card p-12 group relative transition-all duration-500 overflow-hidden ${isComingSoon ? 'opacity-40 cursor-not-allowed' : ''} ${isMember === false ? 'grayscale-[0.5] opacity-80' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {isComingSoon && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-xl glass-dark border-white/10 text-[8px] font-black uppercase tracking-[3px] text-white/30">
                  Locked
                </div>
              )}
              <div className="w-16 h-16 rounded-[1.5rem] glass-dark flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border-white/5 group-hover:border-white/20">
                {opt.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tighter group-hover:text-primary transition-colors">{opt.title}</h3>
              <p className="text-white/30 text-sm leading-relaxed mb-10 font-medium">{opt.desc}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="px-5 py-2.5 rounded-2xl glass-dark text-[10px] font-black tracking-[3px] text-primary border border-primary/20 shadow-inner group-hover:bg-primary/5 transition-colors">
                  {opt.tag}
                </div>
                {!isComingSoon && (
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-primary transition-all duration-500 shadow-2xl">
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
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

      {/* Campaign List Placeholder - REFINED */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="clay-card p-16 text-center border-white/5 bg-[#0A0F1E]/20 backdrop-blur-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="w-24 h-24 rounded-[2.5rem] glass flex items-center justify-center mx-auto mb-10 border-white/10 shadow-2xl group transition-transform hover:scale-110">
          <BarChart3 className="w-12 h-12 text-white/10 group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Zero Deployments</h3>
        <p className="text-white/30 mb-12 max-w-md mx-auto text-sm font-medium leading-relaxed uppercase tracking-wide">Initiate your first campaign cluster to start engaging Nigerian market sectors.</p>
        <Link href="/advertise/new" className="text-primary font-black uppercase tracking-[5px] text-[10px] hover:text-white transition-colors flex items-center justify-center gap-3">
           Engage Network <Plus className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>

  );
}
