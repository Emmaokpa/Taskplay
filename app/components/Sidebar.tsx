"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { 
  LogOut, 
  Gift,
  ShieldAlert,
  Banknote,
  LayoutDashboard,
  Rocket,
  Share2,
  Megaphone,
  User,
  ArrowRight
} from 'lucide-react';

const navigation = [
  { name: 'Command Center', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Income Hub', href: '/earn', icon: Banknote },
  { name: 'CPA Pipeline', href: '/cpa-offers', icon: Rocket },
  { name: 'Social Viral', href: '/social-tasks', icon: Share2 },
  { name: 'Growth Rewards', href: '/referral', icon: Gift },
  { name: 'Launch Ads', href: '/advertise', icon: Megaphone },
  { name: 'My Profile', href: '/profile', icon: User },
];

const Sidebar = ({ mobile, onLinkClick }: { mobile?: boolean; onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIsAdmin(data.isAdmin === true);
          setIsMember(data.isMember === true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    onLinkClick?.(); 
    router.push('/');
  };

  return (
    <aside className={`
      ${mobile ? 'w-full px-2' : 'fixed left-0 top-0 h-screen w-64 hidden md:flex border-r border-white/5 z-50'} 
      flex flex-col bg-[#050505]/40 backdrop-blur-3xl
    `}>
      <div className="flex flex-col flex-1 py-10">
        <div className="px-6 mb-12">
           <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-[1.2rem] bg-primary flex items-center justify-center p-2 shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform">
                 <span className="text-white font-black text-xl italic">T</span>
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">TaskPlay</span>
           </Link>
        </div>

        <nav className="space-y-1.5 px-4 overflow-y-auto flex-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onLinkClick?.()}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden
                  ${isActive
                    ? 'text-white'
                    : 'text-white/30 hover:text-white hover:bg-white/[0.03]'
                  }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId={`sidebar-active-${mobile ? 'mobile' : 'desktop'}`}
                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-2xl"
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary/60'}`} />
                <span className={`relative z-10 text-xs font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => onLinkClick?.()}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden mt-6
                ${pathname.startsWith('/admin')
                  ? 'text-white'
                  : 'text-orange-400/50 hover:text-orange-400 hover:bg-orange-400/5'
                }`}
            >
              <ShieldAlert className="w-5 h-5 relative z-10 text-orange-400" />
              <span className="relative z-10 text-xs font-black uppercase tracking-widest">Operator View</span>
              <span className="ml-auto relative z-10 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-orange-400/20 text-orange-400 border border-orange-400/20">
                Lvl 1
              </span>
            </Link>
          )}
        </nav>
      </div>

      <div className="p-6 mt-auto">
        {!isMember && (
          <Link href="/upgrade" onClick={() => onLinkClick?.()}>
            <motion.div 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               className="p-5 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6 cursor-pointer relative overflow-hidden group shadow-2xl shadow-primary/20"
            >
              <p className="text-[8px] font-black text-white/50 uppercase tracking-[3px] mb-1">Status: Restricted</p>
              <p className="text-[10px] text-white font-black uppercase tracking-wider mb-4 leading-tight italic">Upgrade to earn with ease</p>
              <div className="flex items-center gap-2 text-white font-black text-[9px] uppercase tracking-widest group-hover:gap-4 transition-all">
                Access Now <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                 <ShieldAlert className="w-20 h-20" />
              </div>
            </motion.div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;