import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Tenant, ApiResponse } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const DEMO_TENANTS: Tenant[] = [
  {
    id: 1,
    name: 'Northstar Goods',
    email: 'demo@northstargoods.com',
    domain: 'northstargoods.com',
    plan: 'Growth',
    status: 'active',
    conversations_count: 142,
    sources_count: 10,
    monthly_messages: 1840,
    message_limit: 2500,
    created_at: '2026-08-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Lumina Apparel',
    email: 'support@luminaapparel.io',
    domain: 'luminaapparel.io',
    plan: 'Business',
    status: 'active',
    conversations_count: 512,
    sources_count: 48,
    monthly_messages: 8940,
    message_limit: 10000,
    created_at: '2026-07-20T14:30:00Z'
  },
  {
    id: 3,
    name: 'Nomad Coffee Roasters',
    email: 'hello@nomadcoffee.store',
    domain: 'nomadcoffee.store',
    plan: 'Starter',
    status: 'active',
    conversations_count: 89,
    sources_count: 6,
    monthly_messages: 410,
    message_limit: 500,
    created_at: '2026-09-01T09:15:00Z'
  },
  {
    id: 4,
    name: 'Summit Gear Co',
    email: 'admin@summitgear.co',
    domain: 'summitgear.co',
    plan: 'Enterprise',
    status: 'active',
    conversations_count: 1840,
    sources_count: 120,
    monthly_messages: 28400,
    message_limit: 50000,
    created_at: '2026-05-10T11:45:00Z'
  },
  {
    id: 5,
    name: 'Apex Cycling Lab',
    email: 'ops@apexcycling.com',
    domain: 'apexcycling.com',
    plan: 'Starter',
    status: 'suspended',
    conversations_count: 12,
    sources_count: 3,
    monthly_messages: 510,
    message_limit: 500,
    created_at: '2026-09-12T16:20:00Z'
  }
];

export default function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>(DEMO_TENANTS);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [globalPrompt, setGlobalPrompt] = useState(
    'Enforce ISO-27001 data compliance: redact all Credit Card numbers and passwords automatically before submitting to inference providers.'
  );
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get<ApiResponse<Tenant[]>>('/api/admin/tenants');
      if (res && res.data && res.data.length > 0) {
        setTenants(res.data);
      }
    } catch {
      // Use demo tenants
    }
  };

  const handleToggleStatus = (id: number) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'suspended' : 'active';
    const updated = { ...target, status: newStatus as 'active' | 'suspended' };
    setTenants(tenants.map(t => t.id === id ? updated : t));
    showToast(`Tenant "${target.name}" is now ${newStatus.toUpperCase()}`, 'info');
  };

  const handleSavePlan = () => {
    if (!editingTenant) return;
    setTenants(tenants.map(t => t.id === editingTenant.id ? editingTenant : t));
    setEditingTenant(null);
    showToast('Tenant subscription tier updated', 'success');
  };

  const handleSaveGlobalGuardrail = () => {
    showToast('Platform-wide Master Guardrail updated across all tenant assistants', 'success');
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.domain.toLowerCase().includes(search.toLowerCase()) ||
                          t.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || t.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
              Platform Master
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global management of all connected businesses, subscription limits, and platform-wide safety directives.
          </p>
        </div>
      </div>

      {/* Global Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Tenants</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">1,482</p>
          <span className="inline-block mt-2 text-xs font-medium text-emerald-600">
            ↑ +18 this week
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly AI Queries</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">2.41M</p>
          <span className="inline-block mt-2 text-xs font-medium text-emerald-600">
            94.2% resolution rate
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Providers Health</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-lg font-bold text-slate-800">Operational</p>
          </div>
          <p className="text-xs text-slate-400 mt-1">Gemini • OpenAI • Claude</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Guardrails</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">100%</p>
          <span className="inline-block mt-2 text-xs font-medium text-indigo-600">
            Active enforcement
          </span>
        </div>
      </div>

      {/* Global Master Guardrail Directive */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform-Wide Master AI Guardrail</h2>
              <p className="text-xs text-slate-400">Injected at the top of every assistant context across all tenants.</p>
            </div>
          </div>
          <button
            onClick={handleSaveGlobalGuardrail}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow"
          >
            Apply to All Tenants
          </button>
        </div>
        <textarea
          rows={2}
          value={globalPrompt}
          onChange={(e) => setGlobalPrompt(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Multi-Tenant Store Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Business Stores</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage tenant accounts, usage allowances, and account states.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search stores or domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Business">Business</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-6">Store & Domain</th>
                <th className="py-3 px-6">Tier</th>
                <th className="py-3 px-6">Usage (Msgs)</th>
                <th className="py-3 px-6">Knowledge Sources</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTenants.map((tenant) => {
                const usagePercent = Math.min(Math.round((tenant.monthly_messages / tenant.message_limit) * 100), 100);
                return (
                  <tr key={tenant.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{tenant.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{tenant.domain}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        tenant.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                        tenant.plan === 'Business' ? 'bg-indigo-100 text-indigo-800' :
                        tenant.plan === 'Growth' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-slate-700">{tenant.monthly_messages.toLocaleString()}</span>
                          <span className="text-slate-400">/ {tenant.message_limit.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-semibold">
                      {tenant.sources_count} sources
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        tenant.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setEditingTenant(tenant)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        Edit Tier
                      </button>
                      <button
                        onClick={() => handleToggleStatus(tenant.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          tenant.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {tenant.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tier Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update Plan: {editingTenant.name}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subscription Plan</label>
                <select
                  value={editingTenant.plan}
                  onChange={(e) => setEditingTenant({ ...editingTenant, plan: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Starter">Starter (500 msgs/mo)</option>
                  <option value="Growth">Growth (2,500 msgs/mo)</option>
                  <option value="Business">Business (10,000 msgs/mo)</option>
                  <option value="Enterprise">Enterprise (50,000 msgs/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Custom Message Quota</label>
                <input
                  type="number"
                  value={editingTenant.message_limit}
                  onChange={(e) => setEditingTenant({ ...editingTenant, message_limit: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingTenant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
              >
                Save Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
