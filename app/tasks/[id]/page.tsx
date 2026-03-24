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
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-40">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors font-bold text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to App
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Task Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="clay-card p-10 bg-white/[0.02]">
            <div className="flex items-center gap-3 text-primary mb-6">
              <span className="px-3 py-1 rounded-lg glass text-[10px] font-black uppercase tracking-widest">{task.category}</span>
              <span className="text-[10px] uppercase font-black tracking-widest text-white/20">•</span>
              <span className="text-xs font-black text-green-400">₦{task.userReward} Reward</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight">{task.title}</h1>
            <p className="text-white/40 text-lg leading-relaxed mb-8">{task.description}</p>

            <a
              href={task.actionUrl} target="_blank" rel="noopener noreferrer"
              className="clay-button w-full sm:w-auto px-8 py-5 rounded-2xl font-black text-xl text-white inline-flex items-center gap-3"
            >
              Launch Task <ExternalLink className="w-6 h-6" />
            </a>
          </div>

          <div className="clay-card p-10 border-primary/20 bg-primary/5">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Instructions
            </h3>
            <div className="whitespace-pre-line text-white/60 leading-relaxed text-lg list-decimal pl-4">
              {task.instructions}
            </div>
          </div>
        </div>

        {/* Right: Submission */}
        <div className="space-y-6">
          <div className="clay-card p-8 border-white/10 overflow-hidden">
            <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest">Verify task</h3>

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
                className="block aspect-[4/3] glass rounded-2xl border-2 border-dashed border-white/10 group-hover:border-primary transition-all cursor-pointer relative overflow-hidden"
              >
                {preview ? (
                  <>
                    <Image src={preview} alt="Task proof preview" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-10 h-10 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="w-10 h-10 text-white/20 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-white/40 uppercase tracking-[2px]">Upload Screenshot</p>
                  </div>
                )}
              </label>
            </div>

            {error && <div className="mt-6 p-4 rounded-xl glass border-red-500/20 text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full mt-8 clay-button py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader className="w-5 h-5 animate-spin" /> : 'Submit Proof'}
            </button>
          </div>

          <div className="glass p-6 rounded-2xl">
            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-3">
              <AlertCircle className="w-3 h-3" /> Note
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Fraudulent submissions (fake/borrowed screenshots) will lead to immediate permanent ban and forfeiture of all earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
