/**
 * InventoryHub — Automated RESTful API & Database CRUD Test Suite
 * Tests all endpoints, status codes, database persistence, and validations.
 */

import assert from 'assert/strict';
import http from 'http';
import app from '../server.js';
import { db } from '../models/database.js';

let server;
let port;

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n========================================================');
  console.log('   RUNNING INVENTORYHUB RESTful DATABASE CRUD TESTS     ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✔ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✖ FAIL: ${name}`);
      console.error(`    -> ${err.message}`);
      failed++;
    }
  }

  // Ensure clean test database seed
  db.resetSeed();

  // Start test server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      resolve();
    });
  });

  try {
    // T1: Health Probe
    await test('T1: GET /api/health returns 200 OK with server uptime', async () => {
      const res = await request('GET', '/api/health');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.status, 'ONLINE');
    });

    // T2: Read All Products
    await test('T2: GET /api/products returns 200 OK and initial seed records', async () => {
      const res = await request('GET', '/api/products');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.totalRecords >= 6);
      assert.ok(Array.isArray(res.body.data));
    });

    // T3: Read Single Product by ID
    await test('T3: GET /api/products/PROD-1001 returns 200 OK with MacBook Pro details', async () => {
      const res = await request('GET', '/api/products/PROD-1001');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.id, 'PROD-1001');
      assert.equal(res.body.data.sku, 'TECH-MBP-14');
    });

    // T4: Query Filter by Category
    await test('T4: GET /api/products?category=Peripherals filters records appropriately', async () => {
      const res = await request('GET', '/api/products?category=Peripherals');
      assert.equal(res.statusCode, 200);
      assert.ok(res.body.data.length > 0);
      res.body.data.forEach(p => assert.equal(p.category, 'Peripherals'));
    });

    // T5: Search Query
    await test('T5: GET /api/products?search=Dell matches Dell monitor record', async () => {
      const res = await request('GET', '/api/products?search=Dell');
      assert.equal(res.statusCode, 200);
      assert.ok(res.body.data.length >= 1);
      assert.ok(res.body.data[0].name.includes('Dell'));
    });

    // T6: Create Product (POST)
    let createdId = null;
    await test('T6: POST /api/products inserts new product record (201 Created)', async () => {
      const newProductPayload = {
        sku: 'TECH-ASUS-ROG-OLED',
        name: 'ASUS ROG Swift 32" 4K OLED Gaming Monitor',
        category: 'Monitors & Displays',
        quantity: 18,
        unitPrice: 1299.00,
        supplier: 'ASUS India Distribution',
        reorderThreshold: 5
      };
      const res = await request('POST', '/api/products', newProductPayload);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.id.startsWith('PROD-'));
      assert.equal(res.body.data.sku, 'TECH-ASUS-ROG-OLED');
      createdId = res.body.data.id;
    });

    // T7: Duplicate SKU Conflict (409)
    await test('T7: POST /api/products with existing SKU returns 409 Conflict', async () => {
      const duplicatePayload = {
        sku: 'TECH-MBP-14', // Duplicate SKU from PROD-1001
        name: 'Duplicate Laptop',
        category: 'Laptops & Computers',
        quantity: 10,
        unitPrice: 1999.00,
        supplier: 'Reseller'
      };
      const res = await request('POST', '/api/products', duplicatePayload);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists/i);
    });

    // T8: Missing Required Fields (400)
    await test('T8: POST /api/products missing name returns 400 Bad Request', async () => {
      const badPayload = {
        sku: 'TECH-NEW-ITEM',
        // name missing
        category: 'Peripherals',
        quantity: 10,
        unitPrice: 50
      };
      const res = await request('POST', '/api/products', badPayload);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.errors.some(e => e.field === 'name'));
    });

    // T9: Negative Quantity & Price (400)
    await test('T9: POST /api/products negative price returns 400 Bad Request', async () => {
      const badPayload = {
        sku: 'TECH-NEG-ITEM',
        name: 'Invalid Price Item',
        category: 'Peripherals',
        quantity: -5,
        unitPrice: -200,
        supplier: 'Bad Supplier'
      };
      const res = await request('POST', '/api/products', badPayload);
      assert.equal(res.statusCode, 400);
      assert.ok(res.body.errors.some(e => e.field === 'unitPrice'));
    });

    // T10: Full Update (PUT)
    await test('T10: PUT /api/products/:id completely updates record (200 OK)', async () => {
      assert.ok(createdId, 'createdId must exist from T6');
      const updatePayload = {
        sku: 'TECH-ASUS-ROG-OLED-V2',
        name: 'ASUS ROG Swift 32" 4K OLED Monitor (240Hz Edition)',
        category: 'Monitors & Displays',
        quantity: 28,
        unitPrice: 1399.00,
        supplier: 'ASUS Global Logistics',
        reorderThreshold: 8
      };
      const res = await request('PUT', `/api/products/${createdId}`, updatePayload);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.name, 'ASUS ROG Swift 32" 4K OLED Monitor (240Hz Edition)');
      assert.equal(res.body.data.quantity, 28);
    });

    // T11: Partial Update (PATCH)
    await test('T11: PATCH /api/products/:id updates stock quantity (200 OK)', async () => {
      assert.ok(createdId, 'createdId must exist');
      const patchPayload = { quantity: 50 };
      const res = await request('PATCH', `/api/products/${createdId}`, patchPayload);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.quantity, 50);
    });

    // T12: Delete Product (DELETE)
    await test('T12: DELETE /api/products/:id removes record from database (200 OK)', async () => {
      assert.ok(createdId, 'createdId must exist');
      const res = await request('DELETE', `/api/products/${createdId}`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.deletedRecord.id, createdId);
    });

    // T13: Verify Deletion (404)
    await test('T13: GET /api/products/:id for deleted record returns 404 Not Found', async () => {
      assert.ok(createdId, 'createdId must exist');
      const res = await request('GET', `/api/products/${createdId}`);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
    });

    // T14: Inventory Analytics Summary
    await test('T14: GET /api/products/stats/summary returns aggregated valuation metrics', async () => {
      const res = await request('GET', '/api/products/stats/summary');
      assert.equal(res.statusCode, 200);
      assert.ok(typeof res.body.stats.totalInventoryValuation === 'number');
      assert.ok(typeof res.body.stats.totalProducts === 'number');
      assert.ok(res.body.stats.categoryBreakdown);
    });

  } finally {
    server.close();
  }

  console.log('\n========================================================');
  console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
