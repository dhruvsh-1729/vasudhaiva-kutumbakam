import { useEffect, useMemo, useState, useRef } from 'react';
import { clientAuth } from '@/lib/auth/clientAuth';
import { toast } from 'sonner';
import Header from '@/components/Header';

type ForumPost = {
  id: string;
  title: string;
  content: string;
  isResolved: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; isAdmin: boolean };
  _count: { comments: number };
  reactionSummary?: Record<string, number>;
};

type ForumComment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; isAdmin: boolean };
  reactionSummary?: Record<string, number>;
};

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [activeComments, setActiveComments] = useState<Record<string, ForumComment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentUser = useMemo(() => clientAuth.getUser(), []);

  const fetchPosts = async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum) });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      // Always search globally; server counts total across all posts
      const res = await clientAuth.authFetch(`/api/forum?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.data || []);
        setPage(data.meta?.page || 1);
        setTotalPages(data.meta?.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load forum posts', error);
      toast.error('Failed to load forum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchPosts(page, search);
    }, 300);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [page, search]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    try {
      const res = await clientAuth.authFetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Unable to post');
        return;
      }
      toast.success('Posted!');
      setNewPost({ title: '', content: '' });
      fetchPosts(1);
      setPage(1);
    } catch (error) {
      console.error('Post create error', error);
      toast.error('Unable to create post');
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const res = await clientAuth.authFetch(`/api/forum/${postId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setActiveComments((prev) => ({ ...prev, [postId]: data.data || [] }));
      }
    } catch (error) {
      console.error('Load comments error', error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentDraft[postId];
    if (!content || !content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      const res = await clientAuth.authFetch(`/api/forum/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Unable to comment');
        return;
      }
      setCommentDraft((prev) => ({ ...prev, [postId]: '' }));
      await loadComments(postId);
      fetchPosts();
    } catch (error) {
      console.error('Comment error', error);
      toast.error('Unable to comment');
    }
  };

  const reactionTypes = [
    { key: 'LIKE', label: 'Like', emoji: '👍' },
    { key: 'SUPPORT', label: 'Support', emoji: '🤝' },
    { key: 'LOVE', label: 'Love', emoji: '❤️' },
    { key: 'CELEBRATE', label: 'Celebrate', emoji: '🎉' },
    { key: 'FUNNY', label: 'Funny', emoji: '😂' },
    { key: 'ANGRY', label: 'Angry', emoji: '😡' },
    { key: 'DOWNVOTE', label: 'Downvote', emoji: '👎' },
  ] as const;

  const reactToPost = async (postId: string, type: string) => {
    try {
      const res = await clientAuth.authFetch(`/api/forum/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, reactionSummary: data.data } : p
          )
        );
      }
    } catch (error) {
      console.error('React to post error', error);
    }
  };

  const reactToComment = async (commentId: string, postId: string, type: string) => {
    try {
      const res = await clientAuth.authFetch(`/api/forum/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveComments((prev) => {
          const updated = { ...(prev[postId] || []) };
          const list = (prev[postId] || []).map((c) =>
            c.id === commentId ? { ...c, reactionSummary: data.data } : c
          );
          return { ...prev, [postId]: list };
        });
      }
    } catch (error) {
      console.error('React to comment error', error);
    }
  };

  const handleResolve = async (postId: string, isResolved: boolean) => {
    try {
      const res = await clientAuth.authFetch(`/api/forum/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved }),
      });
      if (res.ok) {
        toast.success(isResolved ? 'Marked resolved' : 'Marked open');
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Unable to update status');
      }
    } catch (error) {
      console.error('Resolve error', error);
      toast.error('Unable to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Forum</h1>
            <p className="text-gray-600">Ask questions, get answers, and collaborate with the community.</p>
          </div>
          <div className="px-3 py-1 bg-white border rounded-lg shadow-sm">
            {posts.length} discussion{posts.length !== 1 && 's'}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or description..."
            className="flex-1 border rounded-lg px-3 py-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
          />
          <button
            onClick={() => fetchPosts(1, search)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
          >
            Search
          </button>
        </div>

        {/* New post form */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Start a new discussion</h2>
          <input
            value={newPost.title}
            onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title"
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost((p) => ({ ...p, content: e.target.value }))}
            placeholder="Describe your question or idea..."
            className="w-full border rounded-lg px-3 py-2 mb-4"
            rows={3}
          />
          <button
            onClick={handleCreatePost}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md shadow hover:from-orange-600 hover:to-red-600"
          >
            Post
          </button>
        </div>

        {/* Posts list */}
        {loading ? (
          <div className="text-center text-gray-500">Loading discussions...</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border rounded-lg shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      {post.isResolved && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{post.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      By {post.author?.name || 'User'} • {post._count?.comments || 0} comment(s)
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {reactionTypes.map((r) => (
                        <button
                          key={r.key}
                          onClick={() => reactToPost(post.id, r.key)}
                          className="text-xs px-3 py-1 border rounded-full bg-orange-50 hover:bg-orange-100 hover:scale-105 transition-transform duration-150 flex items-center gap-1 shadow-sm"
                        >
                          <span>{r.emoji}</span>
                          <span>{r.label}</span>
                          <span className="text-[11px] text-gray-600">{post.reactionSummary?.[r.key] || 0}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentUser?.isAdmin && (
                      <button
                        onClick={() => handleResolve(post.id, !post.isResolved)}
                        className="text-xs px-3 py-1 border rounded-lg hover:bg-gray-50"
                      >
                        Mark {post.isResolved ? 'Open' : 'Resolved'}
                      </button>
                    )}
                    {currentUser?.isAdmin && (
                      <button
                        onClick={async () => {
                          try {
                            await clientAuth.authFetch(`/api/forum/${post.id}`, { method: 'DELETE' });
                            toast.success('Post removed');
                            fetchPosts(page);
                          } catch (error) {
                            toast.error('Failed to remove post');
                          }
                        }}
                        className="text-xs px-3 py-1 border rounded-lg hover:bg-red-50 text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <button
                    onClick={() => loadComments(post.id)}
                    className="text-sm text-orange-600 hover:underline"
                  >
                    View thread
                  </button>
                  {activeComments[post.id] && (
                    <div className="mt-3 space-y-3">
                      {activeComments[post.id].map((c) => (
                        <div key={c.id} className="text-sm bg-orange-50 border border-orange-100 rounded p-2">
                          <div className="font-medium text-gray-800 flex items-center gap-2">
                            {c.author?.name || 'User'} {c.author?.isAdmin && <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Admin</span>}
                          </div>
                          <div className="text-gray-700">{c.content}</div>
                          {currentUser?.isAdmin && (
                            <button
                              onClick={async () => {
                                try {
                                  await clientAuth.authFetch(`/api/forum/${post.id}/comments?commentId=${c.id}`, {
                                    method: 'DELETE',
                                  });
                                  toast.success('Comment removed');
                                  loadComments(post.id);
                                } catch (error) {
                                  toast.error('Failed to remove comment');
                                }
                              }}
                              className="text-[11px] text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {reactionTypes.map((r) => (
                              <button
                                key={r.key}
                                onClick={() => reactToComment(c.id, post.id, r.key)}
                                className="text-[11px] px-2 py-1 border rounded-full bg-white hover:bg-orange-50 hover:scale-105 transition-transform duration-150 flex items-center gap-1"
                              >
                                <span>{r.emoji}</span>
                                <span>{c.reactionSummary?.[r.key] || 0}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={commentDraft[post.id] || ''}
                          onChange={(e) =>
                            setCommentDraft((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          placeholder="Write a reply"
                          className="flex-1 border rounded-lg px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
