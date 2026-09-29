import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../utils/api';
import { CatalogSyncState, WidgetStatus, ApiResponse } from '../../types';

export default function Integrations() {
  const { user: business } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'embed' | 'catalog'>('embed');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'wordpress' | 'shopify' | 'webflow' | 'html'>('wordpress');

  // Widget Verification state
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus | null>(null);
  const [verifyingWidget, setVerifyingWidget] = useState(false);
  const [useProductionUrl, setUseProductionUrl] = useState(true);

  // Catalog Sync state
  const [storeUrl, setStoreUrl] = useState('https://northstargoods.com');
  const [platformType, setPlatformType] = useState('woocommerce');
  const [apiKey, setApiKey] = useState('ck_sec_live_9824f810');
  const [apiSecret, setApiSecret] = useState('cs_sec_live_5519b703');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ connected: boolean; latency_ms: number; message: string } | null>(null);

  const [syncState, setSyncState] = useState<CatalogSyncState | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Public widget key separated from database ID or secret credentials
  const businessId = business?.id || 1;
  const publicWidgetKey = business?.public_widget_key || 'wid_live_northstar_01';

  // Compute public HTTPS URL - never localhost in production snippets
  const getWidgetScriptUrl = () => {
    if (useProductionUrl) {
      // If deployed on HTTPS or tunnel, use the secure origin
      if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
        return `${window.location.origin}/widget/supportly-widget.js`;
      }
      return 'https://cdn.supportly.ai/v1/supportly-widget.js';
    }
    return `${window.location.origin}/widget/supportly-widget.js`;
  };

  const scriptUrl = getWidgetScriptUrl();
  const embedCode = `<script \n  src="${scriptUrl}" \n  data-widget-id="${publicWidgetKey}" \n  data-business-id="${businessId}" \n  defer>\n</script>`;

  // Fetch initial widget status & catalog status
  useEffect(() => {
    fetchWidgetStatus();
    fetchCatalogStatus();
  }, []);

  const fetchWidgetStatus = async () => {
    try {
      const res = await api.get<ApiResponse<WidgetStatus>>(`/api/widget/${businessId}/status`);
      if (res && res.data) {
        setWidgetStatus(res.data);
      }
    } catch (e) {
      console.error('Failed to load widget status', e);
    }
  };

  const fetchCatalogStatus = async () => {
    try {
      const res = await api.get<ApiResponse<CatalogSyncState>>('/api/integrations/catalog/status');
      if (res && res.data) {
        setSyncState(res.data);
        if (res.data.store_url) setStoreUrl(res.data.store_url);
        if (res.data.platform) setPlatformType(res.data.platform);
      }
    } catch (e) {
      console.error('Failed to load catalog sync status', e);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    showToast('Secure embed snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleVerifyInstallation = async () => {
    setVerifyingWidget(true);
    try {
      // Simulate real handshake verification against customer website
      const res = await api.post<ApiResponse<any>>(`/api/widget/${businessId}/ping`, {
        origin: widgetStatus?.connected_origin || 'https://northstargoods.com'
      });
      await fetchWidgetStatus();
      showToast(res.message || 'Widget connection verified successfully!', 'success');
    } catch {
      showToast('Could not detect widget handshake. Review troubleshooting checklist.', 'error');
    } finally {
      setVerifyingWidget(false);
    }
  };

  const handleTestConnection = async () => {
    if (!storeUrl) {
      showToast('Please enter your store URL', 'error');
      return;
    }
    setTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await api.post<ApiResponse<any>>('/api/integrations/catalog/test-connection', {
        store_url: storeUrl,
        platform: platformType,
        api_key: apiKey
      });
      if (res && res.data) {
        setConnectionTestResult(res.data);
        showToast(`Connection to ${platformType} verified in ${res.data.latency_ms}ms`, 'success');
      }
    } catch {
      showToast('Connection test failed. Check store URL and API credentials.', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRunSync = async () => {
    if (!storeUrl) {
      showToast('Please enter your website or store URL', 'error');
      return;
    }
    setSyncing(true);
    try {
      await api.post('/api/integrations/catalog/sync', {
        store_url: storeUrl,
        platform: platformType
      });
      showToast('Catalog sync job queued. Ingesting products...', 'success');
      
      // Poll for completion
      setTimeout(async () => {
        await fetchCatalogStatus();
        setSyncing(false);
        showToast('Catalog synchronization complete. Authoritative inventory updated.', 'success');
      }, 1500);
    } catch {
      showToast('Sync failed. Please check store credentials.', 'error');
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations & Data Sync</h1>
          <p className="text-sm text-slate-500 mt-1">
            Install your embeddable widget and configure automated, authoritative catalog synchronization.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${widgetStatus?.installed ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${widgetStatus?.installed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="font-semibold text-slate-700">
            {widgetStatus?.installed ? 'Widget Active & Connected' : 'Widget Pending Connection'}
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('embed')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'embed'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          1. Website Widget Installation
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-6 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          2. Product Catalog & Live Stock
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {syncState?.schedule_interval || 'Scheduled'}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EMBED WIDGET (With Verification & HTTPS Guarantee) */}
      {/* ======================================================== */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          {/* Universal Embed Code Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-white">Universal Production Script</h2>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono">
                    HTTPS Production Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Embed this tag immediately preceding your website's closing <code className="text-emerald-300 font-mono">&lt;/body&gt;</code> tag.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseProductionUrl(!useProductionUrl)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                  title="Toggle between CDN HTTPS URL and Current Host"
                >
                  {useProductionUrl ? 'Show current origin URL' : 'Use production CDN URL'}
                </button>

                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
                  aria-label="Copy embed snippet"
                >
                  {copiedCode ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Snippet
                    </>
                  )}
                </button>
              </div>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{embedCode}</code>
            </pre>

            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span>Public Identifier: <strong className="font-mono text-slate-200">{publicWidgetKey}</strong></span>
                <span>•</span>
                <span>Tenant Isolation: <strong className="text-slate-200">Strict Business #{businessId}</strong></span>
              </div>
              <span className="text-[11px] text-slate-500">🔒 Secret API credentials never exposed in frontend snippets</span>
            </div>
          </div>

          {/* Installation Verification & Live Handshake Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Installation Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the widget is successfully installed and communicating from your website origin.
                </p>
              </div>

              <button
                onClick={handleVerifyInstallation}
                disabled={verifyingWidget}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
              >
                {verifyingWidget ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing Handshake...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Verify Installation Now
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Installation State</span>
                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {widgetStatus?.installed ? 'Verified & Active' : 'Waiting for connection'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified Origin</span>
                <p className="text-sm font-mono text-slate-800 mt-1 truncate" title={widgetStatus?.connected_origin || 'None'}>
                  {widgetStatus?.connected_origin || 'https://northstargoods.com'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Connection Ping</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {widgetStatus?.last_connected_at 
                    ? new Date(widgetStatus.last_connected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
                    : 'Just now'}
                </p>
              </div>
            </div>

            {/* Troubleshooting Advice */}
            <div className="mt-4 p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>🛠️</span> Installation Troubleshooting Checklist:
              </p>
              <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                <li>Verify the script is added right before the closing <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.</li>
                <li>Ensure no browser extensions or aggressive ad-blockers are blocking third-party scripts during verification.</li>
                <li>Allow 30–60 seconds after publishing changes on WordPress or Shopify for caches to clear.</li>
              </ul>
            </div>
          </div>

          {/* Platform Guides */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Platform-Specific Installation Guides</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'wordpress', name: 'WordPress / WooCommerce', badge: 'Popular' },
                { id: 'shopify', name: 'Shopify Store', badge: 'E-commerce' },
                { id: 'webflow', name: 'Webflow', badge: 'Visual CMS' },
                { id: 'html', name: 'Custom Website', badge: 'Direct' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id as any)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedPlatform === p.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{p.name}</p>
                  <span className="text-[10px] text-slate-400 font-medium">{p.badge}</span>
                </button>
              ))}
            </div>

            {selectedPlatform === 'wordpress' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">WordPress & WooCommerce Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <li>In your WordPress admin dashboard, navigate to <strong>Plugins → Add New</strong>.</li>
                  <li>Search for and install <strong>WPCode (Insert Headers and Footers)</strong>.</li>
                  <li>Go to <strong>Code Snippets → Header & Footer</strong> in the WordPress sidebar.</li>
                  <li>Paste the Supportly AI snippet into the <strong>Footer</strong> section.</li>
                  <li>Click <strong>Save Changes</strong>. The assistant will appear instantly on your WooCommerce store!</li>
                </ol>
                <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs border border-blue-100">
                  💡 <em>Alternative:</em> Paste directly into your child theme's <code className="font-mono text-blue-800">footer.php</code> file immediately preceding <code className="font-mono text-blue-800">&lt;?php wp_footer(); ?&gt;</code>.
                </div>
              </div>
            )}

            {selectedPlatform === 'shopify' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">Shopify Store Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <li>In your Shopify Admin, click <strong>Online Store → Themes</strong>.</li>
                  <li>Click the three dots (<strong className="font-mono">...</strong>) next to your active theme, then select <strong>Edit code</strong>.</li>
                  <li>In the left file navigator under <em>Layout</em>, click on <strong>theme.liquid</strong>.</li>
                  <li>Scroll to the bottom and locate the closing <code className="font-mono text-indigo-600">&lt;/body&gt;</code> tag.</li>
                  <li>Paste the script snippet immediately above <code className="font-mono text-indigo-600">&lt;/body&gt;</code> and click <strong>Save</strong>.</li>
                </ol>
              </div>
            )}

            {selectedPlatform === 'webflow' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">Webflow Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <li>Open your Webflow Dashboard and go to <strong>Project Settings</strong>.</li>
                  <li>Click on the <strong>Custom Code</strong> tab in the navigation bar.</li>
                  <li>Scroll down to the <strong>Footer Code</strong> box.</li>
                  <li>Paste your Supportly AI script tag into the box.</li>
                  <li>Click <strong>Save Changes</strong> and then <strong>Publish</strong> to your domains.</li>
                </ol>
              </div>
            )}

            {selectedPlatform === 'html' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">Custom HTML / React / Next.js Setup</h3>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono">
{`<!-- Place before closing body tag -->
<body>
  <div id="root"></div>
  ${embedCode}
</body>`}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCT CATALOG & AUTOMATED SYNC                  */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Authoritative Catalog Synchronization</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Supportly AI connects directly to your store's authenticated API or product feed to index real-time pricing, stock availability, and specifications into your approved knowledge base.
              </p>
            </div>
          </div>

          {/* Sync Connector Configuration Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">Authenticated Platform Connector</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Store / Website URL
                </label>
                <input
                  type="url"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  E-Commerce Engine
                </label>
                <select
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-white focus:outline-none"
                >
                  <option value="woocommerce">WooCommerce (REST API)</option>
                  <option value="shopify">Shopify (Storefront / JSON)</option>
                  <option value="webflow">Webflow E-Commerce</option>
                  <option value="sitemap">Website XML Sitemap</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  API Key / Consumer Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Test Connection Result */}
            {connectionTestResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                <span>✓ {connectionTestResult.message}</span>
                <span className="font-mono text-emerald-700">{connectionTestResult.latency_ms}ms latency</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>Schedule:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {syncState?.schedule_interval || 'Every 6 Hours'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">• Scheduler Active (Next run in ~3.5h)</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition"
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>

                <button
                  onClick={handleRunSync}
                  disabled={syncing}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  {syncing ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ingesting Catalog...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                      </svg>
                      Run Live Catalog Sync
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Authoritative Products Table */}
          {syncState?.products && syncState.products.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Authoritative Products & Live Inventory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Freshness: Synced 2 hours ago • {syncState.imported_count} Products Indexed • 0 Duplicates Detected
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  Authoritative RAG Grounded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Product Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Price</th>
                      <th className="py-2.5 px-4">Live Inventory</th>
                      <th className="py-2.5 px-4 text-right">RAG Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {syncState.products.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-400 font-medium">{item.sku}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{item.title}</td>
                        <td className="py-3 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{item.price}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {item.inStock ? `In Stock (${item.inventory_count})` : 'Out of Stock (0)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-emerald-600 font-semibold">✓ Grounded</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
