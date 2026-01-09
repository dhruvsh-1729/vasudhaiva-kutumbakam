import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import Footer from '@/components/Footer';
import backgroundImage from "@/public/map.jpg";

interface Winner {
  name: string;
  institution: string;
  placement: string;
}

interface CompetitionCategory {
  title: string;
  icon: string;
  description: string;
  winners: Winner[];
}

const Winners: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const competitions: CompetitionCategory[] = [
    {
      title: 'Poetry Competition',
      icon: '✍️',
      description: 'Celebrating the art of poetic expression through the lens of Vasudhaiva Kutumbakam',
      winners: [
        {
          name: 'Suyash Shukla',
          institution: 'Tata Institute of Social Sciences',
          placement: '1st Prize',
        },
        {
          name: 'Maddela Devendra Yadav',
          institution: 'Jain University',
          placement: '2nd Prize',
        },
        {
          name: 'Jainil Shah',
          institution: 'Mithibai College of Arts',
          placement: '3rd Prize',
        },
      ],
    },
    {
      title: 'MEME Creations',
      icon: '😄',
      description: 'Creative and humorous expressions that capture the spirit of global unity',
      winners: [
        {
          name: 'Dhruv Shah',
          institution: 'K J Somaiya College',
          placement: '1st Prize',
        },
        {
          name: 'Pari Kenia',
          institution: 'SVKM\'s Narsee Monjee College of Commerce and Economics',
          placement: '2nd Prize',
        },
        {
          name: 'Prathmesh Parab',
          institution: 'MCC College',
          placement: '3rd Prize',
        },
      ],
    },
    {
      title: 'Singing Composition',
      icon: '🎵',
      description: 'Musical compositions that harmonize the message of universal brotherhood',
      winners: [
        {
          name: 'Dhruv Solanki',
          institution: 'Sardar Patel Institute of Technology',
          placement: '1st Prize',
        },
        {
          name: 'Rahul Ratda',
          institution: 'S K Somaiya',
          placement: '2nd Prize',
        },
        {
          name: 'Priyal Gutka',
          institution: 'R A Podar College',
          placement: '3rd Prize',
        },
      ],
    },
    {
      title: 'Painting Competition',
      icon: '🎨',
      description: 'Visual artistry bringing to life the concept of "The World is One Family"',
      winners: [
        {
          name: 'Yash Shah',
          institution: 'D J Sanghvi',
          placement: '1st Prize',
        },
        {
          name: 'Vama Dedhia',
          institution: 'K J Somaiya',
          placement: '2nd Prize',
        },
        {
          name: 'Nikhil Patel',
          institution: 'S M Shetty',
          placement: '3rd Prize',
        },
      ],
    },
  ];

  const getPlacementIcon = (placement: string) => {
    if (placement.includes('1st')) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (placement.includes('2nd')) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    } else if (placement.includes('3rd')) {
      return <Award className="w-5 h-5 text-amber-600" />;
    }
    return <Award className="w-5 h-5 text-orange-500" />;
  };

  const getPlacementColor = (placement: string) => {
    if (placement.includes('1st')) {
      return 'from-yellow-400 to-yellow-600';
    } else if (placement.includes('2nd')) {
      return 'from-gray-300 to-gray-500';
    } else if (placement.includes('3rd')) {
      return 'from-amber-500 to-amber-700';
    }
    return 'from-orange-400 to-orange-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Winners Hero"
            fill
            priority
            className="object-cover object-center brightness-50"
            sizes="100vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-orange-800/65 to-red-800/75"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-orange-200 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>

            <div className="text-center text-white space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
                Competition Winners
              </h1>
              <p className="text-lg sm:text-xl text-orange-100 max-w-3xl mx-auto">
                Celebrating the champions of Vasudhaiva Kutumbakam — The World is One Family
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Select a Competition Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
                }`}
              >
                All Categories
              </button>
              {competitions.map((comp) => (
                <button
                  key={comp.title}
                  onClick={() => setSelectedCategory(comp.title)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === comp.title
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-400'
                  }`}
                >
                  <span className="mr-2">{comp.icon}</span>
                  {comp.title}
                </button>
              ))}
            </div>
          </div>

          {/* Winners Grid */}
          <div className="space-y-16">
            {competitions
              .filter((comp) => !selectedCategory || comp.title === selectedCategory)
              .map((competition) => (
                <div
                  key={competition.title}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-5xl">{competition.icon}</span>
                      <div>
                        <h3 className="text-3xl font-bold mb-2">{competition.title}</h3>
                        <p className="text-orange-100 text-lg">{competition.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Winners Cards */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {competition.winners.map((winner, index) => (
                        <div
                          key={index}
                          className="group relative bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                          {/* Placement Badge */}
                          <div className="absolute -top-3 -right-3">
                            <div className={`bg-gradient-to-br ${getPlacementColor(winner.placement)} text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                              {getPlacementIcon(winner.placement)}
                            </div>
                          </div>

                          {/* Winner Info */}
                          <div className="space-y-3 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                              {winner.placement}
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors">
                              {winner.name}
                            </h4>
                            <div className="flex items-start gap-2">
                              <svg
                                className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <p className="text-gray-700 leading-relaxed">{winner.institution}</p>
                            </div>
                          </div>

                          {/* Decorative Element */}
                          <div className="absolute bottom-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy className="w-16 h-16 text-orange-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Celebration Message */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-8 border border-orange-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Congratulations to All Winners! 🎉
              </h3>
              <p className="text-gray-700 text-lg max-w-2xl">
                Your creative expressions have truly embodied the spirit of Vasudhaiva Kutumbakam.
                Thank you for being part of this journey towards global unity and universal love.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/main"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Go to Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="https://vk.jyot.in/vk4-registration"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-orange-700 font-semibold border-2 border-orange-300 shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Physical Competition Registration
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confetti Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default Winners;
