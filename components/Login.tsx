// components/Login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import backgroundImage from "@/public/map.jpg";

// Type definitions
interface LoginFormData {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  token?: string;
  error?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.user && data.token) {
        // Store user info and token
        localStorage.setItem('vk_user', JSON.stringify(data.user));
        localStorage.setItem('vk_token', data.token);
        
        alert("Login successful! Welcome back to VK Competition.");
        router.push("/main");
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials')) {
          setErrors({ 
            general: 'Invalid email or password. Please check your credentials and try again.' 
          });
        } else if (error.message.includes('Account not found')) {
          setErrors({ 
            email: 'No account found with this email. Please register first.' 
          });
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

  const handleForgotPassword = async (): Promise<void> => {
    if (!form.email.trim()) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    alert('Password reset functionality will be implemented soon. Please contact support for assistance.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Vasudhaiva Kutumbakam Information */}
      <div className="w-1/2 relative bg-gradient-to-br from-red-900 via-yellow-200 to-red-900 overflow-hidden hidden sm:block">
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
                    Welcome Back to Unity
                  </span>
                  <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <div className="h-px w-8 bg-orange-400/60"></div>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-light leading-tight mb-4">
                  <span className="block text-white/95 mb-2">Continue Your</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-red-200 to-orange-300">
                    Sacred Journey
                  </span>
                </h1>
                
                <p className="text-lg text-orange-100/90 font-light leading-relaxed">
                  Re-enter the realm of creative expression
                </p>
              </div>

              {/* Quote */}
              <div className="pt-6 border-t border-orange-300/20">
                <p className="text-orange-200/80 text-sm italic font-light">
                  Every login is a return to the universal family
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="w-1/2 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-8 w-full sm:max-w-md mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full border border-red-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="text-white font-bold text-lg">VK</div>
            </div>
            <h2 className="text-3xl font-bold text-red-700 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Continue your sacred expression journey</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full border-2 rounded-xl p-4 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 ${
                  errors.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-red-200 focus:border-red-500'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full border-2 rounded-xl p-4 pr-12 focus:outline-none transition-colors text-gray-700 placeholder-gray-400 ${
                    errors.password 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-red-200 focus:border-red-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-red-600 hover:text-red-700 hover:underline"
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-4 rounded-xl transition-all duration-300 shadow-lg transform ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing you in...
                  </div>
                ) : (
                  'Continue Sacred Journey'
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                  Join the Movement
                </Link>
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Protected by the sacred principles of Vasudhaiva Kutumbakam
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;