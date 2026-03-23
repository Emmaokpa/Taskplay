"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Loader, 
  CreditCard, 
  Wallet,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Smartphone,
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

function CreateCampaignForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = (searchParams.get('type') as 'social' | 'cpa' | 'sale') || 'social';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [advertiserBalance, setAdvertiserBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean, type: 'success' | 'error' | 'info' | 'loading', title: string, message: string
  }>({ isOpen: false, type: 'info', title: '', message: '' });

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
        const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
        const PaystackPop = (await import('@paystack/inline-js')).default;
        const paystack = new PaystackPop();

        paystack.newTransaction({
          key: publicKey,
          email: user.email!,
          amount: Math.round(totalCost) * 100,
          currency: "NGN",
          onSuccess: async (response: any) => {
            let thumbnailUrl = "";
            if (imageFile) thumbnailUrl = await uploadToImageKit(imageFile);
            await saveCampaignToFirestore(response.reference, thumbnailUrl);
            setStep(4);
            setModal({ isOpen: true, type: 'success', title: 'Payment Confirmed', message: 'Campaign submitted for review.' });
          },
          onCancel: () => setLoading(false),
        });
      }
    } catch (err: any) {
       setModal({ isOpen: true, type: 'error', title: 'Error', message: err.message });
    } finally {
       setLoading(false);
    }
  };

  const currentOptions = initialType === 'social' ? SOCIAL_PLATFORMS : CPA_CATEGORIES;
  const meta = getPlatformMetadata(formData.platform);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white py-12 px-4 selection:bg-primary selection:text-white">
      <div className="max-w-xl mx-auto">
        <Link href="/advertise" className="inline-flex items-center gap-2 text-white/30 hover:text-white mb-8 font-black text-[10px] uppercase tracking-[3px] transition-all group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" /> Back to Hub
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">New Campaign</h1>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[4px]">Mission Control • {initialType} Category</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-12">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-700 ${step >= s ? 'bg-primary shadow-[0_0_10px_rgba(74,144,226,0.3)]' : 'bg-white/5'}`} />
           ))}
        </div>

        <div className="bg-[#151B2B] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
           
           <AnimatePresence mode="wait">
              {/* STEP 1: Selection */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                   <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xs border border-primary/20">01</span>
                      Select {initialType === 'social' ? 'Platform' : 'Task Type'}
                   </h2>
                   
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
                      {currentOptions.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => { setFormData({...formData, platform: p.id}); setStep(2); }}
                          className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group relative overflow-hidden ${formData.platform === p.id ? 'border-primary bg-primary/5' : 'border-white/5 hover:bg-white/[0.03]'}`}
                        >
                           <div className="mb-3 transition-transform group-hover:scale-110 z-10" style={{ color: p.color }}>
                              {p.icon}
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white/40 z-10 group-hover:text-white transition-colors">{p.name}</span>
                           {formData.platform === p.id && <motion.div layoutId="active-bg" className="absolute inset-0 bg-primary/5 pointer-events-none" />}
                        </button>
                      ))}
                   </div>
                   
                   <p className="text-[9px] text-center text-white/20 font-black uppercase tracking-widest">Select an iron box above to continue</p>
                </motion.div>
              )}

              {/* STEP 2: Logic Info */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                   <h2 className="text-xl font-black mb-2 flex items-center gap-3 capitalize">
                      <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xs border border-primary/20">02</span>
                      {formData.platform.replace('_', ' ')} Setup
                   </h2>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-1">Title for your {formData.platform} ad</label>
                         <input 
                           placeholder={initialType === 'social' ? `e.g. Follow my ${formData.platform} account` : `e.g. Register on our ${formData.platform.replace('_', ' ')}`}
                           className="w-full px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/5 outline-none focus:border-primary transition-all font-black text-white placeholder:text-white/10"
                           value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-1">{meta.urlLabel}</label>
                         <input 
                           type="url"
                           placeholder={meta.urlPlaceholder}
                           className="w-full px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/5 outline-none focus:border-primary/50 transition-all font-mono text-sm text-primary"
                           value={formData.actionUrl}
                           onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                         />
                      </div>

                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-1">{formData.platform.replace('_', ' ')} Task Steps</label>
                         <textarea 
                           placeholder={meta.instPlaceholder}
                           className="w-full px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/5 outline-none focus:border-primary transition-all text-sm h-32 text-white/60"
                           value={formData.instructions}
                           onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-1">Visual Asset (Optional)</label>
                         <div className="flex items-center gap-4">
                            <input type="file" onChange={handleImageChange} className="hidden" id="file-upload" accept="image/*" />
                            <label htmlFor="file-upload" className="flex-1 px-6 py-4 rounded-xl border border-dashed border-white/10 hover:border-primary text-center text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all text-white/30 hover:text-white">
                               {imageFile ? imageFile.name : 'Upload Content Thumbnail'}
                            </label>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button onClick={() => setStep(1)} className="px-8 py-5 rounded-2xl font-black text-white/20 hover:text-white transition-all text-xs uppercase tracking-widest">Back</button>
                      <button 
                        onClick={() => setStep(3)} 
                        disabled={!formData.title || !formData.actionUrl || !formData.instructions}
                        className="flex-1 bg-primary py-5 rounded-2xl font-black text-white shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-20 text-xs uppercase tracking-[2px]"
                      >
                         Advance to Budgeting
                      </button>
                   </div>
                </motion.div>
              )}

              {/* STEP 3: Financing */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                   <h2 className="text-xl font-black mb-2 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xs border border-primary/20">03</span>
                      Capital Allocation
                   </h2>

                   <div className="bg-[#1A202C] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                      <div>
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Platform</p>
                         <p className="text-lg font-black text-white capitalize">{formData.platform.replace('_', ' ')}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-inner">
                         {currentOptions.find(p => p.id === formData.platform)?.icon}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/30 uppercase tracking-[2px] ml-1">Volume of {formData.platform} Tasks</label>
                         <input 
                           type="number"
                           className="w-full px-6 py-8 rounded-3xl bg-black/20 border border-white/5 outline-none focus:border-primary transition-all font-black text-5xl text-center text-white"
                           value={formData.count}
                           onChange={(e) => setFormData({...formData, count: Number(e.target.value)})}
                         />
                      </div>

                      <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 relative overflow-hidden">
                         <div className="flex justify-between items-center mb-8 relative z-10">
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-[3px]">Mission Budget</span>
                            <span className="text-4xl font-black text-white">
                               ₦{(formData.count * getPricingForCategory(formData.platform).advertiserPrice).toLocaleString()}
                            </span>
                         </div>
                         <div className="space-y-3 pt-6 border-t border-white/5 relative z-10">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-white/20">Advertiser Rate</span>
                               <span className="text-white/60">₦{getPricingForCategory(formData.platform).advertiserPrice} per task</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className="text-white/20">User Earning</span>
                               <span className="text-green-500">₦{getPricingForCategory(formData.platform).userEarn} per completion</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="px-8 py-5 rounded-2xl font-black text-white/20 hover:text-white transition-all text-xs uppercase tracking-widest">Back</button>
                      <button 
                        onClick={handleFinalSubmit}
                        className="flex-1 bg-primary py-5 rounded-2xl font-black text-white shadow-2xl shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-[2px]"
                      >
                         {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> Execute Campaign</>}
                      </button>
                   </div>
                </motion.div>
              )}

              {/* STEP 4: Deployment */}
              {step === 4 && (
                <div className="text-center py-10">
                   <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-green-500/20">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                   </div>
                   <h2 className="text-4xl font-black mb-4 tracking-tighter">Synchronized</h2>
                   <p className="text-white/30 mb-12 text-sm font-medium leading-relaxed max-w-xs mx-auto uppercase tracking-wide">Payload received. Status pending internal verification. Check command center for updates.</p>
                   <button onClick={() => router.push('/advertise')} className="w-full bg-white text-[#0A0F1E] py-5 rounded-3xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all text-xs uppercase tracking-[3px]">Command Center</button>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
      <Modal 
        isOpen={modal.isOpen} 
        onClose={() => setModal({...modal, isOpen: false})} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message}
      />
    </div>
  );
}

export default function CreateCampaignPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-white/20 font-black tracking-widest uppercase">Initializing Interface...</div>}>
      <CreateCampaignForm />
    </Suspense>
  );
}
