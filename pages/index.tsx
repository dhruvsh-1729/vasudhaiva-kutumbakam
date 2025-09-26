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
import logo from '../public/vk-competition-logo.png';

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
        'who-is-involved', 
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
    { id: 'who-is-involved', label: 'Participants' },
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
      title: "Cultural Celebration",
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
    { category: "Lextoons", icon: "🖋️", description: "Turn words into witty AI-generated cartoons that highlight values and social issues." },
    { category: "Political Toons", icon: "🏛️", description: "Use satire and AI artistry to creatively capture political ideas and principles." },
    { category: "Creative Expression", icon: "✨", description: "An open category for unique AI-driven 5-7 pages script aligned with Vasudhaiva Kutumbakam." }              
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
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {/* <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-orange-500 text-white text-xs font-bold shadow-md shadow-red-500/30">
                VK
              </div> */}
              <Image className="w-10 h-10 rounded-full" alt="VK Logo" width={40} height={40}
                  src={logo.src} />
              <div className="text-lg sm:text-xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-red-700 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                  VK Competition
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
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
                        Dashboard
                      </button>
                      <button
                        onClick={() => router.push("/leaderboard")}
                        className="block w-full px-4 py-2 text-sm text-zinc-700 hover:bg-gray-50"
                      >
                        Leaderboard
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
                  <Link href="/register">
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
  
      {/* Hero Section */}
      <section className="relative z-[1] min-h-screen flex items-center overflow-hidden py-8 sm:-mt-6">
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
                  Global Celebration of Unity through Creative Expression
                  </span>
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
      <section id="what-is-competition" className="relative py-24 overflow-hidden">
        {/* Soft gradient ornaments */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-rose-400/25 via-red-400/20 to-orange-300/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-orange-400/25 via-red-400/20 to-rose-300/25 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
        <span className="inline-flex items-center rounded-full border border-red-200/60 bg-white/70 px-3 py-1 text-xs font-medium text-red-700 shadow-sm">
          A celebration of unity
        </span>
        <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-red-700 via-rose-600 to-orange-500 bg-clip-text text-transparent">
            What is the VK Competition?
          </span>
        </h2>
        <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-red-500/60 via-rose-500/60 to-orange-500/60 rounded-full" />
        <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
          A global celebration of unity through creative expression, where artists from every corner of the world 
          come together to showcase the beautiful principle that The World is One Family.
        </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {competitionInfo.map((item: CompetitionInfo, index: number) => (
          <div key={index} className="group relative">
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-rose-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Gradient border wrapper */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-rose-500/20 to-orange-500/20">
          {/* Card */}
          <div className="rounded-2xl h-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
            <div className="p-8">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-orange-50 text-2xl ring-1 ring-red-100 transition-transform duration-300 group-hover:scale-105">
            {item.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
            {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
            {item.description}
              </p>
            </div>

            {/* Subtle top accent */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
          </div>
            </div>
          </div>
        ))}
          </div>

          <div className="mt-12 flex justify-center">
        <button
          onClick={() => scrollToSection('competition-list')}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/35 hover:from-red-700 hover:to-red-800 transition-all"
        >
          Explore categories
          <ArrowRight className="h-4 w-4" />
        </button>
          </div>
        </div>
      </section>

      {/* Who is Involved Section */}
      <section id="who-is-involved" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-6">
              Who Can Participate?
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              The VK Competition welcomes all souls who believe in the power of unity and wish to express 
              the sacred bond that connects humanity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {participantCategories.map((participant: ParticipantCategory, index: number) => (
              <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center border border-red-200">
                <div className="text-3xl mb-3">{participant.icon}</div>
                <h3 className="text-xl font-bold text-red-700 mb-2">{participant.category}</h3>
                <p className="text-gray-600 text-sm">{participant.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes-opportunities" className="py-20 bg-white/50">
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
              Prize Pool of ₹3,00,000
            </h3>
            <p className="text-lg opacity-90">
              And other exciting opportunities to showcase your work on global platforms 
            </p>
          </div>
        </div>
      </section>

      {/* Competition Categories Section */}
      <section id="competition-list" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-6">
              Expression Categories
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto">
              Choose your medium to express the sacred truth of universal brotherhood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    href="https://jyot.in"
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