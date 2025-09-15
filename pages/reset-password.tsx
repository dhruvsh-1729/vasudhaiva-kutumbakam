// pages/reset-password.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ResetPassword from '../components/ResetPassword';
import { clientAuth } from '../middleware/auth';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if user is already logged in
  useEffect(() => {
    const user = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (user && token) {
      router.push('/main');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="text-white font-bold text-lg">VK</div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Must have token to access this page
  if (!router.query.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Invalid Access</h2>
          <p className="text-gray-600 mb-6">This page requires a valid password reset token.</p>
          <button 
            onClick={() => router.push('/forgot-password')}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all"
          >
            Request Password Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reset Password - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta 
          name="description" 
          content="Create a new password for your VK Competition account." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <ResetPassword token={router.query.token as string} />
      </main>
    </>
  );
};

export default ResetPasswordPage;