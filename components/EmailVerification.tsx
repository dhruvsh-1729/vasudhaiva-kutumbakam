// components/EmailVerification.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import backgroundImage from '@/public/map.jpg';

interface EmailVerificationProps {
  token?: string;
  email?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
  waitTime?: number;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ token, email }) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState<boolean>(!!token);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  }>({});
  const [resendResult, setResendResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    waitTime?: number;
  }>({});
  const [resendEmail, setResendEmail] = useState<string>(email || '');
  const [canResend, setCanResend] = useState<boolean>(true);

  // Auto-verify if token is present
  useEffect(() => {
    if (token) {
      handleVerifyEmail(token);
    }
  }, [token]);

  const handleVerifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setVerificationResult({});

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data: ApiResponse = await response.json();

      setVerificationResult({
        success: data.success,
        message: data.message,
        error: data.error,
      });

      if (data.success) {
        // Redirect to login after successful verification
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationResult({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      setResendResult({
        success: false,
        error: 'Please enter your email address',
      });
      return;
    }

    setIsResending(true);
    setResendResult({});

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const data: ApiResponse = await response.json();

      setResendResult({
        success: data.success,
        message: data.message,
        error: data.error,
        waitTime: data.waitTime,
      });

      if (data.waitTime) {
        setCanResend(false);
        // Re-enable resend after wait time
        setTimeout(() => {
          setCanResend(true);
          setResendResult({});
        }, data.waitTime * 1000);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendResult({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Information */}
      <div className="w-1/2 relative bg-gradient-to-br from-red-900 via-yellow-200 to-red-900 overflow-hidden hidden lg:block">
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="VK Background"
            fill
            priority
            className="object-cover object-center opacity-20"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-orange-800/80 to-red-800/90"></div>
        </div>

        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white space-y-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border border-orange-300/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-orange-200/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-200 to-red-300 rounded-full"></div>
                  </div>
                </div>
                {[...Array(8)].map((_, i: number) => (
                  <div 
                    key={i}
                    className="absolute w-px h-6 bg-gradient-to-t from-orange-200/60 to-transparent"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      transformOrigin: 'center 40px',
                      top: '50%',
                      left: '50%',
                      marginLeft: '-0.5px',
                      marginTop: '-40px'
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center mb-4">
                  <div className="h-px w-8 bg-orange-400/60"></div>
                  <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-200 text-xs tracking-[0.2em] uppercase font-light">
                    Email Verification
                  </span>
                  <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <div className="h-px w-8 bg-orange-400/60"></div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4">
                  <span className="block text-white/95 mb-2">Secure Your</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-red-200 to-orange-300">
                    Journey
                  </span>
                </h1>
                
                <p className="text-lg text-orange-100/90 font-light leading-relaxed">
                  Verify your email to join the universal family
                </p>
              </div>

              <div className="pt-6 border-t border-orange-300/20">
                <p className="text-orange-200/80 text-sm italic font-light">
                  Unity begins with verified connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Verification Content */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4 lg:p-8">
        <div className="bg-white shadow-2xl rounded-2xl p-6 lg:p-8 w-full max-w-md border border-red-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="text-white font-bold text-sm lg:text-lg">VK</div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-red-700 mb-2">
              Resend Email Verification
            </h2>
          </div>

          {/* Verification Status */}
          {isVerifying && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-600 text-sm">Verifying your email...</p>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult.success !== undefined && (
            <div className={`mb-6 p-4 rounded-lg border ${
              verificationResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start">
                {verificationResult.success ? (
                  <svg className="flex-shrink-0 w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    verificationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {verificationResult.success ? 'Success!' : 'Verification Failed'}
                  </p>
                  <p className={`text-sm ${
                    verificationResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {verificationResult.message || verificationResult.error}
                  </p>
                  {verificationResult.success && (
                    <p className="text-xs text-green-600 mt-2">
                      Redirecting to login page...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Resend Verification Form */}
          {!verificationResult.success && (
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  className="w-full border-2 border-red-200 rounded-lg p-3 focus:outline-none focus:border-red-500 transition-colors text-gray-700 placeholder-gray-400 text-sm"
                />
              </div>

              {/* Resend Result */}
              {resendResult.success !== undefined && (
                <div className={`p-3 rounded-lg border ${
                  resendResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${
                    resendResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {resendResult.message || resendResult.error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isResending || !canResend}
                className={`w-full font-bold py-3 rounded-lg transition-all duration-300 shadow-lg text-sm ${
                  isResending || !canResend
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : !canResend ? (
                  `Wait ${Math.ceil((resendResult.waitTime || 0) / 60)} min to resend`
                ) : (
                  'Resend Verification Email'
                )}
              </button>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="text-center pt-4 border-t border-gray-200 mt-6">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Protected by the sacred principles of Vasudhaiva Kutumbakam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;