"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { 
  CheckCircle2, 
  Download, 
  Share2, 
  X, 
  Crown,
  Smartphone,
  ShieldCheck,
  QrCode
} from 'lucide-react';

interface ProofData {
  amount: number;
  userName: string;
  date: string;
  refId: string;
}

export default function StatusProofGenerator({ data, onClose }: { data: ProofData | null, onClose: () => void }) {
  const proofRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!proofRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(proofRef.current, { 
        cacheBust: true,
        quality: 1,
        pixelRatio: 2 // High Res
      });
      const link = document.createElement('a');
      link.download = `TaskPlay_Payout_${data?.refId || 'Proof'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#05070A]/95 backdrop-blur-3xl px-4 py-10 overflow-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6 px-2">
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Status Proof</h2>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[3px]">Generated for WhatsApp</p>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-xl glass border-white/5 text-white/40 hover:text-white transition-all">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* ─── THE ACTUAL CARD (Hidden/Visible for capture) ─── */}
        <div className="flex justify-center">
            <div 
                ref={proofRef}
                className="w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] bg-[#05070A] rounded-[2.5rem] relative overflow-hidden flex flex-col items-center p-8 border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.2)]"
                style={{ 
                    backgroundImage: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.15), transparent), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.1), transparent)'
                }}
            >
                {/* Header Logo */}
                <div className="flex flex-col items-center mt-6 mb-12">
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 shadow-xl">
                      <ShieldCheck className="w-8 h-8 text-blue-400" />
                   </div>
                   <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">TaskPlay</h1>
                   <div className="text-[7px] font-black text-blue-500 uppercase tracking-[4px] mt-1 ml-4 italic">Nigeria's #1 Pay-Hub</div>
                </div>

                {/* Main Payout Status */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-[4px]">Payout Successful</span>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter mb-1">₦{data.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[2px]">Deposit Confirmed</div>
                </div>

                {/* Details Section */}
                <div className="w-full space-y-4 mb-auto px-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[2px]">Recipient</span>
                        <span className="text-[10px] font-black text-white italic">{data.userName}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[2px]">Timestamp</span>
                        <span className="text-[10px] font-black text-white italic">{data.date}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[2px]">Ref ID</span>
                        <span className="text-[10px] font-black text-white/40 italic">{data.refId}</span>
                    </div>
                </div>

                {/* Referral Hook */}
                <div className="mt-8 mb-10 w-full glass rounded-[1.8rem] p-6 text-center border-blue-500/20 bg-blue-500/[0.03]">
                    <div className="flex justify-center mb-3">
                        <QrCode className="w-8 h-8 text-white/60" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase italic tracking-tighter mb-1">Wanna Earn Like This?</h3>
                    <p className="text-[7.5px] font-black text-white/30 uppercase tracking-[2.5px]">Scan code or link in bio to start</p>
                </div>

                {/* Footer Branding */}
                <div className="flex flex-col items-center pb-4">
                    <div className="flex items-center gap-1.5 mb-2 opacity-50 scale-75">
                        <Smartphone className="w-3 h-3 text-white" />
                        <div className="h-px w-6 bg-white/20" />
                        <span className="text-[7px] font-black text-white uppercase tracking-[4px]">Verified Mobile Node</span>
                    </div>
                    <div className="text-[7px] font-black text-white/10 uppercase tracking-[5px]">taskplay.com.ng</div>
                </div>

                {/* Noise Overlays */}
                <div className="absolute inset-0 bg-transparent opacity-[0.03] pointer-events-none mix-blend-overlay" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-4">
            <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[1.8rem] font-black text-sm text-white flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            >
                {isGenerating ? "Processing HQ Image..." : <><Download className="w-5 h-5" /> Download High-Res Status</>}
            </button>
            <p className="text-center text-[10px] text-white/20 font-black uppercase tracking-[4px] italic">Post to WhatsApp to double your credibility</p>
        </div>
      </motion.div>
    </div>
  );
}
