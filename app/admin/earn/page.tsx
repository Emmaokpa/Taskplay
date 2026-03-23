"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  ArrowLeft, 
  Zap, 
  Loader, 
  CheckCircle2, 
  Globe, 
  Smartphone, 
  ExternalLink,
  MessageCircle,
  Play,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Trophy,
  Trash,
  List
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import AdminGuard from '@/app/components/AdminGuard';

export default function AdminEarnManagement() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [missions, setMissions] = useState<any[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    userReward: 10,
    maxParticipations: 1000,
    platform: 'web',
    actionUrl: '',
    isDirectLink: false,
  });

  const fetchMissions = async () => {
    setFetching(true);
    try {
      const q = query(collection(db, 'tasks'), where('category', '==', 'earn'));
      const snap = await getDocs(q);
      setMissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleDelete = async (id: string) => {
     if (!confirm("Delete this mission? This cannot be undone.")) return;
     try {
        await deleteDoc(doc(db, 'tasks', id));
        setMissions(missions.filter(m => m.id !== id));
     } catch (err) {
        alert("Delete failed");
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...formData,
        category: 'earn',
        type: formData.isDirectLink ? 'direct' : 'manual',
        status: 'active',
        currentParticipations: 0,
        advertiserId: 'platform_admin',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => {
         setSuccess(false);
         setView('list');
         fetchMissions();
      }, 2000);
    } catch (err) {
      alert("Failed to create mission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <Link href="/admin" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/40 hover:text-primary transition-all">
                  <ArrowLeft className="w-5 h-5" />
               </Link>
               <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter">Mission Control</h1>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">Platform Gigs & Direct Links</p>
               </div>
            </div>
            <button 
               onClick={() => setView(view === 'list' ? 'create' : 'list')}
               className="clay-button px-6 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95"
            >
               {view === 'list' ? <><Plus className="w-4 h-4" /> New Mission</> : <><List className="w-4 h-4" /> View List</>}
            </button>
         </div>

         {view === 'list' ? (
            <div className="space-y-4">
               {fetching ? (
                  <div className="p-20 flex flex-col items-center justify-center text-white/20">
                     <Loader className="w-10 h-10 animate-spin mb-4" />
                     <p className="text-xs font-black uppercase tracking-widest">Scanning Network...</p>
                  </div>
               ) : missions.length === 0 ? (
                  <div className="clay-card p-20 text-center border-white/5">
                     <Zap className="w-12 h-12 text-white/10 mx-auto mb-6" />
                     <p className="text-white/40 font-bold">No active platform missions found.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {missions.map((m) => (
                        <div key={m.id} className="clay-card p-8 group border-white/5 relative overflow-hidden">
                           <div className="flex items-start justify-between mb-6">
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg ${m.type === 'direct' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-primary/10 text-primary'}`}>
                                    <Zap className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <h4 className="text-lg font-black text-white">{m.title}</h4>
                                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{m.type === 'direct' ? 'Auto-Credit' : 'Manual Proof'}</p>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => handleDelete(m.id)}
                                 className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                              >
                                 <Trash className="w-4 h-4" />
                              </button>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="p-4 rounded-xl glass bg-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Slots</p>
                                 <p className="text-lg font-black text-white">{m.currentParticipations} / {m.maxParticipations}</p>
                              </div>
                              <div className="p-4 rounded-xl glass bg-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Reward</p>
                                 <p className="text-lg font-black text-green-400">₦{m.userReward}</p>
                              </div>
                           </div>
                           
                           <div className="text-[9px] font-black text-white/10 uppercase tracking-[2px] truncate">
                              ID: {m.id}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         ) : success ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="clay-card p-20 text-center border-green-500/20">
               <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-6" />
               <h3 className="text-2xl font-black text-white mb-2">Mission Active!</h3>
               <p className="text-white/40">The promotional task is now live on the Earn page.</p>
            </motion.div>
         ) : (
            <form onSubmit={handleSubmit} className="clay-card p-8 md:p-10 space-y-8 border-white/5">
               {/* SAME FORM AS BEFORE */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Platform Category</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-white font-bold"
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  >
                     <option value="whatsapp">WhatsApp Status</option>
                     <option value="instagram">Instagram</option>
                     <option value="tiktok">TikTok</option>
                     <option value="youtube">YouTube</option>
                     <option value="twitter">X / Twitter</option>
                     <option value="facebook">Facebook</option>
                     <option value="web">Website / Monetag</option>
                  </select>
               </div>

               <div 
                  className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${formData.isDirectLink ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                  onClick={() => setFormData({...formData, isDirectLink: !formData.isDirectLink})}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isDirectLink ? 'bg-primary text-white' : 'bg-white/10 text-white/20'}`}>
                        <Zap className="w-5 h-5" />
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-white">Direct Link (Auto-Credit)</h4>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">No Screenshot Verification Needed</p>
                     </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isDirectLink ? 'bg-primary' : 'bg-white/10'}`}>
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isDirectLink ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    placeholder="e.g. Post TaskPlay on WhatsApp Status"
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-white font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Action Link (Optional)</label>
                  <input 
                    placeholder="https://..."
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-primary font-mono text-sm"
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Instructions for User</label>
                  <textarea 
                    required
                    placeholder="1. Copy text... 2. Post on status... 3. Screenshot after 1 hour."
                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-white/60 h-32 text-sm"
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">User Payout (₦)</label>
                     <input 
                       type="number"
                       className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-green-500/50 text-green-400 font-black"
                       value={formData.userReward}
                       onChange={(e) => setFormData({...formData, userReward: Number(e.target.value)})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Target Slots</label>
                     <input 
                       type="number"
                       className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-white font-black"
                       value={formData.maxParticipations}
                       onChange={(e) => setFormData({...formData, maxParticipations: Number(e.target.value)})}
                     />
                  </div>
               </div>

               <button 
                 disabled={loading}
                 className="w-full py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all mt-6"
               >
                 {loading ? <Loader className="animate-spin" /> : <>Activate Mission <Zap className="w-6 h-6" /></>}
               </button>
            </form>
         )}
      </div>
    </AdminGuard>
  );
}
