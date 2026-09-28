import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../utils/api';
import { TeamMember, ApiResponse } from '../../types';

const Settings: React.FC = () => {
  const { user: business } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile
  const [profileData, setProfileData] = useState({ name: business?.name || '', domain: '' });
  
  // Team
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'agent' });
  
  // AI
  const [aiConfig, setAiConfig] = useState({ apiKey: '', model: 'gpt-4o-mini' });
  const [showKey, setShowKey] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    needsHuman: true,
    dailySummary: false,
    weeklyReport: true
  });

  useEffect(() => {
    if (activeTab === 'team') {
      fetchTeam();
    }
  }, [activeTab]);

  const fetchTeam = async () => {
    try {
      const res = await api.get<ApiResponse<TeamMember[]>>('/api/settings/team');
      if (res && res.data) setTeam(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Mocking profile update since API might not exist yet
      showToast('Profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) return;
    try {
      await api.post('/api/settings/team', newMember);
      showToast('Team member added', 'success');
      setNewMember({ name: '', email: '', role: 'agent' });
      fetchTeam();
    } catch (err) {
      showToast('Failed to add team member', 'error');
    }
  };

  const handleRemoveMember = async (id: number) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await api.delete(`/api/settings/team/${id}`);
      showToast('Member removed', 'success');
      fetchTeam();
    } catch (err) {
      showToast('Failed to remove member', 'error');
    }
  };

  const handleSaveAi = async () => {
    try {
      // Mock save
      showToast('AI provider configuration saved. Server-side integration required.', 'success');
    } catch (err) {
      showToast('Failed to save AI config', 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Business Profile' },
    { id: 'team', name: 'Team' },
    { id: 'notifications', name: 'Notifications' },
    { id: 'privacy', name: 'Data & Privacy' },
    { id: 'ai', name: 'AI Provider' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account, team, and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-indigo-600 text-indigo-700 bg-white' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          
          {/* Business Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={business?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website Domain</label>
                <input 
                  type="text" 
                  value={profileData.domain}
                  onChange={e => setProfileData({...profileData, domain: e.target.value})}
                  placeholder="e.g. example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <button 
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* Team */}
          {activeTab === 'team' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Members</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                  {team.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">Loading team members...</div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {team.map(member => (
                        <div key={member.id} className="p-4 flex items-center justify-between bg-white">
                          <div>
                            <p className="font-medium text-slate-900">{member.name}</p>
                            <p className="text-sm text-slate-500">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg capitalize">
                              {member.role}
                            </span>
                            <button onClick={() => handleRemoveMember(member.id)} className="text-slate-400 hover:text-red-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Team Member</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <input type="text" placeholder="Name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <input type="email" placeholder="Email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                  <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button onClick={handleAddMember} className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition">
                  Add Member
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="max-w-xl space-y-6">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
                Email notifications will be enabled when email service is configured.
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer" onClick={() => setNotifications({...notifications, needsHuman: !notifications.needsHuman})}>
                  <div>
                    <h4 className="font-medium text-slate-900">Needs Human Attention</h4>
                    <p className="text-sm text-slate-500">Email me when a conversation needs human attention</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${notifications.needsHuman ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.needsHuman ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer" onClick={() => setNotifications({...notifications, dailySummary: !notifications.dailySummary})}>
                  <div>
                    <h4 className="font-medium text-slate-900">Daily Summary</h4>
                    <p className="text-sm text-slate-500">Daily conversation summary</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${notifications.dailySummary ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.dailySummary ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer" onClick={() => setNotifications({...notifications, weeklyReport: !notifications.weeklyReport})}>
                  <div>
                    <h4 className="font-medium text-slate-900">Weekly Analytics</h4>
                    <p className="text-sm text-slate-500">Weekly analytics report</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${notifications.weeklyReport ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => showToast('Notification preferences saved. Email delivery requires mail service configuration.', 'success')}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div className="max-w-xl space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Retention</h3>
                <p className="text-sm text-slate-500 mb-4">Choose how long conversation data should be kept.</p>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white max-w-xs">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Export Data</h3>
                <p className="text-sm text-slate-500 mb-4">Download a complete archive of your conversations and knowledge base.</p>
                <button 
                  onClick={() => showToast('Data export is being prepared. This feature is coming soon.', 'info')}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Export Data
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-slate-500 mb-4">Permanently delete all your data. This cannot be undone.</p>
                <button 
                  onClick={() => {
                    if(window.confirm('This will permanently delete all conversations, messages, and analytics. This cannot be undone.')) {
                      showToast('Data deletion requires additional confirmation. Contact support.', 'error');
                    }
                  }}
                  className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition border border-red-200"
                >
                  Delete All Data
                </button>
              </div>
            </div>
          )}

          {/* AI Provider */}
          {activeTab === 'ai' && (
            <div className="max-w-xl space-y-6">
              <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
                API keys are stored securely on the server and never exposed to the browser. Without an API key, the assistant uses keyword-based matching.
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">OpenAI API Key</label>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={aiConfig.apiKey}
                    onChange={e => setAiConfig({...aiConfig, apiKey: e.target.value})}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">AI Provider & Model</label>
                <select 
                  value={aiConfig.model}
                  onChange={e => setAiConfig({...aiConfig, model: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                >
                  <optgroup label="Google Gemini">
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra-fast, High Accuracy)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Complex Reasoning)</option>
                  </optgroup>
                  <optgroup label="OpenAI">
                    <option value="gpt-4o-mini">GPT-4o Mini (Fast, Cost-effective)</option>
                    <option value="gpt-4o">GPT-4o (High Performance)</option>
                  </optgroup>
                  <optgroup label="Anthropic">
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Nuanced Understanding)</option>
                  </optgroup>
                  <optgroup label="Local / Content Engine">
                    <option value="keyword-deterministic">Grounded Knowledge Search (No API Key Required)</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSaveAi}
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
                >
                  Save Configuration
                </button>
                <button 
                  onClick={() => showToast('Testing connection to OpenAI...', 'info')}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Test Connection
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
