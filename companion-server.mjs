import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;

// In-memory data store seeded for Northstar Goods
const state = {
  user: {
    id: 1,
    name: 'Northstar Goods',
    email: 'demo@northstargoods.com',
    domain: 'northstargoods.com',
    logo_url: null,
    timezone: 'America/New_York',
    created_at: new Date().toISOString()
  },
  widgetConfig: {
    id: 1,
    business_id: 1,
    assistant_name: 'Northstar Assistant',
    welcome_message: 'Hi there! 👋 I am here to help with any questions about our outdoor gear, shipping, and policies.',
    brand_color: '#4f46e5',
    position: 'right',
    logo_url: null,
    suggested_questions: [
      'What is your return policy?',
      'How long does shipping take?',
      'Help me choose a laptop bag',
      'Can I speak to a person?'
    ],
    business_hours: {
      enabled: true,
      timezone: 'America/New_York',
      hours: {
        mon: { open: '09:00', close: '18:00' },
        tue: { open: '09:00', close: '18:00' },
        wed: { open: '09:00', close: '18:00' },
        thu: { open: '09:00', close: '18:00' },
        fri: { open: '09:00', close: '18:00' },
        sat: null,
        sun: null
      }
    }
  },
  knowledgeSources: [
    {
      id: 1,
      business_id: 1,
      type: 'faq',
      title: 'Return Policy',
      content: 'We offer a hassle-free 30-day return policy on all items. Products must be unused, in original packaging, and accompanied by a receipt. Once we receive your return, refunds are processed within 5–7 business days to your original payment method. Sale items can be exchanged for store credit.',
      url: null,
      file_path: null,
      status: 'active',
      metadata: null,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 2,
      business_id: 1,
      type: 'faq',
      title: 'Shipping Policy',
      content: 'We offer several shipping options:\n• Standard Shipping: 3–5 business days (FREE on orders over $50)\n• Express Shipping: 1–2 business days ($12.99)\n• International Shipping: 7–14 business days (rates vary)\nAll orders include tracking sent via email. Orders placed before 2 PM EST ship same business day.',
      url: null,
      file_path: null,
      status: 'active',
      metadata: null,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 3,
      business_id: 1,
      type: 'faq',
      title: 'Heritage Canvas Laptop Bag',
      content: 'Our Heritage Canvas Laptop Bag ($89.00) is crafted from premium waxed canvas with genuine leather accents. Features include a padded interior compartment that fits laptops up to 15", multiple organizer pockets, and an adjustable shoulder strap. Covered by our Lifetime Heritage Warranty.',
      url: null,
      file_path: null,
      status: 'active',
      metadata: null,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 4,
      business_id: 1,
      type: 'faq',
      title: 'Warranty Information',
      content: 'All Northstar Goods products come with a 1-year standard warranty against manufacturing defects. Our Heritage Collection items are covered by a Lifetime Heritage Warranty. Normal wear and tear or accidental damage is not covered.',
      url: null,
      file_path: null,
      status: 'active',
      metadata: null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 5,
      business_id: 1,
      type: 'faq',
      title: 'Accepted Payment Methods',
      content: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. All transactions are protected by 256-bit SSL encryption. We also offer Afterpay for flexible installment payments.',
      url: null,
      file_path: null,
      status: 'active',
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  conversations: [
    {
      id: 'conv-101',
      business_id: 1,
      customer_name: 'Alex Rivera',
      customer_email: 'alex@example.com',
      status: 'ai_active',
      channel: 'widget',
      assigned_to: null,
      metadata: null,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      latest_message: {
        id: 2,
        conversation_id: 'conv-101',
        role: 'assistant',
        content: 'Our standard shipping takes 3–5 business days within the US. Orders over $50 qualify for free shipping! 📦',
        sources: [{ title: 'Shipping Policy', type: 'faq' }],
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      messages: [
        {
          id: 1,
          conversation_id: 'conv-101',
          role: 'customer',
          content: 'How long does shipping take?',
          sources: null,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 2,
          conversation_id: 'conv-101',
          role: 'assistant',
          content: 'Our standard shipping takes 3–5 business days within the US. Orders over $50 qualify for free shipping! 📦',
          sources: [{ title: 'Shipping Policy', type: 'faq' }],
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        }
      ]
    },
    {
      id: 'conv-102',
      business_id: 1,
      customer_name: 'Jordan Taylor',
      customer_email: 'jordan@example.com',
      status: 'needs_human',
      channel: 'widget',
      assigned_to: null,
      metadata: null,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      latest_message: {
        id: 4,
        conversation_id: 'conv-102',
        role: 'system',
        content: 'Customer requested human assistance regarding an order exchange.',
        sources: null,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      messages: [
        {
          id: 3,
          conversation_id: 'conv-102',
          role: 'customer',
          content: 'Can I speak to a person about exchanging my order?',
          sources: null,
          created_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: 4,
          conversation_id: 'conv-102',
          role: 'system',
          content: 'Customer requested human assistance regarding an order exchange.',
          sources: null,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ]
    },
    {
      id: 'conv-103',
      business_id: 1,
      customer_name: 'Samantha Lee',
      customer_email: 'sam@example.com',
      status: 'human_active',
      channel: 'widget',
      assigned_to: 1,
      metadata: null,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
      latest_message: {
        id: 6,
        conversation_id: 'conv-103',
        role: 'agent',
        content: 'Hi Samantha! I reviewed your warranty claim and approved the replacement strap. It will dispatch tomorrow.',
        sources: null,
        created_at: new Date(Date.now() - 3600000 * 10).toISOString()
      },
      messages: [
        {
          id: 5,
          conversation_id: 'conv-103',
          role: 'customer',
          content: 'My bag strap broke after 6 months. Is this covered under warranty?',
          sources: null,
          created_at: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          id: 6,
          conversation_id: 'conv-103',
          role: 'agent',
          content: 'Hi Samantha! I reviewed your warranty claim and approved the replacement strap. It will dispatch tomorrow.',
          sources: null,
          created_at: new Date(Date.now() - 3600000 * 10).toISOString()
        }
      ]
    }
  ],
  teamMembers: [
    { id: 1, business_id: 1, name: 'Sarah Chen', email: 'sarah@northstargoods.com', role: 'admin', created_at: new Date().toISOString() },
    { id: 2, business_id: 1, name: 'Marcus Rodriguez', email: 'marcus@northstargoods.com', role: 'agent', created_at: new Date().toISOString() }
  ],
  feedback: [
    { id: 1, rating: 'helpful', count: 48 },
    { id: 2, rating: 'unhelpful', count: 6 }
  ],
  rules: [
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
    }
  ],
  tenants: [
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
    }
  ]
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
    });
    return res.end();
  }

  // Serve static widget JS file
  if (pathname === '/widget/supportly-widget.js') {
    const widgetPath = path.join(__dirname, 'backend', 'public', 'widget', 'supportly-widget.js');
    if (fs.existsSync(widgetPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*'
      });
      return fs.createReadStream(widgetPath).pipe(res);
    }
  }

  // API ROUTES
  try {
    // Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      return sendJson(res, 200, {
        success: true,
        token: 'demo-jwt-token-northstar-12345',
        user: state.user
      });
    }

    // Auth Register
    if (pathname === '/api/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      state.user = {
        id: 1,
        name: body.name || 'New Store',
        email: body.email || 'user@example.com',
        domain: body.domain || 'example.com',
        logo_url: null,
        timezone: 'UTC',
        created_at: new Date().toISOString()
      };
      return sendJson(res, 200, {
        success: true,
        token: 'demo-jwt-token-new-store',
        user: state.user
      });
    }

    // Auth Me
    if (pathname === '/api/auth/me' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        user: state.user
      });
    }

    // Auth Profile Update
    if (pathname === '/api/auth/profile' && method === 'PUT') {
      const body = await parseBody(req);
      Object.assign(state.user, body);
      return sendJson(res, 200, {
        success: true,
        user: state.user
      });
    }

    // Analytics Overview
    if (pathname === '/api/analytics/overview' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: {
          total_conversations: 142,
          total_messages: 584,
          ai_answered: 121,
          human_handoffs: 21,
          avg_satisfaction: 4.8,
          conversations_by_day: [
            { date: 'Mon', count: 18 },
            { date: 'Tue', count: 24 },
            { date: 'Wed', count: 29 },
            { date: 'Thu', count: 22 },
            { date: 'Fri', count: 31 },
            { date: 'Sat', count: 12 },
            { date: 'Sun', count: 16 }
          ],
          recent_conversations: state.conversations
        }
      });
    }

    // Analytics Questions
    if (pathname === '/api/analytics/questions' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: [
          { question: 'What is your return policy?', count: 42, last_asked: '10 mins ago' },
          { question: 'How long does shipping take?', count: 38, last_asked: '25 mins ago' },
          { question: 'Do you offer a warranty on bags?', count: 19, last_asked: '1 hour ago' },
          { question: 'Can I track my package?', count: 15, last_asked: '2 hours ago' }
        ]
      });
    }

    // Analytics Unanswered
    if (pathname === '/api/analytics/unanswered' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: [
          { question: 'Do you ship to military APO addresses?', asked_at: 'Yesterday' },
          { question: 'Can I get a custom monogram engraved on the canvas bag?', asked_at: '2 days ago' }
        ]
      });
    }

    // Analytics Feedback
    if (pathname === '/api/analytics/feedback' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        data: {
          helpful: 48,
          unhelpful: 6,
          total: 54,
          satisfaction_percentage: 89
        }
      });
    }

    // Conversations List
    if (pathname === '/api/conversations' && method === 'GET') {
      const status = urlObj.searchParams.get('status');
      let filtered = state.conversations;
      if (status && status !== 'all') {
        filtered = state.conversations.filter(c => c.status === status);
      }
      return sendJson(res, 200, {
        success: true,
        data: filtered
      });
    }

    // Conversation Details
    const convMatch = pathname.match(/^\/api\/conversations\/([^/]+)$/);
    if (convMatch && method === 'GET') {
      const convId = convMatch[1];
      const conv = state.conversations.find(c => c.id === convId);
      if (!conv) return sendJson(res, 404, { success: false, error: 'Conversation not found' });
      return sendJson(res, 200, {
        success: true,
        data: conv
      });
    }

    // Conversation Status Update
    const statusMatch = pathname.match(/^\/api\/conversations\/([^/]+)\/status$/);
    if (statusMatch && method === 'PUT') {
      const convId = statusMatch[1];
      const body = await parseBody(req);
      const conv = state.conversations.find(c => c.id === convId);
      if (conv) {
        conv.status = body.status;
        if (body.status === 'human_active') {
          conv.messages.push({
            id: Date.now(),
            conversation_id: convId,
            role: 'system',
            content: 'Agent took over conversation.',
            sources: null,
            created_at: new Date().toISOString()
          });
        }
        return sendJson(res, 200, { success: true, data: conv });
      }
      return sendJson(res, 404, { success: false, error: 'Not found' });
    }

    // Conversation Add Message
    const msgMatch = pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (msgMatch && method === 'POST') {
      const convId = msgMatch[1];
      const body = await parseBody(req);
      const conv = state.conversations.find(c => c.id === convId);
      if (conv) {
        const newMsg = {
          id: Date.now(),
          conversation_id: convId,
          role: body.role || 'agent',
          content: body.content,
          sources: null,
          created_at: new Date().toISOString()
        };
        conv.messages.push(newMsg);
        conv.latest_message = newMsg;
        return sendJson(res, 200, { success: true, data: newMsg });
      }
      return sendJson(res, 404, { success: false, error: 'Not found' });
    }

    // Conversation Add Note
    const noteMatch = pathname.match(/^\/api\/conversations\/([^/]+)\/notes$/);
    if (noteMatch && method === 'POST') {
      const convId = noteMatch[1];
      const body = await parseBody(req);
      const conv = state.conversations.find(c => c.id === convId);
      if (conv) {
        const noteMsg = {
          id: Date.now(),
          conversation_id: convId,
          role: 'system',
          content: `Internal Note: ${body.note}`,
          sources: null,
          created_at: new Date().toISOString()
        };
        conv.messages.push(noteMsg);
        return sendJson(res, 200, { success: true, data: noteMsg });
      }
      return sendJson(res, 404, { success: false, error: 'Not found' });
    }

    // Knowledge Base List
    if (pathname === '/api/knowledge' && method === 'GET') {
      const type = urlObj.searchParams.get('type');
      let items = state.knowledgeSources;
      if (type && type !== 'all') {
        items = state.knowledgeSources.filter(k => k.type === type);
      }
      return sendJson(res, 200, {
        success: true,
        data: items
      });
    }

    // Knowledge Base Create
    if (pathname === '/api/knowledge' && method === 'POST') {
      const body = await parseBody(req);
      const newSource = {
        id: Date.now(),
        business_id: 1,
        type: body.type || 'faq',
        title: body.title || 'Untitled',
        content: body.content || '',
        url: body.url || null,
        file_path: null,
        status: 'active',
        metadata: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.knowledgeSources.unshift(newSource);
      return sendJson(res, 200, { success: true, data: newSource });
    }

    // Knowledge Base Update
    const knowMatch = pathname.match(/^\/api\/knowledge\/(\d+)$/);
    if (knowMatch && method === 'PUT') {
      const id = parseInt(knowMatch[1]);
      const body = await parseBody(req);
      const idx = state.knowledgeSources.findIndex(k => k.id === id);
      if (idx !== -1) {
        state.knowledgeSources[idx] = { ...state.knowledgeSources[idx], ...body, updated_at: new Date().toISOString() };
        return sendJson(res, 200, { success: true, data: state.knowledgeSources[idx] });
      }
      return sendJson(res, 404, { success: false, error: 'Not found' });
    }

    // Knowledge Base Delete
    if (knowMatch && method === 'DELETE') {
      const id = parseInt(knowMatch[1]);
      state.knowledgeSources = state.knowledgeSources.filter(k => k.id !== id);
      return sendJson(res, 200, { success: true });
    }

    // Knowledge Base Test Question
    if (pathname === '/api/knowledge/test' && method === 'POST') {
      const body = await parseBody(req);
      const q = (body.question || '').toLowerCase();
      
      const matched = state.knowledgeSources.filter(k => {
        return k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) ||
               q.split(' ').some(word => word.length > 3 && (k.title.toLowerCase().includes(word) || k.content.toLowerCase().includes(word)));
      });

      const best = matched[0] || state.knowledgeSources[0];

      return sendJson(res, 200, {
        success: true,
        answer: best ? best.content : "I don't have enough verified information to answer this question. Would you like to connect with a support team member?",
        sources: matched.slice(0, 3).map(m => ({ title: m.title, type: m.type }))
      });
    }

    // Widget Config
    if (pathname === '/api/settings/widget' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: state.widgetConfig });
    }

    if (pathname === '/api/settings/widget' && method === 'PUT') {
      const body = await parseBody(req);
      Object.assign(state.widgetConfig, body);
      return sendJson(res, 200, { success: true, data: state.widgetConfig });
    }

    // Team Members
    if (pathname === '/api/settings/team' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: state.teamMembers });
    }

    if (pathname === '/api/settings/team' && method === 'POST') {
      const body = await parseBody(req);
      const newMember = {
        id: Date.now(),
        business_id: 1,
        name: body.name,
        email: body.email,
        role: body.role || 'agent',
        created_at: new Date().toISOString()
      };
      state.teamMembers.push(newMember);
      return sendJson(res, 200, { success: true, data: newMember });
    }

    const teamMatch = pathname.match(/^\/api\/settings\/team\/(\d+)$/);
    if (teamMatch && method === 'DELETE') {
      const id = parseInt(teamMatch[1]);
      state.teamMembers = state.teamMembers.filter(m => m.id !== id);
      return sendJson(res, 200, { success: true });
    }

    // Public Widget Config
    const pubConfigMatch = pathname.match(/^\/api\/widget\/([^/]+)\/config$/);
    if (pubConfigMatch && method === 'GET') {
      return sendJson(res, 200, {
        assistant_name: state.widgetConfig.assistant_name,
        welcome_message: state.widgetConfig.welcome_message,
        brand_color: state.widgetConfig.brand_color,
        position: state.widgetConfig.position,
        logo_url: state.widgetConfig.logo_url,
        suggested_questions: state.widgetConfig.suggested_questions,
        business_hours: state.widgetConfig.business_hours
      });
    }

    // AI Rules endpoints
    if (pathname === '/api/rules' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: state.rules });
    }

    if (pathname === '/api/rules' && method === 'POST') {
      const body = await parseBody(req);
      const newRule = {
        id: Date.now(),
        business_id: 1,
        name: body.name || 'Untitled Rule',
        category: body.category || 'guardrail',
        description: body.description || '',
        prompt_directive: body.prompt_directive || '',
        priority: body.priority || 'medium',
        enabled: body.enabled !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      state.rules.unshift(newRule);
      return sendJson(res, 200, { success: true, data: newRule });
    }

    const ruleMatch = pathname.match(/^\/api\/rules\/(\d+)$/);
    if (ruleMatch && method === 'PUT') {
      const id = parseInt(ruleMatch[1]);
      const body = await parseBody(req);
      const idx = state.rules.findIndex(r => r.id === id);
      if (idx !== -1) {
        state.rules[idx] = { ...state.rules[idx], ...body, updated_at: new Date().toISOString() };
        return sendJson(res, 200, { success: true, data: state.rules[idx] });
      }
      return sendJson(res, 404, { success: false, error: 'Rule not found' });
    }

    if (ruleMatch && method === 'DELETE') {
      const id = parseInt(ruleMatch[1]);
      state.rules = state.rules.filter(r => r.id !== id);
      return sendJson(res, 200, { success: true });
    }

    // Role Permissions update
    const permMatch = pathname.match(/^\/api\/permissions\/([a-z_]+)$/);
    if (permMatch && method === 'PUT') {
      const role = permMatch[1];
      const body = await parseBody(req);
      return sendJson(res, 200, { success: true, data: body });
    }

    // Super Admin Tenants
    if (pathname === '/api/admin/tenants' && method === 'GET') {
      return sendJson(res, 200, { success: true, data: state.tenants });
    }

    const tenantMatch = pathname.match(/^\/api\/admin\/tenants\/(\d+)$/);
    if (tenantMatch && method === 'PUT') {
      const id = parseInt(tenantMatch[1]);
      const body = await parseBody(req);
      const idx = state.tenants.findIndex(t => t.id === id);
      if (idx !== -1) {
        state.tenants[idx] = { ...state.tenants[idx], ...body };
        return sendJson(res, 200, { success: true, data: state.tenants[idx] });
      }
      return sendJson(res, 404, { success: false, error: 'Tenant not found' });
    }

    // 404 for unhandled API
    return sendJson(res, 404, { success: false, error: `Route ${method} ${pathname} not found` });

  } catch (err) {
    console.error('Server error:', err);
    return sendJson(res, 500, { success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Supportly AI Companion API running at http://localhost:${PORT}`);
});
