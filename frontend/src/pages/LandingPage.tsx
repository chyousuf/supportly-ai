import React, { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import BackendShowcase from '../components/BackendShowcase';

// --- Helper Components ---

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, isInView] = useInView();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Simple Markdown Renderer for Chat
function MarkdownText({ text }: { text: string }) {
  const processText = (input: string) => {
    // Basic bold **text**
    let processed = input.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Split by newlines
    const lines = processed.split('\n');
    const result: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(<li key={`li-${i}`} dangerouslySetInnerHTML={{ __html: trimmed.replace(/^[•-]\s*/, '') }} />);
      } else if (/^\d+\./.test(trimmed)) {
        inList = true;
        listItems.push(<li key={`li-${i}`} className="list-decimal ml-4" dangerouslySetInnerHTML={{ __html: trimmed.replace(/^\d+\.\s*/, '') }} />);
      } else {
        if (inList) {
          result.push(<ul key={`ul-${i}`} className="space-y-1 my-2 ml-4 list-disc">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        if (trimmed === '') {
          result.push(<div key={`br-${i}`} className="h-2" />);
        } else {
          result.push(<span key={`p-${i}`} dangerouslySetInnerHTML={{ __html: trimmed }} />);
          result.push(<br key={`br2-${i}`} />);
        }
      }
    });

    if (inList) {
      result.push(<ul key={`ul-end`} className="space-y-1 my-2 ml-4 list-disc">{listItems}</ul>);
    }

    return <>{result}</>;
  };

  return <div className="text-sm leading-relaxed">{processText(text)}</div>;
}

// --- Icons ---
const LogoIcon = () => (
  <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01M12 10h.01M16 10h.01" />
  </svg>
);

const WPIcon = () => (
  <svg className="w-6 h-6 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12.158 12.786l-2.698 7.84c.806.236 1.657.365 2.54.365 1.047 0 2.05-.18 2.986-.51-.024-.037-.046-.078-.071-.111l-2.757-7.584z"/><path d="M20.692 10.626c0 1.602-.53 2.768-1.06 3.651l-3.214 8.76C19.758 21.144 22 16.828 22 12c0-1.742-.44-3.385-1.206-4.832-.06.442-.102.94-.102 1.458z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 2.395.84 4.593 2.246 6.305l3.864-11.233c-.156-.25-.32-.663-.32-1.127 0-.74.53-1.22 1.13-1.22.42 0 .848.204 1.143.722L12 12l2.39-6.936c.27-.757.513-.918 1.042-.918.423 0 .847.19.847.78 0 .19-.04.42-.11.66l-3.38 9.58-.02.043 2.454 6.772C18.17 20.354 20.692 18.064 20.692 15c0-1.205-.18-2.355-.515-3.43L16.29 20.177l3.66-9.742c.32-1.076.742-2.19.742-3.342 0-2.31-1.396-3.882-3.268-3.882-1.34 0-2.368.74-3.093 1.96L12 8.765 9.68 2.505C8.835 1.765 7.6 1.258 6.257 1.258c-.027 0-.056.002-.084.002C8.017.5 9.94 0 12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12C5.373 24 0 18.627 0 12S5.373 0 12 0h.158z"/></svg>
);

const WooIcon = () => (
  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.84-12.705l-2.07 8.083H5.975l1.637-6.096-1.554-1.987H8.25l.898 1.487.653-2.613L8.1 6.55h2.155l1.042 1.83.997-1.83h2.164l-1.687 2.656.666 2.632.906-1.505h2.203l-1.564 2.005 1.638 6.096h-2.127l-2.062-8.083-1.282 3.864h-2.05l-1.3-3.864z"/></svg>
);

const ShopifyIcon = () => (
  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M19.123 5.485c-.015-.153-.135-.276-.288-.29-2.083-.197-3.95-1.203-5.263-2.834-.09-.112-.25-.138-.372-.06-.118.077-.152.23-.075.348 1.157 1.77 2.727 2.875 4.545 3.25-.11.517-.184 1.05-.218 1.597H8.558c-.035-.55-.108-1.082-.22-1.6-1.782-.376-3.328-1.468-4.47-3.21-.078-.118-.236-.15-.353-.073-.122.08-.146.242-.055.353 1.258 1.543 3.02 2.518 4.982 2.756-.145.023-.25.138-.272.284l-.872 8.783c-.027.272.086.536.3.696.216.16.505.21.765.127l3.35-1.058c.245-.078.508-.078.753 0l6.326 1.996c.152.048.318.037.462-.032.146-.068.256-.192.306-.345l1.636-8.73c.032-.175.006-.356-.073-.505s-.208-.246-.385-.262l-1.616-.14zM12 18.093l-3.89-1.226c-.34-.108-.707-.108-1.047 0l-2.036.643.712-7.16h12.51l-1.393 7.42-4.856-1.532c-.365-.116-.763-.116-1.127 0zm1.758-15.65c-1.327 1.688-3.242 2.748-5.38 2.963.2-.84.502-1.64.887-2.383C10.155 1.18 11.16.035 12 0c.84.035 1.845 1.18 2.735 3.022.384.744.686 1.545.886 2.384-2.14-.216-4.053-1.275-5.38-2.963z"/></svg>
);

const WebflowIcon = () => (
  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 6v12h-3v-6.94l-3 7.74h-2.18l-1.59-4.2-1.59 4.2H10.46l-3-7.74V18H4V6h2.7l1.76 4.74L10.22 6h2.8l1.76 4.74L16.54 6H24zm-6.24 9.07l1.1-2.92v2.92h-1.1zm-8.8 0H7.86v-2.92l1.1 2.92z"/></svg>
);

// --- Demo Data & Logic ---

const demoResponses: Record<string, { answer: string; source?: string }> = {
  'return': {
    answer: "We offer a hassle-free **30-day return policy** on all items. Products must be:\n\n• Unused and in original packaging\n• Accompanied by a receipt\n\nOnce we receive your return, refunds are processed within **5–7 business days** to your original payment method. Sale items can be exchanged for store credit.\n\nTo initiate a return, visit our Returns Center or contact support.",
    source: 'Return Policy'
  },
  'ship': {
    answer: "We offer several shipping options:\n\n• **Standard Shipping**: 3–5 business days (FREE on orders over $50)\n• **Express Shipping**: 1–2 business days ($12.99)\n• **International**: 7–14 business days (rates vary)\n\nAll orders include tracking information sent to your email. Orders placed before 2 PM EST ship same day.",
    source: 'Shipping Policy'
  },
  'laptop bag': {
    answer: "Great choice! I'd recommend our **Heritage Canvas Laptop Bag** ($89.00) — one of our most popular items!\n\n**Features:**\n• Premium waxed canvas with leather accents\n• Fits laptops up to 15\"\n• Padded interior compartment\n• Multiple organizer pockets\n• Adjustable shoulder strap\n\nAvailable in Olive, Navy, and Charcoal. Covered by our **Lifetime Heritage Warranty**.\n\nWould you like to know more about sizing or materials?",
    source: 'Product Catalog'
  },
  'speak': {
    answer: "Of course! I can connect you with our support team.\n\n**Availability:** Monday–Friday, 9 AM – 6 PM EST\n**Email:** support@northstargoods.com\n**Phone:** (555) 123-4567\n\nTo get you to the right person, could you briefly describe what you need help with?",
    source: undefined
  },
  'warranty': {
    answer: "All Northstar Goods products come with a **1-year standard warranty** against manufacturing defects. Our Heritage Collection items are covered by a **Lifetime Heritage Warranty**.\n\nWarranty claims can be submitted through your account or by contacting support.",
    source: 'Warranty Policy'
  },
  'payment': {
    answer: "We accept the following payment methods:\n\n• Visa, Mastercard, American Express, Discover\n• PayPal, Apple Pay, Google Pay\n• **Afterpay** — split into 4 interest-free payments ($35–$1,000 orders)\n\nAll transactions are secured with 256-bit SSL encryption.",
    source: 'Payment Info'
  },
  'track': {
    answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order by:\n\n1. Logging into your account\n2. Visiting 'Order History'\n3. Clicking the tracking link\n\nIf tracking hasn't updated in 48 hours, please contact our support team.",
    source: 'Order Tracking'
  },
  'gift': {
    answer: "Northstar Goods gift cards are available in **$25, $50, $100, and $200** denominations.\n\n• Delivered via email\n• Never expire\n• Usable on any product, including sale items\n• Cannot be returned or exchanged for cash",
    source: 'Gift Cards'
  },
  'trail': {
    answer: "The **Trail Runner Pro** ($129.00) is a fantastic choice for trail running!\n\n**Features:**\n• Vibram outsole for superior grip\n• Breathable mesh upper\n• Reinforced toe cap\n• Responsive cushioning\n• Weight: 10.2 oz\n\nAvailable in men's 7-13 and women's 5-11.",
    source: 'Product Catalog'
  },
  'contact': {
    answer: "You can reach our support team through:\n\n• **Live Chat**: Right here!\n• **Email**: support@northstargoods.com\n• **Phone**: (555) 123-4567\n\n**Hours:** Monday–Friday, 9 AM – 6 PM EST\nResponse times are typically under 2 hours during business hours.",
    source: 'Contact Info'
  },
  'size': {
    answer: "Our apparel follows **standard US sizing**. For the best fit:\n\n1. Measure your chest, waist, and hips\n2. Compare to the size chart on each product page\n3. If between sizes, we recommend sizing up\n\nEach product page includes specific measurements and fit notes.",
    source: 'Size Guide'
  }
};

type Message = {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  source?: string;
  isTyping?: boolean;
};

// --- Main Page Component ---
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi there! 👋 Welcome to Northstar Goods. I can help you with questions about our products, shipping, returns, and more. What can I help you with today?"
    }
  ]);
  const [demoInput, setDemoInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Hero Chat State
  const [heroMessages, setHeroMessages] = useState<Message[]>([]);
  const heroChatRef = useRef<HTMLDivElement>(null);

  // FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle demo chat submit
  const handleDemoSubmit = (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const text = textOverride || demoInput.trim();
    if (!text) return;

    setShowSuggestions(false);
    setDemoInput('');

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    const typingMsg: Message = { id: Date.now().toString() + '-typ', sender: 'assistant', text: '', isTyping: true };
    
    setChatMessages(prev => [...prev, userMsg, typingMsg]);

    setTimeout(() => {
      let matchedResponse = "I don't have specific information about that in my knowledge base. Would you like me to connect you with a team member who can help?";
      let matchedSource = undefined;
      const lowerText = text.toLowerCase();

      for (const [key, val] of Object.entries(demoResponses)) {
        if (lowerText.includes(key)) {
          matchedResponse = val.answer;
          matchedSource = val.source;
          break;
        }
      }

      setChatMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: Date.now().toString() + '-ans', sender: 'assistant', text: matchedResponse, source: matchedSource }
      ]);
    }, 1200);
  };

  // Scroll demo chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Hero Chat Animation Sequence
  useEffect(() => {
    const sequence = async () => {
      // Clear
      setHeroMessages([]);
      
      await new Promise(r => setTimeout(r, 800));
      setHeroMessages([{ id: 'h1', sender: 'assistant', text: 'Hi there! 👋 How can I help you today?' }]);
      
      await new Promise(r => setTimeout(r, 1500));
      setHeroMessages(prev => [...prev, { id: 'h2', sender: 'user', text: 'How long does shipping take?' }]);
      
      await new Promise(r => setTimeout(r, 500));
      setHeroMessages(prev => [...prev, { id: 'h3', sender: 'assistant', text: '', isTyping: true }]);
      
      await new Promise(r => setTimeout(r, 1500));
      setHeroMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { 
          id: 'h4', 
          sender: 'assistant', 
          text: 'Our standard shipping takes 3–5 business days within the US. Orders over $50 qualify for free shipping! 📦',
          source: 'Shipping Policy'
        }
      ]);
    };
    sequence();
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      
      {/* === SECTION 1: NAVIGATION BAR === */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-lg bg-white/80 border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <LogoIcon />
              <span className="font-bold text-xl text-slate-900 tracking-tight">Supportly<span className="text-indigo-600">AI</span></span>
            </div>

            {/* Center (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo('features')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">How It Works</button>
              <button onClick={() => scrollTo('integrations')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Integrations</button>
              <button onClick={() => scrollTo('backend')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Backend</button>
              <button onClick={() => scrollTo('pricing')} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</button>
              <Link to="/showcase" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">
                <span>⚡ 30s Setup</span>
              </Link>
            </div>

            {/* Right */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Sign In</Link>
              <button onClick={() => scrollTo('demo')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                Try Live Demo
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900 p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg absolute w-full left-0">
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              <button onClick={() => scrollTo('features')} className="text-left text-slate-600 font-medium py-2">Features</button>
              <button onClick={() => scrollTo('how-it-works')} className="text-left text-slate-600 font-medium py-2">How It Works</button>
              <button onClick={() => scrollTo('integrations')} className="text-left text-slate-600 font-medium py-2">Integrations</button>
              <button onClick={() => scrollTo('pricing')} className="text-left text-slate-600 font-medium py-2">Pricing</button>
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
                <Link to="/login" className="text-center text-slate-600 font-medium py-2 w-full">Sign In</Link>
                <button onClick={() => scrollTo('demo')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-medium">
                  Try Live Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* === SECTION 2: HERO === */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center py-20 lg:py-32 pt-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column */}
            <div className="space-y-8 z-10 relative">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 shadow-sm">
                ✨ AI-Powered Customer Support
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Helpful answers.<br/>
                Happier customers.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Around the clock.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 max-w-lg leading-relaxed">
                Turn your website content into an AI support assistant that answers customer questions and brings your team in when needed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={() => scrollTo('demo')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]">
                  Try Live Demo
                </button>
                <button onClick={() => scrollTo('features')} className="bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
                  Explore Features
                </button>
              </div>
              
              <div className="pt-6 flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-500">Built for</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 border border-slate-200/60">WordPress</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 border border-slate-200/60">WooCommerce</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 border border-slate-200/60">Shopify</span>
                <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 border border-slate-200/60">Webflow</span>
              </div>
            </div>

            {/* Right Column: Interactive Chat Preview */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Decorative blobs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-400/15 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

              {/* Chat Card */}
              <div className="relative w-full max-w-sm mx-auto motion-safe:animate-[float_6s_ease-in-out_infinite] z-10">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                  
                  {/* Browser chrome */}
                  <div className="h-10 bg-slate-100 border-b flex items-center px-4">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-4 flex-1 h-6 bg-white rounded-md flex items-center px-3 text-xs text-slate-400 truncate shadow-inner">
                      northstargoods.com/support
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="px-5 py-4 border-b bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-white font-bold shadow-inner">
                      N
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">Northstar Goods</div>
                      <div className="flex items-center gap-1.5 text-indigo-200 text-xs mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                        AI Assistant
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="p-5 space-y-4 bg-slate-50 min-h-[300px] flex flex-col justify-end" ref={heroChatRef}>
                    <div className="text-center"><span className="text-xs font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">Today</span></div>
                    
                    {heroMessages.map((msg, i) => (
                      <div key={msg.id} className={`flex flex-col animate-[fadeInUp_0.4s_ease-out_forwards] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.isTyping ? (
                          <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm border border-slate-200 flex gap-1 items-center h-[52px]">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]"></div>
                          </div>
                        ) : (
                          <>
                            <div className={`p-3.5 max-w-[85%] text-sm ${
                              msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md' 
                                : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200 leading-relaxed'
                            }`}>
                              {msg.text}
                            </div>
                            {msg.source && (
                              <div className="mt-1.5 inline-flex bg-indigo-50 text-indigo-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-indigo-100">
                                📋 {msg.source}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input bar */}
                  <div className="px-4 py-3 border-t bg-white flex items-center gap-2">
                    <div className="flex-1 text-sm text-slate-400 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                      Type your message...
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 translate-x-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION 3: INTEGRATION STRIP === */}
      <section id="integrations" className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-8">Works with your favorite platforms</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-20">
            <div className="flex items-center gap-3 text-slate-600 font-medium grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <WPIcon />
              <span className="text-lg">WordPress</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <WooIcon />
              <span className="text-lg">WooCommerce</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <ShopifyIcon />
              <span className="text-lg">Shopify</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100">
              <WebflowIcon />
              <span className="text-lg">Webflow</span>
            </div>
          </div>
          <p className="mt-8 text-xs text-slate-400 font-medium">Supported integration targets. Custom API coming soon.</p>
        </div>
      </section>

      {/* === SECTION 4: FEATURES === */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Everything you need to<br/>support your customers
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Powerful features that make AI-powered support feel natural, helpful, and deeply integrated with your brand.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <AnimatedSection delay={100} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Content-Grounded Answers</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">Your assistant only uses information from your approved knowledge base — FAQs, policies, and product details. No hallucinated answers.</p>
            </AnimatedSection>

            <AnimatedSection delay={200} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-violet-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Product Discovery</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">Help customers find the right products with intelligent recommendations based on your actual catalog and descriptions.</p>
            </AnimatedSection>

            <AnimatedSection delay={300} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-cyan-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Human Handoff</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">When the AI can't help or a customer asks, seamlessly transfer to your support team with full conversation context.</p>
            </AnimatedSection>

            <AnimatedSection delay={400} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Multilingual Support</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">Communicate with customers in their preferred language. The assistant instantly adapts to the language of each conversation.</p>
            </AnimatedSection>

            <AnimatedSection delay={500} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-amber-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Customizable Widget</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">Match your brand perfectly. Customize colors, position, welcome messages, avatars, and suggested questions.</p>
            </AnimatedSection>

            <AnimatedSection delay={600} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg hover:border-rose-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mt-6">Conversation Insights</h3>
              <p className="text-slate-600 mt-2 leading-relaxed">Track what customers ask, identify knowledge gaps on your site, and measure satisfaction with built-in analytics.</p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* === SECTION 5: HOW IT WORKS === */}
      <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Up and running in minutes</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">No coding required. Just point us to your content and we'll handle the rest.</p>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting line desktop */}
            <div className="hidden lg:block absolute top-24 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 w-1/3 animate-[slideRight_3s_linear_infinite]" />
            </div>

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
              
              {/* Step 1 */}
              <AnimatedSection delay={100} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 border-4 border-slate-50">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Add Your Content</h3>
                <p className="text-slate-600 mb-8 max-w-sm">Import your FAQs, policies, and product information. Paste URLs or upload documents.</p>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full max-w-xs text-left space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">📄 Return Policy</span>
                    <span className="text-green-500 text-xs">✓ Done</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-sm font-medium text-slate-700 flex items-center gap-2">📄 Shipping Info</span>
                    <span className="text-green-500 text-xs">✓ Done</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                    <span className="text-sm font-medium text-indigo-700 flex items-center gap-2">📄 Product Catalog</span>
                    <span className="text-indigo-500 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Syncing
                    </span>
                  </div>
                </div>
              </AnimatedSection>

              {/* Step 2 */}
              <AnimatedSection delay={300} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6 border-4 border-slate-50">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Customize Your Assistant</h3>
                <p className="text-slate-600 mb-8 max-w-sm">Set your brand colors, welcome message, and conversation style. Preview changes in real time.</p>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm w-full max-w-xs text-left">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Brand Color</label>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 ring-2 ring-offset-2 ring-indigo-600"></div>
                        <div className="w-8 h-8 rounded-full bg-slate-900"></div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500"></div>
                        <div className="w-8 h-8 rounded-full bg-rose-500"></div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Assistant Name</label>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium">Northstar AI</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Step 3 */}
              <AnimatedSection delay={500} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-6 border-4 border-slate-50">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Install the Widget</h3>
                <p className="text-slate-600 mb-8 max-w-sm">Copy a simple code snippet and paste it into your website. Works instantly with any platform.</p>
                
                <div className="bg-slate-900 p-4 rounded-xl shadow-sm w-full max-w-xs text-left relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-3 border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                    </div>
                  </div>
                  <pre className="pt-6 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                    <span className="text-pink-400">&lt;script</span> <span className="text-green-300">src=</span><span className="text-yellow-300">"https://cdn.supportly.ai/widget.js"</span> <span className="text-green-300">data-id=</span><span className="text-yellow-300">"nx892k"</span><span className="text-pink-400">&gt;&lt;/script&gt;</span>
                  </pre>
                  <button className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                </div>
              </AnimatedSection>

            </div>
          </div>
        </div>
      </section>

      {/* === SECTION 6: INTERACTIVE DEMO === */}
      <section id="demo" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Try it yourself</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              Chat with an AI assistant trained on sample data from Northstar Goods, our fictional outdoor gear store. Ask about shipping, returns, or product recommendations.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm max-w-xl text-left">
              <span className="text-lg">⚠️</span>
              This demo uses pre-built responses for illustration. Connect your AI provider in the dashboard for live generative responses.
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200} className="max-w-lg mx-auto">
            <div className="rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white flex flex-col h-[600px]">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold backdrop-blur-sm border border-white/10">
                    N
                  </div>
                  <div>
                    <div className="font-semibold text-lg leading-tight">Northstar Goods</div>
                    <div className="flex items-center gap-1.5 text-indigo-100 text-xs mt-0.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      AI Assistant
                    </div>
                  </div>
                </div>
                <button className="text-white/70 hover:text-white transition-colors" onClick={() => {
                  setChatMessages([{id: 'welcome', sender: 'assistant', text: "Hi there! 👋 Welcome to Northstar Goods. I can help you with questions about our products, shipping, returns, and more. What can I help you with today?"}]);
                  setShowSuggestions(true);
                }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>

              {/* Messages Area */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto bg-slate-50 p-5 space-y-5 scroll-smooth">
                {chatMessages.map((msg, idx) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-[fadeInUp_0.3s_ease-out_forwards]`}>
                    {msg.isTyping ? (
                      <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-slate-200 flex gap-1 items-center h-[52px]">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.32s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both] [animation-delay:-0.16s]"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]"></div>
                      </div>
                    ) : (
                      <>
                        <div className={`p-4 max-w-[85%] ${
                          msg.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md' 
                            : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200'
                        }`}>
                          <MarkdownText text={msg.text} />
                        </div>
                        {msg.source && (
                          <div className="mt-2 inline-flex bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100 items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {msg.source}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-slate-200 flex flex-col shrink-0">
                {showSuggestions && (
                  <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/50">
                    {["What is your return policy?", "How long does shipping take?", "Help me choose a laptop bag", "Can I speak to a person?"].map(suggestion => (
                      <button 
                        key={suggestion}
                        onClick={() => handleDemoSubmit(undefined, suggestion)}
                        className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[13px] font-medium border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                <form onSubmit={handleDemoSubmit} className="px-4 py-3 flex gap-3 items-center">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    disabled={chatMessages[chatMessages.length - 1]?.isTyping}
                  />
                  <button 
                    type="submit"
                    disabled={!demoInput.trim() || chatMessages[chatMessages.length - 1]?.isTyping}
                    className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
                  >
                    <svg className="w-5 h-5 translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>

            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* === SECTION 7: DASHBOARD PREVIEW === */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Powerful dashboard. Zero complexity.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to manage AI-powered customer support in one place. No steep learning curves.</p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white max-w-6xl mx-auto">
              
              {/* Browser chrome */}
              <div className="h-12 bg-slate-100 border-b flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex-1 max-w-md mx-4 h-7 bg-white rounded-md flex items-center justify-center px-3 text-xs text-slate-400 border border-slate-200">
                  <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  app.supportly.ai/dashboard
                </div>
                <div className="w-16"></div> {/* Spacer */}
              </div>

              {/* App Layout */}
              <div className="flex h-[600px] text-sm">
                
                {/* Sidebar */}
                <div className="w-56 bg-slate-900 text-slate-400 flex flex-col shrink-0">
                  <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <span className="font-bold text-white tracking-tight flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center"><LogoIcon /></div>
                      Supportly
                    </span>
                  </div>
                  <div className="p-4 flex-1 space-y-1">
                    <div className="bg-indigo-600/10 text-indigo-400 px-3 py-2 rounded-lg font-medium flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      Overview
                    </div>
                    <div className="hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center justify-between cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        Inbox
                      </div>
                      <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
                    </div>
                    <div className="hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      Knowledge Base
                    </div>
                    <div className="hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Widget Settings
                    </div>
                    <div className="hover:bg-slate-800 hover:text-white px-3 py-2 rounded-lg font-medium flex items-center gap-3 cursor-pointer transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Analytics
                    </div>
                  </div>
                </div>

                {/* Main Area */}
                <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-hidden">
                  <h1 className="text-xl font-bold text-slate-900 mb-6">Overview</h1>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 font-medium mb-1">Conversations (30d)</div>
                      <div className="text-2xl font-bold text-slate-900">1,247</div>
                      <div className="text-emerald-500 text-xs font-medium mt-1">↑ 12% vs last period</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 font-medium mb-1">AI Resolution Rate</div>
                      <div className="text-2xl font-bold text-slate-900">94.2%</div>
                      <div className="text-emerald-500 text-xs font-medium mt-1">↑ 2.1% vs last period</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 font-medium mb-1">Human Handoffs</div>
                      <div className="text-2xl font-bold text-slate-900">23</div>
                      <div className="text-slate-400 text-xs font-medium mt-1">- 3 pending</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="text-slate-500 font-medium mb-1">CSAT Score</div>
                      <div className="text-2xl font-bold text-slate-900">4.8 ★</div>
                      <div className="text-emerald-500 text-xs font-medium mt-1">↑ 0.2 vs last period</div>
                    </div>
                  </div>

                  {/* Two column layout */}
                  <div className="flex-1 flex gap-6 overflow-hidden">
                    
                    {/* Left: List */}
                    <div className="w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="p-3 border-b border-slate-100 font-semibold text-slate-700 bg-slate-50/50">Recent Conversations</div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-semibold text-slate-900">Sarah Jenkins</div>
                            <div className="text-[10px] text-slate-400">2m ago</div>
                          </div>
                          <div className="text-xs text-slate-600 truncate">Do you ship to Canada?</div>
                          <div className="mt-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Resolved by AI</div>
                        </div>
                        <div className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-semibold text-slate-900">Mike R.</div>
                            <div className="text-[10px] text-slate-400">14m ago</div>
                          </div>
                          <div className="text-xs text-slate-600 truncate">I need to process a return for order #892...</div>
                          <div className="mt-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Handoff Requested</div>
                        </div>
                        <div className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-semibold text-slate-900">Visitor 4992</div>
                            <div className="text-[10px] text-slate-400">1h ago</div>
                          </div>
                          <div className="text-xs text-slate-600 truncate">What are the dimensions of the daypack?</div>
                          <div className="mt-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Resolved by AI</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Detail */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">SJ</div>
                          <div>
                            <div className="font-semibold text-slate-900">Sarah Jenkins</div>
                            <div className="text-[10px] text-slate-500">sarah.j@example.com • Vancouver, CA</div>
                          </div>
                        </div>
                        <button className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">View Details</button>
                      </div>
                      <div className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
                        <div className="flex justify-end">
                          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-3 max-w-[80%] shadow-sm">
                            Hi! Do you ship to Canada? If so, how much is it?
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm p-3 max-w-[80%] shadow-sm">
                            Hello Sarah! 👋 Yes, we do ship to Canada.
                            <br/><br/>
                            Our standard international shipping rate to Canada is a flat fee of **$15.00 USD**. Delivery typically takes 7-10 business days.
                            <br/><br/>
                            Let me know if you need help with anything else!
                            <div className="mt-2 inline-flex bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200">
                              Source: Shipping Policy
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </AnimatedSection>
          
          <div className="text-center mt-6">
            <p className="text-xs text-slate-400 italic">Dashboard shown with sample data for illustration.</p>
          </div>
        </div>
      </section>

      {/* === SECTION: BACKEND ARCHITECTURE & GSAP SHOWCASE === */}
      <section id="backend" className="py-20 bg-slate-900 border-t border-slate-800">
        <BackendShowcase />
      </section>

      {/* === SECTION 8: PRICING === */}
      <section id="pricing" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Start free, upgrade as you grow. No hidden fees.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Starter */}
            <AnimatedSection delay={100} className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">$29</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-slate-600 text-sm mb-6 h-10">Perfect for small businesses getting started with AI.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  500 AI messages/month
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  1 team member
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Basic widget customization
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  50 knowledge sources
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Email support
                </li>
              </ul>
              
              <Link to="/register?plan=starter" className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl font-semibold text-center transition-colors">
                Get Started
              </Link>
            </AnimatedSection>

            {/* Growth */}
            <AnimatedSection delay={200} className="bg-white p-8 rounded-2xl ring-2 ring-indigo-500 shadow-xl relative flex flex-col h-full transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                Most Popular
              </div>
              <h3 className="font-semibold text-lg text-indigo-600 mb-2 mt-2">Growth</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">$79</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-slate-600 text-sm mb-6 h-10">For growing businesses that need human handoff.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  2,500 AI messages/month
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  5 team members
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Human handoff routing
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Full customization
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  200 knowledge sources
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Priority support
                </li>
              </ul>
              
              <Link to="/register?plan=growth" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-center transition-colors shadow-md shadow-indigo-500/25">
                Get Started
              </Link>
            </AnimatedSection>

            {/* Business */}
            <AnimatedSection delay={300} className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col h-full hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">Business</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">$199</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <p className="text-slate-600 text-sm mb-6 h-10">For large operations with high support volume.</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  10,000 AI messages/month
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited team members
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  White-label widget
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited sources
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Custom analytics
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-700">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Dedicated support & API
                </li>
              </ul>
              
              <button className="w-full py-3 px-4 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl font-semibold text-center transition-colors">
                Contact Sales
              </button>
            </AnimatedSection>
          </div>
          
          <p className="text-center text-xs text-slate-400 italic mt-10">
            Placeholder pricing shown for illustration. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* === SECTION 9: FAQ === */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Frequently asked questions</h2>
          </AnimatedSection>

          <AnimatedSection delay={200} className="space-y-4">
            {[
              {
                q: "How does the assistant learn about my business?",
                a: "You provide the content directly by adding FAQs, pasting website URLs, or uploading documents through the dashboard. The assistant only uses this approved content to answer questions — it never browses the internet or makes up information."
              },
              {
                q: "What happens if it doesn't know an answer?",
                a: "The assistant will honestly say it doesn't have that information and offer to connect the customer with your human support team. It never invents or guesses at answers."
              },
              {
                q: "Can customers contact a human?",
                a: "Yes! Customers can request human support at any time. The conversation is transferred to your team's inbox with full context, so they can pick up right where the AI left off."
              },
              {
                q: "Can I change the widget's appearance?",
                a: "Absolutely. You can customize the widget's colors, position, welcome message, assistant name, and suggested questions to match your brand perfectly."
              },
              {
                q: "Does it work with my website platform?",
                a: "Supportly AI is designed to work with WordPress, WooCommerce, Shopify, and Webflow. Installation is typically a simple code snippet added to your site."
              },
              {
                q: "What customer information does it store?",
                a: "Supportly AI stores conversation transcripts, any contact information customers voluntarily provide during handoff requests, and anonymous feedback ratings. You maintain full control of this data through your dashboard settings."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left font-semibold text-slate-900 focus:outline-none"
                >
                  {faq.q}
                  <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* === SECTION 10: CTA === */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Make your next customer conversation easier.</h2>
            <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">Set up in minutes. No credit card required for the demo.</p>
            <button onClick={() => scrollTo('demo')} className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-900/20 transition-all hover:scale-105">
              Try the Demo
            </button>
          </AnimatedSection>
        </div>
      </section>

      {/* === SECTION 11: FOOTER === */}
      <footer className="py-16 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <LogoIcon />
                <span className="font-bold text-xl text-white tracking-tight">Supportly<span className="text-indigo-400">AI</span></span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">AI-powered customer support that works with your existing website and content.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><button onClick={() => scrollTo('demo')} className="hover:text-white transition-colors">Demo</button></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Integrations</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => scrollTo('integrations')} className="hover:text-white transition-colors">WordPress</button></li>
                <li><button onClick={() => scrollTo('integrations')} className="hover:text-white transition-colors">WooCommerce</button></li>
                <li><button onClick={() => scrollTo('integrations')} className="hover:text-white transition-colors">Shopify</button></li>
                <li><button onClick={() => scrollTo('integrations')} className="hover:text-white transition-colors">Webflow</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" title="Coming soon" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" title="Coming soon" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" title="Coming soon" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" title="Coming soon" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2024 Supportly AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.09.39-1.988 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.695 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Animations Style Block */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
