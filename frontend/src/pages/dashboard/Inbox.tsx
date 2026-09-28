import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../utils/api';
import { Conversation, Message, TeamMember, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [replyText, setReplyText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const fetchConversations = async () => {
    try {
      const q = new URLSearchParams();
      if (filter !== 'all') q.append('status', filter);
      if (search) q.append('search', search);
      
      const res = await api.get<ApiResponse<Conversation[]>>(`/api/conversations?${q.toString()}`);
      if (res && res.data) {
        setConversations(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
      showToast('Failed to load conversations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await api.get<ApiResponse<TeamMember[]>>('/api/settings/team');
      if (res && res.data) setTeam(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchTeam();
  }, [filter, search]);

  useEffect(() => {
    if (selectedConvo) {
      fetchMessages(selectedConvo.id);
    }
  }, [selectedConvo?.id]);

  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      const res = await api.get<ApiResponse<{messages: Message[]}>>(`/api/conversations/${id}`);
      if (res && res.data) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      showToast('Failed to load messages', 'error');
    } finally {
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStatusChange = async (status: 'ai_active' | 'needs_human' | 'human_active' | 'closed') => {
    if (!selectedConvo) return;
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/status`, { status });
      setSelectedConvo({ ...selectedConvo, status });
      showToast(`Conversation marked as ${status.replace('_', ' ')}`, 'success');
      fetchConversations();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    setSending(true);
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/messages`, {
        content: replyText,
        role: 'agent'
      });
      setReplyText('');
      fetchMessages(selectedConvo.id);
      fetchConversations();
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    showToast('Note saved (mocked)', 'success');
    setNoteText('');
    setShowNotes(false);
  };

  const renderStatusDot = (status: string) => {
    switch(status) {
      case 'ai_active': return <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>;
      case 'needs_human': return <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>;
      case 'human_active': return <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>;
      default: return <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000); // mins
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* Left Panel - List */}
      <div className={`w-full lg:w-96 flex flex-col border-r border-slate-200 ${selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex border-b border-slate-200 overflow-x-auto">
          {['all', 'ai_active', 'needs_human', 'closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                filter === f ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No conversations found.</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConvo(conv)}
                className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                  selectedConvo?.id === conv.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {conv.customer_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="font-semibold text-sm text-slate-900">{conv.customer_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatTime(conv.updated_at)}</span>
                    {renderStatusDot(conv.status)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 truncate ml-10">
                  {conv.latest_message?.content || '...'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Detail */}
      <div className={`flex-1 flex flex-col ${!selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        {!selectedConvo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <rect x="3" y="4" width="18" height="16" rx="2"></rect>
              <path d="M3 8l9 6 9-6"></path>
            </svg>
            <p>Select a conversation</p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  className="lg:hidden p-2 -ml-2 text-slate-500"
                  onClick={() => setSelectedConvo(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div>
                  <h2 className="font-bold text-slate-900">{selectedConvo.customer_name || 'Anonymous'}</h2>
                  {selectedConvo.customer_email && <p className="text-xs text-slate-500">{selectedConvo.customer_email}</p>}
                </div>
                <div className="ml-4">
                  {selectedConvo.status === 'ai_active' && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">AI Active</span>}
                  {selectedConvo.status === 'needs_human' && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">Needs Human</span>}
                  {selectedConvo.status === 'human_active' && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Human Active</span>}
                  {selectedConvo.status === 'closed' && <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">Closed</span>}
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {loadingMessages ? (
                <div className="text-center text-slate-500 text-sm">Loading messages...</div>
              ) : (
                messages.map((msg, i) => {
                  const isUser = msg.role === 'customer';
                  const isAgent = msg.role === 'agent';
                  const isAssistant = msg.role === 'assistant';
                  const isSystem = msg.role === 'system';

                  if (isSystem) {
                    return (
                      <div key={i} className="text-center text-xs text-slate-400 py-2">
                        {msg.content}
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${
                        isUser 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-md p-4' 
                          : isAgent
                            ? 'bg-emerald-50 rounded-2xl rounded-tl-md p-4 border border-emerald-200'
                            : 'bg-white rounded-2xl rounded-tl-md p-4 border border-slate-200 shadow-sm'
                      }`}>
                        {isAgent && <div className="text-xs font-bold text-emerald-600 mb-1">Agent</div>}
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                        
                        {isAssistant && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.sources.map((ref, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-1 rounded-full font-medium">
                                Source: {ref.title}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Action Area */}
            <div className="border-t border-slate-200 bg-white p-4">
              {showNotes && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an internal note..."
                    className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 resize-none"
                    rows={2}
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button onClick={handleSaveNote} className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-medium rounded-lg hover:bg-yellow-500">
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                {selectedConvo.status !== 'human_active' && selectedConvo.status !== 'closed' && (
                  <button 
                    onClick={() => handleStatusChange('human_active')}
                    className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition"
                  >
                    Take Over
                  </button>
                )}
                {selectedConvo.status !== 'closed' && (
                  <button 
                    onClick={() => handleStatusChange('closed')}
                    className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-medium rounded-lg hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                )}
                <button 
                  onClick={() => setShowNotes(!showNotes)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition ml-auto"
                >
                  {showNotes ? 'Cancel Note' : 'Add Note'}
                </button>
                
                <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Assign to...</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {selectedConvo.status === 'human_active' && (
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  ></textarea>
                  <button 
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inbox;
