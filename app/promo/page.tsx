"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  ArrowLeft,
  Copy,
  MessageCircle,
  Send,
  Download,
  CheckCircle2,
  Sparkles,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ListSkeleton } from '@/app/components/Skeleton';
import { toPng } from 'html-to-image';

interface PromoCampaign {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  writeup: string;
  headline: string;
  subHeadline: string;
  bgColor: string;
}

export default function PromoHubPage() {
  const [userData, setUserData] = useState<{ referralCode: string; fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const router = useRouter();

  // Refs for capture
  const posterRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data() as { referralCode: string; fullName: string });
          }
        } catch (err) {
          console.error('Error fetching data:', err);
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
  }, [router]);

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${userData?.referralCode || 'YOUR_CODE'}` : '';

  const campaigns: PromoCampaign[] = [
    {
      id: 'dashboard-flex',
      title: "The Earnings Flex",
      description: "Show off a real account balance to instantly catch attention. Perfect for WhatsApp Status.",
      imagePath: "/mockups/dashboard.png", // USER MUST REPLACE THIS WITH THEIR UPLOAD
      writeup: `🚀 I'm cashing out daily with my smartphone on TaskPlay Nigeria! \n\nNo experience needed—just complete simple social tasks and get paid directly to your bank account. Stop watching others win and start earning today! 💰🔥\n\nClick my link to join the VIP circle right now:\n[LINK]`,
      headline: "TURN YOUR ONLINE ACTIVITY INTO REAL CASH.",
      subHeadline: "Start earning instantly today.",
      bgColor: "from-purple-900 via-[#0A0F1E] to-blue-900"
    },
    {
      id: 'casual-invite',
      title: "The Viral Promo",
      description: "A gorgeous, high-energy flyer that converts incredibly well on Instagram and Facebook.",
      imagePath: "/mockups/dashboard.png", // USER MUST REPLACE THIS WITH THEIR UPLOAD
      writeup: `Hey guys, I wanted to share this platform I’ve been using called TaskPlay. It actually pays you to do things like follow Instagram pages or download apps. 💸\n\nI've already started making money from it. If you want to try it out, use my invite link below so we can earn together! 👇\n[LINK]`,
      headline: "GET PAID FOR YOUR SCREEN TIME.",
      subHeadline: "The ultimate side hustle.",
      bgColor: "from-orange-900 via-[#0A0F1E] to-red-900"
    }
  ];

  const copyToClipboard = (text: string, stringId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(stringId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareToPlatform = async (platform: 'whatsapp' | 'telegram' | 'native', campaign: PromoCampaign) => {
    const fullMessage = campaign.writeup.replace('[LINK]', referralLink);

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'Make Money with TaskPlay',
          text: fullMessage,
        });
      } catch (error) {
        console.log('Error sharing naturally', error);
      }
      return;
    }

    const encodedMessage = encodeURIComponent(fullMessage);
    let url = '';

    if (platform === 'whatsapp') {
      url = `https://wa.me/?text=${encodedMessage}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(campaign.writeup.replace('[LINK]', ''))}`;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  const downloadPoster = async (campaign: PromoCampaign) => {
    const node = posterRefs.current[campaign.id];
    if (!node) return;

    setDownloadingId(campaign.id);
    try {
      // Temporarily remove transform restrictions for higher quality capture
      node.style.transform = 'scale(1)';
      
      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#05070A',
        style: { transform: 'scale(1)' } // Ensure no scaling affects capture
      });
      
      const link = document.createElement('a');
      link.download = `TaskPlay_Promo_${campaign.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
      alert('Failed to generate poster. Ensure images are fully loaded.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <ListSkeleton />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-7xl mx-auto pb-44 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      
      <Link href="/profile" className="inline-flex items-center gap-3 text-white/20 hover:text-white mb-12 transition-all font-black text-[10px] uppercase tracking-[5px] group">
         <div className="p-2 rounded-xl glass group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
         </div>
         Back to Profile
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div>
           <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-[1.5rem] bg-accent/20 flex items-center justify-center border border-accent/20 shadow-xl">
                 <Sparkles className="w-5 h-5 text-accent shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
              </div>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">Growth Hub</h1>
           <p className="text-white/40 text-[10px] font-black tracking-[3px] uppercase italic">Download premium flyers • Share • Earn Unlimited Commissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {campaigns.map((campaign, i) => {
          const fullMessage = campaign.writeup.replace('[LINK]', referralLink);
          const isCopied = copiedId === campaign.id;
          const isDownloading = downloadingId === campaign.id;

          return (
            <motion.div 
              key={campaign.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay-card bg-[#0A0F1E]/40 backdrop-blur-3xl border-white/5 relative group overflow-hidden flex flex-col h-full rounded-[2.5rem]"
            >
              {/* Header */}
              <div className="p-8 relative z-10 flex items-start justify-between gap-4 border-b border-white/5">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-2">{campaign.title}</h3>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{campaign.description}</p>
                 </div>
              </div>

              {/* POSTER RENDER CONTAINER */}
              {/* We render a pristine 1080x1080 square poster inside a scaled container for viewing, but html-to-image captures the full res */}
              <div className="bg-[#05070A] border-b border-white/5 flex items-center justify-center p-8 overflow-hidden relative min-h-[400px]">
                 <div className="absolute inset-0 bg-black/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none">
                    {/* Dark overlay on hover for better button visibility */}
                 </div>
                 
                 {/* The actual HD Poster Element (Scaled down visually, native size for capture) */}
                 <div className="w-full relative flex items-center justify-center">
                    <div 
                      ref={(el) => { posterRefs.current[campaign.id] = el }}
                      className={`w-[800px] h-[800px] bg-gradient-to-br ${campaign.bgColor} relative overflow-hidden flex flex-col items-center justify-center shadow-2xl`}
                      style={{ transform: 'scale(0.4)', transformOrigin: 'center' }}
                    >
                       {/* Abstract glowing orbs */}
                       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full mix-blend-overlay" />
                       <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/40 blur-[80px] rounded-full" />
                       
                       {/* Poster Typography */}
                       <div className="absolute top-16 w-full text-center z-20 px-12">
                          <h1 className="text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl leading-[1.1]">
                             {campaign.headline}
                          </h1>
                          <p className="text-2xl text-white/80 font-bold mt-4 tracking-[5px] uppercase drop-shadow-lg">
                             {campaign.subHeadline}
                          </p>
                       </div>

                       {/* 3D Phone Frame */}
                       <div className="relative z-30 mt-32" style={{ perspective: '1500px' }}>
                          <div
                            style={{ transform: 'rotateY(-15deg) rotateX(10deg) scale(1.1)' }}
                            className="relative w-[320px] rounded-[3.5rem] border-[12px] border-[#1c1c1e] shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_2px_0_rgba(255,255,255,0.2)] overflow-hidden bg-black aspect-[9/19.5]"
                          >
                             {/* Phone Buttons */}
                             <div className="absolute -right-[15px] top-32 w-[6px] h-20 bg-[#2c2c2e] rounded-r-md" />
                             <div className="absolute -left-[15px] top-24 w-[6px] h-12 bg-[#2c2c2e] rounded-l-md" />
                             <div className="absolute -left-[15px] top-40 w-[6px] h-20 bg-[#2c2c2e] rounded-l-md" />
                             
                             {/* Screen */}
                             <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
                               {/* Notch */}
                               <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-32 h-8 bg-[#1c1c1e] rounded-b-3xl" />
                               {/* User's Screenshot Here */}
                               <Image
                                 src={campaign.imagePath}
                                 alt="Screenshot Mockup"
                                 fill
                                 className="object-cover object-top"
                                 unoptimized
                               />
                               {/* Screen Glare */}
                               <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.1] via-transparent to-white/[0.05] pointer-events-none z-20" />
                               <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-24 h-1.5 bg-white/40 rounded-full" />
                             </div>
                          </div>
                          {/* Intense inner shadow behind phone */}
                          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[120%] h-20 bg-black/80 blur-3xl -z-10" />
                       </div>

                       {/* Brand Footer */}
                       <div className="absolute bottom-16 w-full text-center z-20">
                          <div className="text-4xl font-black text-white/90 tracking-tighter flex items-center justify-center gap-4 drop-shadow-2xl">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-black" />
                             </div>
                             TASKPLAY.NG
                          </div>
                          <div className="mt-4 inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-bold text-xl tracking-widest">
                             JOIN {userData?.fullName?.toUpperCase() || 'ME'} ONLINE
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Download Action Float Button */}
                 <button
                   disabled={isDownloading}
                   onClick={() => downloadPoster(campaign)}
                   className="absolute bottom-6 right-6 px-6 py-4 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all shadow-2xl z-40 font-black text-xs uppercase tracking-widest flex items-center gap-3 disabled:opacity-50 active:scale-95"
                 >
                   {isDownloading ? <Loader className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                   {isDownloading ? 'Rendering Poster...' : 'Download HD Flyer'}
                 </button>
              </div>

              {/* Copy/Paste Writeup Area */}
              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-white/10 mb-4">
                   Caption Template
                </span>
                <p className="text-white/60 text-sm whitespace-pre-wrap font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4">
                  {fullMessage}
                </p>
                <div className="mt-6 pt-6 border-t border-white/5">
                  <button 
                    onClick={() => copyToClipboard(fullMessage, campaign.id)}
                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl transition-all shadow-lg active:scale-95 ${isCopied ? 'bg-green-500 text-white' : 'glass bg-white/5 hover:bg-white/10 text-white'}`}
                  >
                    {isCopied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="text-xs font-black uppercase tracking-[3px]">{isCopied ? 'Copied to Clipboard' : 'Copy Caption & Link'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-px bg-white/5">
                <button 
                  onClick={() => shareToPlatform('whatsapp', campaign)}
                  className="flex flex-col items-center justify-center gap-2 py-6 bg-[#0A0F1E] hover:bg-white/5 text-[#25D366] transition-all group/btn"
                >
                  <MessageCircle className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[2px]">WhatsApp Status</span>
                </button>
                
                <button 
                  onClick={() => shareToPlatform('telegram', campaign)}
                  className="flex flex-col items-center justify-center gap-2 py-6 bg-[#0A0F1E] hover:bg-white/5 text-[#0088cc] transition-all group/btn"
                >
                  <Send className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[2px]">Telegram Distro</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
