import { useState, useEffect } from 'react';
import Link from "next/link";
import jyotimage from '../public/jyot_logo.webp';
import Image from 'next/image';
import backgroundImage from "@/public/map.jpg";
import { useRouter } from 'next/router';
import NotificationBanner from '../components/NotificationBanner';
import { ArrowRight, MoveRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { clientAuth } from '@/middleware/auth';
import logo from '@/public/main_logo.png';
import CountDown from '@/components/CountDown';
import { getCompetitionById } from '@/data/competitions';

// Type definitions
type SectionId = 'what-is-competition' | 'who-is-involved' | 'prizes-opportunities' | 'competition-list' | 'about-jyot';

interface FormData {
  name: string;
  email: string;
  phone: string;
  institution: string;
  competition: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}
interface NavItem {
  id: SectionId;
  label: string;
}

interface CompetitionInfo {
  title: string;
  description: string;
  icon: string;
}

interface ParticipantCategory {
  category: string;
  description: string;
  icon: string;
}

interface CompetitionCategory {
  category: string;
  icon: string;
  description: string;
}

const Home: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('what-is-competition');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter();

  useEffect(() => {
    const currentUser = clientAuth.getUser();
    const token = clientAuth.getToken();
    if (currentUser && token) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Mobile carousel scroll hijacking
  useEffect(() => {
    // Only run on mobile devices
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;

    let currentIndex = 0;
    const totalItems = 4;
    const cardWidth = 320;
    const gap = 24;
    
    const carousel = document.getElementById('mobile-carousel-track');
    const container = document.getElementById('mobile-scroll-carousel');
    const indicators = document.querySelectorAll('.indicator-dot');
    const scrollHint = document.getElementById('scroll-hint');

    const updateCarousel = () => {
      if (!carousel) return;
      
      const translateX = -(currentIndex * (cardWidth + gap));
      carousel.style.transform = `translateX(${translateX}px)`;
      
      // Update indicators
      indicators.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.className = 'w-8 h-2 rounded-full bg-amber-600 transition-all duration-300 indicator-dot active';
        } else {
          dot.className = 'w-2 h-2 rounded-full bg-amber-300 transition-all duration-300 indicator-dot';
        }
      });

      // Update scroll hint
      if (scrollHint) {
        if (currentIndex === 0) {
          scrollHint.textContent = 'Scroll down to explore →';
        } else if (currentIndex === totalItems - 1) {
          scrollHint.textContent = '← Scroll up to go back';
        } else {
          scrollHint.textContent = '← Scroll to navigate →';
        }
      }
    };

    const handleWheelScroll = (e: WheelEvent) => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isInView = rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4;

      if (isInView) {
        const deltaY = e.deltaY;

        if (Math.abs(deltaY) > 10) {
          if (deltaY > 0 && currentIndex < totalItems - 1) {
            // Scroll down -> next slide
            e.preventDefault();
            currentIndex++;
            updateCarousel();
          } else if (deltaY < 0 && currentIndex > 0) {
            // Scroll up -> previous slide
            e.preventDefault();
            currentIndex--;
            updateCarousel();
          }
          // At boundaries, allow normal scrolling (don't preventDefault)
        }
      }
    };

  // Add event listeners
  document.addEventListener('wheel', handleWheelScroll, { passive: false });

  // Initialize
  updateCarousel();

  // Cleanup
  return () => {
    document.removeEventListener('wheel', handleWheelScroll);
  };
}, []);

  const handleRegisterClick = (): void => {
    router.push("/register");
  };
  
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientAuth.getToken()}`,
        },
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    clientAuth.logout();
  };
  
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const scrollToSection = (sectionId: SectionId): void => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
      
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
    }
  };
  
  useEffect(() => {
    const handleScroll = (): void => {
      const sections: SectionId[] = [
        'what-is-competition',
        'prizes-opportunities',
        'competition-list',
        'about-jyot'
      ];
      
      const currentSection = sections.find((section: SectionId) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom > 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items configuration
  const navItems: NavItem[] = [
    { id: 'what-is-competition', label: 'Competition' },
    { id: 'prizes-opportunities', label: 'Prizes' },
    { id: 'competition-list', label: 'Categories' },
    { id: 'about-jyot', label: 'About' }
  ];

  // Competition info data
  const competitionInfo: CompetitionInfo[] = [
    {
      title: "Global Unity",
      description: "Connecting hearts across borders through the universal language of art",
      icon: "🌍"
    },
    {
      title: "Technological Creativity",
      description: "Harnessing AI to amplify human imagination and storytelling",
      icon: "🤖"
    },
    {
      title: "Cultural Unity",
      description: "Embracing diversity while celebrating our shared human experience",
      icon: "🎭"
    }
  ];

  // Participants data
  const participantCategories: ParticipantCategory[] = [
    { category: "Students", description: "Young minds shaping tomorrow", icon: "🎓" },
    { category: "Artists", description: "Creative souls expressing truth", icon: "🎨" },
    { category: "Writers", description: "Wordsmiths weaving wisdom", icon: "✍️" },
    { category: "Everyone", description: "All hearts that beat as one", icon: "❤️" }
  ];

  // Competition categories data
  const competitionCategories: CompetitionCategory[] = [
    { category: "AI Reel Making", icon: "🎬", description: "Craft 1-3 minute stories using AI tools that bring global unity and creativity to life." },
    { category: "Political Toons", icon: "🏛️", description: "Use satire and AI artistry to creatively capture political ideas and principles." },
    { category: "Creative Expression", icon: "✨", description: "An open category for unique script aligned with Vasudhaiva Kutumbakam." },
    { category: "Painting Competition", icon: "🎨", description: "Express the essence of 'The World is One Family' through traditional and digital painting." }
  ];

  // Return statement for the main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">      
      {/* Navigation */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold shadow-md shadow-red-500/30">
            VK
          </div> */}
          <Image className="w-20 h-20 rounded-full" alt="VK Logo" width={80} height={80}
          src={logo.src} />
          <div className="text-lg sm:text-xl font-semibold tracking-tight">
            <div>
            <h1 className="text-xl font-bold text-red-700 group-hover:text-red-800 transition-colors">VK Competition</h1>
          </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item: NavItem) => {
            const active = activeSection === item.id;
            return (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`relative cursor-pointer px-6 py-2 rounded-full text-sm font-medium transition-all
              ${
            active
              ? "text-red-700 bg-red-50 ring-1 ring-red-100 shadow-sm"
              : "text-gray-700 hover:text-red-700 hover:bg-gray-100/60"
              }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
            {active && (
              <span className="pointer-events-none absolute -bottom-2 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
            )}
          </button>
            );
          })}
        </div>

        {/* Right Side - Auth Aware */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
            <button 
          className='hidden lg:block text-base px-5 py-2 bg-gradient-to-r from-red-600 to-orange-800 rounded-md text-white font-medium cursor-pointer hover:from-red-700 hover:to-orange-600' 
          onClick={() => router.push("/main")}
            >
          Dashboard
            </button>
            <div className="relative">
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-semibold shadow hover:shadow-lg transition"
          >
            {getInitials(user.name)}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="text-xs text-gray-600">{user.email}</p>
              </div>
              <button
            onClick={() => router.push("/main")}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
            Competitions
              </button>
              <button
            onClick={() => router.push("/profile")}
            className="block w-full px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50"
              >
            My Profile
              </button>
              <button
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
            Logout
              </button>
            </div>
          )}
            </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="text-gray-700 cursor-pointer hover:text-red-600 font-medium text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition">
              Sign In
            </button>
          </Link>
          <Link href="/register" className="hidden sm:block">
            <button className="bg-gradient-to-r cursor-pointer from-red-600 to-red-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow hover:shadow-lg transition">
              Register
            </button>
          </Link>
            </div>
          )}
        </div>
          </div>
        </div>
      </nav>

      <NotificationBanner />
      <div className='hidden sm:block relative top-0 z-10 w-full'>
        <CountDown deadline={getCompetitionById(1)?.deadline as string} />
      </div>
  
      {/* Hero Section */}
      <section className="relative z-[1] min-h-screen flex items-center overflow-hidden pb-8 pt-8 sm:pt-0 sm:-mt-20">
        {/* Background Image with Overlay */}
        <div className="absolute z-[2] inset-0">
          <Image
            src={backgroundImage}
            alt="VK Competition Hero"
            fill
            priority
            className="object-cover object-center brightness-55 contrast-180"
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-orange-800/65 to-red-800/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-[3] w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white space-y-8">
              
              {/* Decorative Element */}
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-orange-300/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-orange-200/50 flex items-center justify-center">
                      <div className="w-3 h-3 bg-gradient-to-br from-orange-200 to-red-300 rounded-full shadow-lg"></div>
                    </div>
                  </div>
                  {/* Radiating lines */}
                  {[...Array(8)].map((_, i: number) => (
                    <div 
                      key={i}
                      className="absolute w-px h-8 bg-gradient-to-t from-orange-200/60 to-transparent"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        transformOrigin: 'center 48px',
                        top: '50%',
                        left: '50%',
                        marginLeft: '-0.5px',
                        marginTop: '-48px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <div className="inline-flex items-center mb-6">
                  <div className="h-px w-12 bg-orange-400/60"></div>
                  <div className="mx-4 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <span className="text-orange-200 text-sm font-light tracking-[0.2em] uppercase">
                  Empowering Youth to Protect Heritage through Art                  </span>
                  <div className="mx-4 w-1 h-1 bg-orange-400 rounded-full"></div>
                  <div className="h-px w-12 bg-orange-400/60"></div>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                  <span className="block text-white/95">VASUDHAIVA KUTUMBAKAM
                  </span>
                  <span></span>
                </h1>
                
                {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-3">
                <button
                  onClick={handleRegisterClick}
                  className="group bg-gradient-to-r cursor-pointer from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-4 px-8 rounded-full transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1 text-lg"
                >
                  <span className="mr-2">{isAuthenticated ? "Take me to dashboard" : "Begin your journey"}</span>
                  <svg className="inline w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                <button
                  onClick={() => scrollToSection('what-is-competition')}
                  className="group bg-white/10 cursor-pointer backdrop-blur-sm hover:bg-white/20 text-white font-medium py-4 px-8 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 text-lg"
                >
                  <span className="mr-2">Explore Competitions</span>
                  <svg className="inline w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>

                <p className="text-xl md:text-2xl text-orange-100/90 font-light max-w-3xl mx-auto leading-relaxed mt-8">
                  The World is One Family — Unite hearts across borders through the universal language of art
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* What is Competition Section */}
      <section id="what-is-competition" className="relative py-20 overflow-hidden bg-gradient-to-b from-amber-50/40 to-orange-50/30">
        {/* Subtle background texture */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-amber-300/15 blur-3xl" />
          <div className="absolute bottom-10 right-20 h-48 w-48 rounded-full bg-gradient-to-tr from-orange-400/15 via-amber-400/10 to-orange-300/15 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-amber-800 via-orange-700 to-amber-900 bg-clip-text text-transparent">
                What is the VK Competition?
              </span>
            </h2>
            <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-amber-600/60 via-orange-500/60 to-amber-700/60" />
            <div className="mt-8 text-lg md:text-xl text-amber-800/80 max-w-4xl mx-auto leading-relaxed">
            <section className="max-w-3xl mx-auto text-center px-6 py-10">

              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
                Amid global crises — from conflicts and climate change to technological shifts and 
                the rise of a multipolar world — 
                <span className="font-semibold text-gray-900">India's role is crucial.</span>
              </p>

              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                This competition challenges participants to demonstrate how India can utilize the 
                ancient concept of <span className="italic font-semibold text-orange-700">Vasudhaiva Kutumbakam</span> 
                (<em>"The World is One Family"</em>) to emerge as a 
                <span className="font-semibold text-gray-900"> Vishwa Mitra</span> (Global Friend) 
                and a leading power, effectively using its 
                <span className="font-semibold text-gray-900"> hard and soft power </span> 
                to shape the new world order.
              </p>

              {/* <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl shadow-sm px-6 py-4 mt-6">
                <h3 className="text-lg font-bold text-orange-800 mb-2">The Core Challenge</h3>
                <p className="text-base md:text-lg font-semibold text-gray-800">
                  How does India leverage <span className="italic">"The World is One Family"</span> 
                  to become a global leader and trusted partner in an unstable world order? 🇮🇳
                </p>
              </div> */}
            </section>
            </div>
          </div>
          
          {/* Desktop Grid - Hidden on Mobile */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...competitionInfo, {
              title: "Ancient Wisdom",
              description: "Explore the profound knowledge of Indian civilization and weave timeless principles into contemporary narratives",
              icon: "🏛️"
            }].map((item: CompetitionInfo, index: number) => (
              <div key={index} className="group relative transform transition-all duration-500 hover:scale-105">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/8 to-amber-600/10 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Card */}
                <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/60 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:border-amber-300/80">
                  <div className="p-8">
                    {/* Interactive SVG Icon instead of emoji */}
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 shadow-inner transition-transform duration-300 group-hover:scale-110">
                      {index === 0 && (
                        <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18.77L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z"/>
                        </svg>
                      )}
                      {index === 1 && (
                        <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5L12 8L9 7.5V6.5L3 7V9L9 9.5V12L3 12V14L9 14.5V17.5L12 16L15 17.5V14.5L21 14V12L15 11.5V9.5L21 9Z"/>
                        </svg>
                      )}
                      {index === 2 && (
                        <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                        </svg>
                      )}
                      {index === 3 && (
                        <svg className="w-8 h-8 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H5M5,5H19V19H5V5M7,7V9H17V7H7M7,11V13H17V11H7M7,15V17H14V15H7Z"/>
                        </svg>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-medium text-amber-900 mb-4 transition-colors duration-300 group-hover:text-amber-800">
                      {item.title}
                    </h3>
                    <p className="text-amber-700/80 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Elegant top accent line */}
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left" />
                  
                  {/* Subtle corner accents */}
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-300/0 transition-colors duration-300 group-hover:border-amber-400/60" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-300/0 transition-colors duration-300 group-hover:border-amber-400/60" />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Snap Scroll Carousel */}
          <div className="lg:hidden">
            <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">
              <div className="flex gap-6 pb-4 px-4 w-max">
                {[...competitionInfo, {
                  title: "Ancient Wisdom",
                  description: "Explore the profound knowledge of Indian civilization and weave timeless principles into contemporary narratives",
                  icon: "🏛️"
                }].map((item: CompetitionInfo, index: number) => (
                  <div key={index} className="snap-center flex-none w-80 group relative">
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/8 to-amber-600/10 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                    
                    {/* Card */}
                    <div className="relative h-full bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/60 shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:border-amber-300/80">
                      <div className="p-6">
                        {/* Interactive SVG Icon */}
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/50 shadow-inner transition-transform duration-300 group-hover:scale-110">
                          {index === 0 && (
                            <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18.77L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z"/>
                            </svg>
                          )}
                          {index === 1 && (
                            <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5L12 8L9 7.5V6.5L3 7V9L9 9.5V12L3 12V14L9 14.5V17.5L12 16L15 17.5V14.5L21 14V12L15 11.5V9.5L21 9Z"/>
                            </svg>
                          )}
                          {index === 2 && (
                            <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                            </svg>
                          )}
                          {index === 3 && (
                            <svg className="w-6 h-6 text-amber-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5,3C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H5M5,5H19V19H5V5M7,7V9H17V7H7M7,11V13H17V11H7M7,15V17H14V15H7Z"/>
                            </svg>
                          )}
                        </div>
                        <h3 className="text-lg font-medium text-amber-900 mb-3 transition-colors duration-300 group-hover:text-amber-800">
                          {item.title}
                        </h3>
                        <p className="text-amber-700/80 text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Elegant top accent line */}
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left" />
                      
                      {/* Subtle corner accents */}
                      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-amber-300/0 transition-colors duration-300 group-hover:border-amber-400/60" />
                      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-amber-300/0 transition-colors duration-300 group-hover:border-amber-400/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Scroll hint */}
            <div className="text-center mt-4">
              <p className="text-amber-600/70 text-xs animate-pulse">
                ← Swipe horizontally to explore →
              </p>
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <button
              onClick={() => scrollToSection('competition-list')}
              className="group relative cursor-pointer inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-700 to-orange-700 text-white px-8 py-4 text-sm font-medium shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:from-amber-800 hover:to-orange-800 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Explore categories</span>
              <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              
              {/* Button hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left" />
            </button>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes-opportunities" className="pt-10 pb-20 bg-gradient-to-b from-amber-50/40 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-6">
              Prizes & Recognition
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Beyond material rewards, gain recognition as an ambassador of global unity and universal love.
            </p>
          </div>

          {/* Single Prize Pool Banner */}
          <div className="bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl shadow-2xl p-10 text-center text-white">
            <h3 className="text-5xl md:text-6xl font-extrabold mb-4">
              Prize Pool of ₹5,00,000
            </h3>
            <p className="text-lg opacity-90">
              And other exciting opportunities to showcase your work on global platforms in front of dignitaries and industry leaders.
            </p>
          </div>
        </div>
      </section>

      {/* Competition Categories Section */}
      <section id="competition-list" className="py-20 bg-gradient-to-b from-amber-50/40 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-6">
              Expression Categories
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Choose your medium to express the truth of universal brotherhood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {competitionCategories.map((category: CompetitionCategory, index: number) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-red-100 hover:border-red-300">
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="text-xl font-bold text-red-700 mb-2">{category.category}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <button 
                  onClick={handleRegisterClick}
                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                >
                  Register for this category →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Jyot Section */}
      <section id="about-jyot" className="relative py-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Jyot Background"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/85 via-orange-800/80 to-red-800/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Content */}
              <div className="text-white space-y-6">
                <div>
                  <div className="inline-flex items-center mb-4">
                    <div className="h-px w-8 bg-orange-400"></div>
                    <div className="mx-3 w-1 h-1 bg-orange-400 rounded-full"></div>
                    <span className="text-orange-300 text-sm font-light tracking-widest uppercase">
                      Inspired by
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4">
                    <Image 
                      src={jyotimage}
                      alt="Jyot Logo"
                      width={48}
                      height={48}
                      className="inline-block mr-3"
                    />
                    <span className="text-white">Jyot</span>
                  </h2>
                  
                  <p className="text-orange-100 text-lg md:text-xl font-light leading-relaxed mb-6">
                    <em className="text-orange-200">Jyot</em> — meaning light — guides humanity 
                    toward realizing we are one universal family.
                  </p>
                </div>
                
                {/* Mission Statement */}
                <div className="space-y-4">
                  <p className="text-white/90 font-light leading-relaxed">
                  Founded in 2009, Jyot is dedicated to transforming learning into meaningful action. We design programs that mix scientific temper with spiritual insight so that knowledge becomes usable, ethical, and empowering. Guided by <strong>H.H. Spiritual Sovereign Jainacharya Yugbhushansuriji Maharaja</strong>, whose work spans scripture, science and civic thought, Jyot brings together young innovators and experienced mentors to run workshops, publications, and community initiatives.
                  </p>
                  
                  
                  <p className="text-white/90 font-light leading-relaxed">
                    We invite artists worldwide to embody 
                    <span className="text-orange-200 italic font-normal mx-1">
                      Vasudhaiva Kutumbakam
                    </span> 
                    — The World is One Family.
                  </p>
                </div>
                
                {/* CTA */}
                <div className="pt-4 flex justify-center sm:justify-start">
                  <a
                    href="https://vk.jyot.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300"
                  >
                    <span className="font-light">Discover More</span>
                    <svg
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                </div>

              </div>
              
              {/* Right Visual Element */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Outer ring */}
                  <div className="w-48 h-48 rounded-full border border-orange-300/30 flex items-center justify-center">
                    {/* Middle ring */}
                    <div className="w-32 h-32 rounded-full border border-orange-200/40 flex items-center justify-center">
                      {/* Inner ring */}
                      <div className="w-16 h-16 rounded-full border border-orange-100/50 flex items-center justify-center">
                        {/* Center light */}
                        <div className="w-4 h-4 bg-gradient-to-br from-orange-200 to-red-300 rounded-full shadow-lg"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Radiating lines */}
                  {[...Array(12)].map((_, i: number) => (
                    <div 
                      key={i}
                      className="absolute w-px h-16 bg-gradient-to-t from-orange-200/60 to-transparent"
                      style={{
                        transform: `rotate(${i * 30}deg)`,
                        transformOrigin: 'center 96px',
                        top: '50%',
                        left: '50%',
                        marginLeft: '-0.5px',
                        marginTop: '-96px'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Quote - Mobile Optimized */}
            <div className="my-4">
              <p className="text-orange-100/80 text-sm md:text-base font-light italic">
                In diversity we find strength, in unity we discover light
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default Home;