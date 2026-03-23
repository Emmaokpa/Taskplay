"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader, 
  ExternalLink, 
  Image as ImageIcon,
  Zap,
  ArrowLeft,
  Trash2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import Link from 'next/link';
import AdminGuard from '@/app/components/AdminGuard';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending_admin' | 'active' | 'rejected'>('pending_admin');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tasks'), where('status', '==', filter));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleApprove = async (taskId: string, action: 'active' | 'rejected') => {
    setVerifying(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { 
        status: action,
        updatedAt: serverTimestamp()
      });

      if (action === 'rejected' && task.totalBudget > 0) {
        const advertiserRef = doc(db, 'users', task.advertiserId);
        await updateDoc(advertiserRef, { balance: increment(task.totalBudget) });
      }

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Action failed");
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to permanently delete this campaign?")) return;
    setVerifying(taskId);
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setVerifying(null);
    }
  };

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditForm({ ...task });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setVerifying(editingId);
    try {
      const taskRef = doc(db, 'tasks', editingId);
      await updateDoc(taskRef, {
        title: editForm.title,
        description: editForm.description,
        userReward: Number(editForm.userReward) || 0,
        updatedAt: serverTimestamp()
      });
      setTasks(prev => prev.map(t => t.id === editingId ? { ...t, ...editForm } : t));
      setEditingId(null);
    } catch (err) {
      alert("Save failed");
    } finally {
      setVerifying(null);
    }
  };

  if (loading && tasks.length === 0) return (
    <div className="p-20 text-center text-white/50 space-y-4">
      <Loader className="w-10 h-10 animate-spin mx-auto text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[3px]">Synchronizing Vault...</p>
    </div>
  );

  return (
    <AdminGuard>
      <div className="p-10 max-w-7xl mx-auto pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
           <div>
             <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Campaign Infrastructure</h1>
             <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Full CRUD Control • Advertiser Management</p>
           </div>
           
           <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(['pending_admin', 'active', 'rejected'] as const).map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
                >
                  {f.replace('_admin', '')}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => (
              <motion.div 
                layout
                key={task.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                className="clay-card p-0 overflow-hidden flex flex-col md:flex-row border-white/5 relative group"
              >
                {/* Thumbnail Section */}
                <div className="w-full md:w-64 aspect-video md:aspect-square relative bg-white/5 flex-shrink-0">
                  {task.thumbnailUrl ? (
                    <img src={task.thumbnailUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/10 gap-2">
                       <ImageIcon className="w-10 h-10" />
                       <span className="text-[10px] uppercase font-black">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-10">
                     <span className="px-3 py-1 rounded-lg glass text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                        {task.category}
                     </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  {editingId === task.id ? (
                    <div className="space-y-4">
                       <input 
                         className="w-full bg-white/5 border border-primary/30 p-4 rounded-xl text-white font-bold outline-none"
                         value={editForm.title}
                         onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                       />
                       <textarea 
                         className="w-full bg-white/5 border border-primary/30 p-4 rounded-xl text-white/60 text-sm outline-none h-24"
                         value={editForm.description}
                         onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                       />
                       <div className="flex gap-4">
                         <div className="flex-1">
                            <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Reward (₦)</label>
                            <input 
                              type="number"
                              className="w-full bg-white/5 border border-primary/30 p-3 rounded-xl text-primary font-black"
                              value={editForm.userReward}
                              onChange={(e) => setEditForm({...editForm, userReward: e.target.value})}
                            />
                         </div>
                         <div className="flex items-end gap-2">
                            <button onClick={saveEdit} className="p-4 rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/20"><Save className="w-5 h-5"/></button>
                            <button onClick={() => setEditingId(null)} className="p-4 rounded-xl glass border-white/10 text-white"><X className="w-5 h-5"/></button>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-green-400">₦{task.totalBudget?.toLocaleString()}</span>
                            <span className="text-[10px] text-white/20 font-black tracking-widest uppercase bg-white/5 px-2 py-1 rounded">REF: {task.id.slice(0,8)}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => startEdit(task)} className="p-2 rounded-lg glass border-white/5 text-white/20 hover:text-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-2 rounded-lg glass border-white/5 text-white/20 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{task.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-3">{task.description}</p>
                      
                      <div className="mt-auto flex flex-wrap items-center gap-4">
                         <a href={task.actionUrl} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl glass hover:bg-white/10 text-white/40 hover:text-white transition-all">
                            <ExternalLink className="w-5 h-5" />
                         </a>
                         <div className="flex-1" />
                         
                         {filter === 'pending_admin' && (
                           <>
                             <button 
                               onClick={() => handleApprove(task.id, 'rejected')}
                               className="p-4 px-6 rounded-xl glass border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs uppercase"
                             >
                               Reject
                             </button>
                             <button 
                               onClick={() => handleApprove(task.id, 'active')}
                               className="clay-button px-8 py-4 rounded-xl font-black text-white text-xs uppercase tracking-widest active:scale-95 shadow-xl shadow-primary/20"
                             >
                               {verifying === task.id ? <Loader className="w-5 h-5 animate-spin" /> : "Activate"}
                             </button>
                           </>
                         )}

                         {filter === 'active' && (
                            <span className="px-6 py-3 rounded-xl bg-green-500/10 text-green-400 text-[10px] font-black uppercase tracking-[3px] border border-green-500/20">
                               Live & Active
                            </span>
                         )}

                         {filter === 'rejected' && (
                            <span className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-[3px] border border-red-500/20">
                               Archived / Rejected
                            </span>
                         )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && !loading && (
             <div className="clay-card p-20 text-center border-white/5 bg-white/[0.01]">
                <Zap className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Queue Exhausted</h3>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">No matching campaigns in the {filter} segment.</p>
             </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
