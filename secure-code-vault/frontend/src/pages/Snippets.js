import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import {
  Plus, Search, Eye, EyeOff, Edit2, Trash2, Copy,
  Check, Shield, X, ChevronDown, Heart, Code2, Save
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { LANGUAGES, getLang, monacoLang } from '../utils/languages';
import PasswordConfirmModal from '../components/PasswordConfirmModal';

const EMPTY = { title: '', description: '', language: 'javascript', content: '', tags: '' };

export default function Snippets() {
  const [searchParams] = useSearchParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState({});        // id -> decrypted content
  const [confirmReveal, setConfirmReveal] = useState(null); // snippet id
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterLang !== 'all') params.language = filterLang;
      const { data } = await api.get('/snippets', { params });
      setSnippets(data.snippets);
    } catch { toast.error('Failed to load snippets.'); }
    finally { setLoading(false); }
  }, [search, filterLang]);

  useEffect(() => { fetchSnippets(); }, [fetchSnippets]);
  useEffect(() => { if (searchParams.get('new') === '1') setShowForm(true); }, [searchParams]);

  const handleRevealConfirmed = async (id) => {
    setConfirmReveal(null);
    try {
      const { data } = await api.get(`/snippets/${id}`);
      setRevealed(prev => ({ ...prev, [id]: data.content }));
    } catch { toast.error('Failed to decrypt snippet.'); }
  };

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleEdit = async (snippet) => {
    try {
      const { data } = await api.get(`/snippets/${snippet._id}`);
      setForm({ title: data.title, description: data.description, language: data.language, content: data.content, tags: data.tags?.join(', ') || '' });
      setEditId(snippet._id);
      setShowForm(true);
    } catch { toast.error('Failed to load snippet for editing.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this snippet? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(prev => prev.filter(s => s._id !== id));
      setRevealed(prev => { const n = { ...prev }; delete n[id]; return n; });
      toast.success('Snippet deleted.');
    } catch { toast.error('Delete failed.'); }
    finally { setDeleting(null); }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required.'); return; }
    if (!form.content.trim()) { toast.error('Code content required.'); return; }
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      language: form.language,
      content: form.content,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    try {
      if (editId) {
        await api.put(`/snippets/${editId}`, payload);
        toast.success('Snippet updated & re-encrypted.');
      } else {
        await api.post('/snippets', payload);
        toast.success('Snippet encrypted & saved.');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditId(null);
      fetchSnippets();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  const cancelForm = () => { setShowForm(false); setForm(EMPTY); setEditId(null); };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-accent" /> My Snippets
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{snippets.length} encrypted snippet{snippets.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Snippet
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-9" />
        </div>
        <div className="relative">
          <select value={filterLang} onChange={e => setFilterLang(e.target.value)}
            className="input-field pr-8 appearance-none cursor-pointer min-w-36">
            <option value="all">All Languages</option>
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-vault-900 border border-vault-600 rounded-2xl w-full max-w-4xl my-8 shadow-2xl animate-slide-in">
            {/* Form header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-vault-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <h3 className="font-display font-semibold text-white">{editId ? 'Edit Snippet' : 'New Snippet'}</h3>
                <div className="encrypt-badge ml-2">AES-256</div>
              </div>
              <button onClick={cancelForm} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="My API key handler..." className="input-field" />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Language *</label>
                  <div className="relative">
                    <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}
                      className="input-field appearance-none cursor-pointer pr-8">
                      {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this snippet do?" className="input-field" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="api, auth, database..." className="input-field" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-mono uppercase tracking-wider mb-1.5">Code *</label>
                <div className="rounded-lg overflow-hidden border border-vault-600">
                  <Editor
                    height="300px"
                    language={monacoLang(form.language)}
                    value={form.content}
                    onChange={(v) => setForm({ ...form, content: v || '' })}
                    theme="vs-dark"
                    options={{
                      fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false,
                      lineNumbers: 'on', wordWrap: 'on', padding: { top: 12 },
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-vault-700 flex justify-end gap-3">
              <button onClick={cancelForm} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-vault-950 border-t-transparent rounded-full animate-spin" />
                  : <><Save className="w-4 h-4" /> {editId ? 'Update' : 'Encrypt & Save'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password confirm modal */}
      {confirmReveal && (
        <PasswordConfirmModal
          title="Reveal Encrypted Code"
          onConfirm={() => handleRevealConfirmed(confirmReveal)}
          onClose={() => setConfirmReveal(null)}
        />
      )}

      {/* Snippet list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mr-3" />
          Decrypting index...
        </div>
      ) : snippets.length === 0 ? (
        <div className="vault-card text-center py-16">
          <Code2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No snippets found</p>
          <p className="text-slate-600 text-sm mt-1">{search || filterLang !== 'all' ? 'Try adjusting your filters.' : 'Add your first encrypted snippet.'}</p>
          {!search && filterLang === 'all' && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Snippet
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {snippets.map((snippet) => {
            const lang = getLang(snippet.language);
            const isRevealed = !!revealed[snippet._id];
            const content = revealed[snippet._id];

            return (
              <div key={snippet._id} className="vault-card p-0 overflow-hidden">
                {/* Snippet header */}
                <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                  <div className={`lang-badge ${lang.bg} ${lang.border} ${lang.text} mt-0.5 flex-shrink-0`}>{lang.label}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-white text-sm">{snippet.title}</h3>
                      {snippet.isFavorite && <Heart className="w-3 h-3 text-red-400 fill-current" />}
                      <div className="encrypt-badge">ENCRYPTED</div>
                    </div>
                    {snippet.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{snippet.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-600 text-xs">{formatDistanceToNow(new Date(snippet.updatedAt), { addSuffix: true })}</span>
                      {snippet.tags?.map(t => (
                        <span key={t} className="text-xs text-slate-600 bg-vault-800 px-1.5 py-0.5 rounded font-mono">{t}</span>
                      ))}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => isRevealed
                        ? setRevealed(prev => { const n = { ...prev }; delete n[snippet._id]; return n; })
                        : setConfirmReveal(snippet._id)}
                      className={`p-1.5 rounded-lg transition-colors ${isRevealed ? 'text-accent bg-accent/10' : 'text-slate-500 hover:text-slate-300 hover:bg-vault-800'}`}
                      title={isRevealed ? 'Hide' : 'Reveal'}>
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {isRevealed && (
                      <button onClick={() => handleCopy(snippet._id, content)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-vault-800 transition-colors"
                        title="Copy">
                        {copied === snippet._id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                    <button onClick={() => handleEdit(snippet)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-vault-800 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(snippet._id)} disabled={deleting === snippet._id}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Revealed content */}
                {isRevealed && content && (
                  <div className="border-t border-vault-700/50">
                    <Editor
                      height="200px"
                      language={monacoLang(snippet.language)}
                      value={content}
                      theme="vs-dark"
                      options={{
                        readOnly: true, fontSize: 13, minimap: { enabled: false },
                        scrollBeyondLastLine: false, lineNumbers: 'on', wordWrap: 'on',
                        padding: { top: 12 }, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      }}
                    />
                  </div>
                )}

                {/* Hidden overlay */}
                {!isRevealed && (
                  <div className="mx-4 mb-4 h-16 bg-vault-800/50 border border-vault-700/30 rounded-lg flex items-center justify-center gap-2 cursor-pointer hover:border-accent/30 transition-colors"
                    onClick={() => setConfirmReveal(snippet._id)}>
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-slate-500 text-sm font-mono">•••••• encrypted content ••••••</span>
                    <Eye className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
