import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './lib/config';
import { logger } from './lib/logger';

// Import routes
import analyzeRoutes from './routes/analyze';
import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request timing
app.use((req, res, next) => {
  (req as any).startTime = Date.now();
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MetaGipsy OWL Chess Engine API',
    version: '1.0.0',
    description: 'AI conversation analysis with chess-like scoring',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      analyze: '/api/v1/analyze',
      sessions: '/api/v1/sessions',
      auth: '/api/v1/auth'
    }
  });
});

// API routes
app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error, url: req.url, method: req.method });
  
  res.status(500).json({
    error: 'Internal server error'
  });
});

const port = config.port;

app.listen(port, '0.0.0.0', () => {
  logger.info(`MetaGipsy API server running on port ${port}`);
});

export default app;

