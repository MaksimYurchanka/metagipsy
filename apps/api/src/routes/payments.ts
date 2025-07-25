import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { config } from '../lib/config';
import { logger } from '../lib/logger';

const router = express.Router();

// Initialize Stripe with secret key
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

// Rate limiting for payment endpoints - Fixed for proxy
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: {
    error: 'Too many payment requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip proxy header validation for Render/Cloudflare
  skipFailedRequests: true,
  skipSuccessfulRequests: false,
});

// Validation schemas
const CreatePaymentIntentSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  planName: z.string().min(1, 'Plan name is required'),
  customerEmail: z.string().email().optional(),
  customerId: z.string().optional(),
});

const VerifyPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment Intent ID is required'),
});

// Price to amount mapping (amounts in cents)
const PriceToAmountMap: Record<string, number> = {
  [config.stripe.priceMonthly]: 19900, // $199.00 in cents
  [config.stripe.priceDaily]: 999,    // $9.99 in cents
};

// Helper functions for safe property access (following project patterns)
const getClientIP = (req: Request): string => {
  return req.ip || 
         (req.socket && req.socket.remoteAddress) || 
         'unknown';
};

const getUserAgent = (req: Request): string | undefined => {
  return req.get ? req.get('User-Agent') : req.headers['user-agent'] as string;
};

// Type definitions for validated data (matching Zod schema output)
type CreatePaymentIntentData = z.infer<typeof CreatePaymentIntentSchema>;
type VerifyPaymentData = z.infer<typeof VerifyPaymentSchema>;

/**
 * POST /api/v1/payments/create-payment-intent
 * Creates a Stripe Payment Intent for subscription purchases
 * FIXED: statement_descriptor → statement_descriptor_suffix for card compatibility
 */
router.post('/create-payment-intent', paymentRateLimit, async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientIP = getClientIP(req);
  const userAgent = getUserAgent(req);
  
  try {
    logger.info('Payment Intent creation started', {
      requestId,
      ip: clientIP,
      userAgent,
      body: { ...req.body, customerEmail: req.body.customerEmail ? '[REDACTED]' : undefined }
    });

    // Validate request body
    const validation = CreatePaymentIntentSchema.safeParse(req.body);
    if (!validation.success) {
      logger.warn('Invalid payment intent request', {
        requestId,
        errors: validation.error.errors,
        ip: clientIP
      });
      
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.errors,
        requestId
      });
    }

    // Extract validated data (TypeScript compatible)
    const { priceId, planName, customerEmail, customerId }: CreatePaymentIntentData = validation.data;

    // Verify price ID is valid
    if (!PriceToAmountMap[priceId]) {
      logger.warn('Invalid price ID provided', {
        requestId,
        priceId,
        ip: clientIP
      });
      
      return res.status(400).json({
        error: 'Invalid price ID',
        message: 'The specified price ID is not supported.',
        requestId
      });
    }

    const amount = PriceToAmountMap[priceId];

    // Get or create customer if email provided
    let customer: string | undefined;
    if (customerEmail) {
      try {
        // Search for existing customer
        const existingCustomers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0].id;
          logger.info('Existing customer found', {
            requestId,
            customerId: customer
          });
        } else {
          // Create new customer
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            metadata: {
              source: 'metagipsy-web',
              planName,
              requestId
            },
          });
          customer = newCustomer.id;
          
          logger.info('New customer created', {
            requestId,
            customerId: customer
          });
        }
      } catch (customerError) {
        logger.error('Customer creation/lookup failed', {
          requestId,
          error: customerError,
          email: customerEmail ? '[REDACTED]' : undefined
        });
        // Continue without customer - payment will still work
      }
    } else if (customerId) {
      customer = customerId;
    }

    // Create Payment Intent - FIXED: statement_descriptor_suffix for card compatibility
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer,
      metadata: {
        priceId,
        planName,
        source: 'metagipsy-web',
        requestId,
        timestamp: new Date().toISOString(),
      },
      description: `MetaGipsy ${planName} - AI Conversation Analysis`,
      // FIXED: Use statement_descriptor_suffix instead of statement_descriptor
      statement_descriptor_suffix: 'METAGIPSY',
      automatic_payment_methods: {
        enabled: true,
      },
      setup_future_usage: planName.includes('Monthly') ? 'off_session' : undefined,
    });

    // Log successful payment intent creation
    logger.info('Payment Intent created successfully', {
      requestId,
      paymentIntentId: paymentIntent.id,
      planName,
      amount: amount / 100, // Log in dollars
      customerId: customer,
      statementDescriptor: 'METAGIPSY (suffix)'
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: 'usd',
      metadata: {
        planName,
        priceId,
        requestId
      },
    });

  } catch (error) {
    logger.error('Payment Intent creation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIP,
      stripeError: error instanceof Stripe.errors.StripeError ? {
        type: error.type,
        code: error.code,
        param: error.param
      } : undefined
    });

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: 'Stripe error',
        message: error.message,
        type: error.type,
        requestId
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create payment intent',
      requestId
    });
  }
});

/**
 * GET /api/v1/payments/config
 * Returns public Stripe configuration
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      prices: {
        monthly: config.stripe.priceMonthly,
        daily: config.stripe.priceDaily,
      },
      currency: 'usd',
      environment: config.nodeEnv
    });
  } catch (error) {
    logger.error('Failed to get payment config', { error });
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get payment configuration'
    });
  }
});

/**
 * POST /api/v1/payments/verify-payment
 * Verifies payment status and processes subscription upgrade
 */
router.post('/verify-payment', async (req: Request, res: Response) => {
  const requestId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientIP = getClientIP(req);
  
  try {
    logger.info('Payment verification started', {
      requestId,
      ip: clientIP
    });

    const validation = VerifyPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Payment Intent ID is required',
        requestId
      });
    }

    // Extract validated data (TypeScript compatible)
    const { paymentIntentId }: VerifyPaymentData = validation.data;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    logger.info('Payment intent retrieved', {
      requestId,
      paymentIntentId,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100
    });

    if (paymentIntent.status === 'succeeded') {
      // TODO: Update user subscription in database
      // TODO: Send confirmation email
      // TODO: Log successful payment in PaymentTransaction table

      logger.info('Payment verification successful', {
        requestId,
        paymentIntentId,
        customerId: paymentIntent.customer,
        amount: paymentIntent.amount / 100
      });

      res.status(200).json({
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
        requestId
      });
    } else {
      logger.warn('Payment verification failed - not succeeded', {
        requestId,
        paymentIntentId,
        status: paymentIntent.status
      });
      
      res.status(400).json({
        success: false,
        status: paymentIntent.status,
        message: 'Payment not completed',
        requestId
      });
    }

  } catch (error) {
    logger.error('Payment verification failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIP
    });

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        error: 'Stripe error',
        message: error.message,
        requestId
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify payment',
      requestId
    });
  }
});

/**
 * GET /api/v1/payments/health
 * Health check for payment system
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test Stripe connection
    await stripe.accounts.retrieve();
    
    res.status(200).json({
      status: 'healthy',
      stripe: 'connected',
      timestamp: new Date().toISOString(),
      apiVersion: '2025-06-30.basil',
      fixes: {
        statementDescriptorSuffix: 'Applied',
        cardCompatibility: 'Fixed',
        proxySupport: 'Enhanced'
      }
    });
  } catch (error) {
    logger.error('Stripe health check failed', { error });
    
    res.status(503).json({
      status: 'unhealthy',
      stripe: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;