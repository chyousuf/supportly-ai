import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { AnalyticsOverview, ApiResponse, Conversation } from '../../types';

const icons = {
  chat: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
};

const Overview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [dateRange, setDateRange] = useState('7'); // days

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<ApiResponse<AnalyticsOverview>>(`/api/analytics/overview?days=${dateRange}`);
      if (response && response.data) {
        setData(response.data);
      }
      
      const convResponse = await api.get<ApiResponse<Conversation[]>>(`/api/conversations?limit=5`);
      if (convResponse && convResponse.data) {
        setRecentConversations(convResponse.data);
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
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">AI Active</span>;
      case 'needs_human':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Needs Human</span>;
      case 'human_active':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Human Active</span>;
      case 'closed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Closed</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="h-10 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Failed to load overview data</h3>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Generate some mock chart data if not provided by API
  const chartData: {date: string, count: number}[] = data?.conversations_by_day || Array.from({length: parseInt(dateRange)}).map((_, i) => ({
    date: new Date(Date.now() - (parseInt(dateRange) - i - 1) * 86400000).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
    count: Math.floor(Math.random() * 50) + 10
  }));

  const maxChartValue = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Demo data</span>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            {icons.chat}
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Conversations</p>
          <p className="text-3xl font-bold text-slate-900">{data?.total_conversations || 142}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Demo data</span>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
            {icons.sparkles}
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">AI Resolution Rate</p>
          <p className="text-3xl font-bold text-slate-900">{data ? Math.round((data.ai_answered / Math.max(data.total_conversations, 1)) * 100) : '85'}%</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Demo data</span>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            {icons.users}
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Human Handoffs</p>
          <p className="text-3xl font-bold text-slate-900">{data?.human_handoffs || 21}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 relative">
          <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Demo data</span>
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-4">
            {icons.star}
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Satisfaction</p>
          <p className="text-3xl font-bold text-slate-900">{data?.avg_satisfaction || '4.8'}/5</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Conversation Volume</h2>
        <div className="h-64 flex items-end gap-2 md:gap-4 pb-6 relative">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div 
                className="w-full bg-indigo-500 rounded-t transition-all group-hover:bg-indigo-600 relative"
                style={{ height: `${Math.max((d.count / maxChartValue) * 100, 2)}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap transition-opacity">
                  {d.count} convos
                </div>
              </div>
              <span className="text-[10px] md:text-xs text-slate-400 mt-2 rotate-45 md:rotate-0 origin-left">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
          <a href="/dashboard/inbox" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</a>
        </div>
        <div className="divide-y divide-slate-200">
          {recentConversations.length > 0 ? (
            recentConversations.map((conv) => (
              <div key={conv.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                  {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {conv.customer_name || 'Anonymous Customer'}
                    </p>
                    <span className="text-xs text-slate-500 ml-4 shrink-0">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {conv.latest_message?.content || 'No messages yet'}
                  </p>
                </div>
                <div className="shrink-0 ml-4">
                  {renderStatusBadge(conv.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">
              No recent conversations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;

