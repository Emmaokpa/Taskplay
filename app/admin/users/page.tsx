"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  Loader, 
  ArrowLeft,
  XCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import AdminGuard from '@/app/components/AdminGuard';

export default function ManageUsers() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50));
      if (filter === 'verified') q = query(collection(db, 'users'), where('isMember', '==', true), limit(50));
      if (filter === 'unverified') q = query(collection(db, 'users'), where('isMember', '!=', true), limit(50));
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const toggleAdmin = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { isAdmin: !currentStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !currentStatus } : u));
    } catch {
       alert("Action failed");
    } finally {
       setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="p-10 max-w-7xl mx-auto pb-40">
        <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest leading-none">
          <ArrowLeft className="w-4 h-4" /> Admin Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
           <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
                 <Users className="w-10 h-10 text-primary" /> User Operations
              </h1>
              <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Control Access • Identity Management</p>
           </div>
           
           <div className="flex items-center gap-3">
              {(['all', 'verified', 'unverified'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white' : 'glass border-white/5 text-white/40'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
           <input 
              placeholder="Search by name or email..." 
              className="glass w-full pl-16 pr-6 py-5 rounded-2xl text-white outline-none border border-white/5 focus:border-primary transition-all font-bold tracking-tight bg-white/[0.02]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        {loading ? (
          <div className="p-20 text-center text-white/20 space-y-4">
             <Loader className="w-10 h-10 animate-spin mx-auto text-primary" />
             <p className="text-[10px] font-black uppercase tracking-[3px]">Indexing User Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
               {filteredUsers.map((user, i) => (
                 <motion.div 
                   layout
                   key={user.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.02 }}
                   className="clay-card p-8 border-white/5 relative group hover:border-primary/20 transition-all overflow-hidden"
                 >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                       {user.isMember ? (
                         <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/10 font-bold text-[8px] uppercase tracking-widest">
                            <ShieldCheck className="w-3 h-3" /> Verified
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-white/20 font-bold text-[8px] uppercase tracking-widest">
                            <XCircle className="w-3 h-3" /> Standard
                         </div>
                       )}
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-inner ${user.isAdmin ? 'bg-primary' : 'bg-white/5'}`}>
                          {user.fullName?.[0] || 'U'}
                       </div>
                       <div>
                          <h4 className="text-white font-black tracking-tight leading-tight">{user.fullName || 'Anonymous User'}</h4>
                          <span className="text-[10px] font-bold text-white/30 truncate block max-w-[150px]">{user.email || 'No email'}</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Wallet</p>
                          <p className="text-sm font-black text-white">₦{user.balance?.toLocaleString() || 0}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Referrals</p>
                          <p className="text-sm font-black text-white">{user.totalReferrals || 0}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                       <button 
                          disabled={processingId === user.id}
                          onClick={() => toggleAdmin(user.id, user.isAdmin)}
                          className={`flex-1 p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${user.isAdmin ? 'border-primary/20 text-primary bg-primary/5' : 'border-white/5 text-white/20 hover:text-white hover:bg-white/5'}`}
                       >
                          {processingId === user.id ? <Loader className="w-3 h-3 animate-spin mx-auto"/> : user.isAdmin ? 'Admin Root' : 'Set Admin'}
                       </button>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>
          </div>
        )}
        
        {filteredUsers.length === 0 && !loading && (
          <div className="p-20 text-center text-white/20 border-2 border-dashed border-white/5 rounded-[3rem]">
             <Users className="w-16 h-16 mx-auto mb-6 opacity-10" />
             <p className="text-xs uppercase font-black tracking-[4px]">Target Identity Not Found</p>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
