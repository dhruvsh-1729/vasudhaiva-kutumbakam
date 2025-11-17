import { useEffect, useState } from 'react';
import { clientAuth } from '@/lib/auth/clientAuth';
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

const AdminMessages: React.FC = () => {
  const [items, setItems] = useState<PendingMessage[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      <div className="admin-card rounded-xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 font-poppins">Pending Messages</h2>
          <p className="text-gray-600 text-sm">Participant conversations waiting for admin replies.</p>
        </div>
        <button
          onClick={loadMessages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-card rounded-xl p-6 text-center text-gray-600">Loading...</div>
      ) : items.length === 0 ? (
        <div className="admin-card rounded-xl p-6 text-center text-gray-600">No pending messages. Great job!</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="admin-card rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full border">
                      {competitionTitles[item.competitionId] || `Competition ${item.competitionId}`} • Interval {item.interval}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
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
                <a
                  href={`/admin/dashboard?tab=submissions&submissionId=${item.id}`}
                  className="text-sm px-3 py-1 border rounded-lg hover:bg-gray-50"
                >
                  Open in dashboard
                </a>
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
  );
};

export default AdminMessages;
