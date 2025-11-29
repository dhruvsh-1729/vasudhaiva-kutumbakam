import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { clientAuth } from '@/lib/auth/clientAuth';

interface Competition {
  id: string;
  legacyId: number;
  title: string;
  description: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  deadline?: string | null;
  prizePool?: string | null;
  prizes?: any;
  sections?: any;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const defaultForm: Partial<Competition> = {
  legacyId: undefined,
  title: '',
  description: '',
  slug: '',
  icon: '',
  color: '',
  deadline: '',
  prizePool: '',
  prizes: { first: '', second: '', third: '' },
  sections: [],
  isPublished: true,
};

interface Section {
  id: string;
  title: string;
  content: string;
}

const CompetitionsManager: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      const res = await clientAuth.authFetch('/api/admin/competitions');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load competitions');
      setCompetitions(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Unable to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.legacyId || !form.title || !form.description || !form.slug) {
      toast.error('Legacy ID, title, description, and slug are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        legacyId: Number(form.legacyId),
        deadline: form.deadline || null,
        prizePool: form.prizePool || null,
        icon: form.icon || null,
        color: form.color || null,
        prizes: form.prizes,
        sections: form.sections,
      };

      const url = editingId ? `/api/admin/competitions/${editingId}` : '/api/admin/competitions';
      const method = editingId ? 'PUT' : 'POST';

      const res = await clientAuth.authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      toast.success(`${editingId ? 'Competition updated' : 'Competition created'}. Changes will reflect on the main site shortly.`);
      resetForm();
      loadCompetitions();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save competition');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (comp: Competition) => {
    setEditingId(comp.id);
    setForm({
      legacyId: comp.legacyId,
      title: comp.title,
      description: comp.description,
      slug: comp.slug,
      icon: comp.icon || '',
      color: comp.color || '',
      deadline: comp.deadline ? comp.deadline.slice(0, 10) : '',
      prizePool: comp.prizePool || '',
      prizes: comp.prizes || { first: '', second: '', third: '' },
      sections: comp.sections || [],
      isPublished: comp.isPublished,
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this competition?')) return;
    try {
      const res = await clientAuth.authFetch(`/api/admin/competitions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast.success('Competition deleted');
      if (editingId === id) resetForm();
      loadCompetitions();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to delete competition');
    }
  };

  const upsertSection = (idx: number, key: keyof Section, value: string) => {
    const updated = Array.isArray(form.sections) ? [...form.sections] : [];
    const base = updated[idx] || { id: `section-${idx + 1}`, title: '', content: '' };
    const next = { ...base, [key]: value };
    if (key === 'title') {
      next.id = value ? value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : base.id;
    }
    updated[idx] = next;
    setForm({ ...form, sections: updated });
  };

  const addSection = () => {
    const updated = Array.isArray(form.sections) ? [...form.sections] : [];
    updated.push({ id: `section-${updated.length + 1}`, title: '', content: '' });
    setForm({ ...form, sections: updated });
  };

  const removeSection = (idx: number) => {
    const updated = Array.isArray(form.sections) ? [...form.sections] : [];
    updated.splice(idx, 1);
    setForm({ ...form, sections: updated });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Competitions</h2>
            <p className="text-sm text-gray-600">Manage categories, guidelines, and prize info</p>
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg">
            Changes reflect on the main site after a brief cache refresh.
          </div>
        </div>
      </div>

      <div className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Existing Competitions</h3>
            <p className="text-sm text-gray-600">Select a competition to edit, or create a new one.</p>
          </div>
          <button
            onClick={resetForm}
            className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
          >
            Create New
          </button>
        </div>
        <div className="divide-y divide-gray-200 max-h-[420px] overflow-y-auto custom-scrollbar">
          {competitions.map((comp) => (
            <div key={comp.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                    <span className="text-lg">{comp.icon}</span>
                    <span>{comp.title}</span>
                    <span className="text-xs text-gray-500">#{comp.legacyId}</span>
                  </div>
                  <div className="text-xs text-gray-500">@{comp.slug}</div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-3">{comp.description}</div>
                  {comp.prizePool && (
                    <div className="text-xs text-emerald-700 mt-1">Prize Pool: {comp.prizePool}</div>
                  )}
                  {comp.prizes && (
                    <div className="text-xs text-gray-700">
                      Prizes: {comp.prizes.first || '-'} / {comp.prizes.second || '-'} / {comp.prizes.third || '-'}
                    </div>
                  )}
                  {comp.deadline && (
                    <div className="text-xs text-gray-500">Deadline: {new Date(comp.deadline).toLocaleDateString()}</div>
                  )}
                  <div className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${comp.isPublished ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                      {comp.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(comp)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comp.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {competitions.length === 0 && !loading && (
            <div className="p-4 text-sm text-gray-500 text-center">No competitions yet.</div>
          )}
          {loading && (
            <div className="p-4 text-sm text-gray-500 text-center">Loading competitions...</div>
          )}
        </div>
      </div>

      <div ref={formRef} className="admin-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Competition' : 'Create Competition'}</h3>
            <p className="text-sm text-gray-600">Save to update the main site (propagation may take a moment).</p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
            >
              New
            </button>
          )}
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Legacy ID</label>
                <input
                  type="number"
                  value={form.legacyId ?? ''}
                  onChange={(e) => setForm({ ...form, legacyId: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="videos"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={form.icon ?? ''}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="🎥"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  value={form.color ?? ''}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="from-blue-500 to-blue-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="AI Short Video"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Short blurb for the category"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline ?? ''}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prize Pool</label>
                <input
                  type="text"
                  value={form.prizePool ?? ''}
                  onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="₹50,000"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['first', 'second', 'third'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{key.toUpperCase()} Prize</label>
                  <input
                    type="text"
                    value={(form.prizes?.[key] as string) ?? ''}
                    onChange={(e) => setForm({ ...form, prizes: { ...(form.prizes || {}), [key]: e.target.value } })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="₹25,000"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-700">Guidelines / Sections</label>
                <button
                  type="button"
                  onClick={addSection}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                >
                  Add Section
                </button>
              </div>
              <div className="space-y-3">
                {(Array.isArray(form.sections) ? form.sections : []).map((section: Section, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">Section {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeSection(idx)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.title || ''}
                      onChange={(e) => upsertSection(idx, 'title', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Section title"
                    />
                    <SectionEditor
                      value={section.content || ''}
                      onChange={(val) => upsertSection(idx, 'content', val)}
                    />
                  </div>
                ))}
                {(form.sections as Section[]).length === 0 && (
                  <div className="text-xs text-gray-500">No sections yet. Click "Add Section" to start.</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished ?? true}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};

export default CompetitionsManager;

interface SectionEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const focusEditor = () => editorRef.current?.focus();
  const updateValue = () => onChange(editorRef.current?.innerHTML || '');

  const exec = (cmd: string, val?: string) => {
    focusEditor();
    document.execCommand(cmd, false, val);
    // allow DOM to update before reading value (needed for lists)
    setTimeout(updateValue, 0);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
        <button onClick={() => exec('bold')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 font-semibold">B</button>
        <button onClick={() => exec('italic')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 italic">I</button>
        <button onClick={() => exec('underline')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 underline">U</button>
        <button onClick={() => exec('insertUnorderedList')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">• List</button>
        <button onClick={() => exec('insertOrderedList')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">1. List</button>
        <select
          onChange={(e) => exec('fontName', e.target.value)}
          className="text-xs border border-gray-200 rounded px-1 py-1"
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Color
          <input
            type="color"
            onChange={(e) => exec('foreColor', e.target.value)}
            className="w-6 h-6 border border-gray-200 rounded"
          />
        </label>
        <button onClick={() => exec('removeFormat')} type="button" className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100">Clear</button>
      </div>
      <div className="relative">
        {!value && (
          <div className="pointer-events-none absolute top-2 left-3 text-xs text-gray-400">
            Enter rich text (bullets, bold, italics, colors…)
          </div>
        )}
        <div
          ref={editorRef}
          className="min-h-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none prose prose-sm max-w-none list-disc list-decimal"
          style={{ listStylePosition: 'inside' }}
          contentEditable
          suppressContentEditableWarning
          onInput={updateValue}
        />
      </div>
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">Preview</div>
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">No content</p>' }}
        />
      </div>
    </div>
  );
};
