import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import reportsRouter from './routes/reports';
import promotionsRouter from './routes/promotions';
import expensesRouter from './routes/expenses';
import usersRouter from './routes/users';
import shippingZonesRouter from './routes/shippingZones';
import settingsRouter from './routes/settings';

const app = express();

// CORS — restrict origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : true; // allow all in development when not set
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Handle preflight requests explicitly (before rate limiters)
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Rate limiting — strict for auth, relaxed for general API
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml')) as object;
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Baba Abdullah Kitchen API',
  customCss: '.swagger-ui .topbar { background-color: #8B4513; }',
}));

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/categories', apiLimiter, categoriesRouter);
app.use('/api/products', apiLimiter, productsRouter);
app.use('/api/orders', apiLimiter, ordersRouter);
app.use('/api/reports', apiLimiter, reportsRouter);
app.use('/api/promotions', apiLimiter, promotionsRouter);
app.use('/api/expenses', apiLimiter, expensesRouter);
app.use('/api/users', apiLimiter, usersRouter);
app.use('/api/shipping-zones', apiLimiter, shippingZonesRouter);
app.use('/api/settings', apiLimiter, settingsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'baba-abdullah-kitchen-api' }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
