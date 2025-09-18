// components/Footer.tsx (Enhanced with Authentication)
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { clientAuth } from '../middleware/auth';

interface FooterLink {
  href: string;
  label: string;
  requiresAuth?: boolean;
}

interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Footer: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status on component mount
  useEffect(() => {
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    
    if (currentUser && token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  const quickLinks: FooterLink[] = [
    { href: "/", label: "Home" },
    // { href: "/about", label: "About VK" },
    // { href: "/main", label: "Dashboard", requiresAuth: true },
    // { href: "/main#competitions", label: "Competitions", requiresAuth: true },
    { href: "/contact", label: "Contact" },
    { href: "/privacy", label: "Privacy Policy" }
  ];

  const authLinks: FooterLink[] = isAuthenticated 
    ? [
        { href: "/profile", label: "Profile" },
        { href: "/main", label: "Dashboard" }
      ]
    : [
        { href: "/login", label: "Sign In" },
        { href: "/register", label: "Register" }
      ];

  const socialLinks: SocialLink[] = [
    {
      href: "#",
      label: "Twitter",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      )
    },
    {
      href: "#",
      label: "Instagram",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      href: "#",
      label: "LinkedIn",
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-orange-900/10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-600/5 to-transparent rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-600/5 to-transparent rounded-full translate-x-48 translate-y-48"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">VK</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-400">VK Competition</h3>
                <p className="text-xs text-gray-400">Vasudhaiva Kutumbakam</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              A global platform celebrating unity through creative expression. Join thousands of artists, creators, and innovators in our sacred journey of artistic collaboration.
            </p>
            
            {/* User Status */}
            {isAuthenticated && user && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-green-300 font-semibold text-sm">Welcome, {user.name.split(' ')[0]}</p>
                    <p className="text-green-400 text-xs">Logged in and ready to create</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-100">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link: FooterLink, index: number) => {
                // Hide auth-required links if not authenticated
                if (link.requiresAuth && !isAuthenticated) return null;
                
                return (
                  <li key={index}>
                    <Link href={link.href}>
                      <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group">
                        <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Account Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-100">
              {isAuthenticated ? "Account" : "Get Started"}
            </h4>
            <ul className="space-y-3">
              {authLinks.map((link: FooterLink, index: number) => (
                <li key={index}>
                  <Link href={link.href}>
                    <span className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm flex items-center group">
                      <svg className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
              
              {isAuthenticated && (
                <li>
                  <button
                    onClick={() => clientAuth.logout()}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center group"
                  >
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </div>
          
          {/* Social & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-gray-100">Connect With Us</h4>
            {/* <div className="flex space-x-4 mb-6">
              {socialLinks.map((social: SocialLink, index: number) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="text-gray-400 hover:text-white transition-colors transform hover:scale-110 duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div> */}
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                vk4.ki.oar@gmail.com
              </div>
              
              <div className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Global Community
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} VK Competition. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                The World is One Family - Celebrating unity through creative expression
              </p>
            </div>
            
            {/* Competition Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="text-orange-400 font-bold">1000+</div>
                <div className="text-gray-500 text-xs">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold">50+</div>
                <div className="text-gray-500 text-xs">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-amber-400 font-bold">Weekly</div>
                <div className="text-gray-500 text-xs">Challenges</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;