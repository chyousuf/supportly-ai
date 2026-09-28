import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { KnowledgeSource, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const KnowledgeBase: React.FC = () => {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [sourceType, setSourceType] = useState<'faq' | 'url' | 'document' | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', url: '' });
  const [saving, setSaving] = useState(false);

  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{answer: string, sources: any[]} | null>(null);
  const [testing, setTesting] = useState(false);
  
  const { showToast } = useToast();

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

  useEffect(() => {
    fetchSources();
  }, [filter, search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      await api.delete(`/api/knowledge/${id}`);
      showToast('Source deleted successfully', 'success');
      fetchSources();
    } catch (err) {
      showToast('Failed to delete source', 'error');
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
        ...formData
      });
      showToast('Source added successfully', 'success');
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
      } else {
        // mock fallback
        setTestResult({
          answer: "Based on the knowledge base, here is a simulated answer to your question...",
          sources: sources.slice(0, 1)
        });
      }
    } catch (err) {
      showToast('Test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'faq': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
      case 'url': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
      case 'document': return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
      default: return null;
    }
  };

  const getStatus = (status: string) => {
    switch(status) {
      case 'active': return <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active</span>;
      case 'processing': return <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>Processing</span>;
      case 'error': return <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Error</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <button 
          onClick={() => { setShowModal(true); setSourceType(null); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Source
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {['all', 'faq', 'url', 'document'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                  filter === f ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search sources..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading sources...</div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No sources found</h3>
              <p className="text-sm text-slate-500 mb-4">Add your first knowledge source to make your AI smarter.</p>
              <button onClick={() => { setShowModal(true); setSourceType(null); }} className="text-indigo-600 font-medium hover:text-indigo-700">Add Source</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sources.map(source => (
                <div key={source.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      {getIcon(source.type)}
                    </div>
                    {getStatus(source.status)}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 truncate">{source.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                    {source.content || source.url || 'No content preview available'}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Updated {new Date(source.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                      <button onClick={() => handleDelete(source.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 lg:p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Test Your Knowledge Base</h2>
          <p className="text-slate-600 mb-6 text-sm">Enter a question to see how the assistant would respond using your knowledge sources.</p>
          
          <div className="flex gap-3 mb-8">
            <input 
              type="text" 
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="E.g., What are your shipping times?" 
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
            />
            <button 
              onClick={handleTest}
              disabled={testing || !testQuery.trim()}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 transition shadow-sm"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>

          {testResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">AI Response</span>
                <p className="text-slate-800 text-sm leading-relaxed">{testResult.answer}</p>
              </div>
              
              {testResult.sources && testResult.sources.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Sources Used</span>
                  <div className="flex flex-col gap-2">
                    {testResult.sources.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {getIcon(s.type || 'faq')}
                        <span className="font-medium truncate">{s.title || 'Untitled Source'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Add Knowledge Source</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6">
              {!sourceType ? (
                <div>
                  <p className="text-sm text-slate-600 mb-6">Choose the type of knowledge source you want to add.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => setSourceType('faq')} className="p-5 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg w-fit mb-3 group-hover:bg-indigo-200 group-hover:text-indigo-700">{getIcon('faq')}</div>
                      <h4 className="font-bold text-slate-900 mb-1">Q&A / FAQ</h4>
                      <p className="text-xs text-slate-500">Add common questions and specific answers manually.</p>
                    </button>
                    <button onClick={() => setSourceType('url')} className="p-5 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group">
                      <div className="p-3 bg-green-100 text-green-600 rounded-lg w-fit mb-3 group-hover:bg-indigo-200 group-hover:text-indigo-700">{getIcon('url')}</div>
                      <h4 className="font-bold text-slate-900 mb-1">Website URL</h4>
                      <p className="text-xs text-slate-500">Scrape content from a public webpage or article.</p>
                    </button>
                    <button onClick={() => setSourceType('document')} className="p-5 border-2 border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-lg w-fit mb-3 group-hover:bg-indigo-200 group-hover:text-indigo-700">{getIcon('document')}</div>
                      <h4 className="font-bold text-slate-900 mb-1">Document</h4>
                      <p className="text-xs text-slate-500">Upload a PDF, Word doc, or text file.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sourceType === 'faq' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Question / Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="E.g., What is your refund policy?" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Answer / Content</label>
                        <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={6} placeholder="Provide the answer here..."></textarea>
                      </div>
                    </>
                  )}
                  {sourceType === 'url' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
                        <input type="url" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://example.com/pricing" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title (Optional)</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Leave blank to auto-detect" />
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <p>Adding a URL saves its content at the time of import. Automatic re-sync is not yet available.</p>
                      </div>
                    </>
                  )}
                  {sourceType === 'document' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Document title" />
                      </div>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p className="text-sm font-medium text-slate-700 mb-1">Drop files here or click to browse</p>
                        <p className="text-xs text-slate-500">Supports PDF, TXT, DOCX up to 10MB</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {sourceType && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <button onClick={() => setSourceType(null)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition">Back</button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {saving ? 'Saving...' : 'Save Source'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
