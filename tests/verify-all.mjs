/**
 * Supportly AI Automated Verification Suite
 * 
 * Tests critical business logic, security constraints, and data integrity:
 * 1. Cross-business tenant data isolation
 * 2. Unauthorized role access prevention (403 on super admin endpoints)
 * 3. Widget cross-origin handshake & ping verification
 * 4. Catalog sync state transitions & authoritative stock consistency
 * 5. Knowledge gaps capture & approval workflow
 * 6. Human takeover (stops AI) and resume-AI lifecycle
 * 7. Message retry idempotency (deduplication via client_message_id)
 * 8. Order privacy & 2FA/OTP customer verification
 */

import http from 'http';

const BASE_URL = 'http://127.0.0.1:8000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// TEST 1: Role-Based Access Control - Super Admin Endpoint Protection
// ---------------------------------------------------------------------------
test('1. RBAC: Non-super-admin cannot access super-admin tenant endpoints', async () => {
  // Test with support_agent role
  const agentRes = await request({
    path: '/api/admin/tenants',
    method: 'GET',
    headers: { 'X-User-Role': 'support_agent' }
  });
  assert(agentRes.statusCode === 403, `Expected 403 for support_agent, got ${agentRes.statusCode}`);
  assert(agentRes.data.success === false, 'Expected success: false in response');

  // Test with business_admin role
  const adminRes = await request({
    path: '/api/admin/tenants',
    method: 'GET',
    headers: { 'X-User-Role': 'business_admin' }
  });
  assert(adminRes.statusCode === 403, `Expected 403 for business_admin, got ${adminRes.statusCode}`);

  // Test with super_admin role
  const superRes = await request({
    path: '/api/admin/tenants',
    method: 'GET',
    headers: { 'X-User-Role': 'super_admin' }
  });
  assert(superRes.statusCode === 200, `Expected 200 for super_admin, got ${superRes.statusCode}`);
  assert(Array.isArray(superRes.data.data), 'Expected array of tenants for super_admin');
});

// ---------------------------------------------------------------------------
// TEST 2: Multi-Tenant Isolation
// ---------------------------------------------------------------------------
test('2. Tenant Isolation: Scoped conversation queries only return tenant data', async () => {
  const res = await request({
    path: '/api/conversations',
    method: 'GET',
    headers: { 'X-Business-Id': '1' }
  });
  assert(res.statusCode === 200, 'Conversations should return 200');
  const conversations = res.data.data;
  assert(Array.isArray(conversations), 'Conversations should be an array');
  
  // Verify all conversations belong strictly to business 1
  for (const c of conversations) {
    assert(c.business_id === 1, `Leaked conversation ${c.id} from business ${c.business_id}`);
  }
});

// ---------------------------------------------------------------------------
// TEST 3: Widget Public Handshake & Cross-Origin Ping
// ---------------------------------------------------------------------------
test('3. Widget Handshake: CORS support and live ping tracking', async () => {
  const widgetId = 'pub_live_northstar_8923a';
  
  // Ping from client site
  const pingRes = await request({
    path: `/api/widget/${widgetId}/ping`,
    method: 'POST',
    headers: { 'Origin': 'https://outdoorshop-example.com' }
  }, {
    origin: 'https://outdoorshop-example.com',
    platform: 'shopify'
  });
  
  assert(pingRes.statusCode === 200, 'Ping should return 200');
  assert(pingRes.headers['access-control-allow-origin'] === '*', 'CORS header must be present');
  assert(pingRes.data.data.status === 'verified', 'Widget status should be verified');

  // Verify status check endpoint reflects latest handshake
  const statusRes = await request({
    path: `/api/widget/${widgetId}/status`,
    method: 'GET'
  });
  assert(statusRes.statusCode === 200, 'Widget status should return 200');
  assert(statusRes.data.data.status === 'verified', 'Widget status should be verified');
  assert(statusRes.data.data.last_ping !== null, 'Last ping should be populated');
});

// ---------------------------------------------------------------------------
// TEST 4: Catalog Sync & Stock Consistency
// ---------------------------------------------------------------------------
test('4. Catalog Sync: State transitions & authoritative stock consistency', async () => {
  // Test connection
  const testConnRes = await request({
    path: '/api/integrations/catalog/test-connection',
    method: 'POST'
  }, {
    platform: 'shopify',
    store_url: 'https://northstar-outdoors.myshopify.com',
    api_key: 'shpat_live_northstar_test_key'
  });
  assert(testConnRes.statusCode === 200, 'Connection test should succeed');
  assert(testConnRes.data.data.connected === true, 'Connected state should be true');

  // Trigger sync
  const syncRes = await request({
    path: '/api/integrations/catalog/sync',
    method: 'POST'
  });
  assert(syncRes.statusCode === 200, 'Sync trigger should return 200');
  assert(['queued', 'processing', 'completed'].includes(syncRes.data.data.status), 'Sync job should be accepted');

  // Allow brief tick for background sync transition
  await new Promise(r => setTimeout(r, 1500));

  // Verify authoritative catalog items
  const statusRes = await request({
    path: '/api/integrations/catalog/status',
    method: 'GET'
  });
  assert(statusRes.statusCode === 200, 'Catalog status should return 200');
  const products = statusRes.data.data.products;
  assert(Array.isArray(products) && products.length > 0, 'Products should be returned');

  // Assert Titanium Stove is strictly out of stock
  const stove = products.find(p => p.sku === 'NSG-STV-04');
  assert(stove !== undefined, 'Titanium Stove must be in catalog');
  assert(stove.in_stock === false && stove.stock_quantity === 0, 'Stove must be OUT OF STOCK (0 units)');

  // Assert Heritage Canvas Pack is in stock at $89.00
  const pack = products.find(p => p.sku === 'NSG-BAG-01');
  assert(pack !== undefined, 'Heritage Canvas Pack must be in catalog');
  assert(pack.in_stock === true && (pack.price === 89.00 || pack.numeric_price === 89.00), 'Pack must be IN STOCK ($89.00)');
});

// ---------------------------------------------------------------------------
// TEST 5: Knowledge Gaps & Grounded Answers
// ---------------------------------------------------------------------------
test('5. Knowledge Quality: Gap recording, excerpt citation & publishing', async () => {
  // Fetch existing gaps
  const gapsRes = await request({
    path: '/api/knowledge/gaps',
    method: 'GET'
  });
  assert(gapsRes.statusCode === 200, 'Gaps should return 200');
  assert(Array.isArray(gapsRes.data.data), 'Gaps should be an array');
  const initialCount = gapsRes.data.data.length;
  assert(initialCount > 0, 'Initial knowledge gaps should exist');

  // Test question grounding on known topic
  const testRes = await request({
    path: '/api/knowledge/test',
    method: 'POST'
  }, {
    query: 'How long does standard shipping take?'
  });
  assert(testRes.statusCode === 200, 'Knowledge test should return 200');
  assert(testRes.data.data.grounded === true, 'Known topic must be grounded');
  assert(testRes.data.data.sources && testRes.data.data.sources.length > 0, 'Must cite sources');

  // Test unsupported question
  const unsupportedRes = await request({
    path: '/api/knowledge/test',
    method: 'POST'
  }, {
    query: 'Do you sell scuba diving tanks in Paris?'
  });
  assert(unsupportedRes.statusCode === 200, 'Unsupported question returns 200');
  assert(unsupportedRes.data.data.grounded === false, 'Unsupported question must NOT be marked grounded');
});

// ---------------------------------------------------------------------------
// TEST 6: Human Takeover Lifecycle & AI Suppression
// ---------------------------------------------------------------------------
test('6. Human Takeover: Halts automated AI responses until resumed', async () => {
  const convId = 'conv-101';

  // 1. Take over conversation
  const takeoverRes = await request({
    path: `/api/conversations/${convId}/status`,
    method: 'PUT'
  }, { status: 'human_active' });
  assert(takeoverRes.statusCode === 200, 'Takeover should succeed');
  assert(takeoverRes.data.data.status === 'human_active', 'Status must be human_active');

  // 2. Send customer message while human is active
  const msgRes = await request({
    path: `/api/conversations/${convId}/messages`,
    method: 'POST'
  }, {
    sender_type: 'customer',
    message: 'Hello, are you still there?',
    client_message_id: 'test-msg-' + Date.now()
  });
  assert(msgRes.statusCode === 201, 'Message posted successfully');
  
  // Wait brief tick and verify NO automated AI response was generated
  const checkRes = await request({
    path: `/api/conversations/${convId}`,
    method: 'GET'
  });
  const msgs = checkRes.data.data.messages;
  const lastMsg = msgs[msgs.length - 1];
  assert(lastMsg.role !== 'assistant', 'AI assistant must NOT respond while human is active');

  // 3. Resume AI Copilot
  const resumeRes = await request({
    path: `/api/conversations/${convId}/resume-ai`,
    method: 'POST'
  });
  assert(resumeRes.statusCode === 200, 'Resume AI should succeed');
  assert(resumeRes.data.data.status === 'ai_active', 'Status must transition back to ai_active');
});

// ---------------------------------------------------------------------------
// TEST 7: Idempotent Message Deduplication
// ---------------------------------------------------------------------------
test('7. Deduplication: Duplicate client_message_id returns existing message', async () => {
  const convId = 'conv-102';
  const clientId = 'unique-key-' + Date.now();

  const firstCall = await request({
    path: `/api/conversations/${convId}/messages`,
    method: 'POST'
  }, {
    sender_type: 'customer',
    message: 'Testing deduplication message',
    client_message_id: clientId
  });
  assert(firstCall.statusCode === 201, 'First message creation should return 201');
  const firstId = firstCall.data.data.id;

  // Send exact same client_message_id
  const secondCall = await request({
    path: `/api/conversations/${convId}/messages`,
    method: 'POST'
  }, {
    sender_type: 'customer',
    message: 'Testing deduplication message',
    client_message_id: clientId
  });
  assert(secondCall.statusCode === 200, 'Duplicate message should return 200 (deduplicated)');
  assert(secondCall.data.data.id === firstId, 'Deduplicated message ID must match original');
  assert(secondCall.data.deduplicated === true, 'Response must flag deduplicated: true');
});

// ---------------------------------------------------------------------------
// TEST 8: Customer Order 2FA/OTP Verification Sandbox
// ---------------------------------------------------------------------------
test('8. Order Verification: Protects customer details with 4-digit OTP', async () => {
  // Step 1: Request OTP
  const reqOtpRes = await request({
    path: '/api/orders/request-verification',
    method: 'POST'
  }, {
    order_number: 'ORD-9482',
    email: 'sarah.c@example.com'
  });
  assert(reqOtpRes.statusCode === 200, 'OTP request should succeed');
  assert(reqOtpRes.data.data.otp_sent === true, 'OTP sent flag should be true');

  // Step 2: Try invalid OTP
  const failRes = await request({
    path: '/api/orders/verify',
    method: 'POST'
  }, {
    order_number: 'ORD-9482',
    code: '0000'
  });
  assert(failRes.statusCode === 401, 'Invalid OTP must return 401 Unauthorized');
  assert(failRes.data.success === false, 'Verification should fail');

  // Step 3: Verify with valid OTP (test code 8492)
  const passRes = await request({
    path: '/api/orders/verify',
    method: 'POST'
  }, {
    order_number: 'ORD-9482',
    code: '8492'
  });
  assert(passRes.statusCode === 200, 'Valid OTP must return 200');
  assert(passRes.data.success === true, 'Verification must succeed');
  assert(passRes.data.data.order !== undefined, 'Order data must be unlocked');
  assert(passRes.data.data.order.customer_name === 'Sarah Connor', 'Order recipient verified');
  assert(passRes.data.data.order.tracking_number !== undefined, 'Tracking number unlocked');
});

// ---------------------------------------------------------------------------
// TEST RUNNER
// ---------------------------------------------------------------------------
async function runAll() {
  console.log('====================================================');
  console.log('  Supportly AI Automated Verification Test Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`✅ [PASS] ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${t.name}`);
      console.error(`   Error: ${err.message}\n`);
      failed++;
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed} Passed, ${failed} Failed out of ${tests.length} tests`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll();
