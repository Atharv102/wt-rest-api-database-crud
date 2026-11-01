/**
 * InventoryHub — API Request Validation Middleware
 * Validates inputs for CRUD endpoints, ensures data constraints,
 * and intercepts errors before reaching database operations.
 */

import { db } from '../models/database.js';

export const ALLOWED_CATEGORIES = [
  'Laptops & Computers',
  'Peripherals',
  'Monitors & Displays',
  'Audio & Acoustics',
  'Networking',
  'Storage & Drives',
  'Components & Power'
];

/**
 * Validate POST /api/products payload
 */
export function validateCreateProduct(req, res, next) {
  const { sku, name, category, quantity, unitPrice, supplier, reorderThreshold } = req.body;
  const errors = [];

  // SKU validation
  if (!sku || typeof sku !== 'string' || !sku.trim()) {
    errors.push({ field: 'sku', message: 'SKU (Stock Keeping Unit) is required' });
  } else if (!/^[A-Za-z0-9-_]{3,25}$/.test(sku.trim())) {
    errors.push({ field: 'sku', message: 'SKU must be 3-25 alphanumeric characters, hyphens, or underscores' });
  } else {
    // Unique SKU check
    const existing = db.findBySku(sku.trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        statusMessage: 'Conflict: Duplicate Record Detected',
        message: `A product with SKU "${sku.trim().toUpperCase()}" already exists (Product ID: ${existing.id})`,
        error: 'DUPLICATE_SKU',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push({ field: 'name', message: 'Product name is required' });
  } else if (name.trim().length < 3 || name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Product name must be between 3 and 100 characters' });
  }

  // Category validation
  if (!category || !category.trim()) {
    errors.push({ field: 'category', message: 'Category must be selected' });
  } else if (!ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.push({ field: 'category', message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  // Quantity validation
  if (quantity === undefined || quantity === null || quantity === '') {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else {
    const qNum = Number(quantity);
    if (!Number.isInteger(qNum) || qNum < 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be a non-negative whole integer (0 or greater)' });
    }
  }

  // Unit Price validation
  if (unitPrice === undefined || unitPrice === null || unitPrice === '') {
    errors.push({ field: 'unitPrice', message: 'Unit Price is required' });
  } else {
    const pNum = Number(unitPrice);
    if (isNaN(pNum) || pNum <= 0) {
      errors.push({ field: 'unitPrice', message: 'Unit Price must be a positive number greater than 0' });
    }
  }

  // Supplier validation
  if (!supplier || typeof supplier !== 'string' || !supplier.trim()) {
    errors.push({ field: 'supplier', message: 'Supplier name is required' });
  } else if (supplier.trim().length < 2 || supplier.trim().length > 100) {
    errors.push({ field: 'supplier', message: 'Supplier name must be between 2 and 100 characters' });
  }

  // Reorder Threshold
  if (reorderThreshold !== undefined && reorderThreshold !== '') {
    const tNum = Number(reorderThreshold);
    if (!Number.isInteger(tNum) || tNum < 0) {
      errors.push({ field: 'reorderThreshold', message: 'Reorder threshold must be an integer >= 0' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      statusMessage: 'Bad Request: Input Validation Failed',
      errorCount: errors.length,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Validate PUT /api/products/:id payload
 */
export function validateUpdateProduct(req, res, next) {
  const { id } = req.params;
  const existing = db.findById(id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      statusMessage: 'Not Found: Product Record Does Not Exist',
      message: `Cannot update. Product with ID "${id}" was not found in the database.`,
      timestamp: new Date().toISOString()
    });
  }

  const { sku, name, category, quantity, unitPrice, supplier } = req.body;
  const errors = [];

  // SKU check
  if (sku) {
    if (!/^[A-Za-z0-9-_]{3,25}$/.test(sku.trim())) {
      errors.push({ field: 'sku', message: 'SKU must be 3-25 alphanumeric characters, hyphens, or underscores' });
    } else {
      const match = db.findBySku(sku.trim());
      if (match && match.id !== id) {
        return res.status(409).json({
          success: false,
          statusCode: 409,
          statusMessage: 'Conflict: Duplicate SKU',
          message: `SKU "${sku.trim().toUpperCase()}" is already assigned to product "${match.name}" (ID: ${match.id})`,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  if (name && (name.trim().length < 3 || name.trim().length > 100)) {
    errors.push({ field: 'name', message: 'Product name must be between 3 and 100 characters' });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.push({ field: 'category', message: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }

  if (quantity !== undefined) {
    const qNum = Number(quantity);
    if (!Number.isInteger(qNum) || qNum < 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be a non-negative integer >= 0' });
    }
  }

  if (unitPrice !== undefined) {
    const pNum = Number(unitPrice);
    if (isNaN(pNum) || pNum <= 0) {
      errors.push({ field: 'unitPrice', message: 'Unit Price must be greater than 0' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      statusMessage: 'Bad Request: Input Validation Failed',
      errorCount: errors.length,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  next();
}
