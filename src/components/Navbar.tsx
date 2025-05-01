'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiClock } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { user, logout, sessionExpiresAt, resetSessionTimer } = useAuth();
  const pathname = usePathname();

  // Check if session is about to expire
  useEffect(() => {
    if (!user || !sessionExpiresAt) {
      setShowExpiryWarning(false);
      return;
    }

    const checkSessionExpiry = () => {
      const now = new Date();
      const expiryTime = sessionExpiresAt;
      
      // Calculate time difference in milliseconds
      const timeDiff = expiryTime.getTime() - now.getTime();
      
      // Show warning if less than 2 minutes remaining
      const showWarning = timeDiff > 0 && timeDiff < 2 * 60 * 1000;
      
      setShowExpiryWarning(showWarning);
      
      // Format remaining time
      if (showWarning) {
        const seconds = Math.floor(timeDiff / 1000);
        setTimeRemaining(`${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`);
      }
    };

    // Check immediately and then every 10 seconds
    checkSessionExpiry();
    const interval = setInterval(checkSessionExpiry, 10000);
    
    return () => clearInterval(interval);
  }, [user, sessionExpiresAt]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleExtendSession = () => {
    resetSessionTimer();
    setShowExpiryWarning(false);
  };

  const isActive = (path: string) => {
    return pathname === path
      ? 'text-blue-600 font-medium'
      : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-sm">
      {/* Session expiry warning */}
      {showExpiryWarning && (
        <div className="bg-amber-100 px-4 py-2 flex items-center justify-center">
          <FiClock className="text-amber-600 mr-2" />
          <span className="text-amber-800 text-sm">
            Your session will expire in {timeRemaining}. 
          </span>
          <button 
            onClick={handleExtendSession}
            className="ml-2 px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Extend Session
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center text-blue-600 font-bold text-xl"
            >
              Cur8 Notely
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm ${isActive('/')}`}
              >
                Home
              </Link>
              {user && (
                <Link
                  href="/notes"
                  className={`px-3 py-2 rounded-md text-sm ${isActive('/notes')}`}
                >
                  My Notes
                </Link>
              )}
            </div>
            <div className="ml-4">
              {user ? (
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                      Sign In
                    </span>
                  </Link>
                  <Link href="/register">
                    <span className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">
                {isOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            onClick={closeMenu}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
            }`}
          >
            Home
          </Link>
          {user && (
            <Link
              href="/notes"
              onClick={closeMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/notes')
              }`}
            >
              My Notes
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-4">
            {user ? (
              <div className="flex-shrink-0">
                <div className="text-base font-medium text-gray-800">
                  {user.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="mt-2 px-4 py-2 w-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 w-full">
                <Link href="/login" onClick={closeMenu}>
                  <span className="block px-4 py-2 text-sm font-medium text-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    Sign In
                  </span>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <span className="block px-4 py-2 text-sm font-medium text-center text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    Sign Up
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 