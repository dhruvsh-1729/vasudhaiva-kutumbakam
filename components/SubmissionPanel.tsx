// components/SubmissionPanel.tsx
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { clientAuth } from '@/lib/auth/clientAuth';

// Type definitions
interface FormData {
  title: string;
  fileUrl: string;
  description: string;
}

interface FormErrors {
  title?: string;
  fileUrl?: string;
}

interface Submission {
  id: string;
  title: string;
  competitionId: number;
  interval: number;
  fileUrl: string;
  description?: string;
  overallScore?: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'EVALUATED' | 'REJECTED' | 'WINNER' | 'FINALIST';
  isAccessVerified: boolean;
  accessCheckError?: string;
  judgeComments?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionMessage {
  id: string;
  submissionId: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  author?: { id: string; name: string; isAdmin?: boolean };
}

interface SubmissionPanelProps {
  competitionId: number | string;
}

interface AdminSettings {
  currentInterval: number;
  isSubmissionsOpen: boolean;
  maxSubmissionsPerInterval: number;
}

interface SubmissionMessage {
  id: string;
  submissionId: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  author?: { id: string; name: string; isAdmin?: boolean };
}

const SubmissionPanel: React.FC<SubmissionPanelProps> = ({ competitionId }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    fileUrl: '',
    description: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isVerifyingAccess, setIsVerifyingAccess] = useState<boolean>(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Record<string, SubmissionMessage[]>>({});
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [loadingMessages, setLoadingMessages] = useState<Record<string, boolean>>({});

  // Check if this is competition 4 (non-weekly)
  const isCompetition4 = Number(competitionId) === 4;

  // Fetch admin settings and user submissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch admin settings
        const settingsResponse = await clientAuth.authFetch('/api/admin/settings');
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setAdminSettings(settings);
        }
        
        // Fetch user submissions for this competition
        const submissionsResponse = await clientAuth.authFetch(`/api/submissions?competitionId=${competitionId}`);
        if (submissionsResponse.ok) {
          const userSubmissions = await submissionsResponse.json();
          setSubmissions(userSubmissions);
          // Preload messages for each submission so the user can converse with admins
          const subsArray = Array.isArray(userSubmissions) ? userSubmissions : [];
          subsArray.forEach((s: Submission) => {
            loadMessages(s.id);
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load submission data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [competitionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const loadMessages = async (submissionId: string) => {
    try {
      setLoadingMessages((prev) => ({ ...prev, [submissionId]: true }));
      const res = await clientAuth.authFetch(`/api/submissions/${submissionId}/messages`);
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => ({ ...prev, [submissionId]: data.data || [] }));
      }
    } catch (error) {
      console.error('Failed to load submission messages', error);
    } finally {
      setLoadingMessages((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  const sendMessage = async (submissionId: string) => {
    const content = messageDrafts[submissionId];
    if (!content || !content.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    try {
      const res = await clientAuth.authFetch(`/api/submissions/${submissionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send message');
        return;
      }
      setMessageDrafts((prev) => ({ ...prev, [submissionId]: '' }));
      loadMessages(submissionId);
      toast.success('Message sent');
    } catch (error) {
      console.error('Failed to send submission message', error);
      toast.error('Failed to send message');
    }
  };

  // Check if Google Drive link is accessible
  const verifyGoogleDriveAccess = async (url: string): Promise<{ success: boolean; error?: string }> => {
    setIsVerifyingAccess(true);
    
    try {
      const response = await clientAuth.authFetch('/api/verify-drive-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify access. Please check your internet connection.'
      };
    } finally {
      setIsVerifyingAccess(false);
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    if (!formData.fileUrl.trim()) {
      newErrors.fileUrl = 'Google Drive link is required';
    } else if (!isValidGoogleDriveUrl(formData.fileUrl)) {
      newErrors.fileUrl = 'Please enter a valid Google Drive sharing link';
    }
    
    return newErrors;
  };

  const isValidGoogleDriveUrl = (url: string): boolean => {
    const drivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
      /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/,
      /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9_-]+/
    ];
    
    return drivePatterns.some(pattern => pattern.test(url));
  };

  const getCurrentIntervalSubmissions = (): Submission[] => {
    if (!adminSettings) return [];
    return submissions.filter(sub => sub.interval === adminSettings.currentInterval);
  };

  const canSubmitMore = (): boolean => {
    if (!adminSettings) return false;
    const currentSubmissions = getCurrentIntervalSubmissions();
    return currentSubmissions.length < adminSettings.maxSubmissionsPerInterval;
  };

  const isSubmitDisabled =
    isSubmitting ||
    isVerifyingAccess ||
    !adminSettings?.isSubmissionsOpen ||
    (!isCompetition4 && !canSubmitMore());

  const handleSubmit = async (): Promise<void> => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (!adminSettings?.isSubmissionsOpen) {
      toast.error('Submissions are currently closed');
      return;
    }

    if (!isCompetition4 && !canSubmitMore()) {
      toast.error(`Maximum ${adminSettings.maxSubmissionsPerInterval} submissions allowed per interval`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First verify Google Drive access
      // const accessCheck = await verifyGoogleDriveAccess(formData.fileUrl);
      
      // if (!accessCheck.success) {
      //   toast.error(`Access verification failed: ${accessCheck.error}`);
      //   setIsSubmitting(false);
      //   return;
      // }
      
      // Submit the entry
      const response = await clientAuth.authFetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: Number(competitionId),
          title: formData.title,
          fileUrl: formData.fileUrl,
          description: formData.description,
        }),
      });
      
      if (!response.ok) {
        toast.error('Failed to submit entry. Please try again.');
        return;
      }
      
      const newSubmission = await response.json();
      if (!newSubmission) {
        toast.error('Failed to submit entry. Please try again.');
        return;
      }
      
      toast.success('Submission successful! Your entry has been received and will be reviewed by our panel of judges.');
      window.location.reload(); // Reload to fetch updated submissions
      
      // Reset form
      setFormData({
        title: '',
        fileUrl: '',
        description: ''
      });
      
      // Switch to history tab to show the new submission
      setActiveTab('history');
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    setIsConfirmModalOpen(true);
  };

  const confirmSubmission = async (): Promise<void> => {
    setIsConfirmModalOpen(false);
    await handleSubmit();
  };

  const cancelSubmission = (): void => {
    setIsConfirmModalOpen(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EVALUATED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      case 'WINNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FINALIST': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'UNDER_REVIEW': return '👁️';
      case 'EVALUATED': return '✅';
      case 'REJECTED': return '❌';
      case 'WINNER': return '🏆';
      case 'FINALIST': return '🥇';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-orange-100/50 shadow-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-orange-200 rounded w-3/4"></div>
          <div className="h-4 bg-orange-100 rounded w-full"></div>
          <div className="h-10 bg-orange-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .submission-gradient {
          background: linear-gradient(135deg, #FF8C00, #D2691E, #CC5500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .submit-shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .submit-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.8s ease;
        }
        
        .submit-shimmer:hover::before {
          left: 100%;
        }
      `}</style>

      <div className="lg:col-span-1 text-black">
        <div className="sticky top-8 bg-white/95 backdrop-blur-md rounded-2xl border border-orange-100/50 shadow-xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200/20 to-transparent rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-200/20 to-transparent rounded-full"></div>
          
          {/* Tab Navigation */}
          <div className="relative z-10 border-b border-orange-100/50">
            <nav className="flex" role="tablist">
              <button
                onClick={() => setActiveTab('submit')}
                className={`flex-1 px-4 py-3 text-sm font-medium font-inter transition-all duration-300 ${
                  activeTab === 'submit'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-orange-700 hover:bg-orange-50/50'
                }`}
                role="tab"
              >
                Submit Entry
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-3 text-sm font-medium font-inter transition-all duration-300 relative ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-orange-700 hover:bg-orange-50/50'
                }`}
                role="tab"
              >
                My Submissions
                {submissions.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {submissions.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="p-6 relative z-10">
            {activeTab === 'submit' ? (
              <>
                {/* Submit Tab Content */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-xl submission-gradient">
                      Submit Entry
                    </h3>
                  </div>
                  <p className="font-bold text-orange-700/70 text-sm ml-11">Ready to participate? Submit your entry below.</p>
                  {!isCompetition4 && (
                    <p className='font-inter text-black-700/70 text-sm ml-11'>Best of 3 submissions will be considered for final evaluation of the competition for the specfic week.</p>
                  )}
                </div>

                {/* Submission Status Info - Only show for non-competition 4 */}
                {adminSettings && !isCompetition4 && (
                  <div className="mb-6 p-4 bg-blue-50/80 rounded-xl border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-inter text-sm font-semibold text-blue-800">Current Week: {adminSettings.currentInterval}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        adminSettings.isSubmissionsOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {adminSettings.isSubmissionsOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 font-inter">
                      <span>Submissions: {getCurrentIntervalSubmissions().length}/{adminSettings.maxSubmissionsPerInterval}</span>
                    </div>
                  </div>
                )}

                <div className="mb-6 p-5 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 shadow-inner">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-inter text-base font-semibold text-orange-900">Set your Google Drive link to "Anyone with the link can view".</p>
                      <p className="text-sm text-orange-700 font-inter">If the judges cannot open your file, the submission is automatically rejected. Double-check the sharing settings before you proceed.</p>
                    </div>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-orange-800 font-inter">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Open the Share dialog &gt; choose "Anyone with the link".</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>Set the permission to "Viewer" (or higher) so we can access it.</span>
                    </li>
                  </ul>
                    <div className="mt-5">
                    <p className="text-sm font-semibold text-orange-900 font-inter mb-2">Watch this 2-minute checklist before submitting:</p>
                    <div className="relative w-full">
                      {/* Desktop: Show embedded video */}
                      <div className="hidden sm:block rounded-2xl overflow-hidden shadow-lg border border-orange-200 bg-black/5">
                        <div className="aspect-video w-full">
                          <iframe 
                            className="w-full h-full" 
                            src="https://www.youtube.com/embed/grjZ9LxL4wc?si=Ti5QZFnN5_S8geTg" 
                            title="YouTube video player" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen
                          />
                        </div>
                      </div>
                      
                      {/* Mobile: Show link that opens in new tab */}
                      <div className="block sm:hidden">
                        <a
                          href="https://www.youtube.com/watch?v=grjZ9LxL4wc"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-lg border border-red-200 hover:from-red-600 hover:to-red-700 transition-all duration-300"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            <span className="font-semibold">Watch 2-min tutorial on YouTube</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-orange-700 font-inter mt-2 text-center sm:text-left">The video explains exactly how to unlock your file for the judges on any device.</p>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {/* Title Field */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-orange-800 mb-2 font-inter">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 font-inter text-sm backdrop-blur-sm ${
                        errors.title ? 'border-red-400 bg-red-50/50' : 'border-orange-200/50 bg-white/80 hover:border-orange-300'
                      }`}
                      placeholder="Enter a title for your submission"
                      maxLength={100}
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-600 font-inter">{errors.title}</p>}
                    <p className="text-xs text-orange-600/70 mt-1 font-inter">{formData.title.length}/100 characters</p>
                  </div>

                  {/* Google Drive Link Field */}
                  <div>
                    <label htmlFor="fileUrl" className="block text-sm font-semibold text-orange-800 mb-2 font-inter">
                      Google Drive Link *
                    </label>
                    <input
                      type="url"
                      id="fileUrl"
                      name="fileUrl"
                      value={formData.fileUrl}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 font-inter text-sm backdrop-blur-sm ${
                        errors.fileUrl ? 'border-red-400 bg-red-50/50' : 'border-orange-200/50 bg-white/80 hover:border-orange-300'
                      }`}
                      placeholder="https://drive.google.com/file/d/your-file-id"
                    />
                    {errors.fileUrl && <p className="mt-1 text-xs text-red-600 font-inter">{errors.fileUrl}</p>}
                    
                    {/* Access Permission Notice */}
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="text-xs text-amber-800 font-inter">
                          <span className="font-semibold">Important:</span> Ensure your Google Drive file/folder is set to &quot;Anyone with the link can view&quot; for successful submission.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Field */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-orange-800 mb-2 font-inter">
                      Description (Optional)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={8}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-orange-200/50 bg-white/80 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none font-inter text-sm backdrop-blur-sm hover:border-orange-300"
                      placeholder="Tell us about your submission approach, tools used, or any additional context..."
                      maxLength={500}
                    />
                    <p className="text-xs text-orange-600/70 mt-1 font-inter">{formData.description.length}/500 characters</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`submit-shimmer w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 font-inter relative overflow-hidden ${
                      isSubmitDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:via-amber-700 hover:to-orange-800 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isVerifyingAccess ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying Access...
                      </div>
                    ) : isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : !adminSettings?.isSubmissionsOpen ? (
                      'Submissions Closed'
                    ) : (!isCompetition4 && !canSubmitMore()) ? (
                      'Submission Limit Reached'
                    ) : (
                      'Submit Entry'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* History Tab Content */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2"></div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-playfair text-xl font-bold submission-gradient">
                      My Submissions
                    </h3>
                  </div>
                  <p className="font-inter text-orange-700/70 text-sm ml-11">Track your submitted entries and their status.</p>

                {/* Submissions List */}
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-inter text-sm">No submissions yet</p>
                    </div>
                  ) : (
                    submissions.map((submission) => (
                      <div key={submission.id} className="bg-gray-50/80 rounded-xl p-4 border border-gray-200/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getStatusIcon(submission.status)}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                              {submission?.status?.replace('_', ' ')}
                            </span>
                          </div>
                          {!isCompetition4 && (
                            <span className="text-xs text-gray-500 font-inter">
                              Week {submission.interval}
                            </span>
                          )}
                        </div>

                        <h4 className="font-semibold text-md text-gray-800 font-inter mb-1 break-words">{submission.title}</h4>
                        
                        {/* {submission.description && (
                          <p className="text-sm text-gray-700 font-inter mb-3 line-clamp-3">
                            {submission.description}
                          </p>
                        )} */}
                        
                        <div className="mb-3">
                          <a
                            href={submission.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium font-inter underline break-all"
                          >
                            View Submission
                          </a>
                        </div>
                        
                        {submission.judgeComments && (
                          <p className="text-sm text-gray-700 font-inter mb-3 line-clamp-2">
                            <span className="font-semibold">Judge's Comments:</span> {submission.judgeComments}
                          </p>
                        )}
                        
                        {(typeof submission.overallScore === 'number' && submission.overallScore > 0) && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-700 font-inter">Score:</span>
                            <div className="flex items-center gap-1">
                              <span className="text-lg text-amber-500">⭐</span>
                              <span className="text-sm font-bold text-amber-600">
                                {submission.overallScore.toFixed(1)}/10
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {!submission.isAccessVerified && submission.accessCheckError && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs text-red-600 font-inter">
                              ⚠️ {submission.accessCheckError}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500 font-inter mt-3 pt-2 border-t border-gray-200/50">
                          <span>Submitted: {new Date(submission.createdAt).toLocaleDateString()}</span>
                          {submission.isAccessVerified && (
                            <span className="text-green-600">✓ Verified</span>
                          )}
                        </div>

                        {/* Conversation with admins */}
                        <div className="mt-4 bg-white border border-orange-100 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-800">Conversation</span>
                            <button
                              onClick={() => loadMessages(submission.id)}
                              className="text-xs text-orange-600 hover:text-orange-700"
                            >
                              {loadingMessages[submission.id] ? 'Loading...' : 'Refresh'}
                            </button>
                          </div>
                          <div className="max-h-44 overflow-y-auto space-y-2">
                            {(messages[submission.id] || []).length === 0 && (
                              <div className="text-xs text-gray-500">No messages yet. Ask a question to your judges.</div>
                            )}
                            {(messages[submission.id] || []).map((m) => (
                              <div key={m.id} className="text-xs bg-orange-50 border border-orange-100 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold ${m.isFromAdmin ? 'text-indigo-700' : 'text-gray-800'}`}>
                                    {m.author?.name || (m.isFromAdmin ? 'Admin' : 'You')}
                                  </span>
                                  {m.isFromAdmin && (
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">Admin</span>
                                  )}
                                  <span className="text-[10px] text-gray-500">{new Date(m.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap mt-1">{m.content}</div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <textarea
                              value={messageDrafts[submission.id] || ''}
                              onChange={(e) => setMessageDrafts(prev => ({ ...prev, [submission.id]: e.target.value }))}
                              placeholder="Ask a question or reply..."
                              className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-xs focus:ring-orange-500 focus:border-orange-500"
                              rows={2}
                            />
                            <button
                              onClick={() => sendMessage(submission.id)}
                              className="px-3 py-2 bg-orange-500 text-white rounded-md text-xs hover:bg-orange-600"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-orange-900 font-inter">Before you submit...</p>
                <p className="text-sm text-orange-700 font-inter">Can our judges open your Google Drive file without a request?</p>
              </div>
            </div>
            <ul className="text-sm text-gray-700 font-inter space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>The link is set to "Anyone with the link can view".</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>No login or access requests are required.</span>
              </li>
            </ul>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelSubmission}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-orange-200 text-orange-700 font-semibold hover:bg-orange-50 transition-colors"
              >
                Let me fix it
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md transition-colors"
              >
                Yes, submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionPanel;
