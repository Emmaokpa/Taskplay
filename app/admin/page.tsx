"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Users, 
  FileCheck, 
  Rocket, 
  Settings, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import AdminGuard from '@/app/components/AdminGuard';

export default function AdminHome() {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    pendingSubmissions: 0,
    pendingWithdrawals: 0,
    verifiedUsers: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Pending Tasks
      const qTasks = query(collection(db, 'tasks'), where('status', '==', 'pending_admin'));
      const tasksSnap = await getDocs(qTasks);
      
      // 2. Pending Submissions
      const qSubs = query(collection(db, 'submissions'), where('status', '==', 'pending'));
      const subsSnap = await getDocs(qSubs);

      // 3. Pending Withdrawals
      const qWithdraws = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
      const withdrawsSnap = await getDocs(qWithdraws);

      // 4. Verified Users
      const qVerified = query(collection(db, 'users'), where('isMember', '==', true));
      const verifiedSnap = await getDocs(qVerified);

      // 5. Total Users
      const qUsers = collection(db, 'users');
      const usersSnap = await getDocs(qUsers);

      setStats({
        pendingTasks: tasksSnap.size,
        pendingSubmissions: subsSnap.size,
        pendingWithdrawals: withdrawsSnap.size,
        verifiedUsers: verifiedSnap.size,
        totalUsers: usersSnap.size
      });
    };
    fetchStats();
  }, []);

  const adminCards = [
    {
      title: "Campaign Approvals",
      count: stats.pendingTasks,
      desc: "Review and activate new advertiser tasks.",
      href: "/admin/tasks",
      icon: <Rocket className="w-8 h-8 text-primary" />,
      tag: "Urgent"
    },
    {
      title: "Verify Proofs",
      count: stats.pendingSubmissions,
      desc: "Verify user screenshots and credit earnings.",
      href: "/admin/submissions",
      icon: <FileCheck className="w-8 h-8 text-green-400" />,
      tag: "Daily"
    },
    {
      title: "Manage Users",
      count: stats.totalUsers,
      desc: "Track balances, referrals and membership levels.",
      href: "/admin/users",
      icon: <Users className="w-8 h-8 text-blue-400" />,
      tag: "CRM"
    },
    {
      title: "Platform Missions",
      count: "Earn",
      desc: "Create official TaskPlay tasks for users to promote us.",
      href: "/admin/earn",
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      tag: "Growth"
    },
    {
      title: "Payouts & Finance",
      count: stats.pendingWithdrawals,
      desc: "Manage withdrawal requests and platform fees.",
      href: "/admin/payouts",
      icon: <CreditCard className="w-8 h-8 text-orange-400" />,
      tag: "Revenue"
    }
  ];

  return (
    <AdminGuard>
      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-40">
      <div className="flex items-center gap-4 mb-12">
         <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-primary" />
         </div>
         <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Central</h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Mission Control • Root Access</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {adminCards.map((card, i) => (
          <Link key={i} href={card.href}>
             <motion.div 
               whileHover={{ y: -8 }}
               className="clay-card p-10 group cursor-pointer relative overflow-hidden"
             >
                <div className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-primary/30">
                   {card.tag}
                </div>
                <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center mb-8 border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                   {card.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-2">{card.title}</h3>
                <p className="text-white/40 text-xs font-medium leading-relaxed mb-8">{card.desc}</p>
                <div className="flex items-center justify-between">
                   <div className="text-3xl font-black text-white">{card.count}</div>
                   <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/20 group-hover:text-primary transition-all">
                      <ArrowRight className="w-5 h-5" />
                   </div>
                </div>
             </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Access List */}
      <h2 className="text-xl font-black text-white mb-8 tracking-tight flex items-center gap-3">
         <BarChart3 className="w-6 h-6 text-accent" /> Live Insights
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="clay-card p-8 flex items-center justify-between border-white/5">
            <div>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-1">Verified Members</p>
               <h4 className="text-2xl font-black text-white">{stats.verifiedUsers} Users</h4>
            </div>
            <ShieldCheck className="w-10 h-10 text-green-500/20" />
         </div>
         <div className="clay-card p-8 flex items-center justify-between border-white/5">
            <div>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px] mb-1">Total Registered</p>
               <h4 className="text-2xl font-black text-white">{stats.totalUsers} Users</h4>
            </div>
            <Users className="w-10 h-10 text-blue-500/20" />
         </div>
         <div className="clay-card p-8 flex items-center justify-between border-white/5 bg-primary/5">
            <Link href="/settings" className="flex items-center gap-4 group">
               <div className="p-3 rounded-xl glass">
                  <Settings className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-white group-hover:underline">Site Settings</h4>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Global Vars • Maintenance</p>
               </div>
            </Link>
         </div>
      </div>
      </div>
    </AdminGuard>
  );
}
