import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { WidgetConfig, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const WidgetCustomization: React.FC = () => {
  const [config, setConfig] = useState<WidgetConfig>({
    id: 0,
    business_id: 0,
    assistant_name: 'Supportly AI',
    welcome_message: 'Hi there! How can I help you today?',
    brand_color: '#4f46e5',
    position: 'right',
    suggested_questions: ['What are your pricing plans?', 'How do I get started?'],
    logo_url: null,
    business_hours: null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get<ApiResponse<WidgetConfig>>('/api/settings/widget');
      if (res && res.data) {
        setConfig(res.data);
      }
    } catch (err) {
      console.error(err);
      // fallback to default
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings/widget', config);
      showToast('Widget settings saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    if ((config.suggested_questions || []).length >= 6) {
      return showToast('Maximum 6 questions allowed', 'error');
    }
    setConfig({
      ...config,
      suggested_questions: [...(config.suggested_questions || []), newQuestion.trim()]
    });
    setNewQuestion('');
  };

  const removeQuestion = (idx: number) => {
    const questions = [...(config.suggested_questions || [])];
    questions.splice(idx, 1);
    setConfig({ ...config, suggested_questions: questions });
  };

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Widget Customization</h1>
        <p className="text-slate-500 mt-1">Design how the chat widget appears on your website.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Assistant Name</label>
            <input 
              type="text" 
              value={config.assistant_name} 
              onChange={e => setConfig({...config, assistant_name: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Welcome Message</label>
            <textarea 
              value={config.welcome_message} 
              onChange={e => setConfig({...config, welcome_message: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Brand Color</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                value={config.brand_color} 
                onChange={e => setConfig({...config, brand_color: e.target.value})}
                className="w-12 h-12 rounded cursor-pointer border-0 p-0"
              />
              <input 
                type="text" 
                value={config.brand_color} 
                onChange={e => setConfig({...config, brand_color: e.target.value})}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Widget Position</label>
            <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
              <button 
                onClick={() => setConfig({...config, position: 'left'})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${config.position === 'left' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                Left
              </button>
              <button 
                onClick={() => setConfig({...config, position: 'right'})}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${config.position === 'right' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Right
                <div className="w-3 h-3 rounded-full bg-indigo-500" style={{backgroundColor: config.brand_color}}></div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Logo URL (Optional)</label>
            <input 
              type="url" 
              value={config.logo_url || ''} 
              onChange={e => setConfig({...config, logo_url: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-900">Suggested Questions</label>
              <span className="text-xs text-slate-500">{(config.suggested_questions || []).length}/6</span>
            </div>
            <div className="space-y-2 mb-3">
              {(config.suggested_questions || []).map((q: string, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <span className="truncate pr-4 text-slate-700">{q}</span>
                  <button onClick={() => removeQuestion(i)} className="text-slate-400 hover:text-red-500 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
            {(config.suggested_questions || []).length < 6 && (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addQuestion()}
                  placeholder="Add a new suggested question..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={addQuestion} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">Add</button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-200">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="relative">
          <div className="sticky top-8 bg-slate-100 rounded-2xl border border-slate-200 h-[600px] overflow-hidden flex flex-col shadow-inner">
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center text-sm font-medium text-slate-500">
              Live Preview
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</span>
            </div>
            
            <div className="flex-1 relative bg-slate-50">
              {/* Background website mockup elements */}
              <div className="p-8 opacity-40">
                <div className="h-8 w-1/3 bg-slate-300 rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-slate-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
                  <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
                </div>
                <div className="mt-12 h-64 w-full bg-slate-200 rounded-xl"></div>
              </div>

              {/* The Widget */}
              <div className={`absolute bottom-6 ${config.position === 'left' ? 'left-6' : 'right-6'} w-[340px] flex flex-col gap-4 max-w-[calc(100%-3rem)]`}>
                
                {/* Chat Window */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col h-[400px]">
                  {/* Header */}
                  <div className="p-4 text-white flex items-center gap-3 relative overflow-hidden" style={{backgroundColor: config.brand_color}}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex gap-3 items-center w-full">
                      {config.logo_url ? (
                        <img src={config.logo_url} alt="Logo" className="w-10 h-10 rounded-full bg-white object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shrink-0">
                          {config.assistant_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-[15px] leading-tight">{config.assistant_name}</h3>
                        <p className="text-[11px] text-white/80">AI Assistant</p>
                      </div>
                      <button className="text-white/80 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 p-4 bg-slate-50 overflow-y-auto">
                    <div className="flex mb-4">
                      <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm text-sm text-slate-800 max-w-[85%]">
                        {config.welcome_message}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(config.suggested_questions || []).map((q: string, i: number) => (
                        <button key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-slate-300 shadow-sm transition">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="p-3 bg-white border-t border-slate-100">
                    <div className="relative">
                      <input type="text" placeholder="Type a message..." disabled className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-0 rounded-xl text-sm focus:ring-0" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white" style={{backgroundColor: config.brand_color}}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* FAB */}
                <div className={`flex ${config.position === 'left' ? 'justify-start' : 'justify-end'}`}>
                  <button 
                    className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    style={{backgroundColor: config.brand_color}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetCustomization;
