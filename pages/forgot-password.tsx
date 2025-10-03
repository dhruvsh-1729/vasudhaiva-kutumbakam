// pages/forgot-password.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ForgotPassword from '../components/ForgotPassword';
import { clientAuth } from '../middleware/auth';

const ForgotPasswordPage: React.FC = () => {
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

  return (
    <>
      <Head>
        <title>Forgot Password - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta 
          name="description" 
          content="Reset your VK Competition password. Enter your email to receive password reset instructions." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        <ForgotPassword />
      </main>
    </>
  );
};

export default ForgotPasswordPage;
