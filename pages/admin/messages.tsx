import { useEffect, useState } from 'react';
import { clientAuth } from '@/lib/auth/clientAuth';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

type PendingMessage = {
  id: string;
  title: string;
  competitionId: number;
  interval: number;
  fileUrl: string;
  description?: string;
  user: { id: string; name: string; email: string; institution?: string | null };
  messages: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: { id: string; name: string; email: string };
  }>;
};

const competitionTitles: Record<number, string> = {
  1: 'AI Short Video',
  2: 'Creative Expression',
  3: 'Political Toons',
  4: 'Painting Competition',
};

export default function AdminMessagesPage() {
  const [items, setItems] = useState<PendingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await clientAuth.authFetch('/api/admin/messages');
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to load messages');
        return;
      }
      setItems(data.data || []);
    } catch (error) {
      console.error('Admin messages load error', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const openConversation = (submissionId: string) => {
    router.push(`/admin/dashboard?submissionId=${submissionId}`);
    toast.message('Opening submission conversation in dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unanswered User Messages</h1>
            <p className="text-sm text-gray-600">Latest participant messages without an admin reply.</p>
          </div>
          <button
            onClick={loadMessages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 bg-white rounded-lg border p-8">
            No pending messages. Great job!
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs text-gray-500">
                        {competitionTitles[item.competitionId] || `Competition ${item.competitionId}`} • Interval {item.interval}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.user.name} ({item.user.email}) {item.user.institution && `• ${item.user.institution}`}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{item.description}</p>
                    )}
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block break-all"
                    >
                      View file
                    </a>
                  </div>
                  <button
                    onClick={() => openConversation(item.id)}
                    className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
                  >
                    Open in dashboard
                  </button>
                </div>

                {item.messages[0] && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="text-xs text-gray-500 mb-1">
                      From {item.messages[0].author?.name || 'User'} at{' '}
                      {new Date(item.messages[0].createdAt).toLocaleString()}
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">{item.messages[0].content}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
