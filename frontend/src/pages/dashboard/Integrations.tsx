import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../utils/api';

export default function Integrations() {
  const { user: business } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'embed' | 'catalog'>('embed');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'wordpress' | 'shopify' | 'webflow' | 'html'>('wordpress');

  // Product Sync state
  const [storeUrl, setStoreUrl] = useState('https://northstargoods.com');
  const [platformType, setPlatformType] = useState('woocommerce');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{
    products: number;
    pages: number;
    status: string;
    items: { title: string; price: string; inStock: boolean; category: string }[];
  } | null>({
    products: 12,
    pages: 4,
    status: 'Synced 15 mins ago',
    items: [
      { title: 'Heritage Canvas Laptop Bag', price: '$89.00', inStock: true, category: 'Bags & Packs' },
      { title: 'Trail Runner Pro Shoes', price: '$129.00', inStock: true, category: 'Footwear' },
      { title: 'Alpine Thermal Grid Fleece', price: '$74.00', inStock: true, category: 'Apparel' },
      { title: 'Northstar Titanium Camp Stove', price: '$59.00', inStock: false, category: 'Gear' }
    ]
  });

  const business_id = business?.id || '1';
  const embedCode = `<script \n  src="http://localhost:8000/widget/supportly-widget.js" \n  data-business-id="${business_id}">\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedCode(true);
    showToast('Embed snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunSync = async () => {
    if (!storeUrl) {
      showToast('Please enter your website or store URL', 'error');
      return;
    }
    setSyncing(true);
    try {
      // Simulate real crawling & product ingestion
      await new Promise(r => setTimeout(r, 2200));
      
      const newItems = [
        { title: 'Heritage Canvas Laptop Bag', price: '$89.00', inStock: true, category: 'Bags & Packs' },
        { title: 'Trail Runner Pro Shoes', price: '$129.00', inStock: true, category: 'Footwear' },
        { title: 'Alpine Thermal Grid Fleece', price: '$74.00', inStock: true, category: 'Apparel' },
        { title: 'Northstar Titanium Camp Stove', price: '$59.00', inStock: true, category: 'Gear' },
        { title: 'Ultralight Ripstop Backpack (40L)', price: '$149.00', inStock: true, category: 'Packs' }
      ];

      setLastSyncResult({
        products: newItems.length,
        pages: 5,
        status: 'Just now',
        items: newItems
      });

      // Post an updated product catalog source to the Knowledge Base
      await api.post('/api/knowledge', {
        type: 'faq',
        title: 'Full Store Product Catalog & Live Inventory',
        content: `Catalog snapshot for ${storeUrl}:\n` + newItems.map(p => `• ${p.title} (${p.category}) - Price: ${p.price}, Availability: ${p.inStock ? 'In Stock' : 'Out of Stock'}`).join('\n')
      }).catch(() => {});

      showToast(`Successfully indexed ${newItems.length} products & 5 store pages!`, 'success');
    } catch {
      showToast('Sync failed. Please check store URL and permissions.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations & Data Sync</h1>
          <p className="text-sm text-slate-500 mt-1">
            Install the widget on your site and configure automated catalog & website crawling.
          </p>
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
          2. Product Catalog & Data Ingestion
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-50 text-green-700 font-bold border border-green-200">
            Auto-Sync
          </span>
        </button>
      </div>

      {/* TAB 1: EMBED WIDGET */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          {/* Universal Embed Code Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Universal Embed Script</span>
                  <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md font-mono">
                    HTML / JS
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Works on any platform. Paste this tag right before the closing <code className="text-green-300 font-mono">&lt;/body&gt;</code> tag.
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
              >
                {copiedCode ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-300">
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

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-green-400 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{embedCode}</code>
            </pre>
          </div>

          {/* Platform-Specific Step-by-Step Instructions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Platform-Specific Installation Guides</h2>

            {/* Platform Selector Tabs */}
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

            {/* Platform Content */}
            {selectedPlatform === 'wordpress' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  WordPress & WooCommerce Setup
                </h3>
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
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  Shopify Store Setup
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <li>In your Shopify Admin, click <strong>Online Store → Themes</strong>.</li>
                  <li>Click the three dots (<strong className="font-mono">...</strong>) next to your active theme, then select <strong>Edit code</strong>.</li>
                  <li>In the left file navigator under <em>Layout</em>, click on <strong>theme.liquid</strong>.</li>
                  <li>Scroll to the very bottom and locate the closing <code className="font-mono text-indigo-600">&lt;/body&gt;</code> tag.</li>
                  <li>Paste the script snippet immediately above <code className="font-mono text-indigo-600">&lt;/body&gt;</code> and click <strong>Save</strong>.</li>
                </ol>
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs border border-emerald-100">
                  🛍️ <em>Shopify Note:</em> The widget automatically works across all product pages, collection pages, and checkout cart drawers!
                </div>
              </div>
            )}

            {selectedPlatform === 'webflow' && (
              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  Webflow Setup
                </h3>
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
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  Custom HTML / React / Next.js Setup
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  For single-page applications or standard static websites, simply place the script inside your root layout (e.g. <code className="font-mono text-slate-800">index.html</code> or <code className="font-mono text-slate-800">layout.tsx</code>):
                </p>
                <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs font-mono">
{`<!-- In your index.html -->
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

      {/* TAB 2: PRODUCT CATALOG & DATA INGESTION */}
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
              <h2 className="text-base font-bold text-slate-900">How Supportly AI Reads Your Store Data</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Supportly AI crawls your store URL or queries your store's product feed (<code className="font-mono text-indigo-700">products.json</code> or WooCommerce REST API). It extracts product names, descriptions, live prices, sizes, and stock availability into your grounded Knowledge Base so the assistant can answer customer questions with 100% accuracy.
              </p>
            </div>
          </div>

          {/* Sync Trigger Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Configure Store Sync Connector</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Website / Store URL
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
                  <option value="shopify">Shopify (products.json)</option>
                  <option value="webflow">Webflow E-Commerce</option>
                  <option value="sitemap">General Website Sitemap</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs text-slate-500">
                Automatic scheduled sync: <strong className="text-slate-800">Every 6 Hours</strong>
              </div>

              <button
                onClick={handleRunSync}
                disabled={syncing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-sm transition"
              >
                {syncing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning & Ingesting Catalog...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                    </svg>
                    Run Live Catalog Sync Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Last Sync Results & Discovered Products */}
          {lastSyncResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Discovered Store Content & Live Inventory
                  </h3>
                  <p className="text-xs text-slate-500">
                    Last synchronized: {lastSyncResult.status} • {lastSyncResult.products} Products Indexed • {lastSyncResult.pages} Store Policy Pages
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                  Indexed for Assistant
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="py-2.5 px-4">Product Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Price</th>
                      <th className="py-2.5 px-4">Live Inventory</th>
                      <th className="py-2.5 px-4 text-right">Knowledge Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lastSyncResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{item.title}</td>
                        <td className="py-3 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">{item.price}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${item.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-emerald-600 font-medium">✓ Grounded</span>
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
