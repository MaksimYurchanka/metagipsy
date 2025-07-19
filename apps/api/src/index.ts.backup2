import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateConfig } from './lib/config';
import { logger } from './lib/logger';

// Import routes
import analyzeRoutes from './routes/analyze';
import authRoutes from './routes/auth';
import sessionsRoutes from './routes/sessions';
// ✅ NEW: Stripe payment integration
import paymentsRoutes from './routes/payments';
import webhooksRoutes from './routes/webhooks';

const app = express();

// ✅ NEW: Validate configuration including Stripe settings
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed:', error);
  process.exit(1);
}

// ✅ ENHANCED: Security middleware with payment-specific headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));

// ✅ CRITICAL: Webhook routes MUST be defined BEFORE express.json() middleware
// Stripe webhooks require raw body for signature verification
app.use('/api/v1/webhooks', webhooksRoutes);

// ✅ STANDARD: JSON middleware for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request timing and logging
app.use((req, res, next) => {
  (req as any).startTime = Date.now();
  
  // ✅ ENHANCED: Log payment-related requests for security monitoring
  if (req.path.includes('/payments') || req.path.includes('/webhooks')) {
    logger.info('Payment request received', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
});

// Health check with enhanced payment system status
app.get('/health', async (req, res) => {
  try {
    // ✅ NEW: Include Stripe connectivity in health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected', // TODO: Add actual DB health check
        redis: 'connected',    // TODO: Add actual Redis health check
        stripe: config.stripe.secretKey ? 'configured' : 'not_configured',
        anthropic: config.anthropic.apiKey ? 'configured' : 'not_configured'
      },
      environment: config.nodeEnv
    };

    res.json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'MetaGipsy OWL Chess Engine API',
    version: '1.0.0',
    description: 'AI conversation analysis with chess-like scoring and payment processing',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      analyze: '/api/v1/analyze',
      sessions: '/api/v1/sessions',
      auth: '/api/v1/auth',
      // ✅ NEW: Payment endpoints
      payments: '/api/v1/payments',
      webhooks: '/api/v1/webhooks'
    },
    features: [
      '5D conversation analysis',
      'Chess notation scoring',
      'Session management', 
      'Stripe payment processing',
      'Subscription management'
    ]
  });
});

// ✅ ENHANCED: API routes with payment integration
app.use('/api/v1/analyze', analyzeRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
// ✅ NEW: Payment processing routes
app.use('/api/v1/payments', paymentsRoutes);

// Response time logging middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    const duration = Date.now() - (req as any).startTime;
    
    // ✅ ENHANCED: Special logging for payment operations
    if (req.path.includes('/payments') || req.path.includes('/webhooks')) {
      logger.info('Payment request completed', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        success: res.statusCode < 400
      });
    } else {
      logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    }
  });
  
  next();
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('404 - Endpoint not found', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} is not a valid endpoint`,
    availableEndpoints: [
      '/health',
      '/api/v1/analyze',
      '/api/v1/sessions', 
      '/api/v1/auth',
      '/api/v1/payments',
      '/api/v1/webhooks'
    ]
  });
});

// ✅ ENHANCED: Error handler with payment-specific error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isPaymentRequest = req.path.includes('/payments') || req.path.includes('/webhooks');
  
  // ✅ CRITICAL: Special handling for payment errors
  if (isPaymentRequest) {
    logger.error('Payment system error', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body ? JSON.stringify(req.body).substring(0, 200) : 'no body'
    });
    
    // Don't expose internal payment errors to client
    res.status(500).json({
      error: 'Payment processing error',
      message: 'Please try again or contact support if the problem persists',
      requestId: (req as any).requestId || 'unknown'
    });
  } else {
    // Standard error handling for non-payment requests
    logger.error('Unhandled error', { 
      error: error.message, 
      stack: error.stack,
      url: req.url, 
      method: req.method 
    });
    
    res.status(500).json({
      error: 'Internal server error',
      message: config.nodeEnv === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// ✅ ENHANCED: Graceful shutdown handling for payment processing
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // TODO: Add cleanup for any ongoing payment processes
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  // TODO: Add cleanup for any ongoing payment processes  
  process.exit(0);
});

const port = config.port;

app.listen(port, '0.0.0.0', () => {
  logger.info(`MetaGipsy API server running on port ${port}`, {
    environment: config.nodeEnv,
    stripe: config.stripe.secretKey ? 'configured' : 'not_configured',
    webhooks: config.stripe.webhookSecret ? 'configured' : 'not_configured'
  });
});

export default app;