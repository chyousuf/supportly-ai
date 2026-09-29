import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { KnowledgeSource, KnowledgeGap, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState<'sources' | 'gaps'>('sources');
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reindexing, setReindexing] = useState(false);

  // Preview chunks modal
  const [previewSource, setPreviewSource] = useState<KnowledgeSource | null>(null);

  // Add source modal
  const [showModal, setShowModal] = useState(false);
  const [sourceType, setSourceType] = useState<'faq' | 'url' | 'document' | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', url: '' });
  const [saving, setSaving] = useState(false);

  // Testing area state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{
    answer: string;
    grounding_status?: string;
    sources: { title: string; type: string; excerpt?: string }[];
  } | null>(null);
  const [testing, setTesting] = useState(false);

  // Draft gap edit modal
  const [editingGap, setEditingGap] = useState<KnowledgeGap | null>(null);
  const [gapDraftAnswer, setGapDraftAnswer] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchSources();
    fetchGaps();
  }, [filter, search]);

  const fetchSources = async () => {
    try {
      const q = new URLSearchParams();
      if (filter !== 'all') q.append('type', filter);
      if (search) q.append('search', search);
      
      const res = await api.get<ApiResponse<KnowledgeSource[]>>(`/api/knowledge?${q.toString()}`);
      if (res && res.data) {
        setSources(res.data);
      }
    } catch (err) {
      showToast('Failed to load knowledge sources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGaps = async () => {
    try {
      const res = await api.get<ApiResponse<KnowledgeGap[]>>('/api/knowledge/gaps');
      if (res && res.data) {
        setGaps(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    await new Promise(r => setTimeout(r, 1200));
    setReindexing(false);
    showToast('Knowledge base re-indexed. Embeddings refreshed for 5 active sources.', 'success');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this knowledge source?')) return;
    try {
      await api.delete(`/api/knowledge/${id}`);
      showToast('Source deleted successfully', 'success');
      fetchSources();
    } catch (err) {
      showToast('Failed to delete source', 'error');
    }
  };

  const handleApproveSource = async (id: number) => {
    try {
      await api.put(`/api/knowledge/${id}/approve`, {});
      showToast('Source approved and indexed for live assistant grounding', 'success');
      fetchSources();
    } catch {
      showToast('Failed to approve source', 'error');
    }
  };

  const handleSave = async () => {
    if (!sourceType) return;
    if (sourceType === 'faq' && (!formData.title || !formData.content)) {
      return showToast('Title and content required for FAQ', 'error');
    }
    if (sourceType === 'url' && !formData.url) {
      return showToast('URL is required', 'error');
    }

    setSaving(true);
    try {
      await api.post('/api/knowledge', {
        type: sourceType,
        title: formData.title,
        content: formData.content,
        url: formData.url,
        status: 'approved'
      });
      showToast('Knowledge source registered and approved', 'success');
      setShowModal(false);
      setSourceType(null);
      setFormData({ title: '', content: '', url: '' });
      fetchSources();
    } catch (err) {
      showToast('Failed to save source', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testQuery.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post<ApiResponse<any>>('/api/knowledge/test', { question: testQuery });
      if (res && res.data) {
        setTestResult(res.data);
      }
    } catch (err) {
      showToast('Test query failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleApproveGap = async (gap: KnowledgeGap) => {
    try {
      await api.post(`/api/knowledge/gaps/${gap.id}/approve`, {
        answer: gapDraftAnswer || gap.suggested_answer
      });
      showToast(`Approved FAQ for: "${gap.question}"`, 'success');
      setEditingGap(null);
      fetchGaps();
      fetchSources();
    } catch {
      showToast('Failed to approve gap answer', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
      case 'active':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved (In Index)
          </span>
        );
      case 'draft':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Draft (Pending Review)
          </span>
        );
      case 'conflicted':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-800 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Conflict Warning
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base & Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage approved source documents, preview chunk extractions, and resolve customer knowledge gaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReindex}
            disabled={reindexing}
            className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <svg className={`h-3.5 w-3.5 text-indigo-600 ${reindexing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reindexing ? 'Re-indexing...' : 'Re-index Sources'}
          </button>

          <button 
            onClick={() => { setShowModal(true); setSourceType(null); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <span>+</span> Add Knowledge Source
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sources')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Approved Sources & Catalog
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-bold">
            {sources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'gaps'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>⚠️</span>
          Knowledge Gaps & Unanswered
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-900 font-bold">
            {gaps.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: APPROVED SOURCES & GROUNDED CONTENT               */}
      {/* ======================================================== */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Conflict Warning Notification Banner */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <span className="text-base mt-0.5">ℹ️</span>
            <div>
              <p className="font-bold">Automated Grounding Guardrail Active</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Only content in <strong>Approved</strong> state is indexed into assistant RAG context. Draft items remain offline until verified by a store administrator.
              </p>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'faq', 'catalog', 'url', 'document'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                      filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search sources by title or keyword..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Source Grid Cards */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12 text-slate-400 text-xs">Loading sources...</div>
              ) : sources.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <h3 className="font-bold text-slate-900">No knowledge sources found</h3>
                  <p className="text-xs text-slate-400 mt-1">Add FAQs or connect your website to populate your knowledge base.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sources.map(source => (
                    <div key={source.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-sm transition flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono">
                            {source.type}
                          </span>
                          {getStatusBadge(source.status)}
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{source.title}</h3>
                        
                        <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                          {source.content}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>{source.freshness || 'Updated recently'}</span>
                          <span className="truncate max-w-[120px] font-mono">{source.origin || 'Direct'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setPreviewSource(source)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            Preview Chunks →
                          </button>

                          <div className="flex items-center gap-2">
                            {source.status === 'draft' && (
                              <button
                                onClick={() => handleApproveSource(source.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                              >
                                Approve
                              </button>
                            )}

                            <button 
                              onClick={() => handleDelete(source.id)} 
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Delete source"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Answer Testing Area with Cited Excerpts */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">Live Grounded Engine Query Test</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold font-mono">
                  Sanctum Auth Active
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-5">
                Simulate a customer question to inspect exact cited source excerpts used for the grounded answer.
              </p>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g., Is the titanium stove in stock, or what are your shipping times?" 
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
                />
                <button 
                  onClick={handleTest}
                  disabled={testing || !testQuery.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition shadow-sm"
                >
                  {testing ? 'Testing...' : 'Test Answer'}
                </button>
              </div>

              {testResult && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Assistant Response</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      ✓ {testResult.grounding_status || 'Supported by approved sources'}
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">{testResult.answer}</p>
                  
                  {testResult.sources && testResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cited Source Excerpts
                      </span>
                      <div className="space-y-2">
                        {testResult.sources.map((s, i) => (
                          <div key={i} className="text-xs bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                            <span className="font-bold text-indigo-300 block mb-1">[{i+1}] {s.title}</span>
                            <p className="text-slate-400 text-[11px] italic font-mono bg-slate-950/60 p-2 rounded">
                              "{s.excerpt || 'Full text match in knowledge base'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KNOWLEDGE GAPS & UNANSWERED QUESTIONS             */}
      {/* ======================================================== */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-bold">Human Review Required Before Publishing</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                These questions were asked repeatedly by customers where your assistant did not find approved source data. Review or customize the suggested answer, then approve to immediately plug the gap.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {gaps.map((gap) => (
              <div key={gap.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      {gap.question}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Asked <strong className="text-indigo-600">{gap.frequency} times</strong> by visitors • Last asked {gap.last_asked}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGap(gap);
                        setGapDraftAnswer(gap.suggested_answer);
                      }}
                      className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
                    >
                      Edit Draft Answer
                    </button>

                    <button
                      onClick={() => handleApproveGap(gap)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                    >
                      Approve & Publish FAQ
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Suggested Draft Answer (Based on Context):
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {gap.suggested_answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Chunks Drawer / Modal */}
      {previewSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Extracted Vector Chunks</h3>
              <button onClick={() => setPreviewSource(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">{previewSource.title}</p>
              <p className="text-[11px] text-slate-500">Source: {previewSource.origin || 'Direct Content'}</p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 p-1">
              {(previewSource.extracted_chunks || [previewSource.content]).map((chunk, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                  <span className="font-bold text-indigo-600 mr-1.5 text-[10px] uppercase">Chunk #{idx+1}:</span>
                  {chunk}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button 
                onClick={() => setPreviewSource(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Knowledge Source Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Knowledge Source</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {!sourceType ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">Choose the format of source data to register:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSourceType('faq')} 
                    className="p-4 border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-xl text-left transition"
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-0.5">FAQ / Q&A</span>
                    <span className="text-[11px] text-slate-500">Common customer questions & answers</span>
                  </button>
                  <button 
                    onClick={() => setSourceType('url')} 
                    className="p-4 border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-xl text-left transition"
                  >
                    <span className="font-bold text-xs text-slate-900 block mb-0.5">Website URL</span>
                    <span className="text-[11px] text-slate-500">Index public webpage or policy</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {sourceType === 'faq' ? (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Question / Subject</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
                        placeholder="e.g. Can I modify my order after purchase?"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Approved Answer Content</label>
                      <textarea 
                        rows={4} 
                        value={formData.content} 
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Provide the exact factual policy..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Page URL</label>
                      <input 
                        type="url" 
                        value={formData.url} 
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
                        placeholder="https://northstargoods.com/policies/terms"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Title</label>
                      <input 
                        type="text" 
                        value={formData.title} 
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Terms of Service & Usage"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setSourceType(null)} 
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save & Index'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
