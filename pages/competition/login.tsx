// pages/login.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Login from '../../components/Login';
import { clientAuth } from '../../lib/auth';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const user = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (user && token) {
      router.push('/competition/main');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Handle query parameters (like success messages)
  useEffect(() => {
    const { registered, message } = router.query;
    
    if (registered === 'true') {
      // Show success message if redirected from registration
      setTimeout(() => {
        // alert('Registration successful! Please log in with your credentials.');
        toast.success('Registration successful! Please log in with your credentials.');
      }, 100);
    }
    
    if (message && typeof message === 'string') {
      setTimeout(() => {
        // alert(decodeURIComponent(message));
        toast.success(decodeURIComponent(message));
      }, 100);
    }
  }, [router.query]);

  // Show loading while checking authentication
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
        <title>Login - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta 
          name="description" 
          content="Sign in to VK Competition. Access your account to participate in global creative expression celebrating unity through diversity." 
        />
        <meta name="keywords" content="VK Competition, login, sign in, Vasudhaiva Kutumbakam, creative expression, global community" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vkcompetition.com/login" />
        <meta property="og:title" content="Login to VK Competition - Vasudhaiva Kutumbakam" />
        <meta property="og:description" content="Sign in to continue your creative expression journey in the global VK Competition community." />
        <meta property="og:image" content="/vk-og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://vkcompetition.com/login" />
        <meta property="twitter:title" content="Login to VK Competition - Vasudhaiva Kutumbakam" />
        <meta property="twitter:description" content="Sign in to continue your creative expression journey in the global VK Competition community." />
        <meta property="twitter:image" content="/vk-og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/map.jpg" as="image" />
      </Head>
      
      <main>
        <Login />
      </main>
    </>
  );
};

export default LoginPage;