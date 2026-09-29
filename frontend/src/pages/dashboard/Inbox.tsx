import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../utils/api';
import { Conversation, Message, TeamMember, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export default function Inbox() {
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
  const [savingNote, setSavingNote] = useState(false);
  
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
        // Sync selectedConvo if active
        if (selectedConvo) {
          const updated = res.data.find(c => c.id === selectedConvo.id);
          if (updated) setSelectedConvo(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
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
      const res = await api.get<ApiResponse<{ messages: Message[] }>>(`/api/conversations/${id}`);
      if (res && res.data) {
        setMessages(res.data.messages || []);
      }
    } catch {
      showToast('Failed to load message thread', 'error');
    } finally {
      setLoadingMessages(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStatusChange = async (status: 'ai_active' | 'needs_human' | 'human_active' | 'closed' | 'reopened') => {
    if (!selectedConvo) return;
    try {
      await api.put(`/api/conversations/${selectedConvo.id}/status`, { status });
      setSelectedConvo({ ...selectedConvo, status });
      showToast(`Conversation marked as ${status.replace('_', ' ')}`, 'success');
      fetchConversations();
      fetchMessages(selectedConvo.id);
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handleResumeAI = async () => {
    if (!selectedConvo) return;
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/resume-ai`, {});
      setSelectedConvo({ ...selectedConvo, status: 'ai_active' });
      showToast('AI Assistant Copilot resumed for this conversation', 'success');
      fetchConversations();
      fetchMessages(selectedConvo.id);
    } catch {
      showToast('Failed to resume AI', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo) return;
    setSending(true);
    const clientMessageId = `msg-agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/messages`, {
        content: replyText,
        role: 'agent',
        client_message_id: clientMessageId
      });
      setReplyText('');
      await fetchMessages(selectedConvo.id);
      fetchConversations();
    } catch {
      showToast('Failed to deliver message. Check connection.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteText.trim() || !selectedConvo) return;
    setSavingNote(true);
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/notes`, {
        note: noteText,
        author: 'Agent'
      });
      setNoteText('');
      setShowNotes(false);
      showToast('Internal note saved to conversation history', 'success');
      await fetchMessages(selectedConvo.id);
    } catch {
      showToast('Failed to save note', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleAssign = async (agentId: string) => {
    if (!selectedConvo) return;
    const parsed = agentId ? parseInt(agentId) : null;
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/assign`, {
        assigned_to: parsed
      });
      setSelectedConvo({ ...selectedConvo, assigned_to: parsed });
      showToast('Staff assignment updated', 'success');
      fetchConversations();
    } catch {
      showToast('Failed to update assignment', 'error');
    }
  };

  const handlePriorityChange = async (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!selectedConvo) return;
    try {
      await api.post(`/api/conversations/${selectedConvo.id}/assign`, { priority });
      setSelectedConvo({ ...selectedConvo, priority });
      showToast(`Priority set to ${priority}`, 'success');
      fetchConversations();
    } catch {
      showToast('Failed to update priority', 'error');
    }
  };

  const renderStatusDot = (status: string) => {
    switch(status) {
      case 'ai_active': return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>;
      case 'needs_human': return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>;
      case 'human_active': return <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>;
      case 'reopened': return <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>;
      default: return <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>;
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-5.5rem)] flex bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      
      {/* ======================================================== */}
      {/* LEFT PANEL: CONVERSATION LIST (Responsive mobile view)   */}
      {/* ======================================================== */}
      <div className={`w-full lg:w-96 flex flex-col border-r border-slate-200 ${selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search conversations by name or query..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none px-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'ai_active', label: 'AI Active' },
            { id: 'needs_human', label: 'Needs Human' },
            { id: 'human_active', label: 'Human Active' },
            { id: 'closed', label: 'Closed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                filter === f.id 
                  ? 'border-indigo-600 text-indigo-700' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations found under filter.
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConvo(conv)}
                className={`p-3.5 cursor-pointer transition-colors ${
                  selectedConvo?.id === conv.id 
                    ? 'bg-indigo-50/60 border-l-3 border-l-indigo-600' 
                    : 'hover:bg-slate-50 border-l-3 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {conv.customer_name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="font-bold text-xs text-slate-900 truncate">{conv.customer_name || 'Anonymous'}</span>
                    {conv.priority === 'high' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">High</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400">{conv.waiting_time || 'Just now'}</span>
                    {renderStatusDot(conv.status)}
                  </div>
                </div>

                <p className="text-xs text-slate-500 truncate ml-9">
                  {conv.latest_message?.content || conv.ai_summary || '...'}
                </p>

                {conv.unread_count && conv.unread_count > 0 ? (
                  <div className="ml-9 mt-1 flex">
                    <span className="px-1.5 py-0.2 bg-red-500 text-white font-bold text-[9px] rounded-full">
                      {conv.unread_count} unread
                    </span>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: CONVERSATION DETAILS & THREAD               */}
      {/* ======================================================== */}
      <div className={`flex-1 flex flex-col ${!selectedConvo ? 'hidden lg:flex' : 'flex'}`}>
        {!selectedConvo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl mb-3 shadow-xs">
              💬
            </div>
            <p className="font-bold text-slate-700 text-sm">Select a Conversation</p>
            <p className="text-xs text-slate-400 mt-1">Choose a conversation from the left to view transcripts, take over, or add staff notes.</p>
          </div>
        ) : (
          <>
            {/* Header Details */}
            <div className="px-6 py-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  className="lg:hidden p-1.5 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  onClick={() => setSelectedConvo(null)}
                  aria-label="Back to conversations list"
                >
                  ← Back
                </button>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {selectedConvo.customer_name || 'Anonymous Customer'}
                    <span className="text-[10px] font-mono text-slate-400 font-normal">({selectedConvo.id})</span>
                  </h2>
                  {selectedConvo.customer_email && (
                    <p className="text-[11px] text-slate-500">{selectedConvo.customer_email}</p>
                  )}
                </div>
              </div>

              {/* Controls: Status, Assignee, Priority */}
              <div className="flex items-center gap-2.5">
                {/* Priority Selector */}
                <select 
                  value={selectedConvo.priority || 'medium'}
                  onChange={(e) => handlePriorityChange(e.target.value as any)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>

                {/* Team Assignee Selector */}
                <select 
                  value={selectedConvo.assigned_to || ''}
                  onChange={(e) => handleAssign(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
                >
                  <option value="">Unassigned</option>
                  {team.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedConvo.status === 'ai_active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  selectedConvo.status === 'needs_human' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  selectedConvo.status === 'human_active' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {selectedConvo.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* AI Summary Banner (Agent Briefing) */}
            {selectedConvo.ai_summary && (
              <div className="px-6 py-2 bg-indigo-50/50 border-b border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
                <span className="truncate">
                  <strong>✦ AI Summary:</strong> {selectedConvo.ai_summary}
                </span>
                <span className="text-[10px] text-indigo-600 font-medium shrink-0 ml-2">
                  Waiting: {selectedConvo.waiting_time || '4m'}
                </span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {loadingMessages ? (
                <div className="text-center text-slate-400 text-xs py-8">Loading transcripts...</div>
              ) : (
                messages.map((msg, i) => {
                  const isUser = msg.role === 'customer';
                  const isAgent = msg.role === 'agent';
                  const isInternalNote = msg.is_internal_note || msg.content.startsWith('Internal Note:');
                  const isSystem = msg.role === 'system';

                  // Internal Staff Note styling
                  if (isInternalNote) {
                    return (
                      <div key={i} className="my-2 p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-950 shadow-xs">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                          <span>🔒 Staff-Only Internal Note</span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content.replace(/^Internal Note(\s*\([^)]*\))?:\s*/i, '')}</p>
                      </div>
                    );
                  }

                  if (isSystem) {
                    return (
                      <div key={i} className="text-center text-[11px] text-slate-400 py-1 font-mono">
                        — {msg.content} —
                      </div>
                    );
                  }

                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${
                        isUser 
                          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs p-4 shadow-xs' 
                          : isAgent
                            ? 'bg-emerald-50 rounded-2xl rounded-tl-xs p-4 border border-emerald-200 shadow-xs'
                            : 'bg-white rounded-2xl rounded-tl-xs p-4 border border-slate-200 shadow-xs'
                      }`}>
                        {isAgent && <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Human Agent Staff</div>}
                        {!isUser && !isAgent && <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">AI Assistant</div>}
                        
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.content}</p>
                        
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {msg.sources.map((ref, idx) => (
                              <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-medium">
                                Source: {ref.title}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Actions & Reply Area */}
            <div className="border-t border-slate-200 bg-white p-4 space-y-3">
              {/* Internal Note Drawer Input */}
              {showNotes && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Write an internal note (only visible to team members)..."
                    className="w-full bg-white border border-amber-300 rounded-lg text-xs p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowNotes(false)} 
                      className="px-3 py-1 text-xs text-amber-800 hover:underline"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNote} 
                      disabled={savingNote || !noteText.trim()}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Save Internal Note'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selectedConvo.status !== 'human_active' && selectedConvo.status !== 'closed' && (
                    <button 
                      onClick={() => handleStatusChange('human_active')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition"
                    >
                      Take Over Conversation
                    </button>
                  )}

                  {selectedConvo.status === 'human_active' && (
                    <button 
                      onClick={handleResumeAI}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <span>✦</span> Resume AI Copilot
                    </button>
                  )}

                  {selectedConvo.status !== 'closed' ? (
                    <button 
                      onClick={() => handleStatusChange('closed')}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
                    >
                      Close Conversation
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusChange('reopened')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
                    >
                      Reopen Conversation
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setShowNotes(!showNotes)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                >
                  <span>📝</span> {showNotes ? 'Hide Note Box' : 'Add Internal Note'}
                </button>
              </div>

              {/* Agent Reply Input (Active when human agent has taken over) */}
              {selectedConvo.status === 'human_active' ? (
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your message to customer... (Enter to send)"
                    className="flex-1 border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition flex items-center justify-center shrink-0"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                  <span>AI assistant is currently handling this conversation automatically.</span>
                  <button 
                    onClick={() => handleStatusChange('human_active')}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Click to Take Over
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
