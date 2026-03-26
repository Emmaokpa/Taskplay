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
                      className={`w-[1080px] h-[1080px] bg-white relative overflow-hidden flex flex-row items-center justify-between shadow-2xl`}
                      style={{ transform: 'scale(0.35)', transformOrigin: 'center' }}
                    >
                       {/* Subtle Background Gradients */}
                       <div className={`absolute top-0 right-0 w-[800px] h-[1080px] bg-gradient-to-l ${campaign.bgColor} opacity-20 pointer-events-none`} />
                       <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gray-50 rounded-full blur-[80px] pointer-events-none" />
                       
                       {/* LEFT CONTENT AREA */}
                       <div className="w-[55%] h-full pl-20 pr-10 py-24 flex flex-col justify-center relative z-20">
                          {/* Top Pill Badge */}
                          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary font-black uppercase tracking-widest text-sm mb-10 w-max shadow-sm bg-white">
                             <Sparkles className="w-4 h-4" /> THE FULL STACK
                          </div>

                          {/* Massive Typography */}
                          <h1 className="text-[90px] font-black text-[#0A0F1E] tracking-tighter leading-[0.95] mb-6 drop-shadow-sm">
                             {campaign.headline.split(' ').slice(0, 2).join(' ')}<br/>
                             <span className="text-primary">{campaign.headline.split(' ').slice(2).join(' ')}</span>
                          </h1>
                          
                          <p className="text-[28px] text-gray-500 font-medium leading-[1.4] mb-12 max-w-lg">
                             {campaign.subHeadline}
                          </p>

                          {/* Checkmarks / Features */}
                          <div className="grid grid-cols-2 gap-y-8 gap-x-6 mb-16">
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-[#0A0F1E]" />
                                <span className="text-lg font-black text-[#0A0F1E] uppercase tracking-widest">Instant Payouts</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-[#0A0F1E]" />
                                <span className="text-lg font-black text-[#0A0F1E] uppercase tracking-widest">Social Tasks</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-8 h-8 text-[#0A0F1E]" />
                                <span className="text-lg font-black text-[#0A0F1E] uppercase tracking-widest">Premium CPA</span>
                             </div>
                          </div>

                          {/* Footer Trust Badge */}
                          <div className="absolute bottom-20 left-20 flex items-center gap-6">
                             <div className="flex -space-x-4">
                                <div className="w-16 h-16 rounded-full border-4 border-white bg-green-400 flex items-center justify-center text-white font-black text-xl shadow-lg">P</div>
                                <div className="w-16 h-16 rounded-full border-4 border-white bg-blue-400 flex items-center justify-center text-white font-black text-xl shadow-lg">T</div>
                                <div className="w-16 h-16 rounded-full border-4 border-white bg-purple-400 flex items-center justify-center text-white font-black text-xl shadow-lg">E</div>
                                <div className="w-16 h-16 rounded-full border-4 border-white bg-[#0A0F1E] flex items-center justify-center text-white font-black text-sm shadow-lg tracking-tighter">15k+</div>
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-[#0A0F1E]">Trusted by Nigerians</h4>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-[3px]">Official Task Protocol</p>
                             </div>
                          </div>
                       </div>

                       {/* RIGHT PHONE AREA */}
                       <div className="w-[45%] h-full flex flex-col items-center justify-center relative z-20 pr-12">
                          
                          {/* Floating Elements (Trophy/Gift) */}
                          <div className="absolute top-48 right-16 w-32 h-32 bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] flex items-center justify-center rotate-12 z-40 border border-gray-100">
                             <span className="text-6xl">🎁</span>
                          </div>

                          <div className="absolute bottom-60 -left-10 w-24 h-24 bg-white rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center -rotate-6 z-40 border border-gray-100">
                             <span className="text-4xl">💸</span>
                          </div>

                          {/* 3D Phone Mockup */}
                          <div className="relative shadow-[30px_30px_80px_rgba(0,0,0,0.2)] rounded-[4.5rem] bg-white border border-gray-200 p-3 z-30">
                             <div className="relative w-[400px] h-[820px] rounded-[4rem] border-[14px] border-[#1c1c1e] bg-black overflow-hidden shadow-inner">
                                
                                {/* Screen content entirely driven by user screenshot */}
                                <div className="absolute inset-0 z-10 bg-white">
                                   <Image
                                     src={campaign.imagePath}
                                     alt="Screenshot Mockup"
                                     fill
                                     className="object-cover object-top"
                                     unoptimized
                                   />
                                </div>

                                {/* Modern Dynamic Island / Notch */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-36 h-9 bg-black rounded-full flex items-center justify-between px-3">
                                   <div className="w-3 h-3 rounded-full bg-[#111] shadow-inner" />
                                   <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />
                                </div>
                                
                                {/* Home Indicator */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-32 h-1.5 bg-black/20 rounded-full" />
                             </div>
                          </div>
                          
                          {/* Floor Shadow */}
                          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-black/10 blur-xl rounded-full z-10" />
                       </div>

                       {/* Very Bottom Centered Watermark */}
                       <div className="absolute bottom-8 left-0 w-full flex justify-center items-center gap-3 text-gray-300 font-bold text-sm tracking-[5px] uppercase">
                          <div className="w-6 h-6 rounded bg-gray-200 text-white flex items-center justify-center">T</div>
                          TASKPLAY SYSTEMS INC.
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
