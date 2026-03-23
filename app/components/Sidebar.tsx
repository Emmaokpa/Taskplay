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
  Zap
} from 'lucide-react';

// MUI Icon imports
import HomeIcon from '@mui/icons-material/HomeOutlined'; 
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import RocketIcon from '@mui/icons-material/RocketOutlined';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined'; 
import CampaignIcon from '@mui/icons-material/CampaignOutlined';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChartIcon },
  { name: 'TaskPlay Earn', href: '/earn', icon: Zap },
  { name: 'CPA Offers', href: '/cpa-offers', icon: RocketIcon },
  { name: 'Social Tasks', href: '/social-tasks', icon: ShareIcon },
  { name: 'Refer & Earn', href: '/referral', icon: Gift },
  { name: 'Advertise', href: '/advertise', icon: CampaignIcon },
  { name: 'Profile', href: '/profile', icon: AccountCircleIcon },
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
      ${mobile ? 'w-full h-full' : 'fixed left-0 top-0 h-screen w-64 hidden md:flex border-r border-white/10 z-50 shadow-2xl'} 
      bg-black/10 backdrop-blur-[120px] backdrop-saturate-[180%] text-gray-300 p-4 sm:p-6 flex-col
    `}>
      <div className="mb-8">
        <Link href="/" className="group flex items-center mb-10 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center p-2 shadow-lg group-hover:scale-110 transition-transform">
             <span className="text-white font-black text-xl">T</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">TaskPlay</span>
        </Link>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onLinkClick?.()}
              className={`flex items-center p-4 rounded-2xl transition-all duration-300 relative group
                ${pathname === item.href
                  ? 'text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
            >
              {pathname === item.href && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10"
                />
              )}
              <item.icon className={`mr-3 relative z-10 ${pathname === item.href ? 'text-primary' : ''}`} fontSize="medium" />
              <span className="relative z-10 font-bold">{item.name}</span>
            </Link>
          ))}

          {/* Admin link — only visible if isAdmin: true in Firestore */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => onLinkClick?.()}
              className={`flex items-center p-4 rounded-2xl transition-all duration-300 relative group
                ${pathname.startsWith('/admin')
                  ? 'text-white'
                  : 'text-orange-400/60 hover:text-orange-400 hover:bg-orange-400/5'
                }`}
            >
              {pathname.startsWith('/admin') && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-orange-400/10 rounded-2xl border border-orange-400/20"
                />
              )}
              <ShieldAlert className="w-5 h-5 mr-3 relative z-10 text-orange-400" />
              <span className="relative z-10 font-bold">Admin Panel</span>
              <span className="ml-auto relative z-10 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400">
                Admin
              </span>
            </Link>
          )}
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        {/* Upgrade prompt — only for non-members */}
        {!isMember && (
          <Link href="/upgrade" onClick={() => onLinkClick?.()}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 mb-6 cursor-pointer hover:border-primary/40 transition-all">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[2px] mb-1">STANDARD PLAN</p>
              <p className="text-xs text-white/60 mb-3">Pay ₦1,500 to unlock full earning potential.</p>
              <div className="w-full py-2 rounded-xl bg-primary text-white text-xs font-bold text-center">
                Upgrade Now
              </div>
            </div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
          <span className="font-bold">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;