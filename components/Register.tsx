// components/Register.tsx (Updated)
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/public/map.jpg";
import { toast } from "sonner";

// Type definitions
interface FormData {
  name: string;
  email: string;
  phone: string;
  institution: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  requiresEmailVerification?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
  error?: string;
}

interface BulletPoint {
  text: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    institution: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!form.institution.trim()) {
      newErrors.institution = 'Institution is required';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          institution: form.institution,
          password: form.password,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        // throw new Error(data.error || 'Registration failed');
      }

      if (data.success) {
        // Check if email verification is required (new flow)
        if (data.requiresEmailVerification && data.user) {
          setRegistrationSuccess(true);
          setRegisteredEmail(data.user.email);
          
          // Redirect to email verification page after 3 seconds
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(data.user!.email)}`);
          }, 3000);
          
        } else if (data.user && data.token) {
          // Legacy flow - if token is provided (shouldn't happen with new flow)
          localStorage.setItem('vk_user', JSON.stringify(data.user));
          localStorage.setItem('vk_token', data.token);
          
          // alert("Registration successful! Welcome to the VK Competition community.");
          toast.success("Registration successful! Welcome to the VK Competition community.");
          router.push("/main");
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          setErrors({ email: 'This email is already registered. Please use a different email.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = (): void => {
    router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`);
  };

  // Feature bullet points data
  const bulletPoints: BulletPoint[] = [
    { text: "Global artistic community" },
    { text: "Multiple expression categories" },
    { text: "Prizes & recognition" },
    { text: "Unity through diversity" }
  ];

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-red-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-green-700 mb-4">Registration Successful!</h2>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="flex-shrink-0 w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-amber-800">Email Verification Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  We have sent a verification email to <strong>{registeredEmail}</strong>. 
                  Please check your inbox and click the verification link to complete your registration.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            You will be redirected to the email verification page in a few seconds, or you can click the button below.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleVerifyEmail}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Go to Email Verification
            </button>
            
            <p className="text-sm text-gray-500">
              Did not receive the email? Check your spam folder or try the verification page to resend.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already verified?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Vasudhaiva Kutumbakam Information */}
      <div className="w-1/2 relative bg-gradient-to-br from-red-900 via-yellow-200 to-red-900 overflow-hidden hidden lg:block">
        {/* Background Image with Overlay */}
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

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white space-y-8">
            
            {/* Decorative Element */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border border-orange-300/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-orange-200/50 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-200 to-red-300 rounded-full"></div>
                  </div>
                </div>
                {/* Radiating lines */}
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

            {/* Main Content */}
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center mb-4">
                  <div className="h-px w-8 bg-orange-400/60"></div>
                  <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-200 text-xs tracking-[0.2em] uppercase font-light">
                    Global Celebration of Unity through Creative Expression
                  </span>
                  <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <div className="h-px w-8 bg-orange-400/60"></div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4">
                  <span className="block text-white/95 mb-2">Vasudhaiva</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-red-200 to-orange-300">
                    Kutumbakam
                  </span>
                </h1>
                
                <p className="text-lg text-orange-100/90 font-light leading-relaxed">
                  The World is One Family
                </p>
              </div>

              {/* Description */}
              <div className="space-y-4 text-left">
                <p className="text-white/90 text-sm leading-relaxed">
                  Join a global movement celebrating unity through creative expression. 
                  Express the sacred truth that connects all humanity as one universal family.
                </p>
                
                <div className="space-y-3">
                  {bulletPoints.map((point: BulletPoint, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                      <span className="text-orange-100 text-sm">{point.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="pt-6 border-t border-orange-300/20">
                <p className="text-orange-200/80 text-sm italic font-light">
                  In diversity we find strength, in unity we discover light
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Registration Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4 lg:p-8">
        <div className="bg-white shadow-2xl rounded-2xl p-6 lg:p-8 w-full max-w-2xl border border-red-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <div className="text-white font-bold text-sm lg:text-lg">VK</div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-red-700 mb-2">
              Join the Movement
            </h2>
            <p className="text-gray-600 text-sm">Begin your journey with email verification</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid Layout for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                    errors.name 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-200 focus:border-red-500'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                    errors.email 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-200 focus:border-red-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                    errors.phone 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-200 focus:border-red-500'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Institution Field */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Institution / College
                </label>
                <input
                  type="text"
                  name="institution"
                  placeholder="Enter your institution name"
                  value={form.institution}
                  onChange={handleChange}
                  required
                  className={`w-full border-2 rounded-lg p-3 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                    errors.institution 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-200 focus:border-red-500'
                  }`}
                />
                {errors.institution && (
                  <p className="mt-1 text-xs text-red-600">{errors.institution}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`w-full border-2 rounded-lg p-3 pr-10 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                      errors.password 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-red-200 focus:border-red-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full border-2 rounded-lg p-3 pr-10 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 text-sm ${
                      errors.confirmPassword 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-red-200 focus:border-red-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Email Verification Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Email Verification Required:</strong> After registration, you will receive an email to verify your account before you can sign in.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 rounded-lg transition-all duration-300 shadow-lg transform text-sm cursor-pointer ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating your account...
                  </div>
                ) : (
                  'Register Now'
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By registering, you agree to honor the principles of Vasudhaiva Kutumbakam
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;