"use client";

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader,
  ShieldCheck,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { Skeleton } from '@/app/components/Skeleton';
import { onAuthStateChanged } from 'firebase/auth';

interface TaskData {
  id: string;
  advertiserId: string;
  userReward: number;
  category: string;
  title: string;
  description: string;
  actionUrl: string;
  instructions: string;
  status: string;
  maxParticipations: number;
  currentParticipations: number;
  [key: string]: unknown;
}

interface UserData {
  isMember?: boolean;
  [key: string]: unknown;
}

export default function TaskSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (user) {
        try {
          // 1. Fetch User Data (for membership check)
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const docData = userDoc.data();
            setUserData(docData);

            // Immediate Redirect if not a member
            if (!docData.isMember) {
              router.push('/upgrade');
              return;
            }
          } else {
            // If user doc doesn't exist, they definitely aren't a member
            router.push('/upgrade');
            return;
          }

          // 2. Fetch Task
          const docRef = doc(db, 'tasks', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isMounted) {
            const taskData = { id: docSnap.id, ...docSnap.data() } as TaskData;

            // Check if task is still active and has slots
            if (taskData && (taskData.status !== 'active' || (taskData.currentParticipations >= taskData.maxParticipations))) {
              setTask(null);
              setLoading(false);
              return;
            }

            setTask(taskData);

            // 3. Check for duplicate submission
            const q = query(
              collection(db, 'submissions'),
              where('taskId', '==', id),
              where('userId', '==', user.uid),
              limit(1)
            );
            const subSnap = await getDocs(q);
            if (!subSnap.empty && isMounted) {
              setAlreadySubmitted(true);
            }
          }
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
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const uploadToImageKit = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', `proof-${Date.now()}`);

    const authResponse = await fetch('/api/imagekit-auth');
    const authData = await authResponse.json();

    formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
    formData.append('signature', authData.signature);
    formData.append('expire', authData.expire);
    formData.append('token', authData.token);

    const uploadResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(result.message || 'Image upload failed');
    return result.url;
  };

  const handleSubmit = async () => {
    if (!task) return;
    if (!userData?.isMember) {
      router.push('/upgrade');
      return;
    }
    if (!file) return setError('Please upload a screenshot as proof.');
    setSubmitting(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Please log in first');

      // 0. Double check participation limit
      const taskRef = doc(db, 'tasks', id);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        const latestData = taskSnap.data();
        if ((latestData.currentParticipations || 0) >= (latestData.maxParticipations || 0)) {
          throw new Error('This task just reached its capacity. Please try another one.');
        }
      }

      // 1. Upload screenshot
      const proofUrl = await uploadToImageKit(file);

      // 2. Save submission to Firestore
      await addDoc(collection(db, 'submissions'), {
        taskId: id,
        userId: user.uid,
        advertiserId: task.advertiserId,
        proofUrl,
        status: 'pending',
        rewardAmount: task.userReward,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[2.5rem] h-64"><Skeleton className="h-full w-full rounded-2xl" /></div>
          <div className="glass p-10 rounded-[2.5rem] h-40"><Skeleton className="h-full w-full rounded-2xl" /></div>
        </div>
        <div className="glass p-8 rounded-[2rem] h-96"><Skeleton className="h-full w-full rounded-3xl" /></div>
      </div>
    </div>
  );

  if (!task) return <div className="p-20 text-center text-white/40 font-black uppercase tracking-widest">Target Task is no longer active.</div>;

  if (alreadySubmitted) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F1E]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="clay-card p-10 md:p-14 text-center max-w-md w-full border-blue-500/10"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-white mb-4 tracking-tight">Already Submitted!</h2>
        <p className="text-white/40 mb-10 text-sm">You have already submitted proof for this task. Please wait for the admin to verify it.</p>
        <Link href="/dashboard" className="clay-button w-full py-4 rounded-xl font-bold text-white inline-block text-sm uppercase tracking-widest">Command Center</Link>
      </motion.div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0F1E]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="clay-card p-10 md:p-14 text-center max-w-md w-full"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">Proof Submitted!</h2>
        <p className="text-white/40 mb-12 text-sm md:text-md">Your submission is pending verification. Rewards will be credited upon approval.</p>
        <Link href="/dashboard" className="clay-button w-full py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg text-white uppercase tracking-widest">Return to Dashboard</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/30 hover:text-white mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left: Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 md:p-8 rounded-[2rem] border-white/5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">{task.category}</span>
              <span className="text-[10px] font-black text-green-400">₦{task.userReward} Earn</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight leading-tight">{task.title}</h1>
            <p className="text-white/40 text-sm md:text-base leading-relaxed mb-8">{task.description}</p>

            <a
              href={task.actionUrl} target="_blank" rel="noopener noreferrer"
              className="bg-primary hover:bg-primary/80 w-full sm:w-auto px-10 py-4 rounded-xl font-black text-sm text-white inline-flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Start Earning Now <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="glass p-6 md:p-8 border-white/5 rounded-[2rem] bg-white/[0.01]">
            <h3 className="text-sm font-black text-white/60 mb-6 uppercase tracking-[3px] flex items-center gap-2">
               Steps to follow
            </h3>
            <div className="whitespace-pre-line text-white/50 leading-loose text-sm pl-2">
              {task.instructions}
            </div>
          </div>
        </div>

        {/* Right: Submission */}
        <div className="space-y-6">
          <div className="glass p-6 md:p-8 border-white/5 rounded-[2rem] shadow-2xl">
            <h3 className="text-sm font-black text-white mb-6 uppercase tracking-[3px]">Submit Proof</h3>

            <div className="relative group">
              <input
                type="file"
                id="screenshot-task"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label
                htmlFor="screenshot-task"
                className="block aspect-square glass rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden"
              >
                {preview ? (
                  <>
                    <Image src={preview} alt="Task proof" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="w-8 h-8 text-white/10 mb-3" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[2px]">Tap to upload screenshot</p>
                  </div>
                )}
              </label>
            </div>

            {error && <div className="mt-4 p-3 rounded-lg glass border-red-500/10 text-red-400 text-[10px] flex items-center gap-2"><AlertCircle className="w-3 h-3" /> {error}</div>}

            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full mt-6 bg-green-600 hover:bg-green-500 py-4 rounded-xl font-black text-xs text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
            >
              {submitting ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirm Completed'}
            </button>
          </div>

          <div className="glass p-5 rounded-2xl border-white/5">
             <p className="text-[9px] text-white/20 leading-relaxed font-black uppercase tracking-widest text-center">
               Fake proof leads to permanent account suspension
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
