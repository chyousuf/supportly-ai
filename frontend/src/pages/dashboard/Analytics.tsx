import React, { useEffect, useState } from 'react';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // Mock data as endpoints don't fully exist yet for detailed analytics
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const topQuestions = [
    { text: "What is your return policy?", count: 45, lastAsked: "2 hours ago" },
    { text: "How do I reset my password?", count: 32, lastAsked: "5 hours ago" },
    { text: "Do you ship internationally?", count: 28, lastAsked: "1 day ago" },
    { text: "Where is my order?", count: 24, lastAsked: "2 days ago" },
    { text: "How do I cancel my subscription?", count: 15, lastAsked: "3 days ago" },
  ];

  const unansweredQuestions = [
    { text: "Do you have a physical store in London?", time: "2 hours ago" },
    { text: "Can I use multiple discount codes?", time: "5 hours ago" },
    { text: "What materials is the premium jacket made of?", time: "1 day ago" },
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100">
          Sample Data
        </span>
      </div>
      
      <p className="text-slate-500 text-sm mb-6">Analytics data shown below is from the demo dataset.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Top Questions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Question</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3 rounded-r-lg">Last Asked</th>
                </tr>
              </thead>
              <tbody>
                {topQuestions.map((q, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{q.text}</td>
                    <td className="px-4 py-3 text-slate-600">{q.count}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{q.lastAsked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unanswered Questions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Unanswered Questions
          </h2>
          <p className="text-sm text-slate-500 mb-4">Questions the AI couldn't answer. Add these to your knowledge base.</p>
          <div className="space-y-3">
            {unansweredQuestions.map((q, i) => (
              <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-xl flex justify-between items-start">
                <span className="text-sm font-medium text-red-900">{q.text}</span>
                <span className="text-xs text-red-500 whitespace-nowrap ml-4">{q.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 transition border border-slate-200">
            View All Unanswered
          </button>
        </div>

        {/* Customer Feedback */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Feedback</h2>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-bold text-slate-900">85%</span>
            <span className="text-sm text-slate-500 mb-1">helpful rate (124 ratings)</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Helpful</span>
                <span className="text-slate-500">105 (85%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Unhelpful</span>
                <span className="text-slate-500">19 (15%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Handoff Frequency */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Handoff Frequency</h2>
          <div className="flex flex-col items-center justify-center h-40">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-32 h-32">
                <path
                  className="text-slate-100"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeWidth="3"
                  strokeDasharray="15, 100"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">15%</span>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Handoffs</span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-2">
            15% of conversations were transferred to a human agent.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
