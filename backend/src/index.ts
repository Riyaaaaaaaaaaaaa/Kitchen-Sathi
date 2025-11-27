// import dotenv from 'dotenv';
// dotenv.config();

// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import apiRouter from './routes/index.js';

// const app = express();

// app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
// app.use(express.json());

// app.use('/api', apiRouter);

// app.get('/api/health', (_req, res) => {
//   res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
// });

// const port = Number(process.env.PORT || 5000);
// const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aajkyabanega';

// async function start() {
//   try {
//     await mongoose.connect(mongoUri);
//     app.listen(port, () => {
//       console.log(`API running on http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error('Failed to start server', err);
//     process.exit(1);
//   }
// }

// start();


// // Global error handlers to surface otherwise-silent exceptions/rejections
// process.on('uncaughtException', (err) => {
//   console.error('[uncaughtException]', err);
// });

// process.on('unhandledRejection', (reason) => {
//   console.error('[unhandledRejection]', reason);
// });
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import apiRouter from './routes/index.js';
// Temporarily disabled - causing crash
// import { expiryCheckService } from './services/ExpiryCheckService.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'test', time: new Date().toISOString() });
});

app.use('/api', apiRouter);

// Global error handler to ensure JSON responses
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[error] Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`[404] ❌ API route not found: ${req.method} ${req.originalUrl}`);
  console.log(`[404] Request headers:`, req.headers);
  res.status(404).json({ 
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /api/health',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/me',
      'GET /api/groceries',
      'POST /api/groceries',
      'PATCH /api/groceries/:id/status ⭐ STATUS UPDATE',
      'POST /api/groceries/:id/mark-completed ⭐ STATUS UPDATE',
      'POST /api/groceries/:id/mark-used ⭐ STATUS UPDATE',
      'GET /api/groceries/by-status/:status',
      'PATCH /api/groceries/:id',
      'DELETE /api/groceries/:id',
      'GET /api/groceries/expiring',
      'GET /api/groceries/expired',
      'GET /api/groceries/notifications',
      'PATCH /api/groceries/:id/expiry',
      'GET /api/groceries/expiry/stats'
    ]
  });
});

// Log all registered routes for debugging
console.log('[startup] ✅ Registered routes:');
console.log('  GET    /api/health');
console.log('  GET    /api');
console.log('  POST   /api/auth/register');
console.log('  POST   /api/auth/login');
console.log('  GET    /api/me (auth required)');
console.log('  GET    /api/admin/ping (admin required)');
console.log('  GET    /api/groceries (auth required)');
console.log('  POST   /api/groceries (auth required)');
console.log('  PATCH  /api/groceries/:id/status (auth required) ⭐');
console.log('  POST   /api/groceries/:id/mark-completed (auth required) ⭐');
console.log('  POST   /api/groceries/:id/mark-used (auth required) ⭐');
console.log('  GET    /api/groceries/by-status/:status (auth required) ⭐');
console.log('  PATCH  /api/groceries/:id (auth required)');
console.log('  DELETE /api/groceries/:id (auth required)');
console.log('  GET    /api/groceries/expiring (auth required)');
console.log('  GET    /api/groceries/expired (auth required)');
console.log('  PATCH  /api/groceries/:id/expiry (auth required)');
console.log('⭐ = Status update routes');

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aajkyabanega';

async function start() {
  try {
    console.log('[startup] connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[startup] connected to MongoDB');
    
    // Import and initialize the grocery expiry service
    const { groceryExpiryService } = await import('./services/groceryExpiryService.js');
    console.log('[startup] ✅ Grocery expiry service imported');
    
    // Initialize cron job for daily checks at midnight
    groceryExpiryService.initializeCronJob();
    
    // Run initial check on startup (after 5 seconds)
    setTimeout(() => {
      console.log('[startup] 🔍 Running initial expiry check...');
      groceryExpiryService.checkAndNotifyExpiringGroceries().catch(err => {
        console.error('[startup] ❌ Initial expiry check failed:', err);
      });
    }, 5000);
    
    app.listen(port, () => {
      console.log(`🌐 API running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (err) {
    console.error('[startup] Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

