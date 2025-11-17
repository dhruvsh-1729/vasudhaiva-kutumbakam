// pages/main.tsx (Example protected dashboard page)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { clientAuth } from '../lib/auth/clientAuth';

interface User {
  id: string;
  name: string;
  email: string;
}

const MainDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (!currentUser || !token) {
      router.push('/login');
      return;
    }
    
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      clientAuth.logout('/logout');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="text-white font-bold text-lg">VK</div>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Head>
        <title>Dashboard - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta name="description" content="VK Competition Dashboard - Manage your creative expressions and participate in global unity celebrations." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-red-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">VK</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-red-700">VK Competition</h1>
                  <p className="text-xs text-gray-500">Vasudhaiva Kutumbakam</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-red-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-white font-bold text-xl">VK</span>
              </div>
              
              <h1 className="text-3xl font-bold text-red-700 mb-4">
                Welcome, {user.name.split(' ')[0]}!
              </h1>
              
              <p className="text-gray-600 text-lg mb-6">
                You are now part of the global Vasudhaiva Kutumbakam community
              </p>
              
              <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-700 font-semibold">Account Active</span>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
              </div>
              <p className="text-gray-600 mb-4">Manage your account settings and personal information</p>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                View Profile
              </button>
            </div>

            {/* Competitions Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Competitions</h3>
              </div>
              <p className="text-gray-600 mb-4">Browse and participate in creative expression competitions</p>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                Explore
              </button>
            </div>

            {/* Community Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Community</h3>
              </div>
              <p className="text-gray-600 mb-4">Connect with global artists and creative minds</p>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
                Join
              </button>
            </div>
          </div>

          {/* Quote Section */}
          <div className="bg-gradient-to-br from-red-900 via-orange-800 to-red-800 rounded-xl shadow-lg p-8 text-center text-white">
            <blockquote className="text-xl font-light italic mb-4">
              In diversity we find strength, in unity we discover light
            </blockquote>
            <p className="text-orange-200 text-sm">
              The essence of Vasudhaiva Kutumbakam - The World is One Family
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default MainDashboard;
