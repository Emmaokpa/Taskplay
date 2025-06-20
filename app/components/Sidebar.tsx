"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// MUI Icon imports
import HomeIcon from '@mui/icons-material/HomeOutlined'; // Using Outlined versions for consistency
import BusinessCenterIcon from '@mui/icons-material/BusinessCenterOutlined'; // For Tasks
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined'; // For Profile
import SettingsIcon from '@mui/icons-material/SettingsOutlined'; // For Admin/Settings
import AddTaskIcon from '@mui/icons-material/AddTaskOutlined'; // For Create Task
import SportsEsportsIcon from '@mui/icons-material/SportsEsportsOutlined'; // For Games
import LogoutIcon from '@mui/icons-material/LogoutOutlined'; // For Log Out

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Tasks', href: '/tasks', icon: BusinessCenterIcon },
  { name: 'Profile', href: '/profile', icon: AccountCircleIcon },
  { name: 'Admin Tasks', href: '/admin/tasks', icon: SettingsIcon },
  { name: 'Create Task', href: '/admin/platform-tasks/create', icon: AddTaskIcon },
  { name: 'Create Game', href: '/admin/games/create', icon: SportsEsportsIcon },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-admin-sidebar text-gray-300 p-4 sm:p-6 flex-col hidden md:flex"> {/* USE NEW CUSTOM COLOR */}
      <div className="mb-8">
        <Link href="/" className="flex items-center mb-10">
          {/* Replace with your logo if you have one */}
          {/* <img src="/logo.png" alt="TaskPlay Logo" className="h-8 w-auto mr-3" /> */}
          <span className="text-2xl font-bold text-white">TaskPlay</span>
        </Link>
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center p-3 rounded-lg transition-colors
                ${pathname === item.href
                  ? 'bg-sidebar-active-bg text-white' // USE NEW CUSTOM COLOR
                  : 'hover:bg-gray-800 hover:text-white'
                }`}
            >
              <item.icon className="mr-3" fontSize="medium" /> {/* MUI icons use fontSize prop for size */}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Optional: Upgrade section or other fixed bottom elements */}
      {/* <div className="mt-auto bg-orange-600 rounded-lg p-4 text-white">
        <p className="font-semibold mb-2">Upgrade Plan</p>
        <p className="text-sm">Unlock more features!</p>
        <button className="w-full mt-3 bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg text-sm">
          Upgrade Now
        </button>
      </div> */}

      <div className="mt-auto pt-4 border-t border-gray-700">
        <Link
          href="/logout" // Replace with actual logout logic/path
          className="flex items-center p-3 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogoutIcon className="mr-3" fontSize="medium" />
          Log Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;