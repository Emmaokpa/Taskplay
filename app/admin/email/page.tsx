"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Users, 
  User, 
  ShieldCheck, 
  Settings, 
  Loader, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import AdminGuard from '@/app/components/AdminGuard';

export default function AdminEmailBroadcast() {
  const [target, setTarget] = useState<'all' | 'specific' | 'group'>('all');
  const [specificEmails, setSpecificEmails] = useState('');
  const [group, setGroup] = useState<'verified' | 'unverified'>('unverified');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return alert("Subject and content are required.");
    if (target === 'specific' && !specificEmails) return alert("Please enter at least one email.");

    setLoading(true);
    setMessage(null);

    try {
       const res = await fetch('/api/admin/broadcast-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target, specificEmails, group, subject, content })
       });
       const data = await res.json();
       if (data.success) {
          setMessage({ type: 'success', text: data.message });
       } else {
          setMessage({ type: 'error', text: data.error || "Failed to send broadcast." });
       }
    } catch (err) {
       console.error(err);
       setMessage({ type: 'error', text: "A fatal error occurred." });
    } finally {
       setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="p-10 max-w-5xl mx-auto pb-44">
        <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-xs uppercase tracking-widest leading-none">
          <ArrowLeft className="w-4 h-4" /> Admin Home
        </Link>

        <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
                <Send className="w-10 h-10 text-primary" /> Email Broadcast
            </h1>
            <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Reach your audience • Automated Outreach</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Controls Card */}
           <div className="lg:col-span-1 space-y-6">
              <div className="clay-card p-8 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl">
                 <h3 className="text-white font-black uppercase tracking-[3px] text-[10px] mb-8 flex items-center gap-2 opacity-40">
                    <Settings className="w-4 h-4" /> Targeting & Logic
                 </h3>
                 
                 <div className="space-y-4">
                    <button 
                       onClick={() => setTarget('all')}
                       className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${target === 'all' ? 'bg-primary/20 border-primary text-white shadow-lg' : 'glass border-white/5 text-white/40 hover:bg-white/5'}`}
                    >
                       <span className="font-bold text-sm">All Users</span>
                       <Users className="w-5 h-5" />
                    </button>
                    
                    <button 
                       onClick={() => setTarget('group')}
                       className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${target === 'group' ? 'bg-primary/20 border-primary text-white shadow-lg' : 'glass border-white/5 text-white/40 hover:bg-white/5'}`}
                    >
                       <span className="font-bold text-sm">Specific Group</span>
                       <ShieldCheck className="w-5 h-5" />
                    </button>

                    <button 
                       onClick={() => setTarget('specific')}
                       className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${target === 'specific' ? 'bg-primary/20 border-primary text-white shadow-lg' : 'glass border-white/5 text-white/40 hover:bg-white/5'}`}
                    >
                       <span className="font-bold text-sm">Target List</span>
                       <User className="w-5 h-5" />
                    </button>
                 </div>

                 {target === 'group' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-white/5">
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">Select Group Tier</p>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => setGroup('unverified')}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${group === 'unverified' ? 'bg-white/10 text-white' : 'glass text-white/20'}`}
                          >
                             Basic
                          </button>
                          <button 
                            onClick={() => setGroup('verified')}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${group === 'verified' ? 'bg-green-500/20 text-green-400' : 'glass text-white/20'}`}
                          >
                             Verified
                          </button>
                       </div>
                    </motion.div>
                 )}

                 {target === 'specific' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 pt-6 border-t border-white/5">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4">Email Addresses</p>
                        <textarea 
                           placeholder="user1@example.com, user2@example.com..."
                           className="w-full h-32 glass rounded-2xl p-4 text-xs font-medium text-white outline-none border border-white/5 focus:border-primary placeholder:text-white/10"
                           value={specificEmails}
                           onChange={(e) => setSpecificEmails(e.target.value)}
                        />
                        <p className="text-[8px] text-white/40 mt-2 italic">* Separate multiple emails with commas</p>
                    </motion.div>
                 )}
              </div>
           </div>

           {/* Compose Section */}
           <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="clay-card p-10 border-white/5 bg-[#0A0F1E]/40 backdrop-blur-3xl overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                 
                 <div className="mb-8">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-3 block">Message Subject</label>
                    <input 
                       className="w-full glass-dark py-5 px-6 rounded-2xl text-xl font-bold text-white outline-none border border-white/10 focus:border-primary transition-all shadow-inner"
                       placeholder="Enter your email heading..."
                       value={subject}
                       onChange={(e) => setSubject(e.target.value)}
                    />
                 </div>

                 <div className="mb-10">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[4px] mb-3 block">Main Content (HTML/Rich Text)</label>
                    <textarea 
                       className="w-full h-80 glass-dark p-6 rounded-2xl text-base font-medium text-white/80 outline-none border border-white/10 focus:border-primary transition-all leading-relaxed shadow-inner"
                       placeholder="Write your beautiful message here... (HTML supported)"
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="flex items-start gap-3 mt-4 px-2">
                       <AlertCircle className="w-4 h-4 text-white/20 mt-0.5" />
                       <p className="text-[10px] text-white/20 leading-relaxed font-bold italic">This message will be automatically wrapped in your high-end TaskPlay premium email template.</p>
                    </div>
                 </div>

                 {message && (
                    <motion.div 
                       initial={{ opacity: 0, x: -20 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       className={`p-6 rounded-2xl mb-8 flex items-center gap-4 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}
                    >
                       {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                       <p className="font-bold text-sm tracking-tight">{message.text}</p>
                    </motion.div>
                 )}

                 <button 
                   disabled={loading}
                   type="submit"
                   className="w-full py-6 rounded-[2rem] bg-primary hover:bg-blue-600 text-white font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                 >
                    {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Initiate Broadcast <Send className="w-6 h-6" /></>}
                 </button>
              </form>
           </div>
        </div>
      </div>
    </AdminGuard>
  );
}
