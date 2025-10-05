// pages/competitions/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import SidebarNav from '../../components/SidebarNav';
import { getAllCompetitionIds, getCompetitionById } from '@/data/competitions';
import CompetitionDetails from '@/components/CompetitionDetails';
import SubmissionPanel from '@/components/SubmissionPanel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotificationBanner from '@/components/NotificationBanner';
import CountDown from '@/components/CountDown';
import { clientAuth } from '@/middleware/auth';

// Type definitions
interface Competition {
  id: number;
  title: string;
  icon: string;
  deadline: string;
  sections: CompetitionSection[];
}

interface CompetitionSection {
  id: string | number;
  title: string;
  content: string;
}

interface CompetitionDetailPageProps {
  competition: Competition | null;
}
interface StaticPathParams extends ParsedUrlQuery {
  id: string;
}

interface BreadcrumbItem {
  href?: string;
  label: string;
  isActive?: boolean;
}

interface FooterLink {
  href: string;
  label: string;
}

const CompetitionDetailPage: React.FC<CompetitionDetailPageProps> = ({ competition }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // Replace 'any' with your user type

  // Handle loading state during fallback

  useEffect(() => {
    if (router.isFallback) {
      return;
    }
    setIsLoading(false);
  }, [router.isFallback]);

  useEffect(() => {
      const currentUser = clientAuth.getUser();
      const token = clientAuth.getToken();
      
      if (!currentUser || !token) {
        // Not authenticated - redirect to login
        router.push('/login?message=' + encodeURIComponent('Please log in to access the dashboard'));
        return;
      }
      
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, [router]);

  // Breadcrumb items configuration
  const breadcrumbItems: BreadcrumbItem[] = [
    { href: '/', label: 'Home' },
    { href: '/main', label: 'Competitions' },
    { label: competition?.title || 'Competition', isActive: true }
  ];

  // Footer links configuration
  const footerLinks: FooterLink[] = [
    { href: '/help', label: 'Help Center' },
    { href: '/contact', label: 'Contact Support' },
    { href: '/terms', label: 'Terms & Conditions' }
  ];

  const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading competition details...</p>
      </div>
    </div>
  );

  const NotFoundError: React.FC = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Competition Not Found</h1>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn&apos;t find the competition you&apos;re looking for. It may have been removed or the URL might be incorrect.
        </p>
        <Link 
          href="/main"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Competitions
        </Link>
      </div>
    </div>
  );

  const ChevronIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  if (router.isFallback || isLoading) {
    return <LoadingSpinner />;
  }

  if (!competition) {
    return <NotFoundError />;
  }

  return (
    <>
      <Head>
        <title>{competition.title} | Competition Platform</title>
        {/* <meta name="description" content={competition.description} /> */}
        <meta property="og:title" content={competition.title} />
        {/* <meta property="og:description" content={competition.description} /> */}
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header/Breadcrumb */}
        <Header />
        <NotificationBanner />
        <CountDown deadline={getCompetitionById(competition.id)?.deadline as string} />
        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Middle Panel - Competition Details */}
            <div className="lg:col-span-8 space-y-6">
              <CompetitionDetails competition={competition} />
            </div>

            {/* Right Panel - Submission Panel */}
            <div className="lg:col-span-4 space-y-6">
              <SubmissionPanel competitionId={competition.id} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default CompetitionDetailPage;

// Static generation functions with proper TypeScript types
export const getStaticPaths: GetStaticPaths<StaticPathParams> = async () => {
  const paths = getAllCompetitionIds();
  
  return {
    paths,
    fallback: false // Set to 'blocking' or true if you want to generate pages on-demand
  };
};

export const getStaticProps: GetStaticProps<CompetitionDetailPageProps, StaticPathParams> = async ({ params }) => {
  if (!params?.id) {
    return {
      notFound: true,
    };
  }

  // Convert the ID to integer since our data uses numeric IDs
  const competitionId = parseInt(params.id, 10);
  
  // Check if the ID is a valid number
  if (isNaN(competitionId)) {
    return {
      notFound: true,
    };
  }

  const competition = getCompetitionById(competitionId);
  
  if (!competition) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {
      competition,
    },
    revalidate: 60, // Regenerate the page every 60 seconds if requested
  };
};