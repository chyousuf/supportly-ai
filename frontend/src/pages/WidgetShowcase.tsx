import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function WidgetShowcase() {
  const { showToast } = useToast();

  // Wizard state
  const [selectedPlatform, setSelectedPlatform] = useState<'wordpress' | 'shopify' | 'webflow' | 'html' | 'squarespace'>('shopify');
  const [storeName, setStoreName] = useState('My Awesome Store');
  const [brandColor, setBrandColor] = useState('#4f46e5');
  const [position, setPosition] = useState<'right' | 'left'>('right');
  const [copied, setCopied] = useState(false);

  // Interactive Live Chat preview state
  const [chatOpen, setChatOpen] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'customer' | 'assistant'; text: string; source?: string }>>([
    {
      role: 'assistant',
      text: "👋 Hi there! I'm your AI support assistant. I can answer questions about shipping, returns, product specs, and warranties using verified store content. Ask me anything!"
    },
    {
      role: 'customer',
      text: "How long does standard delivery take?"
    },
    {
      role: 'assistant',
      text: "Standard delivery takes 3–5 business days within the continental US. Orders over $50 qualify for free shipping! 📦",
      source: "Shipping Policy"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const embedScript = `<!-- Supportly AI Chatbot Widget -->\n<script \n  src="http://localhost:8000/widget/supportly-widget.js" \n  data-business-id="1"\n  data-brand-color="${brandColor}"\n  data-position="${position}">\n</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    showToast('Embed script copied to clipboard! Paste it before </body>.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: 'customer', text: userText }]);
    setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I checked our store knowledge base, but couldn't find specific details on that. Would you like me to connect you with a human agent?";
      let src = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes('return') || lower.includes('refund')) {
        reply = "We offer a 30-day return policy for all unused items in their original packaging. Refunds are processed within 5–7 business days.";
        src = "Return Policy";
      } else if (lower.includes('ship') || lower.includes('delivery')) {
        reply = "Orders placed before 2 PM EST ship the same day! Standard delivery takes 3–5 business days, and Express is 1–2 business days.";
        src = "Shipping Policy";
      } else if (lower.includes('bag') || lower.includes('laptop')) {
        reply = "Our Heritage Canvas Laptop Bag ($89.00) fits laptops up to 15 inches, features padded sleeves, and comes with a Lifetime Warranty!";
        src = "Product Catalog";
      } else if (lower.includes('person') || lower.includes('human') || lower.includes('agent')) {
        reply = "Certainly! I've flagged this conversation for our support desk. An agent is reviewing your inquiry now.";
        src = "Support Desk";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply, source: src }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Supportly <span className="text-indigo-600">AI</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block">
              Dashboard
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition"
            >
              Open Console
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Embeddable Chatbot Showcase & 30-Second Setup
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Turn your store into an <span className="text-indigo-600">AI-powered sales & support</span> engine.
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Answer customer questions 24/7, recommend in-stock products with live prices, and escalate to human staff when needed. Installs on any website in seconds.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="#quick-setup"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
              >
                <span>⚡ Setup on Your Site in 30s</span>
              </a>
              <a
                href="#live-preview"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm sm:text-base rounded-xl transition"
              >
                Try Interactive Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Killer Features Grid */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why E-Commerce Stores Love Supportly AI</h2>
            <p className="text-slate-500 text-sm mt-2">Built specifically for WooCommerce, Shopify, Webflow, and custom websites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🛡️',
                title: 'Strict Knowledge Grounding',
                desc: 'Zero hallucinated policies or made-up prices. The assistant only answers using your approved website content and store policies.'
              },
              {
                icon: '🛍️',
                title: 'Live Product Discovery & Stock',
                desc: 'Automatically checks product inventory, sizes, and pricing. Recommends the right items directly in the chat bubble.'
              },
              {
                icon: '🤝',
                title: 'Instant Human Takeover',
                desc: 'When a customer needs special attention, human agents can take over the conversation seamlessly in the Inbox.'
              },
              {
                icon: '🌐',
                title: '95+ Language Translation',
                desc: 'Speaks fluently with international shoppers in their native language while grounding answers in your English policies.'
              },
              {
                icon: '⚡',
                title: 'Zero-Lag Core Web Vitals',
                desc: 'Under 15KB lightweight footprint. Loads asynchronously with zero impact on your store’s Google SEO or page speed scores.'
              },
              {
                icon: '📊',
                title: 'Unanswered Question Insights',
                desc: 'Tracks every question the AI could not answer so you can discover product gaps and improve your content.'
              }
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive 30-Second Setup Wizard & Live Preview */}
      <section id="quick-setup" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              Interactive Setup Wizard
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Configure & Install in Under 30 Seconds
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Select your platform, pick your brand colors, and copy your instant tag.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Step by step configuration */}
            <div className="lg:col-span-7 space-y-6">
              {/* STEP 1: Platform Selection */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="text-base font-bold text-slate-900">Select Your Website Platform</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    { id: 'shopify', name: 'Shopify', icon: '🛍️' },
                    { id: 'wordpress', name: 'WooCommerce / WP', icon: '🌐' },
                    { id: 'webflow', name: 'Webflow', icon: '📐' },
                    { id: 'squarespace', name: 'Squarespace', icon: '⬛' },
                    { id: 'html', name: 'Custom HTML / React', icon: '💻' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id as any)}
                      className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        selectedPlatform === p.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-sm ring-1 ring-indigo-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs font-bold">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 2: Branding & Customization */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="text-base font-bold text-slate-900">Personalize Your Assistant</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Store / Business Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Widget Position
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPosition('right')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          position === 'right' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Bottom Right
                      </button>
                      <button
                        onClick={() => setPosition('left')}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                          position === 'left' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Bottom Left
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Brand Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    {['#4f46e5', '#059669', '#7c3aed', '#e11d48', '#0f172a', '#d97706'].map(color => (
                      <button
                        key={color}
                        onClick={() => setBrandColor(color)}
                        className={`w-8 h-8 rounded-full transition shadow-sm ${brandColor === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-500 uppercase">{brandColor}</span>
                  </div>
                </div>
              </div>

              {/* STEP 3: Instant Embed Snippet */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold flex items-center justify-center">3</span>
                    <h3 className="text-base font-bold text-white">Copy & Paste Your 1-Line Embed Tag</h3>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow"
                  >
                    {copied ? '✓ Copied to Clipboard!' : '📋 Copy Script Tag'}
                  </button>
                </div>

                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-green-400 text-xs font-mono overflow-x-auto leading-relaxed">
                  <code>{embedScript}</code>
                </pre>

                {/* Platform Specific Quick Instructions */}
                <div className="pt-2 text-xs text-slate-400 space-y-1">
                  {selectedPlatform === 'shopify' && (
                    <p>📍 <strong>Shopify Instructions:</strong> Online Store → Themes → Edit code → Open <code className="text-green-300 font-mono">theme.liquid</code> → Paste right before <code className="text-green-300 font-mono">&lt;/body&gt;</code>.</p>
                  )}
                  {selectedPlatform === 'wordpress' && (
                    <p>📍 <strong>WordPress Instructions:</strong> Plugins → Install <em>WPCode</em> → Header & Footer → Paste into <strong>Footer</strong> box → Save.</p>
                  )}
                  {selectedPlatform === 'webflow' && (
                    <p>📍 <strong>Webflow Instructions:</strong> Project Settings → Custom Code → Paste inside <strong>Footer Code</strong> box → Publish.</p>
                  )}
                  {selectedPlatform === 'squarespace' && (
                    <p>📍 <strong>Squarespace Instructions:</strong> Settings → Advanced → Code Injection → Paste in <strong>Footer</strong> → Save.</p>
                  )}
                  {selectedPlatform === 'html' && (
                    <p>📍 <strong>Custom HTML Instructions:</strong> Paste inside your root template right before <code className="text-green-300 font-mono">&lt;/body&gt;</code>.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Live Interactive Chatbot Preview */}
            <div id="live-preview" className="lg:col-span-5 sticky top-24">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Chat Header */}
                <div 
                  className="p-4 text-white flex justify-between items-center transition-colors"
                  style={{ backgroundColor: brandColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                      {storeName.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold leading-tight">{storeName}</h4>
                      <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        AI Support Assistant
                      </p>
                    </div>
                  </div>

                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">
                    Live Demo
                  </span>
                </div>

                {/* Messages Body */}
                <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.role === 'customer' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] ${
                          m.role === 'customer'
                            ? 'text-white font-medium rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                        }`}
                        style={m.role === 'customer' ? { backgroundColor: brandColor } : {}}
                      >
                        {m.text}
                      </div>

                      {m.source && (
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          📋 Verified from: <strong className="text-slate-600">{m.source}</strong>
                        </span>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>

                {/* Suggested Prompt Chips */}
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
                  {[
                    "What's your return policy?",
                    "How long does shipping take?",
                    "Heritage Canvas Laptop Bag specs"
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setInputMsg(chip); }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-full transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type a test question..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 text-white font-bold text-xs rounded-xl transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    Send
                  </button>
                </form>
              </div>

              {/* Floating trigger badge */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>💡 Position setting: <strong className="uppercase">{position}</strong> side of website</span>
                <span className="font-mono text-[10px] text-amber-700">ESC closes widget</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Ready to deploy Supportly AI on your store?</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Get started in 30 seconds. No credit card required. Grounded answers, 24/7 coverage.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition"
            >
              Create Free Store Account
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-xs text-slate-600 pt-6">© 2026 Supportly AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
