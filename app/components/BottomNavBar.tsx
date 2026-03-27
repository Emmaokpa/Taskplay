"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Rocket, 
  Share2, 
  User,
  LayoutDashboard,
  Banknote,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Earn', href: '/earn', icon: Banknote },
    { name: 'CPA', href: '/cpa-offers', icon: Rocket },
    { name: 'Ad', href: '/advertise', icon: Plus, special: true },
    { name: 'Social', href: '/social-tasks', icon: Share2 },
    { name: 'Cash', href: '/withdraw', icon: Wallet },
    { name: 'Me', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pb-safe">
      <div className="glass mx-1 mb-2 rounded-[1.5rem] px-1 py-2 flex items-center justify-around border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] bg-black/80 backdrop-blur-3xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.special) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${isActive ? 'bg-primary' : 'bg-white/10'}`}>
                  <Plus size={18} className="text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 transition-all duration-300 relative px-1
                ${isActive ? 'text-primary' : 'text-white/20 hover:text-white'}
              `}
            >
              <div className="p-1 transition-all">
                <item.icon size={16} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
              </div>
              <span className={`text-[6px] font-black uppercase tracking-[0.05em] transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
