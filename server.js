/**
 * InventoryHub — Server Entrypoint
 * Enterprise RESTful API for Database CRUD operations
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import productRoutes from './routes/productRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Static Web Assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/api', productRoutes);

// Health Check Probe
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'InventoryHub Database CRUD RESTful API',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Download Postman Collection via API
app.get('/api/postman-collection', (req, res) => {
  const postmanPath = path.join(__dirname, 'InventoryHub_API.postman_collection.json');
  if (fs.existsSync(postmanPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="InventoryHub_API.postman_collection.json"');
    return res.sendFile(postmanPath);
  }
  return res.status(404).json({ error: 'Postman collection file not found' });
});

// 404 Handler for Unmapped API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    statusMessage: 'Not Found',
    message: `The requested REST endpoint "${req.method} ${req.originalUrl}" does not exist on this server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: 'An unexpected server exception occurred while processing your request.',
    error: err.message
  });
});

// Start Server if executed directly
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`  InventoryHub RESTful Database API is RUNNING!         `);
    console.log(`  Local Server:  http://localhost:${PORT}               `);
    console.log(`  API Base:      http://localhost:${PORT}/api/products  `);
    console.log(`  Health Check:  http://localhost:${PORT}/api/health    `);
    console.log('========================================================');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = Number(PORT) + 1;
      console.warn(`Port ${PORT} in use, starting on port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`Server started on fallback port ${fallbackPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

export default app;

