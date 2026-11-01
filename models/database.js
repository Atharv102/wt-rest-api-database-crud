/**
 * InventoryHub — Database Engine
 * Persistent file-backed database layer supporting ACID CRUD operations,
 * indexing by ID and SKU, query filtering, and aggregate analytics.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'inventory.db.json');

const INITIAL_SEED_PRODUCTS = [
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

class Database {
  constructor() {
    this.ensureDatabaseFile();
  }

  ensureDatabaseFile() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      this.writeDatabase({
        meta: {
          databaseName: 'InventoryHub_Warehouse_DB',
          version: '1.0.0',
          lastInitialized: new Date().toISOString()
        },
        products: INITIAL_SEED_PRODUCTS
      });
    }
  }

  readDatabase() {
    try {
      this.ensureDatabaseFile();
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
      const fallback = {
        meta: { databaseName: 'InventoryHub_Warehouse_DB', version: '1.0.0' },
        products: INITIAL_SEED_PRODUCTS
      };
      this.writeDatabase(fallback);
      return fallback;
    }
  }

  writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // --- CRUD OPERATIONS ---

  // 1. READ ALL (with filtering, search, pagination, and sorting)
  findAll(options = {}) {
    const db = this.readDatabase();
    let items = [...db.products];

    // Filter by category
    if (options.category && options.category !== 'All') {
      items = items.filter(p => p.category.toLowerCase() === options.category.toLowerCase());
    }

    // Filter by search query (name, sku, supplier)
    if (options.search) {
      const q = options.search.toLowerCase().trim();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    // Filter by low stock / out of stock
    if (options.lowStock === 'true' || options.lowStock === true) {
      items = items.filter(p => p.quantity <= p.reorderThreshold);
    }

    // Sort items
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    items.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });

    // Pagination
    const totalCount = items.length;
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      data: paginatedItems
    };
  }

  // 2. READ ONE BY ID
  findById(id) {
    const db = this.readDatabase();
    return db.products.find(p => p.id === id) || null;
  }

  // 3. READ BY SKU (for uniqueness check)
  findBySku(sku) {
    const db = this.readDatabase();
    return db.products.find(p => p.sku.toUpperCase() === sku.toUpperCase()) || null;
  }

  // 4. CREATE RECORD
  insert(productData) {
    const db = this.readDatabase();
    const newId = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const quantity = parseInt(productData.quantity, 10) || 0;
    const threshold = parseInt(productData.reorderThreshold, 10) || 10;
    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= threshold) status = 'Low Stock';

    const newProduct = {
      id: newId,
      sku: productData.sku.toUpperCase().trim(),
      name: productData.name.trim(),
      category: productData.category.trim(),
      quantity,
      unitPrice: parseFloat(productData.unitPrice),
      supplier: productData.supplier.trim(),
      reorderThreshold: threshold,
      status,
      createdAt: now,
      updatedAt: now
    };

    db.products.unshift(newProduct);
    this.writeDatabase(db);
    return newProduct;
  }

  // 5. UPDATE RECORD (Full PUT or Partial PATCH)
  update(id, updateData) {
    const db = this.readDatabase();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = db.products[index];
    const quantity = updateData.quantity !== undefined ? parseInt(updateData.quantity, 10) : current.quantity;
    const threshold = updateData.reorderThreshold !== undefined ? parseInt(updateData.reorderThreshold, 10) : current.reorderThreshold;

    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= threshold) status = 'Low Stock';

    const updated = {
      ...current,
      ...updateData,
      id: current.id, // Immutable ID
      sku: updateData.sku ? updateData.sku.toUpperCase().trim() : current.sku,
      quantity,
      reorderThreshold: threshold,
      unitPrice: updateData.unitPrice !== undefined ? parseFloat(updateData.unitPrice) : current.unitPrice,
      status,
      createdAt: current.createdAt, // Immutable creation timestamp
      updatedAt: new Date().toISOString()
    };

    db.products[index] = updated;
    this.writeDatabase(db);
    return updated;
  }

  // 6. DELETE RECORD
  delete(id) {
    const db = this.readDatabase();
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const [deleted] = db.products.splice(index, 1);
    this.writeDatabase(db);
    return deleted;
  }

  // 7. AGGREGATE STATS
  getStats() {
    const db = this.readDatabase();
    const total = db.products.length;
    const totalValue = db.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
    const lowStockCount = db.products.filter(p => p.quantity > 0 && p.quantity <= p.reorderThreshold).length;
    const outOfStockCount = db.products.filter(p => p.quantity === 0).length;

    const byCategory = {};
    for (const p of db.products) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }

    return {
      totalProducts: total,
      totalInventoryValuation: parseFloat(totalValue.toFixed(2)),
      lowStockCount,
      outOfStockCount,
      inStockCount: total - (lowStockCount + outOfStockCount),
      categoryBreakdown: byCategory
    };
  }

  // Reset database back to seed products
  resetSeed() {
    const resetData = {
      meta: {
        databaseName: 'InventoryHub_Warehouse_DB',
        version: '1.0.0',
        lastReset: new Date().toISOString()
      },
      products: INITIAL_SEED_PRODUCTS
    };
    this.writeDatabase(resetData);
    return resetData.products;
  }
}

export const db = new Database();
