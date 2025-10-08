// pages/register.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Register from '../../components/Register';
import { clientAuth } from '../../lib/auth';

const RegisterPage: React.FC = () => {
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    const user = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (user && token) {
      router.push('/competition/main');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>Register - VK Competition | Vasudhaiva Kutumbakam</title>
        <meta 
          name="description" 
          content="Join the VK Competition community. Register to participate in global creative expression celebrating unity through diversity." 
        />
        <meta name="keywords" content="VK Competition, registration, Vasudhaiva Kutumbakam, creative expression, global community" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vkcompetition.com/register" />
        <meta property="og:title" content="Join VK Competition - Vasudhaiva Kutumbakam" />
        <meta property="og:description" content="Register to join a global movement celebrating unity through creative expression." />
        <meta property="og:image" content="/vk-og-image.jpg" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://vkcompetition.com/register" />
        <meta property="twitter:title" content="Join VK Competition - Vasudhaiva Kutumbakam" />
        <meta property="twitter:description" content="Register to join a global movement celebrating unity through creative expression." />
        <meta property="twitter:image" content="/vk-og-image.jpg" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      
      <main>
        <Register />
      </main>
    </>
  );
};

export default RegisterPage;