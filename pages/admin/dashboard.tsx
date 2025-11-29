// pages/admin/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast } from 'sonner';

// Component imports
import { clientAuth } from '@/lib/auth/clientAuth';
import CompetitionStats from '@/components/admin/CompetitionStats';
import SubmissionsManager from '@/components/admin/SubmissionsManager';
import UsersManager from '@/components/admin/UsersManager';
import AdminSettings from '@/components/admin/AdminSetting';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMessages from '@/components/admin/AdminMessages';
import CompetitionsManager from '@/components/admin/CompetitionsManager';

// Type definitions
interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

type ActiveTab = 'overview' | 'submissions' | 'users' | 'settings' | 'messages' | 'competitions';

const getVisibleTabs = (adminUser: AdminUser | null): ActiveTab[] => {
  if (adminUser?.email?.toLowerCase() === 'vk4@admin.com') {
    return ['submissions', 'messages','overview'];
  }
  return ['overview', 'submissions', 'messages', 'users', 'settings'];
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Check authentication and admin status
  useEffect(() => {
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (!currentUser || !token) {
      router.push('/login?message=' + encodeURIComponent('Please log in to access admin dashboard'));
      return;
    }

    // TODO: Add proper admin role checking
    // For now, we'll assume the user is admin if they reach this page
    // In production, you should validate admin status server-side
    if (!currentUser.isAdmin) {
      router.push('/main?message=' + encodeURIComponent('Access denied. Admin privileges required.'));
      return;
    }
    
    setUser(currentUser as AdminUser);
    if (currentUser.email?.toLowerCase() === 'vk4@admin.com') {
      setActiveTab('submissions');
    }
    setIsLoading(false);
  }, [router]);

  // Ensure restricted admins cannot activate hidden tabs
  useEffect(() => {
    if (!user) return;
    const visibleTabs = getVisibleTabs(user);
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [user, activeTab]);

  // Handle tab changes
  const handleTabChange = (tab: ActiveTab) => {
    const visibleTabs = getVisibleTabs(user);
    if (!visibleTabs.includes(tab)) return;
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar on mobile when tab changes
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="text-white font-bold text-lg">A</div>
          </div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
          <div className="mt-4 w-24 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!user) {
    return null;
  }

  const visibleTabs = getVisibleTabs(user);

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CompetitionStats />;
      case 'submissions':
        return <SubmissionsManager />;
      case 'users':
        return <UsersManager />;
      case 'settings':
        return <AdminSettings />;
      case 'messages':
        return <AdminMessages />;
      case 'competitions':
        return <CompetitionsManager />;
      default:
        return <CompetitionStats />;
    }
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard - VK Competition</title>
        <meta name="description" content="Admin dashboard for managing competitions, submissions, and users" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        /* Admin theme variables */
        :root {
          --admin-primary: #2563eb;
          --admin-primary-dark: #1d4ed8;
          --admin-secondary: #64748b;
          --admin-accent: #06b6d4;
          --admin-success: #10b981;
          --admin-warning: #f59e0b;
          --admin-error: #ef4444;
          --admin-bg-primary: #f8fafc;
          --admin-bg-secondary: #ffffff;
          --admin-border: #e2e8f0;
          --admin-text-primary: #0f172a;
          --admin-text-secondary: #64748b;
        }
        
        /* Admin layout background */
        .admin-background {
          background: 
            radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.03) 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.03) 0%, transparent 60%),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Card hover effects */
        .admin-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 
            0 4px 16px rgba(15, 23, 42, 0.04),
            0 1px 4px rgba(15, 23, 42, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .admin-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 24px rgba(15, 23, 42, 0.08),
            0 4px 8px rgba(15, 23, 42, 0.04);
          border-color: rgba(37, 99, 235, 0.2);
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .admin-main-content {
            padding-left: 0;
            padding-right: 0;
          }
        }
      `}</style>

      <div className="admin-background font-inter">
        {/* Admin Header */}
        <AdminHeader 
          user={user} 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex">
          {/* Admin Sidebar */}
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            visibleTabs={visibleTabs}
          />

          {/* Main Content */}
          <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'} admin-main-content`}>
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {/* Page Title */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-poppins">
                  {activeTab === 'overview' && 'Competition Overview'}
                  {activeTab === 'submissions' && 'Submissions Management'}
                  {activeTab === 'users' && 'Users Management'}
                  {activeTab === 'settings' && 'Admin Settings'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {activeTab === 'overview' && 'Monitor competition statistics and activity'}
                  {activeTab === 'submissions' && 'Review and evaluate competition submissions'}
                  {activeTab === 'users' && 'Manage user accounts and permissions'}
                  {activeTab === 'settings' && 'Configure competition settings and intervals'}
                </p>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
