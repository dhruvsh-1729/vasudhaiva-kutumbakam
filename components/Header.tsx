// components/Header.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { clientAuth } from '../middleware/auth';
import { toast } from 'sonner';
import Image from 'next/image';
import logo from '@/public/main_logo.png';
import { Phone } from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on component mount
  useEffect(() => {
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (currentUser && token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const navigationItems: NavigationItem[] = [
    { href: "/", label: "Home" },
    { href: "/main", label: "Dashboard", requiresAuth: true },
    { href: "/profile", label: "My Profile", requiresAuth: true },
    { href: "/contact", label: "Contact Us" },  
    // { href: "/main#competitions", label: "Competitions", requiresAuth: true },
    // { href: "/main#timeline", label: "Timeline", requiresAuth: true }
  ];

  const handleLogout = async (): Promise<void> => {
    // const confirmLogout = confirm('Are you sure you want to logout?');
    // if (!confirmLogout) return;

    try {
      // Call logout API to invalidate token on server
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clientAuth.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear local storage and redirect regardless of API response
      clientAuth.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API fails
      clientAuth.logout();
    }
  };

  const handleProfileClick = (): void => {
    router.push('/profile');
    setShowUserMenu(false);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-red-600 cursor-pointer">VK Competition</span>
              </Link>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <Image className="w-20 h-20 rounded-full" alt="VK Logo" width={80} height={80}
                  src={logo.src} />
                  <div>
                    <h1 className="text-xl font-bold text-red-700 group-hover:text-red-800 transition-colors">VK Competition</h1>
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="ml-10 hidden md:flex items-center space-x-1">
              {navigationItems.map((item: NavigationItem, index: number) => {
                // Hide auth-required items if not authenticated
                if (item.requiresAuth && !isAuthenticated) return null;
                
                return (
                  <Link key={index} href={item.href}>
                    <span className="text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Side - Authentication Status */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* User Info - Hidden on small screens */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="w-10 h-10 cursor-pointer bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    {getInitials(user.name)}
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Info in Menu */}
                      {/* <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div> */}

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </button>

                        <Link href="/main">
                          <span className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            Dashboard
                          </span>
                        </Link>

                        <Link href="/contact">
                          <span className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer">
                            <Phone className="w-4 h-4 mr-3" />
                            Contact us
                          </span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Not authenticated - show login/register buttons
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="text-gray-700 hover:text-red-600 cursor-pointer font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200">
                    Sign In
                  </button>Sign In
                </Link>
                <Link href="/register">
                  <button className="bg-gradient-to-r from-red-600 to-red-700 cursor-pointer hover:from-red-700 hover:to-red-800 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    Register
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            {/* <button className="md:hidden p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;