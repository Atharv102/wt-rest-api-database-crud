/**
 * InventoryHub — RESTful API Router
 * Maps standard HTTP methods to product controller actions with validation middleware.
 */

import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/validator.js';

const router = Router();

// Aggregate Analytics & Utilities (defined before /:id parameter)
router.get('/products/stats/summary', productController.getStats);
router.post('/products/reset', productController.resetSeed);

// Collection Level CRUD
router.get('/products', productController.getAllProducts);
router.post('/products', validateCreateProduct, productController.createProduct);

// Resource Level CRUD
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', validateUpdateProduct, productController.updateProduct);
router.patch('/products/:id', productController.patchProduct);
router.delete('/products/:id', productController.deleteProduct);

export default router;

