/**
 * InventoryHub — Client Application & Postman Studio Controller
 * Handles interactive REST API testing, real-time database table rendering,
 * and client fallback simulator for static hosting (GitHub Pages).
 */

// Global State
let productsData = [];
let isLiveServer = false;

// DOM Elements
const httpMethod = document.getElementById('httpMethod');
const requestUrl = document.getElementById('requestUrl');
const requestBodyJson = document.getElementById('requestBodyJson');
const btnSendRequest = document.getElementById('btnSendRequest');
const sendSpinner = document.getElementById('sendSpinner');
const presetSelector = document.getElementById('presetSelector');

const respStatusBadge = document.getElementById('respStatusBadge');
const respTimeBadge = document.getElementById('respTimeBadge');
const respSizeBadge = document.getElementById('respSizeBadge');
const responseBodyDisplay = document.getElementById('responseBodyDisplay');
const btnCopyResp = document.getElementById('btnCopyResp');

const productsTableBody = document.getElementById('productsTableBody');
const dbSearchInput = document.getElementById('dbSearchInput');
const dbCategoryFilter = document.getElementById('dbCategoryFilter');
const btnRefreshDb = document.getElementById('btnRefreshDb');
const btnResetDbSeed = document.getElementById('btnResetDbSeed');

const statTotalProducts = document.getElementById('statTotalProducts');
const statInventoryVal = document.getElementById('statInventoryVal');
const statLowStock = document.getElementById('statLowStock');
const statOutOfStock = document.getElementById('statOutOfStock');

const serverStatusText = document.getElementById('serverStatusText');
const serverStatusBadge = document.getElementById('serverStatusBadge');

// Quick Form Elements
const qSku = document.getElementById('qSku');
const qName = document.getElementById('qName');
const qCategory = document.getElementById('qCategory');
const qQty = document.getElementById('qQty');
const qPrice = document.getElementById('qPrice');
const btnQuickPost = document.getElementById('btnQuickPost');

// Request Tabs
const reqTabButtons = document.querySelectorAll('.req-tab-btn');
const reqTabPanes = document.querySelectorAll('.req-tab-pane');

document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupPresets();
  setupEventListeners();
  await checkServerHealth();
  await loadProducts();
});

function setupTabs() {
  reqTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      reqTabButtons.forEach(b => b.classList.remove('active'));
      reqTabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-req-tab'));
      if (target) target.classList.add('active');
    });
  });

  // Method select color styling
  httpMethod.addEventListener('change', () => {
    httpMethod.className = `method-select method-${httpMethod.value.toLowerCase()}`;
  });
}

async function checkServerHealth() {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isLiveServer = true;
      serverStatusText.textContent = 'REST API Online';
      return;
    }
  } catch (e) {
    isLiveServer = false;
    serverStatusText.textContent = 'REST Simulator (Static Demo)';
  }
}

async function loadProducts() {
  if (isLiveServer) {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        productsData = data.data;
        renderProductsTable(productsData);
        await updateStats();
        return;
      }
    } catch (e) {
      console.warn('API error, using local fallback', e);
    }
  }

  // Fallback initial data for static hosting
  if (productsData.length === 0) {
    productsData = [
      {
        id: 'PROD-1001',
        sku: 'TECH-MBP-14',
        name: 'Apple MacBook Pro 14" M3 Pro',
        category: 'Laptops & Computers',
        quantity: 25,
        unitPrice: 1999.00,
        supplier: 'Apple Enterprise Distribution',
        reorderThreshold: 10,
        status: 'In Stock',
        createdAt: '2026-10-15T08:30:00.000Z',
        updatedAt: '2026-10-15T08:30:00.000Z'
      },
      {
        id: 'PROD-1002',
        sku: 'TECH-LOGI-MX3S',
        name: 'Logitech MX Master 3S Wireless Mouse',
        category: 'Peripherals',
        quantity: 85,
        unitPrice: 99.99,
        supplier: 'Logitech Asia Pacific',
        reorderThreshold: 20,
        status: 'In Stock',
        createdAt: '2026-10-16T10:15:00.000Z',
        updatedAt: '2026-10-16T10:15:00.000Z'
      },
      {
        id: 'PROD-1003',
        sku: 'TECH-DELL-U2723QE',
        name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
        category: 'Monitors & Displays',
        quantity: 8,
        unitPrice: 620.00,
        supplier: 'Dell Technologies India',
        reorderThreshold: 10,
        status: 'Low Stock',
        createdAt: '2026-10-18T12:00:00.000Z',
        updatedAt: '2026-10-20T14:45:00.000Z'
      },
      {
        id: 'PROD-1004',
        sku: 'TECH-SONY-WH1000XM5',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling',
        category: 'Audio & Acoustics',
        quantity: 42,
        unitPrice: 399.00,
        supplier: 'Sony Consumer Electronics',
        reorderThreshold: 15,
        status: 'In Stock',
        createdAt: '2026-10-22T09:20:00.000Z',
        updatedAt: '2026-10-22T09:20:00.000Z'
      },
      {
        id: 'PROD-1005',
        sku: 'TECH-CISCO-C9200',
        name: 'Cisco Catalyst 9200L 48-Port PoE+ Switch',
        category: 'Networking',
        quantity: 4,
        unitPrice: 2850.00,
        supplier: 'Cisco Systems Networking',
        reorderThreshold: 5,
        status: 'Low Stock',
        createdAt: '2026-10-25T11:10:00.000Z',
        updatedAt: '2026-10-25T11:10:00.000Z'
      },
      {
        id: 'PROD-1006',
        sku: 'TECH-SAM-990PRO-2TB',
        name: 'Samsung 990 PRO PCIe 4.0 NVMe SSD 2TB',
        category: 'Storage & Drives',
        quantity: 0,
        unitPrice: 179.99,
        supplier: 'Samsung Semiconductor India',
        reorderThreshold: 15,
        status: 'Out of Stock',
        createdAt: '2026-10-26T15:00:00.000Z',
        updatedAt: '2026-10-29T16:30:00.000Z'
      }
    ];
  }

  renderProductsTable(productsData);
  updateStats();
}

function renderProductsTable(list) {
  productsTableBody.innerHTML = '';
  if (list.length === 0) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 1.5rem;">
          No matching product records located in database.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach(p => {
    const tr = document.createElement('tr');
    let statusClass = 'status-in-stock';
    if (p.status === 'Low Stock') statusClass = 'status-low-stock';
    else if (p.status === 'Out of Stock') statusClass = 'status-out-of-stock';

    tr.innerHTML = `
      <td>
        <div class="id-tag">${escapeHtml(p.id)}</div>
        <div class="sku-sub">${escapeHtml(p.sku)}</div>
      </td>
      <td>
        <div class="prod-name">${escapeHtml(p.name)}</div>
        <div class="supplier-sub">Supplier: ${escapeHtml(p.supplier || 'N/A')}</div>
      </td>
      <td><span style="font-size: 0.72rem; color: #94a3b8;">${escapeHtml(p.category)}</span></td>
      <td><strong style="color: #fff;">${p.quantity}</strong></td>
      <td>$${Number(p.unitPrice).toFixed(2)}</td>
      <td>
        <span class="status-badge ${statusClass}">${escapeHtml(p.status)}</span>
      </td>
      <td>
        <div class="actions-cell">
          <button type="button" class="btn-tbl-edit" data-id="${p.id}" title="Load into Postman for PUT / PATCH">Edit</button>
          <button type="button" class="btn-tbl-del" data-id="${p.id}" title="DELETE this record">Del</button>
        </div>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });

  // Attach Table Action Handlers
  document.querySelectorAll('.btn-tbl-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const item = productsData.find(p => p.id === id);
      if (item) {
        httpMethod.value = 'PUT';
        httpMethod.className = 'method-select method-put';
        requestUrl.value = `/api/products/${item.id}`;
        requestBodyJson.value = JSON.stringify({
          sku: item.sku,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          supplier: item.supplier,
          reorderThreshold: item.reorderThreshold
        }, null, 2);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.btn-tbl-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      httpMethod.value = 'DELETE';
      httpMethod.className = 'method-select method-delete';
      requestUrl.value = `/api/products/${id}`;
      requestBodyJson.value = '{}';
      window.scrollTo({ top: 120, behavior: 'smooth' });
    });
  });
}

async function updateStats() {
  if (isLiveServer) {
    try {
      const res = await fetch('/api/products/stats/summary');
      const data = await res.json();
      if (data.success && data.stats) {
        statTotalProducts.textContent = data.stats.totalProducts;
        statInventoryVal.textContent = `$${data.stats.totalInventoryValuation.toLocaleString()}`;
        statLowStock.textContent = `${data.stats.lowStockCount} Items`;
        statOutOfStock.textContent = `${data.stats.outOfStockCount} Items`;
        return;
      }
    } catch(e) {}
  }

  // Local calculation
  const total = productsData.length;
  const val = productsData.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const low = productsData.filter(p => p.quantity > 0 && p.quantity <= p.reorderThreshold).length;
  const out = productsData.filter(p => p.quantity === 0).length;

  statTotalProducts.textContent = total;
  statInventoryVal.textContent = `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  statLowStock.textContent = `${low} Items`;
  statOutOfStock.textContent = `${out} Items`;
}

// Postman Request Dispatcher
function setupEventListeners() {
  btnSendRequest.addEventListener('click', async () => {
    const method = httpMethod.value;
    let url = requestUrl.value.trim();
    let body = null;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = JSON.parse(requestBodyJson.value.trim());
      } catch (err) {
        alert('Invalid JSON in Request Body: ' + err.message);
        return;
      }
    }

    setSending(true);
    const startTime = performance.now();

    if (isLiveServer) {
      try {
        const fetchOptions = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };
        if (body) fetchOptions.body = JSON.stringify(body);

        const res = await fetch(url, fetchOptions);
        const duration = Math.round(performance.now() - startTime);
        const data = await res.json();
        const sizeKb = (JSON.stringify(data).length / 1024).toFixed(1);

        displayResponse(res.status, `${res.status} ${res.statusText || getStatusText(res.status)}`, duration, sizeKb, data);
        await loadProducts();
        setSending(false);
        return;
      } catch (err) {
        console.warn('Network call failed, falling back to simulator', err);
      }
    }

    // Static Host / GitHub Pages Simulator Engine
    setTimeout(() => {
      const duration = Math.round(performance.now() - startTime) + 8;
      const { status, statusText, data } = simulateCrud(method, url, body);
      const sizeKb = (JSON.stringify(data).length / 1024).toFixed(1);

      displayResponse(status, statusText, duration, sizeKb, data);
      renderProductsTable(productsData);
      updateStats();
      setSending(false);
    }, 180);
  });

  // Table filters
  dbSearchInput.addEventListener('input', applyTableFilters);
  dbCategoryFilter.addEventListener('change', applyTableFilters);
  btnRefreshDb.addEventListener('click', loadProducts);

  btnResetDbSeed.addEventListener('click', async () => {
    if (confirm('Reset database back to factory seed products?')) {
      if (isLiveServer) {
        await fetch('/api/products/reset', { method: 'POST' });
        await loadProducts();
      } else {
        productsData = [];
        await loadProducts();
      }
    }
  });

  // Quick Action Form button
  btnQuickPost.addEventListener('click', () => {
    const sku = qSku.value.trim() || 'TECH-DELL-XPS15';
    const name = qName.value.trim() || 'Dell XPS 15 InfinityEdge Touch Laptop';
    const category = qCategory.value;
    const quantity = parseInt(qQty.value, 10) || 12;
    const unitPrice = parseFloat(qPrice.value) || 1749.99;

    httpMethod.value = 'POST';
    httpMethod.className = 'method-select method-post';
    requestUrl.value = '/api/products';
    requestBodyJson.value = JSON.stringify({
      sku,
      name,
      category,
      quantity,
      unitPrice,
      supplier: 'Dell Technologies Commercial',
      reorderThreshold: 5
    }, null, 2);

    btnSendRequest.click();
  });

  btnCopyResp.addEventListener('click', () => {
    navigator.clipboard.writeText(responseBodyDisplay.textContent);
    btnCopyResp.textContent = 'Copied!';
    setTimeout(() => { btnCopyResp.textContent = 'Copy Response'; }, 1500);
  });
}

function applyTableFilters() {
  const q = dbSearchInput.value.toLowerCase().trim();
  const cat = dbCategoryFilter.value;

  const filtered = productsData.filter(p => {
    const matchQuery = !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.supplier.toLowerCase().includes(q);

    const matchCat = (cat === 'All') || (p.category === cat);
    return matchQuery && matchCat;
  });

  renderProductsTable(filtered);
}

function displayResponse(statusCode, statusText, durationMs, sizeKb, data) {
  respStatusBadge.className = `status-pill status-${statusCode}`;
  respStatusBadge.textContent = statusText;
  respTimeBadge.textContent = `${durationMs} ms`;
  respSizeBadge.textContent = `${sizeKb} KB`;
  responseBodyDisplay.textContent = JSON.stringify(data, null, 2);
}

function setSending(isSending) {
  btnSendRequest.disabled = isSending;
  sendSpinner.style.display = isSending ? 'inline-block' : 'none';
}

function getStatusText(code) {
  const map = {
    200: 'OK',
    201: 'CREATED',
    400: 'BAD REQUEST',
    404: 'NOT FOUND',
    409: 'CONFLICT',
    500: 'INTERNAL ERROR'
  };
  return map[code] || '';
}

// Preset Test Scenarios
function setupPresets() {
  presetSelector.addEventListener('change', () => {
    const val = presetSelector.value;
    switch (val) {
      case 'get_all':
        httpMethod.value = 'GET';
        requestUrl.value = '/api/products';
        requestBodyJson.value = '{}';
        break;

      case 'get_one':
        httpMethod.value = 'GET';
        requestUrl.value = '/api/products/PROD-1001';
        requestBodyJson.value = '{}';
        break;

      case 'post_create':
        httpMethod.value = 'POST';
        requestUrl.value = '/api/products';
        requestBodyJson.value = JSON.stringify({
          sku: `TECH-AUTO-DEV-${Math.floor(100 + Math.random() * 900)}`,
          name: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
          category: 'Peripherals',
          quantity: 35,
          unitPrice: 199.50,
          supplier: 'Keychron Direct Asia',
          reorderThreshold: 10
        }, null, 2);
        break;

      case 'put_update':
        httpMethod.value = 'PUT';
        requestUrl.value = '/api/products/PROD-1002';
        requestBodyJson.value = JSON.stringify({
          sku: 'TECH-LOGI-MX3S',
          name: 'Logitech MX Master 3S Wireless Mouse (Graphite V2)',
          category: 'Peripherals',
          quantity: 110,
          unitPrice: 94.99,
          supplier: 'Logitech Asia Pacific Distribution',
          reorderThreshold: 20
        }, null, 2);
        break;

      case 'patch_update':
        httpMethod.value = 'PATCH';
        requestUrl.value = '/api/products/PROD-1003';
        requestBodyJson.value = JSON.stringify({
          quantity: 25,
          unitPrice: 599.00
        }, null, 2);
        break;

      case 'delete':
        httpMethod.value = 'DELETE';
        requestUrl.value = '/api/products/PROD-1006';
        requestBodyJson.value = '{}';
        break;

      case 'err_not_found':
        httpMethod.value = 'GET';
        requestUrl.value = '/api/products/PROD-9999';
        requestBodyJson.value = '{}';
        break;

      case 'err_duplicate_sku':
        httpMethod.value = 'POST';
        requestUrl.value = '/api/products';
        requestBodyJson.value = JSON.stringify({
          sku: 'TECH-MBP-14', // Duplicate SKU from PROD-1001
          name: 'Duplicate SKU Apple Laptop',
          category: 'Laptops & Computers',
          quantity: 5,
          unitPrice: 1999.00,
          supplier: 'Unauthorized Vendor'
        }, null, 2);
        break;

      case 'err_bad_req':
        httpMethod.value = 'POST';
        requestUrl.value = '/api/products';
        requestBodyJson.value = JSON.stringify({
          sku: 'TECH-INVALID',
          name: 'Invalid Negative Price Item',
          category: 'Peripherals',
          quantity: -10,
          unitPrice: -50.00,
          supplier: 'Bad Vendor'
        }, null, 2);
        break;

      case 'get_stats':
        httpMethod.value = 'GET';
        requestUrl.value = '/api/products/stats/summary';
        requestBodyJson.value = '{}';
        break;
    }

    httpMethod.className = `method-select method-${httpMethod.value.toLowerCase()}`;
  });
}

// Fallback CRUD Simulator (for GitHub Pages static hosting)
function simulateCrud(method, path, body) {
  // GET /api/products/stats/summary
  if (method === 'GET' && path.includes('/stats/summary')) {
    const total = productsData.length;
    const totalVal = productsData.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    const low = productsData.filter(p => p.quantity > 0 && p.quantity <= p.reorderThreshold).length;
    const out = productsData.filter(p => p.quantity === 0).length;

    const cats = {};
    for (const p of productsData) cats[p.category] = (cats[p.category] || 0) + 1;

    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Inventory Statistics Calculated',
        stats: {
          totalProducts: total,
          totalInventoryValuation: parseFloat(totalVal.toFixed(2)),
          lowStockCount: low,
          outOfStockCount: out,
          inStockCount: total - (low + out),
          categoryBreakdown: cats
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  // GET /api/products/:id
  const singleMatch = path.match(/\/api\/products\/(PROD-[\w-]+)/);
  if (method === 'GET' && singleMatch) {
    const id = singleMatch[1];
    const item = productsData.find(p => p.id === id);
    if (!item) {
      return {
        status: 404,
        statusText: '404 NOT FOUND',
        data: {
          success: false,
          statusCode: 404,
          statusMessage: 'Not Found: Record Missing',
          message: `Product with ID "${id}" does not exist in the database.`,
          timestamp: new Date().toISOString()
        }
      };
    }
    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Product Record Found',
        data: item,
        timestamp: new Date().toISOString()
      }
    };
  }

  // GET /api/products
  if (method === 'GET' && (path === '/api/products' || path.startsWith('/api/products?'))) {
    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Records Retrieved Successfully',
        totalRecords: productsData.length,
        page: 1,
        limit: 50,
        totalPages: 1,
        data: productsData,
        timestamp: new Date().toISOString()
      }
    };
  }

  // POST /api/products
  if (method === 'POST' && path === '/api/products') {
    if (!body || !body.sku || !body.name || !body.category) {
      return {
        status: 400,
        statusText: '400 BAD REQUEST',
        data: {
          success: false,
          statusCode: 400,
          statusMessage: 'Bad Request: Input Validation Failed',
          message: 'Required product fields are missing.',
          timestamp: new Date().toISOString()
        }
      };
    }

    if (body.unitPrice <= 0 || body.quantity < 0) {
      return {
        status: 400,
        statusText: '400 BAD REQUEST',
        data: {
          success: false,
          statusCode: 400,
          statusMessage: 'Bad Request: Input Validation Failed',
          message: 'Quantity must be >= 0 and Unit Price must be > 0.',
          timestamp: new Date().toISOString()
        }
      };
    }

    // SKU duplicate check
    const existing = productsData.find(p => p.sku.toUpperCase() === body.sku.toUpperCase().trim());
    if (existing) {
      return {
        status: 409,
        statusText: '409 CONFLICT',
        data: {
          success: false,
          statusCode: 409,
          statusMessage: 'Conflict: Duplicate Record Detected',
          message: `A product with SKU "${body.sku.toUpperCase()}" already exists (Product ID: ${existing.id})`,
          error: 'DUPLICATE_SKU',
          timestamp: new Date().toISOString()
        }
      };
    }

    const newId = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const quantity = parseInt(body.quantity, 10) || 0;
    const threshold = parseInt(body.reorderThreshold, 10) || 10;
    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= threshold) status = 'Low Stock';

    const newProduct = {
      id: newId,
      sku: body.sku.toUpperCase().trim(),
      name: body.name.trim(),
      category: body.category.trim(),
      quantity,
      unitPrice: parseFloat(body.unitPrice),
      supplier: (body.supplier || 'Vendor Direct').trim(),
      reorderThreshold: threshold,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    productsData.unshift(newProduct);

    return {
      status: 201,
      statusText: '201 CREATED',
      data: {
        success: true,
        statusCode: 201,
        statusMessage: 'Created: Product Record Inserted Into Database',
        message: `Product "${newProduct.name}" created successfully with ID ${newProduct.id}.`,
        data: newProduct,
        timestamp: new Date().toISOString()
      }
    };
  }

  // PUT /api/products/:id
  if (method === 'PUT' && singleMatch) {
    const id = singleMatch[1];
    const index = productsData.findIndex(p => p.id === id);
    if (index === -1) {
      return {
        status: 404,
        statusText: '404 NOT FOUND',
        data: {
          success: false,
          statusCode: 404,
          statusMessage: 'Not Found',
          message: `Cannot update product "${id}" because it does not exist.`,
          timestamp: new Date().toISOString()
        }
      };
    }

    const current = productsData[index];
    const updated = {
      ...current,
      ...body,
      id: current.id,
      quantity: parseInt(body.quantity !== undefined ? body.quantity : current.quantity, 10),
      unitPrice: parseFloat(body.unitPrice !== undefined ? body.unitPrice : current.unitPrice),
      updatedAt: new Date().toISOString()
    };
    productsData[index] = updated;

    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Product Record Fully Updated',
        message: `Product "${updated.name}" (${updated.id}) has been updated in database.`,
        data: updated,
        timestamp: new Date().toISOString()
      }
    };
  }

  // PATCH /api/products/:id
  if (method === 'PATCH' && singleMatch) {
    const id = singleMatch[1];
    const index = productsData.findIndex(p => p.id === id);
    if (index === -1) {
      return {
        status: 404,
        statusText: '404 NOT FOUND',
        data: {
          success: false,
          statusCode: 404,
          statusMessage: 'Not Found',
          message: `Cannot patch product "${id}" because it does not exist.`,
          timestamp: new Date().toISOString()
        }
      };
    }

    const current = productsData[index];
    const updated = {
      ...current,
      ...body,
      id: current.id,
      quantity: body.quantity !== undefined ? parseInt(body.quantity, 10) : current.quantity,
      unitPrice: body.unitPrice !== undefined ? parseFloat(body.unitPrice) : current.unitPrice,
      updatedAt: new Date().toISOString()
    };
    productsData[index] = updated;

    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Product Partially Patched',
        message: `Product "${updated.name}" was partially updated.`,
        data: updated,
        timestamp: new Date().toISOString()
      }
    };
  }

  // DELETE /api/products/:id
  if (method === 'DELETE' && singleMatch) {
    const id = singleMatch[1];
    const index = productsData.findIndex(p => p.id === id);
    if (index === -1) {
      return {
        status: 404,
        statusText: '404 NOT FOUND',
        data: {
          success: false,
          statusCode: 404,
          statusMessage: 'Not Found: Record Missing',
          message: `Cannot delete product with ID "${id}". Record not found in database.`,
          timestamp: new Date().toISOString()
        }
      };
    }

    const [deleted] = productsData.splice(index, 1);
    return {
      status: 200,
      statusText: '200 OK',
      data: {
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Product Record Deleted From Database',
        message: `Product "${deleted.name}" (${deleted.id}) was permanently deleted from database.`,
        deletedRecord: deleted,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Default Fallback
  return {
    status: 404,
    statusText: '404 NOT FOUND',
    data: {
      success: false,
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `Endpoint ${method} ${path} unmapped.`,
      timestamp: new Date().toISOString()
    }
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

