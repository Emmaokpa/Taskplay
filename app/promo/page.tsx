"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  ArrowLeft,
  Copy,
  MessageCircle,
  Send,
  Download,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { ListSkeleton } from '@/app/components/Skeleton';

interface PromoCampaign {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  writeup: string;
}

export default function PromoHubPage() {
  const [userData, setUserData] = useState<{ referralCode: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && isMounted) {
            setUserData(userDoc.data() as { referralCode: string });
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
      imagePath: "/mockups/dashboard.png",
      writeup: `🚀 I'm cashing out daily using my smartphone with TaskPlay Nigeria! \n\nNo experience needed—just complete simple social tasks and get paid directly to your bank account. Stop watching others win and start earning today! 💰🔥\n\nClick my link to join the VIP circle right now:\n[LINK]`,
    },
    {
      id: 'casual-invite',
      title: "The Casual Invite",
      description: "A friendly, low-pressure invitation that converts highly on Facebook and Telegram groups.",
      imagePath: "/mockups/dashboard.png", // Reuse screenshot but different writeup
      writeup: `Hey guys, I wanted to share this platform I’ve been using called TaskPlay. It actually pays you to do things like follow Instagram pages or download apps. 💸\n\nI've already started making money from it. If you want to try it out, use my invite link below so we can earn together! 👇\n[LINK]`,
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

  if (loading) return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <ListSkeleton />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-12 max-w-6xl mx-auto pb-44 relative overflow-x-hidden">
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
           <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">Promo Hub</h1>
           <p className="text-white/30 text-[10px] font-black tracking-[3px] uppercase italic">Download mockups • Share to socials • Earn unlimited</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {campaigns.map((campaign, i) => {
          const fullMessage = campaign.writeup.replace('[LINK]', referralLink);
          const isCopied = copiedId === campaign.id;

          return (
            <motion.div 
              key={campaign.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="clay-card p-6 sm:p-8 bg-[#0A0F1E]/40 backdrop-blur-3xl border-white/5 relative group overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
              
              {/* Header */}
              <div className="mb-8 relative z-10 flex items-start justify-between gap-4">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter mb-2">{campaign.title}</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed">{campaign.description}</p>
                 </div>
              </div>

              {/* Mockup Preview Area */}
              <div className="mb-8 relative z-10 bg-black/60 rounded-3xl py-10 px-6 flex items-center justify-center border border-white/5 overflow-hidden group-hover:border-primary/20 transition-all duration-500 min-h-[340px]">
                {/* 3D Phone Frame */}
                <div className="relative group/mockup" style={{ perspective: '1200px' }}>
                   <motion.div
                     whileHover={{ rotateY: 0, rotateX: 0, scale: 1.04 }}
                     style={{ transform: 'rotateY(-12deg) rotateX(6deg)' }}
                     className="relative z-10 transition-all duration-500"
                   >
                     {/* Phone Outer Shell */}
                     <div className="relative w-[155px] sm:w-[175px] rounded-[2.2rem] border-[7px] border-[#1c1c1e] shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.5)] overflow-hidden bg-black"
                          style={{ aspectRatio: '9/19.5' }}>
                       {/* Side buttons */}
                       <div className="absolute -right-[9px] top-20 w-[5px] h-12 bg-[#2c2c2e] rounded-r-sm" />
                       <div className="absolute -left-[9px] top-16 w-[5px] h-8 bg-[#2c2c2e] rounded-l-sm" />
                       <div className="absolute -left-[9px] top-28 w-[5px] h-12 bg-[#2c2c2e] rounded-l-sm" />

                       {/* Screen */}
                       <div className="absolute inset-0 overflow-hidden rounded-[1.6rem]">
                         {/* Notch */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-20 h-5 bg-[#1c1c1e] rounded-b-2xl flex items-center justify-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                           <div className="w-4 h-1.5 rounded-full bg-[#2a2a2a]" />
                         </div>
                         {/* Screenshot Image */}
                         <Image
                           src={campaign.imagePath}
                           alt={campaign.title}
                           fill
                           className="object-cover object-top"
                           unoptimized
                         />
                         {/* Glossy screen overlay */}
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.06] via-transparent to-white/[0.02] pointer-events-none z-20" />
                         {/* Home Indicator */}
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-16 h-1 bg-white/30 rounded-full" />
                       </div>
                     </div>
                   </motion.div>

                   {/* Glow beneath phone */}
                   <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/40 blur-2xl rounded-full -z-10 group-hover/mockup:bg-primary/60 transition-colors duration-500" />
                </div>

                {/* Download Button */}
                <a
                  href={campaign.imagePath}
                  download={`TaskPlay_Promo_${i+1}.png`}
                  className="absolute bottom-4 right-4 p-3 rounded-2xl glass hover:bg-white/20 hover:scale-110 transition-all shadow-xl z-30"
                  title="Download Image"
                >
                  <Download className="w-5 h-5 text-white" />
                </a>
              </div>

              {/* Copy/Paste Writeup Area */}
              <div className="relative z-10 bg-black/20 rounded-2xl p-5 border border-white/5 mb-8 flex-1">
                <span className="absolute -top-3 left-5 px-3 py-1 rounded-full glass-dark text-[8px] font-black uppercase tracking-widest text-white/50 border border-white/10">Caption Template</span>
                <p className="text-white/60 text-xs sm:text-sm whitespace-pre-wrap font-medium leading-relaxed italic mt-2">
                  {fullMessage}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                  <button 
                    onClick={() => copyToClipboard(fullMessage, campaign.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isCopied ? 'bg-green-500/20 text-green-400' : 'glass hover:bg-white/10 text-white/40 hover:text-white'}`}
                  >
                    {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-[10px] font-black uppercase tracking-[2px]">{isCopied ? 'Copied to Clipboard' : 'Copy Caption & Link'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 grid grid-cols-3 gap-3">
                <button 
                  onClick={() => shareToPlatform('whatsapp', campaign)}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] transition-all active:scale-95 shadow-lg group/btn"
                >
                  <MessageCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-[2px]">WhatsApp</span>
                </button>
                
                <button 
                  onClick={() => shareToPlatform('telegram', campaign)}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 text-[#0088cc] transition-all active:scale-95 shadow-lg group/btn"
                >
                  <Send className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-[8px] font-black uppercase tracking-[2px]">Telegram</span>
                </button>

                <button 
                  onClick={() => shareToPlatform('native', campaign)}
                  className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all active:scale-95 shadow-lg group/btn"
                >
                  <Share2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-white/50 group-hover/btn:text-white" />
                  <span className="text-[8px] font-black uppercase tracking-[2px] text-white/50 group-hover/btn:text-white">Other</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
