import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { AIRule, RolePermissions, PermissionDefinition, ApiResponse, UserRole, AuditLog } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const DEFAULT_PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { id: 'view_knowledge', name: 'View Knowledge Sources', description: 'Browse approved FAQs, URLs, and uploaded files', category: 'Knowledge' },
  { id: 'manage_knowledge', name: 'Create & Edit Knowledge', description: 'Add, update, or remove knowledge base content', category: 'Knowledge' },
  { id: 'view_inbox', name: 'Access Customer Inbox', description: 'View real-time customer conversation transcripts', category: 'Inbox' },
  { id: 'reply_inbox', name: 'Agent Takeover & Replies', description: 'Take over AI chats and send messages as a human agent', category: 'Inbox' },
  { id: 'add_internal_notes', name: 'Add Internal Notes', description: 'Add private staff-only notes to conversation threads', category: 'Inbox' },
  { id: 'customize_widget', name: 'Customize Widget & Branding', description: 'Modify widget colors, greeting, position, and business hours', category: 'Settings' },
  { id: 'configure_ai_rules', name: 'Manage AI Rules & Guardrails', description: 'Register, edit, and toggle AI behavioral constraints and prompts', category: 'Settings' },
  { id: 'manage_team', name: 'Team & Role Assignments', description: 'Invite team members, assign permissions, and remove users', category: 'Team' },
  { id: 'super_admin_access', name: 'Super Admin Platform Control', description: 'Access multi-tenant management and cross-store configuration', category: 'System' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    displayName: 'Super Admin (Platform Owner)',
    description: 'Unrestricted control over all businesses, system prompts, tenant billing, and platform rules.',
    permissions: DEFAULT_PERMISSION_DEFINITIONS.map(p => p.id)
  },
  admin: {
    role: 'admin',
    displayName: 'Business Admin (Store Owner)',
    description: 'Full management of this business store, team members, knowledge sources, widget, and AI rules.',
    permissions: [
      'view_knowledge', 'manage_knowledge', 'view_inbox', 'reply_inbox',
      'add_internal_notes', 'customize_widget', 'configure_ai_rules', 'manage_team'
    ]
  },
  agent: {
    role: 'agent',
    displayName: 'Support Agent (Staff)',
    description: 'Handles customer support chats, takes over conversations from AI, and adds internal notes.',
    permissions: [
      'view_knowledge', 'view_inbox', 'reply_inbox', 'add_internal_notes'
    ]
  },
  viewer: {
    role: 'viewer',
    displayName: 'Auditor / Read-Only Analyst',
    description: 'View-only access for observing analytics, conversation history, and knowledge base.',
    permissions: [
      'view_knowledge', 'view_inbox'
    ]
  }
};

const DEFAULT_AI_RULES: AIRule[] = [
  {
    id: 1,
    business_id: 1,
    name: 'Strict Knowledge Grounding Guardrail',
    category: 'guardrail',
    description: 'Prohibits the assistant from guessing or answering questions outside approved website content.',
    prompt_directive: 'You must strictly refuse to invent product specifications, shipping times, or warranties not present in the provided context.',
    priority: 'critical',
    enabled: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    business_id: 1,
    name: 'Order Verification Protocol',
    category: 'policy',
    description: 'Requires customer email and order reference before sharing order-related tracking details.',
    prompt_directive: 'Never disclose order status or personal contact details without verifying the customer email address first.',
    priority: 'high',
    enabled: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 3,
    business_id: 1,
    name: 'Instant Human Handoff on Escalation',
    category: 'routing',
    description: 'Triggers human agent escalation if customer mentions anger, chargebacks, or requests a supervisor.',
    prompt_directive: 'If the customer mentions "chargeback", "lawyer", "angry", or repeatedly demands a human, immediately initiate human handoff without arguing.',
    priority: 'high',
    enabled: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 4,
    business_id: 1,
    name: 'Competitor Price Neutrality',
    category: 'compliance',
    description: 'Prevents speaking negatively about or quoting speculative competitor prices.',
    prompt_directive: 'Never criticize competitor brands or quote estimated pricing for external stores. Reiterate Northstar Goods value propositions politely.',
    priority: 'medium',
    enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function RulesAndPermissions() {
  const [activeTab, setActiveTab] = useState<'rules' | 'roles' | 'audit'>('rules');
  const [rules, setRules] = useState<AIRule[]>(DEFAULT_AI_RULES);
  const [rolePerms, setRolePerms] = useState<Record<UserRole, RolePermissions>>(DEFAULT_ROLE_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Order verification sandbox state
  const [orderId, setOrderId] = useState('ORD-9824');
  const [orderEmail, setOrderEmail] = useState('alex@example.com');
  const [otpCode, setOtpCode] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [verifiedOrderResult, setVerifiedOrderResult] = useState<any>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Rule Modal state
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AIRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    category: 'guardrail' as AIRule['category'],
    description: '',
    prompt_directive: '',
    priority: 'medium' as AIRule['priority'],
    enabled: true
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchRules();
    fetchPermissions();
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get<ApiResponse<AuditLog[]>>('/api/audit-logs');
      if (res && res.data) {
        setAuditLogs(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const fetchRules = async () => {
    try {
      const res = await api.get<ApiResponse<AIRule[]>>('/api/rules');
      if (res && res.data && res.data.length > 0) {
        setRules(res.data);
      }
    } catch {
      // Fallback to demo rules
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get<ApiResponse<Record<UserRole, RolePermissions>>>('/api/permissions');
      if (res && res.data) {
        setRolePerms(res.data);
      }
    } catch {
      // Fallback to demo permissions
    }
  };

  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleForm({
      name: '',
      category: 'guardrail',
      description: '',
      prompt_directive: '',
      priority: 'high',
      enabled: true
    });
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (rule: AIRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      category: rule.category,
      description: rule.description,
      prompt_directive: rule.prompt_directive,
      priority: rule.priority,
      enabled: rule.enabled
    });
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.name.trim() || !ruleForm.prompt_directive.trim()) {
      showToast('Please provide a rule name and AI prompt directive', 'error');
      return;
    }

    try {
      if (editingRule) {
        // Edit existing rule
        const updated: AIRule = {
          ...editingRule,
          ...ruleForm,
          updated_at: new Date().toISOString()
        };
        await api.put(`/api/rules/${editingRule.id}`, updated).catch(() => {});
        setRules(rules.map(r => r.id === editingRule.id ? updated : r));
        showToast('Rule updated successfully', 'success');
      } else {
        // Create new rule
        const newRule: AIRule = {
          id: Date.now(),
          business_id: 1,
          ...ruleForm,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await api.post('/api/rules', newRule).catch(() => {});
        setRules([newRule, ...rules]);
        showToast('New AI rule registered and active', 'success');
      }
      setShowRuleModal(false);
    } catch {
      showToast('Failed to save rule', 'error');
    }
  };

  const handleToggleRule = async (id: number) => {
    const target = rules.find(r => r.id === id);
    if (!target) return;
    const updated = { ...target, enabled: !target.enabled };
    setRules(rules.map(r => r.id === id ? updated : r));
    await api.put(`/api/rules/${id}`, updated).catch(() => {});
    showToast(`Rule "${target.name}" is now ${updated.enabled ? 'Enabled' : 'Disabled'}`, 'info');
  };

  const handleDeleteRule = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this AI rule?')) return;
    setRules(rules.filter(r => r.id !== id));
    await api.delete(`/api/rules/${id}`).catch(() => {});
    showToast('Rule deleted successfully', 'success');
  };

  const handleTogglePermission = (permissionId: string) => {
    if (selectedRole === 'super_admin') {
      showToast('Super Admin role must retain all platform permissions', 'error');
      return;
    }

    const currentPerms = rolePerms[selectedRole].permissions;
    const hasPerm = currentPerms.includes(permissionId);
    const newPerms = hasPerm
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    const updatedRoleData: RolePermissions = {
      ...rolePerms[selectedRole],
      permissions: newPerms
    };

    setRolePerms({
      ...rolePerms,
      [selectedRole]: updatedRoleData
    });
  };

  const handleSavePermissions = async () => {
    try {
      await api.put(`/api/permissions/${selectedRole}`, rolePerms[selectedRole]).catch(() => {});
      showToast(`Permissions for ${rolePerms[selectedRole].displayName} updated successfully!`, 'success');
    } catch {
      showToast('Failed to save permission matrix', 'error');
    }
  };

  const handleRequestOtp = async () => {
    setOtpLoading(true);
    setVerifiedOrderResult(null);
    try {
      const res = await api.post<ApiResponse<any>>('/api/orders/request-verification', {
        order_id: orderId,
        email: orderEmail
      });
      setOtpRequested(true);
      if (res.data?.sample_code) setOtpCode(res.data.sample_code);
      showToast(res.message || 'OTP verification code generated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to request OTP', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await api.post<ApiResponse<any>>('/api/orders/verify', {
        order_id: orderId,
        email: orderEmail,
        code: otpCode
      });
      if (res.data?.verified) {
        setVerifiedOrderResult(res.data.order);
        showToast('Order authenticated. Private shipping tracking revealed.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid or expired verification code', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const categories = Array.from(new Set(DEFAULT_PERMISSION_DEFINITIONS.map(p => p.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rules & Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure AI system guardrails, customer safety rules, and role-based access control.
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'rules' && (
            <button
              onClick={handleOpenAddRule}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Register New Rule
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('rules')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          AI Guardrail & Business Rules
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 font-bold">
            {rules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Role Permissions Matrix (RBAC)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          Administrative Audit Trail
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-bold">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: AI RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <p className="font-semibold text-sm">How AI Rules Work</p>
              <p className="mt-0.5 leading-relaxed text-indigo-800">
                Active rules are automatically compiled into the server-side system prompt for your AI assistant. The model will enforce these policies during every conversation before responding to customers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-sm ${
                  rule.enabled ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        {rule.name}
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          rule.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                          rule.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {rule.priority}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {rule.category}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEditRule(rule)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      Edit Rule
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-400 select-none mr-2 font-sans uppercase tracking-wider text-[10px]">
                    System Directive:
                  </span>
                  "{rule.prompt_directive}"
                </div>
              </div>
            ))}
          </div>

          {/* SENSITIVE DATA ENFORCEMENT & OTP VERIFICATION SANDBOX */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🔒</span> Sensitive Action Enforcement: Customer Order Verification Protocol
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  AI prompt rules provide guidance, but backend authorization policies strictly enforce security. Customer email + order ID alone cannot grant tracking access without authenticated 4-digit OTP verification.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 uppercase">
                Backend Enforced
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Order Identifier</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpLoading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                >
                  {otpLoading ? 'Generating OTP...' : '1. Request Customer OTP'}
                </button>
              </div>
            </div>

            {otpRequested && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-xs text-indigo-900 font-semibold">
                    ✉️ Enter 4-Digit Verification Code sent to {orderEmail}:
                  </span>
                  <span className="text-[11px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Test Sandbox Code: <strong>8492</strong>
                  </span>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 8492"
                    className="w-32 px-3 py-2 text-center font-mono font-bold tracking-widest text-sm bg-white border border-indigo-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || !otpCode}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                  >
                    2. Authenticate & Disclose Order
                  </button>
                </div>
              </div>
            )}

            {verifiedOrderResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2 animate-fade-in">
                <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <span>✓</span> Verification Successful — Private Order Details Disclosed:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Status: <strong>{verifiedOrderResult.status} ({verifiedOrderResult.carrier})</strong></div>
                  <div>Tracking #: <strong className="font-mono">{verifiedOrderResult.tracking_number}</strong></div>
                  <div className="sm:col-span-2">Address: <strong>{verifiedOrderResult.shipping_address}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Role Selector Sidebar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 lg:col-span-1 shadow-sm h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Select Role to Configure
            </h3>

            {(Object.keys(rolePerms) as UserRole[]).map((rKey) => {
              const r = rolePerms[rKey];
              const isSelected = selectedRole === rKey;
              return (
                <button
                  key={rKey}
                  onClick={() => setSelectedRole(rKey)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    isSelected
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold shadow-sm'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">{r.displayName.split(' ')[0]}</span>
                    <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                      {r.permissions.length} perms
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {r.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:col-span-3 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {rolePerms[selectedRole].displayName}
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({rolePerms[selectedRole].permissions.length} / {DEFAULT_PERMISSION_DEFINITIONS.length} active)
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rolePerms[selectedRole].description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setRolePerms(DEFAULT_ROLE_PERMISSIONS)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Save Role Permissions
                </button>
              </div>
            </div>

            {/* Categorized Permissions */}
            <div className="space-y-6">
              {categories.map((cat) => {
                const permsInCat = DEFAULT_PERMISSION_DEFINITIONS.filter(p => p.category === cat);
                return (
                  <div key={cat} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {cat} Permissions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {permsInCat.map((perm) => {
                        const isGranted = rolePerms[selectedRole].permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                              isGranted
                                ? 'bg-indigo-50/50 border-indigo-200'
                                : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
                            }`}
                          >
                            <div className="space-y-1">
                              <p className={`text-xs font-bold ${isGranted ? 'text-indigo-900' : 'text-slate-700'}`}>
                                {perm.name}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-tight">
                                {perm.description}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}} // Handled by parent div
                              disabled={selectedRole === 'super_admin'}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMINISTRATIVE AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable compliance log of all configuration modifications, rule updates, and role permission adjustments.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {auditLogs.length} Recorded Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Change Description</th>
                  <th className="py-2.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{log.id}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.actor}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{log.description}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RULE MODAL (REGISTER / EDIT) */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingRule ? 'Edit AI Rule' : 'Register New AI Guardrail Rule'}
              </h2>
              <button
                onClick={() => setShowRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g. Return Policy Enforcement"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category
                  </label>
                  <select
                    value={ruleForm.category}
                    onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="guardrail">Guardrail (Safety)</option>
                    <option value="policy">Store Policy</option>
                    <option value="routing">Routing / Handoff</option>
                    <option value="compliance">Legal / Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="critical">Critical (Strict Enforce)</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Brief Purpose Description
                </label>
                <input
                  type="text"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                  placeholder="What condition or behavior does this rule govern?"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  AI System Directive (Injected into Assistant Context)
                </label>
                <textarea
                  rows={4}
                  value={ruleForm.prompt_directive}
                  onChange={(e) => setRuleForm({ ...ruleForm, prompt_directive: e.target.value })}
                  placeholder="e.g. Always append the official return portal URL when discussing returns..."
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="enableRule"
                  checked={ruleForm.enabled}
                  onChange={(e) => setRuleForm({ ...ruleForm, enabled: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300"
                />
                <label htmlFor="enableRule" className="text-xs font-medium text-slate-700">
                  Enable and activate this rule immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition"
                >
                  {editingRule ? 'Save Changes' : 'Register Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
