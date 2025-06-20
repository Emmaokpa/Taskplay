// c:\Users\Emmanuel Okpa\Desktop\TaskPlay\client\components\MobileSidebar.tsx
"use client";

import Link from 'next/link';
import { Session } from '@supabase/auth-helpers-nextjs';
import CloseIcon from './icons/CloseIcon';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  isLoading: boolean;
}

export default function MobileSidebar({ isOpen, onClose, session, isLoading }: MobileSidebarProps) {
  return (
    // Use 'invisible' and 'opacity-0' for the closed state for smoother transitions
    // 'visible' and 'opacity-100' for the open state
    <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-in-out ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} role="dialog" aria-modal="true">
      {/* Overlay */}
      {/* The overlay also needs to transition */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true" onClick={onClose}></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 flex flex-col w-4/5 max-w-xs sm:max-w-sm bg-white dark:bg-gray-800 shadow-xl p-4 transform transition-transform ease-in-out duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full' // Changed to -translate-x-full for right-to-left slide
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-orange-500">Menu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-orange-500 p-1">
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-grow flex flex-col space-y-1"> {/* Reduced space-y for tighter packing if needed */}
          <Link href="/" onClick={onClose} className="text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-3 rounded-md text-base font-medium transition-colors">Home</Link>
          <Link href="/games" onClick={onClose} className="text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-3 rounded-md text-base font-medium transition-colors">Games</Link>
          <Link href="/tasks" onClick={onClose} className="text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-3 rounded-md text-base font-medium transition-colors">Tasks</Link>
          {/* Add other mobile navigation links here */}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          {!isLoading && (
            session ? (
              <form action="/auth/sign-out" method="post" className="w-full">
                <button
                  type="submit"
                  onClick={onClose} // Close sidebar when logout is clicked
                  className="w-full text-left bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-md text-sm transition-colors"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/auth" // Ensure this path is correct
                onClick={onClose}
                className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-md text-sm"
              >
                Login / Sign Up
              </Link>
            )
          )}
          {isLoading && <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">Loading user...</p>}
        </div>
      </div>
    </div>
  );
}
