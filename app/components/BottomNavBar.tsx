// File: c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\app\components\BottomNavBar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// MUI Icon imports
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
// If you want to add a Menu item later, you would import its icon here, e.g.:
// import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

const navItems = [
  { href: '/', label: 'Home', Icon: HomeOutlinedIcon },
  { href: '/tasks', label: 'Tasks', Icon: BusinessCenterOutlinedIcon },
  { href: '/games', label: 'Games', Icon: SportsEsportsOutlinedIcon },
  { href: '/profile', label: 'Profile', Icon: AccountCircleOutlinedIcon },
  // Example for adding a Menu item in the future:
  // { href: '/menu', label: 'Menu', Icon: MenuOutlinedIcon }, // Ensure MenuOutlinedIcon is imported if you uncomment
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-admin-sidebar text-gray-400 flex justify-around items-center h-16 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
                         (item.href === "/tasks" && pathname.startsWith("/tasks")) ||
                         (item.href === "/games" && pathname.startsWith("/games"));

        
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center p-2 transition-colors 
              ${isActive ? 'text-orange-500' : 'hover:text-white'}`}
          >
            <item.Icon 
              className={`mb-0.5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
              sx={{ fontSize: 24 }}
            />
            <span className={`text-xs ${isActive ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
