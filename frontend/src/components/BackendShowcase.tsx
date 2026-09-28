import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface BackendFeature {
  id: string;
  badge: string;
  title: string;
  description: string;
  phpFile: string;
  latency: string;
  codeSnippet: string;
  executionSteps: Array<{
    step: string;
    detail: string;
    status: 'done' | 'processing' | 'idle';
  }>;
  jsonOutput: string;
}

const BACKEND_FEATURES: BackendFeature[] = [
  {
    id: 'knowledge_search',
    badge: 'Core Grounding Engine',
    title: 'Knowledge Base Search & Keyword Relevance Scoring',
    description: 'Laravel queries knowledge sources with stop-word filtering and multi-factor relevance scoring to find verified store data with sub-5ms database latency.',
    phpFile: 'app/Services/KnowledgeSearchService.php',
    latency: '3.2ms',
    codeSnippet: `public function searchSources(int $businessId, string $query): array
{
    $keywords = $this->extractKeywords($query); // Strips stop-words
    $sources = KnowledgeSource::where('business_id', $businessId)
        ->where('status', 'active')
        ->get();

    $scored = [];
    foreach ($sources as $source) {
        $score = $this->calculateScore($source, $keywords); // Title=3x, Content=1x
        if ($score > 0) {
            $scored[] = ['title' => $source->title, 'content' => $source->content, 'score' => $score];
        }
    }
    usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
    return array_slice($scored, 0, 3);
}`,
    executionSteps: [
      { step: '1. Input Tokenization', detail: 'Clean punctuation, remove stop-words, extract ["shipping", "standard"]', status: 'done' },
      { step: '2. Scoped DB Query', detail: 'SELECT * FROM knowledge_sources WHERE business_id = 1 AND status = "active"', status: 'done' },
      { step: '3. Relevance Ranking', detail: 'Matched "Shipping Policy" (Score: 7), "Return Policy" (Score: 2)', status: 'done' }
    ],
    jsonOutput: `{
  "matched_sources": [
    {
      "id": 2,
      "title": "Shipping Policy",
      "type": "faq",
      "score": 7,
      "latency": "3.2ms"
    }
  ]
}`
  },
  {
    id: 'ai_synthesis',
    badge: 'Zero-Hallucination AI',
    title: 'Server-Side Context Synthesis & Multi-Model Inference',
    description: 'Securely injects verified knowledge sources and guardrail directives into OpenAI, Gemini, or Claude. API keys are strictly kept server-side.',
    phpFile: 'app/Services/AIService.php',
    latency: '240ms',
    codeSnippet: `public function generateResponse(string $query, int $businessId, array $history): array
{
    $searchResults = $this->searchService->searchSources($businessId, $query);
    $apiKey = config('services.openai.api_key'); // Never exposed to browser

    $systemPrompt = "You are a customer assistant for {$businessName}. "
        . "Answer questions ONLY using the provided verified context. "
        . "Never invent policies or prices. If unknown, offer human handoff.\\n\\n"
        . "VERIFIED STORE DATA:\\n" . $this->formatContext($searchResults);

    return $this->invokeModel($model, $systemPrompt, $query);
}`,
    executionSteps: [
      { step: '1. Guardrail Injection', detail: 'Appended: "Refuse to quote external competitor pricing or unverified sales"', status: 'done' },
      { step: '2. Grounded Payload', detail: 'Injected 2 verified context excerpts into System Context', status: 'done' },
      { step: '3. Streaming Inference', detail: 'Generated response: "Standard shipping takes 3–5 business days ($0 over $50)"', status: 'done' }
    ],
    jsonOutput: `{
  "role": "assistant",
  "content": "Standard shipping takes 3–5 business days within the US. Orders over $50 qualify for free shipping! 📦",
  "sources": [{"title": "Shipping Policy", "type": "faq"}],
  "needs_handoff": false
}`
  },
  {
    id: 'human_handoff',
    badge: 'Real-time Escalation',
    title: 'Automatic Sentiment Detection & Agent Takeover',
    description: 'Inspects customer urgency, sentiment, and explicit requests for human assistance. Immediately transitions state to `needs_human` and alerts agents.',
    phpFile: 'app/Http/Controllers/Api/ConversationController.php',
    latency: '8.4ms',
    codeSnippet: `public function requestHandoff(Request $request, $businessId, $conversationId)
{
    $conversation = Conversation::where('business_id', $businessId)->findOrFail($conversationId);
    $conversation->update([
        'status' => 'needs_human',
        'customer_name' => $request->input('name'),
        'customer_email' => $request->input('email')
    ]);

    Message::create([
        'conversation_id' => $conversationId,
        'role' => 'system',
        'content' => 'Customer requested live human support.'
    ]);
    return response()->json(['success' => true]);
}`,
    executionSteps: [
      { step: '1. Intent Trigger', detail: 'Detected phrase: "speak to a person about exchanging my order"', status: 'done' },
      { step: '2. State Mutation', detail: 'Conversation status changed: ai_active → needs_human', status: 'done' },
      { step: '3. Staff Notification', detail: 'Real-time broadcast dispatched to Support Desk Inbox', status: 'done' }
    ],
    jsonOutput: `{
  "conversation_id": "conv-102",
  "previous_status": "ai_active",
  "current_status": "needs_human",
  "customer": {"name": "Jordan Taylor", "email": "jordan@example.com"},
  "assigned_to": null
}`
  },
  {
    id: 'tenant_isolation',
    badge: 'Enterprise Security',
    title: 'Multi-Tenant Scoping & Personal Access Tokens (Sanctum)',
    description: 'Rigorous multi-tenant data isolation ensures store A can never read or query store B data through route-level ownership middleware.',
    phpFile: 'app/Http/Middleware/EnsureBusinessOwnership.php',
    latency: '1.8ms',
    codeSnippet: `public function handle(Request $request, Closure $next)
{
    $business = $request->user(); // Sanctum authenticated store owner
    $resourceBusinessId = $request->route('business_id') 
        ?? $request->route('id');

    if ($business->id !== (int) $resourceBusinessId) {
        return response()->json(['error' => 'Forbidden: Cross-tenant access denied'], 403);
    }
    return $next($request);
}`,
    executionSteps: [
      { step: '1. Bearer Token Check', detail: 'Decoded Sanctum token: Business ID #1 ("Northstar Goods")', status: 'done' },
      { step: '2. Scope Enforcement', detail: 'Verified target resource belongs strictly to business_id 1', status: 'done' },
      { step: '3. Cross-Tenant Denial', detail: 'Attempted access to store #2 rejected with HTTP 403 Forbidden', status: 'done' }
    ],
    jsonOutput: `{
  "authenticated_business": "Northstar Goods",
  "tenant_id": 1,
  "role": "admin",
  "isolation_mode": "strict_tenant_bound"
}`
  }
];

export default function BackendShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<BackendFeature>(BACKEND_FEATURES[0]);
  const [simulating, setSimulating] = useState(false);

  // GSAP animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const stepListRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const terminalHeaderRef = useRef<HTMLDivElement>(null);

  // Animate on initial mount and when switching tabs with GSAP
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Staggered entrance animation for active feature
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      gsap.fromTo(
        codeRef.current,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.4)' }
      );

      gsap.fromTo(
        outputRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' }
      );

      // Pulse terminal header
      gsap.fromTo(
        terminalHeaderRef.current,
        { backgroundColor: 'rgba(30, 41, 59, 1)' },
        { backgroundColor: 'rgba(15, 23, 42, 1)', duration: 0.6 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selectedFeature.id]);

  // Run interactive live simulation with GSAP timeline
  const handleRunSimulation = () => {
    setSimulating(true);

    const tl = gsap.timeline({
      onComplete: () => setSimulating(false)
    });

    // Step 1: Flash code block
    tl.to(codeRef.current, {
      borderColor: '#4f46e5',
      boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
      duration: 0.3
    });

    // Step 2: Animate execution steps in order
    if (stepListRef.current) {
      const stepElements = stepListRef.current.children;
      tl.fromTo(
        stepElements,
        { scale: 0.95, opacity: 0.6 },
        { scale: 1, opacity: 1, stagger: 0.2, duration: 0.35, ease: 'power1.out' }
      );
    }

    // Step 3: Pop the JSON output
    tl.fromTo(
      outputRef.current,
      { y: 15, opacity: 0.7 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'bounce.out' }
    );

    // Reset code border
    tl.to(codeRef.current, {
      borderColor: '#334155',
      boxShadow: 'none',
      duration: 0.4
    });
  };

  return (
    <div ref={containerRef} className="space-y-8 max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          Laravel 11 • Architecture Showcase • Animated with GSAP
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Under the Hood: <span className="text-indigo-600">Laravel 11 Backend</span> Architecture
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore the real server-side services powering Supportly AI. Grounded search, multi-model LLM inference, strict tenant isolation, and sub-10ms response pipelines.
        </p>
      </div>

      {/* Feature Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BACKEND_FEATURES.map((feature) => {
          const isSelected = selectedFeature.id === feature.id;
          return (
            <button
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {feature.badge}
              </span>
              <p className="text-xs sm:text-sm font-bold mt-2 line-clamp-1">{feature.title.split('&')[0]}</p>
              <div className="flex justify-between items-center mt-2 text-[11px] opacity-80 font-mono">
                <span>{feature.phpFile.split('/').pop()}</span>
                <span className="font-bold">{feature.latency}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Visualizer */}
      <div ref={cardRef} className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden text-slate-200">
        {/* Terminal Chrome Bar */}
        <div ref={terminalHeaderRef} className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3.5 h-3.5 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <span className="text-xs font-mono text-indigo-400 font-bold flex items-center gap-1.5">
              <span>🐘 PHP 8.3 / Laravel 11</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{selectedFeature.phpFile}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              ⏱ Avg Execution: {selectedFeature.latency}
            </span>

            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <span>{simulating ? 'Running...' : '▶ Run GSAP Simulation'}</span>
            </button>
          </div>
        </div>

        {/* Content Body: Left Code Snippet, Right Execution Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Column: PHP Code Snippet */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-bold text-slate-300">Method Source Code</span>
              <span className="font-mono text-[11px] text-slate-500">Eloquent / Service Layer</span>
            </div>

            <pre
              ref={codeRef}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-200 overflow-x-auto leading-relaxed h-[360px] shadow-inner selection:bg-indigo-900"
            >
              <code>{selectedFeature.codeSnippet}</code>
            </pre>
          </div>

          {/* Right Column: Interactive Execution Timeline & Output */}
          <div className="lg:col-span-5 space-y-4">
            {/* Step-by-Step Execution Pipeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pipeline Lifecycle Execution
              </span>

              <div ref={stepListRef} className="space-y-2.5">
                {selectedFeature.executionSteps.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-300">{s.step}</span>
                      <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-900">
                        PASS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono leading-tight">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response JSON Payload */}
            <div ref={outputRef} className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Output JSON Response</span>
                <span className="text-[10px] font-mono text-slate-500">HTTP 200 OK</span>
              </span>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto h-[130px] leading-relaxed">
                <code>{selectedFeature.jsonOutput}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Explanation Bar */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-400">
          <p className="leading-relaxed">
            <strong className="text-indigo-400 font-semibold">{selectedFeature.title}:</strong> {selectedFeature.description}
          </p>
          <span className="shrink-0 text-slate-500 font-mono text-[10px]">
            Stateless • Token Authenticated • Multi-Tenant
          </span>
        </div>
      </div>
    </div>
  );
}
