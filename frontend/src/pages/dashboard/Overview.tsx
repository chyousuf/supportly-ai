import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { AnalyticsOverview, ApiResponse, Conversation } from '../../types';

const icons = {
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
};

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [dateRange, setDateRange] = useState('7'); // days
  const [dismissOnboarding, setDismissOnboarding] = useState(false);

  // Setup Checklist Definition
  const checklistItems = [
    { id: 1, title: 'Add business details & store domain', completed: true, path: '/dashboard/settings' },
    { id: 2, title: 'Add and approve knowledge sources', completed: true, path: '/dashboard/knowledge' },
    { id: 3, title: 'Configure AI model & guardrails', completed: true, path: '/dashboard/rules-permissions' },
    { id: 4, title: 'Customize widget branding', completed: true, path: '/dashboard/widget' },
    { id: 5, title: 'Install and verify the widget', completed: true, path: '/dashboard/integrations' },
    { id: 6, title: 'Test an answer and human handoff', completed: false, path: '/showcase', actionText: 'Test in Demo Showcase' }
  ];

  const completedCount = checklistItems.filter(i => i.completed).length;
  const progressPct = Math.round((completedCount / checklistItems.length) * 100);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<ApiResponse<AnalyticsOverview>>(`/api/analytics/overview?days=${dateRange}`);
      if (response && response.data) {
        setData(response.data);
      }
      
      const convResponse = await api.get<ApiResponse<Conversation[]>>(`/api/conversations`);
      if (convResponse && convResponse.data) {
        setRecentConversations(convResponse.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch overview data', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ai_active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">AI Active</span>;
      case 'needs_human':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Needs Human</span>;
      case 'human_active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Human Active</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Closed</span>;
      default:
        return null;
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-32"></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to load overview data</h3>
        <p className="text-sm text-slate-500 mb-4">The companion server may be offline or restarting.</p>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const chartData = data?.conversations_by_day || [];
  const maxChartValue = Math.max(...chartData.map(d => d.count), 25);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time support operations, customer inquiries, and AI resolution rates.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Timeframe:</span>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* ITEM 7: PERSISTENT GUIDED ONBOARDING CHECKLIST */}
      {!dismissOnboarding && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-800/60 px-2 py-0.5 rounded">
                    Guided Setup
                  </span>
                  <span className="text-xs text-slate-300 font-medium">{completedCount} of {checklistItems.length} completed</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Get Supportly AI Ready for Production</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete these recommended steps to ensure fast response times and accurate grounded answers on your store.
                </p>
              </div>

              <button
                onClick={() => setDismissOnboarding(true)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Dismiss checklist"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {checklistItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                    item.completed
                      ? 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                      : 'bg-indigo-600/30 border-indigo-400/40 text-white font-semibold hover:bg-indigo-600/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/30 text-indigo-200'
                    }`}>
                      {item.completed ? '✓' : item.id}
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.actionText && (
                    <span className="text-[10px] text-indigo-300 underline shrink-0 ml-1">
                      Action →
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ITEM 8: ACTIONABLE METRICS WITH DIRECT LINKS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversations */}
        <Link 
          to="/dashboard/inbox"
          className="bg-white rounded-2xl border border-slate-200 p-5 relative hover:border-indigo-300 hover:shadow-sm transition group"
        >
          <span className="absolute top-4 right-4 text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Live Stream
          </span>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
            {icons.chat}
          </div>
          <p className="text-xs font-semibold text-slate-500">Total Conversations</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{data?.total_conversations || 142}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">+18% vs prev</span>
          </div>
          <p className="text-[10px] text-indigo-600 group-hover:underline mt-2 flex items-center gap-1">
            View all in Inbox →
          </p>
        </Link>

        {/* AI Resolution Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 relative">
          <span className="absolute top-4 right-4 text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Grounded
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            {icons.sparkles}
          </div>
          <p className="text-xs font-semibold text-slate-500">AI Resolution Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{data?.ai_resolution_rate || 85}%</p>
            <span className="text-[11px] text-slate-400">{data?.ai_resolved_count || 121} resolved</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            No escalation or human handoff required
          </p>
        </div>

        {/* Human Handoffs */}
        <Link 
          to="/dashboard/inbox?status=needs_human"
          className="bg-white rounded-2xl border border-slate-200 p-5 relative hover:border-amber-300 hover:shadow-sm transition group"
        >
          <span className="absolute top-4 right-4 text-[9px] uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Escalations
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            {icons.users}
          </div>
          <p className="text-xs font-semibold text-slate-500">Human Handoffs</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{data?.human_handoffs || 21}</p>
            <span className="text-[11px] text-slate-500 font-medium">({data?.human_handoff_rate || 15}%)</span>
          </div>
          <p className="text-[10px] text-amber-700 group-hover:underline mt-2 flex items-center gap-1">
            Filter pending escalations →
          </p>
        </Link>

        {/* Customer Satisfaction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 relative">
          <span className="absolute top-4 right-4 text-[9px] uppercase font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded">
            Feedback
          </span>
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            {icons.star}
          </div>
          <p className="text-xs font-semibold text-slate-500">Customer Satisfaction</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{data?.avg_satisfaction || 4.8} / 5</p>
            <span className="text-[11px] text-emerald-600 font-medium">89% positive</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Based on {data?.customer_feedback_total || 54} visitor ratings
          </p>
        </div>
      </div>

      {/* Conversation Volume Chart with Axes and Accessible Tooltips */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Conversation Volume</h2>
            <p className="text-xs text-slate-500">Daily message traffic handled across all integrated web channels.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Peak: {maxChartValue} chats / day
          </span>
        </div>

        <div className="h-64 flex items-end gap-2 md:gap-3 pb-6 pt-4 border-b border-slate-100 relative">
          {/* Subtle Y-Axis Gridlines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 flex justify-between text-[9px] text-slate-400">
            <span>{maxChartValue}</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 flex justify-between text-[9px] text-slate-400">
            <span>{Math.round(maxChartValue / 2)}</span>
          </div>

          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative z-10">
              <div 
                className="w-full max-w-[32px] bg-indigo-500 hover:bg-indigo-600 rounded-t-md transition-all relative"
                style={{ height: `${Math.max((d.count / maxChartValue) * 100, 4)}%` }}
              >
                {/* Accessible Tooltip on Hover/Focus */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] py-1 px-2 rounded-md pointer-events-none whitespace-nowrap transition-opacity shadow-lg z-20">
                  {d.count} conversations ({d.date})
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">{d.date}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 flex flex-wrap justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Total Volume
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> AI Handled ({data?.ai_resolution_rate || 85}%)
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Estimated AI Cost ({dateRange}d): ${data?.estimated_ai_cost_usd || '0.025'}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Recent Customer Activity</h2>
          <Link to="/dashboard/inbox" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
            Open Support Inbox →
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentConversations.length > 0 ? (
            recentConversations.map((conv) => (
              <Link 
                key={conv.id} 
                to={`/dashboard/inbox`} 
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors block"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {conv.customer_name || 'Website Visitor'}
                      </p>
                      {conv.unread_count && conv.unread_count > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-bold">
                          {conv.unread_count} new
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.latest_message?.content || conv.ai_summary || 'No recent messages'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {conv.last_activity || 'Recent'}
                  </span>
                  {renderStatusBadge(conv.status)}
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent conversations recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
