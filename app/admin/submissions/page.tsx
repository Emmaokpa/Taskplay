"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Loader, 
  Eye, 
  ExternalLink, 
  X
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';

import { ListSkeleton } from '@/app/components/Skeleton';
import AdminGuard from '@/app/components/AdminGuard';

interface Submission {
  id: string;
  proofUrl: string;
  userId: string;
  taskId: string;
  rewardAmount: number;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
  [key: string]: unknown;
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, 'submissions'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        const subs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
        if (isMounted) setSubmissions(subs);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSubmissions();
    return () => { isMounted = false; };
  }, []);

  const handleVerify = async (sub: Submission, action: 'approve' | 'reject') => {
    setVerifying(sub.id);
    try {
      const subRef = doc(db, 'submissions', sub.id);
      
      if (action === 'approve') {
        // 1. Credit user balance
        const userRef = doc(db, 'users', sub.userId);
        await updateDoc(userRef, {
          balance: increment(sub.rewardAmount),
          totalEarned: increment(sub.rewardAmount),
        });

        // 2. Increment task participation count & check for completion
        const taskRef = doc(db, 'tasks', sub.taskId);
        const taskSnap = await getDoc(taskRef);
        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          const newCount = (taskData.currentParticipations || 0) + 1;
          const max = taskData.maxParticipations || 0;
          
          const updateData = (newCount >= max) 
            ? { currentParticipations: increment(1), status: 'completed' }
            : { currentParticipations: increment(1) };
          
          await updateDoc(taskRef, updateData);
        }

        // 3. Update submission status
        await updateDoc(subRef, { 
          status: 'approved',
          verifiedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(subRef, { 
          status: 'rejected',
          verifiedAt: serverTimestamp(),
        });
      }

      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
    } catch {
      alert("Verification failed");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return (
    <AdminGuard>
      <div className="p-10 max-w-6xl mx-auto space-y-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Proof Verification</h1>
          <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Reviewing entries...</p>
        </div>
        <ListSkeleton />
      </div>
    </AdminGuard>
  );

  return (
    <AdminGuard>
      <div className="p-10 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Proof Verification</h1>
        <p className="text-white/40 text-sm font-bold tracking-[2px] uppercase">Review and approve user submissions</p>
      </div>

      {submissions.length === 0 ? (
        <div className="clay-card p-20 text-center border-white/5 bg-white/[0.01]">
           <CheckCircle2 className="w-16 h-16 text-green-500/20 mx-auto mb-6" />
           <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
           <p className="text-white/40">No pending submissions to verify.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((sub, i) => (
            <motion.div 
               key={sub.id}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.05 }}
               className="clay-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-white/5 hover:border-primary/20 transition-all"
            >
               <div className="flex items-center gap-6 flex-1 overflow-hidden">
                  <div 
                    onClick={() => setSelectedProof(sub.proofUrl)}
                    className="w-24 h-24 rounded-2xl glass border-white/10 flex-shrink-0 cursor-pointer hover:scale-105 transition-all overflow-hidden relative group"
                  >
                     <Image src={sub.proofUrl} alt="Submission proof" fill className="object-cover rounded-[inherit] opacity-80" unoptimized />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                     </div>
                  </div>
                  <div className="overflow-hidden">
                     <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-green-400">₦{sub.rewardAmount}</span>
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/20">•</span>
                        <span className="text-xs font-bold text-white/40 truncate">UID: {sub.userId}</span>
                     </div>
                     <h3 className="text-xl font-black text-white tracking-tight truncate">Task ID: {sub.taskId}</h3>
                     <p className="text-[10px] uppercase font-black text-white/20 tracking-widest mt-2">{new Date(sub.createdAt.seconds * 1000).toLocaleString()}</p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <button 
                    disabled={!!verifying}
                    onClick={() => handleVerify(sub, 'reject')}
                    className="p-4 rounded-2xl glass border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                  >
                     <XCircle className="w-6 h-6" />
                  </button>
                  <button 
                    disabled={!!verifying}
                    onClick={() => handleVerify(sub, 'approve')}
                    className="clay-button px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 group active:scale-95"
                  >
                     {verifying === sub.id ? <Loader className="w-6 h-6 animate-spin" /> : <>Approve <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" /></>}
                  </button>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Proof Modal */}
      <AnimatePresence>
        {selectedProof && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setSelectedProof(null)} />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative max-w-4xl w-full p-2 glass rounded-3xl border-white/20 overflow-hidden"
             >
                <button onClick={() => setSelectedProof(null)} className="absolute top-4 right-4 p-3 rounded-full glass bg-black/40 text-white z-10 hover:bg-white/10 transition-all">
                   <X className="w-6 h-6" />
                </button>
                <Image src={selectedProof} alt="Submission proof enlarged" width={800} height={600} className="w-full h-auto max-h-[85vh] object-contain rounded-2xl" unoptimized />
                <div className="p-6 text-center">
                   <a href={selectedProof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:underline">
                      Open Full Size <ExternalLink className="w-4 h-4" />
                   </a>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </AdminGuard>
  );
}
