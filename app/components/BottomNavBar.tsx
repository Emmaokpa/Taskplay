"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  Rocket, 
  Share2, 
  User,
  LayoutDashboard,
  Zap,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dash', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Earn', href: '/earn', icon: Zap },
    { name: 'CPA', href: '/cpa-offers', icon: Rocket },
    { name: 'Ad', href: '/advertise', icon: Plus, special: true },
    { name: 'Social', href: '/social-tasks', icon: Share2 },
    { name: 'Cash', href: '/withdraw', icon: Wallet },
    { name: 'Me', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="glass mx-2 mb-4 rounded-[2rem] px-2 py-3 flex items-center justify-between border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/60 backdrop-blur-3xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.special) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative -top-3 scale-105"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_10px_30px_rgba(139,92,246,0.5)] border-4 border-black active:scale-95 transition-all">
                  <Plus size={20} className="text-white stroke-[3px]" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 relative px-0.5
                ${isActive ? 'text-primary' : 'text-white/30 hover:text-white'}
              `}
            >
              <div className="p-0.5 transition-all">
                <item.icon size={16} className={isActive ? "stroke-[2.5]" : "stroke-[2]"} />
              </div>
              <span className={`text-[6.5px] font-black uppercase tracking-[0.05em] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
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
