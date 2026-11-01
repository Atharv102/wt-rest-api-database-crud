/**
 * InventoryHub — Product Controller
 * Implements RESTful HTTP handlers for all CRUD operations.
 */

import { db } from '../models/database.js';
import { ALLOWED_CATEGORIES } from '../middleware/validator.js';

export const productController = {
  // 1. CREATE: POST /api/products
  createProduct(req, res) {
    try {
      const newProduct = db.insert(req.body);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        statusMessage: 'Created: Product Record Inserted Into Database',
        message: `Product "${newProduct.name}" created successfully with ID ${newProduct.id}.`,
        data: newProduct,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error inserting product:', err);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Database insertion error occurred',
        error: err.message
      });
    }
  },

  // 2. READ ALL: GET /api/products
  getAllProducts(req, res) {
    try {
      const result = db.findAll(req.query);
      return res.status(200).json({
        success: true,
        statusCode: 200,
        statusMessage: 'OK: Records Retrieved Successfully',
        totalRecords: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({
        success: false,
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Database query execution error',
        error: err.message
      });
    }
  },

  // 3. READ ONE: GET /api/products/:id
  getProductById(req, res) {
    const { id } = req.params;
    const product = db.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        statusMessage: 'Not Found: Record Missing',
        message: `Product with ID "${id}" does not exist in the database.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Product Record Found',
      data: product,
      timestamp: new Date().toISOString()
    });
  },

  // 4. UPDATE (FULL): PUT /api/products/:id
  updateProduct(req, res) {
    const { id } = req.params;
    const updated = db.update(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Cannot update product "${id}" because it does not exist.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Product Record Fully Updated',
      message: `Product "${updated.name}" (${updated.id}) has been updated in database.`,
      data: updated,
      timestamp: new Date().toISOString()
    });
  },

  // 5. UPDATE (PARTIAL): PATCH /api/products/:id
  patchProduct(req, res) {
    const { id } = req.params;
    const existing = db.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Product with ID "${id}" was not found for patch update.`,
        timestamp: new Date().toISOString()
      });
    }

    // Ensure at least one field is provided
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        statusMessage: 'Bad Request: No Fields to Update',
        message: 'Provide at least one attribute to perform partial update via PATCH.',
        timestamp: new Date().toISOString()
      });
    }

    const updated = db.update(id, req.body);
    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Product Partially Patched',
      message: `Product "${updated.name}" was partially updated.`,
      data: updated,
      timestamp: new Date().toISOString()
    });
  },

  // 6. DELETE: DELETE /api/products/:id
  deleteProduct(req, res) {
    const { id } = req.params;
    const deleted = db.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        statusMessage: 'Not Found: Record Missing',
        message: `Cannot delete product with ID "${id}". Record not found in database.`,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Product Record Deleted From Database',
      message: `Product "${deleted.name}" (${deleted.id}) was permanently deleted from database.`,
      deletedRecord: deleted,
      timestamp: new Date().toISOString()
    });
  },

  // 7. STATS: GET /api/products/stats/summary
  getStats(req, res) {
    const stats = db.getStats();
    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Inventory Statistics Calculated',
      stats,
      allowedCategories: ALLOWED_CATEGORIES,
      timestamp: new Date().toISOString()
    });
  },

  // 8. RESET SEED: POST /api/products/reset
  resetSeed(req, res) {
    const products = db.resetSeed();
    return res.status(200).json({
      success: true,
      statusCode: 200,
      statusMessage: 'OK: Database Reset to Factory Seed State',
      message: 'Warehouse database reseeded with default product records.',
      count: products.length,
      timestamp: new Date().toISOString()
    });
  }
};

