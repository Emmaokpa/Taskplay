"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Loader,
  CreditCard,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Globe,
  MessageCircle,
  Play,
  Download,
  Trophy,
  DollarSign,
  Building2,
  Send
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPricingForCategory } from '@/lib/pricing';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import Modal from '@/app/components/Modal';

// Social Platforms
const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-6 h-6" />, color: '#E4405F' },
  { id: 'tiktok', name: 'TikTok', icon: <Play className="w-6 h-6" />, color: '#FFFFFF' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="w-6 h-6" />, color: '#FF0000' },
  { id: 'twitter', name: 'X / Twitter', icon: <Twitter className="w-6 h-6" />, color: '#1DA1F2' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-6 h-6" />, color: '#1877F2' },
  { id: 'telegram', name: 'Telegram', icon: <Send className="w-6 h-6" />, color: '#0088CC' },
  { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-6 h-6" />, color: '#25D366' }
];

// CPA Categories
const CPA_CATEGORIES = [
  { id: 'website', name: 'Website Visit', icon: <Globe className="w-6 h-6" />, color: '#4A90E2' },
  { id: 'app_install', name: 'App Install', icon: <Download className="w-6 h-6" />, color: '#A855F7' },
  { id: 'betting', name: 'Betting Reg', icon: <Trophy className="w-6 h-6" />, color: '#F59E0B' },
  { id: 'loan', name: 'Loan App', icon: <DollarSign className="w-6 h-6" />, color: '#10B981' },
  { id: 'bank', name: 'Bank App', icon: <Building2 className="w-6 h-6" />, color: '#3B82F6' }
];

const getPlatformMetadata = (platformId: string) => {
  switch (platformId) {
    case 'instagram': return {
      urlLabel: 'Instagram Post/Profile URL',
      urlPlaceholder: 'https://instagram.com/reel/...',
      instPlaceholder: 'e.g., Click the link, Like the reel, and follow my account. Screenshot your like.'
    };
    case 'tiktok': return {
      urlLabel: 'TikTok Video URL',
      urlPlaceholder: 'https://tiktok.com/@user/video/...',
      instPlaceholder: 'e.g., Watch for 10 seconds, Like and Follow. Tag 2 friends.'
    };
    case 'youtube': return {
      urlLabel: 'YouTube Video/Channel Link',
      urlPlaceholder: 'https://youtube.com/watch?v=...',
      instPlaceholder: 'e.g., Subscribe to the channel and turn on bell notifications. Screenshot the sub.'
    };
    case 'twitter': return {
      urlLabel: 'X / Twitter Post/Profile URL',
      urlPlaceholder: 'https://x.com/user/status/...',
      instPlaceholder: 'e.g., Retweet the post and follow my account. Screenshot the retweet.'
    };
    case 'facebook': return {
      urlLabel: 'Facebook Page/Post link',
      urlPlaceholder: 'https://facebook.com/share/v/...',
      instPlaceholder: 'e.g., Like the post and comment "Incredible!" Screenshot the comment.'
    };
    case 'telegram': return {
      urlLabel: 'Telegram Group/Channel Link',
      urlPlaceholder: 'https://t.me/yourgroup',
      instPlaceholder: 'e.g., Join the group and say "Hello from TaskPlay". Screenshot your chat.'
    };
    case 'whatsapp': return {
      urlLabel: 'WhatsApp Status Link/Number',
      urlPlaceholder: 'https://wa.me/yournumber',
      instPlaceholder: 'e.g., Message me to see my status, or repost this content on your status for 24 hours.'
    };
    case 'app_install': return {
      urlLabel: 'App Play Store/App Store Link',
      urlPlaceholder: 'https://play.google.com/store/apps/details?id=...',
      instPlaceholder: 'e.g., Download the app, open it for 2 minutes, and rate it 5 stars. Screenshot the rating.'
    };
    case 'website': return {
      urlLabel: 'Website URL',
      urlPlaceholder: 'https://yourwebsite.com',
      instPlaceholder: 'e.g., Visit the site, click on one article, and wait for 60 seconds. Screenshot the footer.'
    };
    case 'betting': return {
      urlLabel: 'Betting Registration Link',
      urlPlaceholder: 'https://bet.com/register?ref=...',
      instPlaceholder: 'e.g., Register with the referral link, verify your email, and make a minimum deposit of ₦100.'
    };
    case 'loan': return {
      urlLabel: 'Loan App Registration Link',
      urlPlaceholder: 'https://loanapp.com/signup',
      instPlaceholder: 'e.g., Download the loan app and complete the BVN verification. Screenshot the success page.'
    };
    case 'bank': return {
      urlLabel: 'Bank App Registration Link',
      urlPlaceholder: 'https://bank.com/signup',
      instPlaceholder: 'e.g., Open a free account, complete Level 2 KYC, and screenshot your account number.'
    };
    default: return {
      urlLabel: 'Task Link / URL',
      urlPlaceholder: 'https://...',
      instPlaceholder: 'List specific steps for the user to follow...'
    };
  }
};

export default function CreateCampaignForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = (searchParams.get('type') as 'social' | 'cpa' | 'sale') || 'social';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [advertiserBalance, setAdvertiserBalance] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentUser, setCurrentUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: initialType,
    platform: '',
    title: '',
    description: '',
    instructions: '',
    actionUrl: '',
    count: 10,
    pricePerSale: 0,
    proofType: 'screenshot' as const,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [, setImagePreview] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean, type: 'success' | 'error' | 'info' | 'loading', title: string, message: string
  }>({ isOpen: false, type: 'info', title: '', message: '' });
  const processedRef = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setAdvertiserBalance(data.balance || 0);
          setUserData(data);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setImageFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const uploadToImageKit = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileName', `thumb-${Date.now()}`);
    const authResponse = await fetch('/api/imagekit-auth');
    const authData = await authResponse.json();
    fd.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
    fd.append('signature', authData.signature);
    fd.append('expire', authData.expire);
    fd.append('token', authData.token);

    const uploadResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
      method: 'POST',
      body: fd,
    });
    const result = await uploadResponse.json();
    return result.url;
  };

  const saveCampaignToFirestore = async (paymentRef: string, thumbnailUrl: string) => {
    const user = auth.currentUser!;
    const pricing = getPricingForCategory(formData.platform);

    const totalBudget = formData.count * pricing.advertiserPrice;
    const userReward = pricing.userEarn;
    const platformCommission = pricing.platformFee;

    await addDoc(collection(db, 'tasks'), {
      advertiserId: user.uid,
      ...formData,
      thumbnailUrl,
      totalBudget,
      userReward,
      platformCommission,
      maxParticipations: formData.count,
      currentParticipations: 0,
      status: 'pending_admin',
      paymentRef: paymentRef || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleFinalSubmit = async () => {
    if (!userData?.isMember) {
      router.push('/upgrade');
      return;
    }
    const user = currentUser || auth.currentUser;
    if (!user) return;

    const pricing = getPricingForCategory(formData.platform);
    const totalCost = formData.count * pricing.advertiserPrice;

    setLoading(true);
    processedRef.current = false;
    setModal({ isOpen: true, type: 'loading', title: 'Processing', message: 'Launching your campaign...' });

    try {
      if (advertiserBalance >= totalCost) {
        await updateDoc(doc(db, 'users', user.uid), { balance: increment(-totalCost) });
        let thumbnailUrl = "";
        if (imageFile) thumbnailUrl = await uploadToImageKit(imageFile);
        await saveCampaignToFirestore('balance_deduction', thumbnailUrl);
        setStep(4);
        setModal({ isOpen: true, type: 'success', title: 'Launched!', message: 'Campaign is now pending admin approval.' });
      } else {
        const publicKey = process.env.NEXT_PUBLIC_KORAPAY_PUBLIC_KEY;
        if (!(window as any).Korapay) {
            setModal({ isOpen: true, type: 'error', title: 'Gateway Error', message: 'Payment gateway still loading. Please try again in 2 seconds.' });
            setLoading(false);
            return;
        }

        (window as any).Korapay.initialize({
          key: publicKey,
          reference: `camp_${Date.now()}_${user.uid.substring(0, 5)}`,
          customer: {
            name: user.displayName || user.email?.split('@')[0] || "Advertiser",
            email: user.email!
          },
          amount: Math.round(totalCost), // Korapay amount (mapped straight in NGN)
          currency: "NGN",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSuccess: async (response: any) => {
            if (processedRef.current) return;
            processedRef.current = true;
            let thumbnailUrl = "";
            if (imageFile) thumbnailUrl = await uploadToImageKit(imageFile);
            await saveCampaignToFirestore(response.reference, thumbnailUrl);
            setStep(4);
            setModal({ isOpen: true, type: 'success', title: 'Payment Confirmed', message: 'Campaign submitted for review.' });
          },
          onClose: () => setLoading(false),
        });
      }
    } catch (err) {
      setModal({ isOpen: true, type: 'error', title: 'Error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const currentOptions = initialType === 'social' ? SOCIAL_PLATFORMS : CPA_CATEGORIES;
  const meta = getPlatformMetadata(formData.platform);

  return (
    <div className="min-h-screen bg-[#05070A] text-white py-12 px-6 selection:bg-primary selection:text-white relative overflow-hidden pb-44">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] -ml-48 -mb-48 pointer-events-none" />

      <div className="max-w-2xl mx-auto">
        <Link href="/advertise" className="inline-flex items-center gap-3 text-white/20 hover:text-white mb-10 font-black text-[10px] uppercase tracking-[4px] transition-all group">
          <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          Back to Hub
        </Link>

        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter">Deploy Campaign</h1>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-[5px]">Sector: {initialType} • Mission Identity</p>
        </div>

        {/* Steps - REFINED INDICATORS */}
        <div className="flex gap-4 mb-14">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 flex flex-col gap-3">
              <div className={`h-1 rounded-full transition-all duration-1000 ${step >= s ? 'bg-gradient-to-r from-primary to-accent shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-white/5'}`} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s ? 'text-primary' : 'text-white/10'}`}>Phase 0{s}</span>
            </div>
          ))}
        </div>

        <div className="clay-card bg-[#0A0F1E]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] via-transparent to-white/[0.02] pointer-events-none" />

          <AnimatePresence mode="wait">
            {/* STEP 1: Selection - SLEEK GRID */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl glass-dark border-primary/20 text-primary flex items-center justify-center text-xs font-black shadow-xl">01</div>
                  <h2 className="text-2xl font-black tracking-tight">Select {initialType === 'social' ? 'Platform' : 'Task Type'}</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-12">
                  {currentOptions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setFormData({ ...formData, platform: p.id }); setStep(2); }}
                      className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${formData.platform === p.id ? 'border-primary/50 bg-primary/10 shadow-[0_20px_40px_rgba(139,92,246,0.2)]' : 'border-white/5 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05]'}`}
                    >
                      <div className="mb-4 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 z-10" style={{ color: p.color }}>
                        {p.icon}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[3px] text-white/30 z-10 group-hover:text-white transition-colors">{p.name}</span>
                      {formData.platform === p.id && <motion.div layoutId="active-bg" className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />}
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-center text-white/20 font-black uppercase tracking-[5px] flex items-center justify-center gap-3">
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  Select an objective node to engage
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                </p>
              </motion.div>
            )}

            {/* STEP 2: Logic Info - REFINED INPUTS */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl glass-dark border-primary/20 text-primary flex items-center justify-center text-xs font-black shadow-xl">02</div>
                  <h2 className="text-2xl font-black tracking-tight capitalize">{formData.platform.replace('_', ' ')} Setup</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Title for your {formData.platform} ad</label>
                    <input
                      placeholder={initialType === 'social' ? `e.g. Follow my ${formData.platform} account` : `e.g. Register on our ${formData.platform.replace('_', ' ')}`}
                      className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 font-bold text-white placeholder:text-white/10"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">{meta.urlLabel}</label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder={meta.urlPlaceholder}
                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 font-mono text-xs text-primary placeholder:text-primary/20"
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <Globe className="w-4 h-4 text-primary opacity-30" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">{formData.platform.replace('_', ' ')} Task Steps</label>
                    <textarea
                      placeholder={meta.instPlaceholder}
                      className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border border-white/5 outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all duration-300 text-sm h-40 text-white/60 leading-relaxed font-medium"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Visual Asset (Optional)</label>
                    <div className="flex items-center gap-4">
                      <input type="file" onChange={handleImageChange} className="hidden" id="file-upload" accept="image/*" />
                      <label htmlFor="file-upload" className="flex-1 px-8 py-6 rounded-3xl border-2 border-dashed border-white/5 hover:border-primary/40 hover:bg-primary/5 text-center text-[10px] font-black uppercase tracking-[4px] cursor-pointer transition-all duration-500 text-white/20 hover:text-white group">
                        {imageFile ? (
                          <span className="text-primary truncate block max-w-[200px] mx-auto">{imageFile.name}</span>
                        ) : (
                          <span className="flex items-center justify-center gap-3">
                            <Download className="w-4 h-4 opacity-50 group-hover:translate-y-1 transition-transform" />
                            Upload Media Fragment
                          </span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <button onClick={() => setStep(1)} className="px-10 py-5 rounded-[1.5rem] glass hover:bg-white/10 active:scale-95 font-black text-white transition-all text-xs uppercase tracking-[3px]">Protocol Reset</button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.title || !formData.actionUrl || !formData.instructions}
                    className="flex-1 clay-button py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-20 text-xs uppercase tracking-[3px] italic"
                  >
                    Advance to Budgeting
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Financing - SLEEK SUMMARY */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl glass-dark border-primary/20 text-primary flex items-center justify-center text-xs font-black shadow-xl">03</div>
                  <h2 className="text-2xl font-black tracking-tight">Capital Allocation</h2>
                </div>

                <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[4px] mb-2 uppercase">Protocol</p>
                    <p className="text-2xl font-black text-white capitalize group-hover:text-primary transition-colors">{formData.platform.replace('_', ' ')}</p>
                  </div>
                  <div className="w-16 h-16 rounded-[1.5rem] glass flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    {currentOptions.find(p => p.id === formData.platform)?.icon}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[3px] ml-1">Task Volume</label>
                    <div className="relative group">
                      <input
                        type="number"
                        className="w-full px-8 py-10 rounded-[2.5rem] bg-black/40 border-2 border-white/5 outline-none focus:border-primary/40 focus:bg-black/60 transition-all font-black text-7xl text-center text-white tracking-tighter"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="p-10 rounded-[3rem] bg-gradient-to-br from-primary/[0.08] via-[#0A0F1E] to-accent/[0.08] border border-white/10 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col items-center text-center mb-10 relative z-10">
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-[5px] mb-4">Mission Budget</span>
                      <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        ₦{(formData.count * getPricingForCategory(formData.platform).advertiserPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5 relative z-10">
                      <div className="text-center md:text-left">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Base Rate</p>
                        <p className="text-sm font-black text-white/60">₦{getPricingForCategory(formData.platform).advertiserPrice}/task</p>
                      </div>
                      <div className="text-center md:text-right">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Payout</p>
                        <p className="text-sm font-black text-green-400">₦{getPricingForCategory(formData.platform).userEarn}/user</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <button onClick={() => setStep(2)} className="px-10 py-5 rounded-[1.5rem] glass hover:bg-white/10 active:scale-95 font-black text-white transition-all text-xs uppercase tracking-[3px]">Recalibrate</button>
                  <button
                    onClick={handleFinalSubmit}
                    className="flex-1 clay-button py-5 rounded-[1.5rem] font-black text-white shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[3px] italic"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Execute Campaign</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Deployment - REFINED SUCCESS */}
            {step === 4 && (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className="w-28 h-28 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                >
                  <CheckCircle2 className="w-14 h-14 text-green-500" />
                </motion.div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter">Synchronized</h2>
                <p className="text-white/30 mb-14 text-sm font-bold uppercase tracking-[4px] leading-relaxed max-w-sm mx-auto italic text-center">Payload received. Status pending internal verification. Check command center for updates.</p>
                <button onClick={() => router.push('/advertise')} className="w-full clay-button py-6 rounded-[2rem] font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-[4px] italic">Return to Command Center</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
