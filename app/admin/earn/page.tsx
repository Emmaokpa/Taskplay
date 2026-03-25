"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ArrowLeft, 
  Zap, 
  Loader, 
  CheckCircle2, 
  Trash,
  List,
  Pencil,
  X,
  Pause,
  Play,
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import AdminGuard from '@/app/components/AdminGuard';

interface Mission {
  id: string;
  title: string;
  instructions: string;
  userReward: number;
  maxParticipations: number;
  currentParticipations: number;
  platform: string;
  actionUrl: string;
  type: string;
  status: string;
  isDirectLink: boolean;
  [key: string]: unknown;
}

type FormState = {
  title: string;
  instructions: string;
  userReward: number;
  maxParticipations: number;
  platform: string;
  actionUrl: string;
  isDirectLink: boolean;
};

export default function AdminEarnManagement() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [missions, setMissions] = useState<Mission[]>([]);

  // Edit modal state
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
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
      setMissions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Mission)));
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
        setMissions(prev => prev.filter(m => m.id !== id));
     } catch {
        alert("Delete failed");
     }
  };

  const handleToggleStatus = async (mission: Mission) => {
    const newStatus = mission.status === 'active' ? 'paused' : 'active';
    try {
      await updateDoc(doc(db, 'tasks', mission.id), { status: newStatus });
      setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, status: newStatus } : m));
    } catch {
      alert("Failed to toggle status.");
    }
  };

  const handleOpenEdit = (mission: Mission) => {
    setEditingMission(mission);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMission) return;
    setEditLoading(true);
    try {
      const updatePayload = {
        title: editingMission.title,
        instructions: editingMission.instructions,
        userReward: Number(editingMission.userReward),
        maxParticipations: Number(editingMission.maxParticipations),
        platform: editingMission.platform,
        actionUrl: editingMission.actionUrl,
        type: editingMission.isDirectLink ? 'direct' : 'manual',
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'tasks', editingMission.id), updatePayload);
      setMissions(prev => prev.map(m => m.id === editingMission.id ? { ...m, ...updatePayload, updatedAt: new Date() } : m));
      setEditingMission(null);
    } catch {
      alert("Update failed.");
    } finally {
      setEditLoading(false);
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
         setFormData({ title: '', instructions: '', userReward: 10, maxParticipations: 1000, platform: 'web', actionUrl: '', isDirectLink: false });
      }, 2000);
    } catch {
      alert("Failed to create mission");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 outline-none focus:border-primary text-white font-bold text-sm";

  return (
    <AdminGuard>
      <div className="p-6 md:p-10 max-w-5xl mx-auto pb-40">
         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
               <Link href="/admin" className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/40 hover:text-primary transition-all">
                  <ArrowLeft className="w-5 h-5" />
               </Link>
               <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Mission Control</h1>
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
                        <motion.div 
                          key={m.id} 
                          layout
                          className={`clay-card p-6 sm:p-8 group border-white/5 relative overflow-hidden transition-all ${m.status === 'paused' ? 'opacity-50' : ''}`}
                        >
                           <div className="flex items-start justify-between mb-5 gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                 <div className={`p-2 rounded-lg shrink-0 ${m.type === 'direct' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-primary/10 text-primary'}`}>
                                    <Zap className="w-5 h-5" />
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="text-base font-black text-white truncate">{m.title}</h4>
                                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">{m.type === 'direct' ? 'Auto-Credit' : 'Manual Proof'}</p>
                                 </div>
                              </div>
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                    onClick={() => handleToggleStatus(m)}
                                    title={m.status === 'active' ? 'Pause' : 'Resume'}
                                    className={`p-2 rounded-lg transition-all ${m.status === 'active' ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                                 >
                                    {m.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                 </button>
                                 <button 
                                    onClick={() => handleOpenEdit(m)}
                                    className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                 >
                                    <Pencil className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(m.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all"
                                 >
                                    <Trash className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-3 gap-3 mb-4">
                              <div className="p-3 rounded-xl glass bg-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Slots</p>
                                 <p className="text-sm font-black text-white">{m.currentParticipations}/{m.maxParticipations}</p>
                              </div>
                              <div className="p-3 rounded-xl glass bg-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Reward</p>
                                 <p className="text-sm font-black text-green-400">₦{m.userReward}</p>
                              </div>
                              <div className={`p-3 rounded-xl glass ${m.status === 'active' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                 <p className={`text-sm font-black uppercase ${m.status === 'active' ? 'text-green-400' : 'text-orange-400'}`}>{m.status}</p>
                              </div>
                           </div>

                           <div className="text-[9px] font-black text-white/10 uppercase tracking-[2px] truncate">
                              ID: {m.id}
                           </div>
                        </motion.div>
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
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Platform Category</label>
                  <select className={inputClass} value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                     <option value="whatsapp">WhatsApp Status</option>
                     <option value="instagram">Instagram</option>
                     <option value="tiktok">TikTok</option>
                     <option value="youtube">YouTube</option>
                     <option value="twitter">X / Twitter</option>
                     <option value="facebook">Facebook</option>
                     <option value="web">Website / Monetag</option>
                  </select>
               </div>

               <div className={`p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${formData.isDirectLink ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`} onClick={() => setFormData({...formData, isDirectLink: !formData.isDirectLink})}>
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
                  <input required placeholder="e.g. Post TaskPlay on WhatsApp Status" className={inputClass} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Action Link (Optional)</label>
                  <input placeholder="https://..." className={inputClass + " text-primary font-mono"} value={formData.actionUrl} onChange={(e) => setFormData({...formData, actionUrl: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Instructions for User</label>
                  <textarea required placeholder="1. Copy text... 2. Post on status... 3. Screenshot after 1 hour." className={inputClass + " h-32 resize-none"} value={formData.instructions} onChange={(e) => setFormData({...formData, instructions: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">User Payout (₦)</label>
                     <input type="number" className={inputClass + " text-green-400 font-black"} value={formData.userReward} onChange={(e) => setFormData({...formData, userReward: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Target Slots</label>
                     <input type="number" className={inputClass} value={formData.maxParticipations} onChange={(e) => setFormData({...formData, maxParticipations: Number(e.target.value)})} />
                  </div>
               </div>
               <button disabled={loading} className="w-full py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all mt-6">
                 {loading ? <Loader className="animate-spin" /> : <>Activate Mission <Zap className="w-6 h-6" /></>}
               </button>
            </form>
         )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMission && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setEditingMission(null)} />
            <motion.form 
              onSubmit={handleEditSave}
              initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="clay-card p-8 md:p-10 w-full max-w-2xl relative z-10 space-y-6 border-primary/20 shadow-[0_0_80px_rgba(139,92,246,0.2)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-2">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">Edit Mission</h3>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1 truncate">ID: {editingMission.id}</p>
                 </div>
                 <button type="button" onClick={() => setEditingMission(null)} className="p-3 rounded-2xl glass hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Platform</label>
                 <select className={inputClass} value={editingMission.platform} onChange={(e) => setEditingMission({...editingMission, platform: e.target.value})}>
                    <option value="whatsapp">WhatsApp Status</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="telegram">Telegram</option>
                    <option value="web">Website / Monetag</option>
                 </select>
              </div>

              <div className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${editingMission.isDirectLink ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/5'}`} onClick={() => setEditingMission({...editingMission, isDirectLink: !editingMission.isDirectLink})}>
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingMission.isDirectLink ? 'bg-primary text-white' : 'bg-white/10 text-white/20'}`}><Zap className="w-5 h-5" /></div>
                    <div>
                       <h4 className="text-sm font-black text-white">Direct Link (Auto-Credit)</h4>
                       <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Toggle credit mode</p>
                    </div>
                 </div>
                 <div className={`w-12 h-6 rounded-full p-1 transition-colors ${editingMission.isDirectLink ? 'bg-primary' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${editingMission.isDirectLink ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Task Title</label>
                 <input required className={inputClass} value={editingMission.title} onChange={(e) => setEditingMission({...editingMission, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Action Link</label>
                 <input className={inputClass + " text-primary font-mono"} value={editingMission.actionUrl || ''} onChange={(e) => setEditingMission({...editingMission, actionUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Instructions</label>
                 <textarea required className={inputClass + " h-32 resize-none"} value={editingMission.instructions} onChange={(e) => setEditingMission({...editingMission, instructions: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">User Payout (₦)</label>
                    <input type="number" className={inputClass + " text-green-400 font-black"} value={editingMission.userReward} onChange={(e) => setEditingMission({...editingMission, userReward: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Max Slots</label>
                    <input type="number" className={inputClass} value={editingMission.maxParticipations} onChange={(e) => setEditingMission({...editingMission, maxParticipations: Number(e.target.value)})} />
                 </div>
              </div>

              <button disabled={editLoading} type="submit" className="w-full py-5 rounded-3xl bg-primary text-white font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all">
                 {editLoading ? <Loader className="animate-spin" /> : <>Save Changes <CheckCircle2 className="w-5 h-5" /></>}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminGuard>
  );
}
