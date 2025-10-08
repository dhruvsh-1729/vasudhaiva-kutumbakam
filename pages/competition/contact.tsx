import { useEffect, useState } from 'react';
import Image from 'next/image';
import backgroundImage from "@/public/map.jpg";
import { Mail, Phone, MapPin, Send, ArrowLeft, Clock, Globe } from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'submitting'>('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vk_token');
      const user = localStorage.getItem('vk_user');
      
      if (token && user) {
        setIsAuthenticated(true);
        const userData = JSON.parse(user);
        setUserInfo({ name: userData.name, email: userData.email });
        // Pre-fill form for authenticated users
        setFormData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email
        }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('submitting');
    
    try {    
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        // Reset only the fields that can be changed
        if (isAuthenticated) {
          setFormData(prev => ({ ...prev, subject: '', message: '' }));
        } else {
          setFormData({ name: '', email: '', subject: '', message: '' });
        }
      } else {
        const errorData = await response.json();
        console.error('Submit error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold shadow-md shadow-red-500/30">
                VK
              </div>
              <div className="text-lg sm:text-xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-red-700 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                  VK Competition
                </span>
              </div>
            </div>

            {/* Back to Home */}
            <Link href="/competition">
              <button className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose-400/25 via-red-400/20 to-orange-300/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-orange-400/25 via-red-400/20 to-rose-300/25 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-red-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-red-700 shadow-sm">
              Get in Touch
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-red-700 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-red-500/60 via-rose-500/60 to-orange-500/60 rounded-full" />
            <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Have questions about the Vasudhaiva Kutumbakam Competition? 
              We are here to help you on your creative journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
        {/* Email Card */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-rose-500/20 to-orange-500/20">
            <div className="rounded-2xl h-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-red-600 ring-1 ring-red-100">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
            <a href="mailto:vk4.ki.oar@gmail.com" className="text-red-600 hover:text-red-700 break-all">
              vk4.ki.oar@gmail.com 
            </a>
            &nbsp;is the official email ID for all queries.
          </div>
            </div>
          </div>
        </div>

        {/* Phone Card */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-rose-500/20 to-orange-500/20">
            <div className="rounded-2xl h-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-red-600 ring-1 ring-red-100">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
            <a href="tel:+919137828829" className="text-red-600 hover:text-red-700 block">
              +91 91378 28829
            </a>
            <a href="tel:+919892221754" className="text-red-600 hover:text-red-700 block">
              +91 98922 21754
            </a>
          </div>
            </div>
          </div>
        </div>

        {/* Response Time Card */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-rose-500/20 to-orange-500/20">
            <div className="rounded-2xl h-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-red-600 ring-1 ring-red-100">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
            <p className="text-gray-600">We typically respond within 24-48 hours</p>
          </div>
            </div>
          </div>
        </div>

        {/* Global Reach Card */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-rose-500/20 to-orange-500/20">
            <div className="rounded-2xl h-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-300 group-hover:shadow-xl">
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-red-600 ring-1 ring-red-100">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Support</h3>
            <p className="text-gray-600">Supporting participants worldwide</p>
          </div>
            </div>
          </div>
        </div>
          </div>

          {/* Contact Form */}
          {/* <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send Us a Message</h2>
              
              {isAuthenticated && userInfo && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    <strong>Logged in as:</strong> {userInfo.name} ({userInfo.email})
                  </p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors ${
                        isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required={!isAuthenticated}
                      disabled={isAuthenticated}
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors ${
                        isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="registration">Registration Help</option>
                    <option value="competition">Competition Queries</option>
                    <option value="technical">Technical Support</option>
                    <option value="prizes">Prizes & Recognition</option>
                    <option value="partnership">Partnership Opportunities</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex cursor-pointer items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold px-8 py-3 rounded-full hover:from-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                {submitStatus === 'success' && (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">Thank you for your message! We will get back to you soon.</p>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">Something went wrong. Please try again or email us directly.</p>
                  </div>
                )}
              </form>
            </div>
          </div> */}

          {/* FAQ Section */}
          {/* <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <p className="text-gray-600 mb-6">
              Before contacting us, you might find your answer in our FAQ section
            </p>
            <Link href="/faq">
              <button className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium">
                View FAQs
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactUs;