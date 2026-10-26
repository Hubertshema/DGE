import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { query } from './db';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import categoriesRouter from './routes/categories';
import notificationsRouter from './routes/notifications';
import updatesRouter from './routes/updates';

import { env } from './config/env';
import { authRateLimiter, apiRateLimiter } from './middleware/rateLimiter';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin === '*' ? true : env.clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Apply general API rate limiter
app.use('/api', apiRateLimiter);

// Apply strict rate limiter to authentication routes
app.use('/api/v1/auth', authRateLimiter);

// Lightweight Keep-Alive Ping (Zero DB overhead to preserve Neon free compute hours)
app.get('/ping', (_req: Request, res: Response) => {
  res.status(200).send('pong');
});

// Health Check Endpoint (Proves Neon connection)
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbResult = await query('SELECT NOW() as server_time, version()');
    res.json({
      status: 'healthy',
      app: 'DG E-Commerce Backend',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        serverTime: dbResult.rows[0].server_time,
        version: dbResult.rows[0].version,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

// Route Modules
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/updates', updatesRouter);


// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal error occurred.',
  });
});

export default app;
