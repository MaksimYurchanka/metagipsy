import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../lib/config';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Initialize Stripe with updated API version
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Helper functions for safe property access (following project patterns)
const getClientIP = (req: Request): string => {
  return req.ip || 
         (req.socket && req.socket.remoteAddress) || 
         'unknown';
};

const getUserAgent = (req: Request): string | undefined => {
  return req.get ? req.get('User-Agent') : req.headers['user-agent'] as string;
};

// Helper function to safely extract subscription ID from invoice (TypeScript compatible)
const getSubscriptionIdFromInvoice = (invoice: Stripe.Invoice): string | undefined => {
  // Stripe Invoice can have subscription property as string, object, or undefined
  // TypeScript definitions don't always include it, but it exists at runtime
  const invoiceAny = invoice as any;
  
  if (!invoiceAny.subscription) return undefined;
  
  // Handle both string and expanded object subscription types
  if (typeof invoiceAny.subscription === 'string') {
    return invoiceAny.subscription;
  } else if (typeof invoiceAny.subscription === 'object' && invoiceAny.subscription.id) {
    return invoiceAny.subscription.id;
  }
  
  return undefined;
};

// Webhook signature verification
const verifyStripeSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event | null => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    logger.error('Webhook signature verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      hasSignature: !!signature,
      hasSecret: !!secret
    });
    return null;
  }
};

// Helper function to determine plan type from price ID
const getPlanTypeFromPriceId = (priceId: string): 'daily' | 'monthly' | 'unknown' => {
  if (priceId === config.stripe.priceDaily) return 'daily';
  if (priceId === config.stripe.priceMonthly) return 'monthly';
  return 'unknown';
};

// Helper function to get daily limit based on plan
const getDailyLimitForPlan = (planType: 'daily' | 'monthly'): number => {
  return 500000; // Both plans have 500k characters
};

// Database operations for user subscription management
const updateUserSubscription = async (
  customerId: string,
  updates: {
    subscriptionStatus?: string;
    currentPlan?: string;
    subscriptionId?: string;
    subscriptionStart?: Date;
    subscriptionEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    dailyLimit?: number;
  }
): Promise<void> => {
  try {
    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    logger.info('User subscription updated', {
      customerId,
      updates: { ...updates, customerId: '[REDACTED]' }
    });
  } catch (error) {
    logger.error('Failed to update user subscription', {
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

const recordPaymentTransaction = async (
  paymentIntentId: string,
  customerId: string,
  amount: number,
  status: string,
  planType: string,
  planName: string,
  metadata?: any,
  failureReason?: string
): Promise<void> => {
  try {
    await prisma.paymentTransaction.create({
      data: {
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId: customerId,
        userId: '', // TODO: Link to actual user ID when we have customer->user mapping
        amount,
        currency: 'usd',
        status,
        planType,
        planName,
        metadata: metadata || {},
        failureReason
      }
    });

    logger.info('Payment transaction recorded', {
      paymentIntentId,
      customerId,
      amount: amount / 100, // Log in dollars (cents to dollars conversion)
      status,
      planType
    });
  } catch (error) {
    logger.error('Failed to record payment transaction', {
      paymentIntentId,
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    // Don't throw - this shouldn't break webhook processing
  }
};

// Event handlers for each Stripe event type
const eventHandlers = {
  // Customer Events
  async 'customer.created'(event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;
    logger.info('Customer created webhook received', {
      customerId: customer.id,
      email: customer.email ? '[REDACTED]' : null,
      created: customer.created
    });
    
    // TODO: Link customer to existing user account if email matches
  },

  async 'customer.updated'(event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;
    logger.info('Customer updated webhook received', {
      customerId: customer.id
    });
    
    // TODO: Update any cached customer information
  },

  async 'customer.deleted'(event: Stripe.Event) {
    const customer = event.data.object as Stripe.Customer;
    logger.info('Customer deleted webhook received', {
      customerId: customer.id
    });
    
    await updateUserSubscription(customer.id, {
      subscriptionStatus: 'canceled',
      currentPlan: undefined,
      subscriptionId: undefined,
      dailyLimit: 5000 // Reset to free tier
    });
  },

  // Payment Intent Events
  async 'payment_intent.succeeded'(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const customerId = paymentIntent.customer as string;
    const priceId = paymentIntent.metadata.priceId;
    const planName = paymentIntent.metadata.planName || 'Unknown';
    const planType = getPlanTypeFromPriceId(priceId);
    
    logger.info('Payment succeeded webhook received', {
      paymentIntentId: paymentIntent.id,
      customerId,
      amount: paymentIntent.amount / 100, // Log in dollars
      planType,
      planName
    });
    
    // Record successful payment
    await recordPaymentTransaction(
      paymentIntent.id,
      customerId,
      paymentIntent.amount,
      'succeeded',
      planType,
      planName,
      paymentIntent.metadata
    );
    
    // Upgrade user access if this is a valid plan
    if (planType !== 'unknown') {
      const dailyLimit = getDailyLimitForPlan(planType);
      const subscriptionEnd = new Date();
      
      if (planType === 'daily') {
        subscriptionEnd.setHours(subscriptionEnd.getHours() + 24);
      } else {
        subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);
      }
      
      await updateUserSubscription(customerId, {
        subscriptionStatus: 'active',
        currentPlan: planType,
        subscriptionStart: new Date(),
        subscriptionEnd,
        dailyLimit
      });
      
      // Reset usage tracking in separate update (avoiding conflicts)
      try {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            dailyUsage: 0,
            usageResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
      } catch (usageError) {
        logger.warn('Failed to reset usage tracking', {
          customerId,
          error: usageError instanceof Error ? usageError.message : 'Unknown error'
        });
      }
      
      logger.info('User upgraded successfully', {
        customerId,
        planType,
        dailyLimit
      });
    }
  },

  async 'payment_intent.payment_failed'(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const customerId = paymentIntent.customer as string;
    const lastPaymentError = paymentIntent.last_payment_error?.message || 'Unknown error';
    const planType = getPlanTypeFromPriceId(paymentIntent.metadata.priceId);
    const planName = paymentIntent.metadata.planName || 'Unknown';
    
    logger.warn('Payment failed webhook received', {
      paymentIntentId: paymentIntent.id,
      customerId,
      error: lastPaymentError,
      planType
    });
    
    await recordPaymentTransaction(
      paymentIntent.id,
      customerId,
      paymentIntent.amount,
      'failed',
      planType,
      planName,
      paymentIntent.metadata,
      lastPaymentError
    );
  },

  // Invoice Events (for future subscription support) - FIXED TypeScript compatibility
  async 'invoice.payment_succeeded'(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    const subscriptionId = getSubscriptionIdFromInvoice(invoice); // ✅ TypeScript safe access
    
    logger.info('Invoice payment succeeded webhook received', {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      amount: (invoice.amount_paid || 0) / 100 // Log in dollars
    });
    
    // For recurring subscriptions, ensure user access is maintained
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const planType = getPlanTypeFromPriceId(priceId || '');
        
        if (planType !== 'unknown') {
          const dailyLimit = getDailyLimitForPlan(planType);
          const subscriptionEnd = new Date((subscription as any).current_period_end * 1000);
          
          await updateUserSubscription(customerId, {
            subscriptionStatus: 'active',
            currentPlan: planType,
            subscriptionEnd,
            dailyLimit
          });
        }
      } catch (error) {
        logger.error('Failed to process invoice payment success', {
          invoiceId: invoice.id,
          customerId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  },

  async 'invoice.payment_failed'(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;
    const subscriptionId = getSubscriptionIdFromInvoice(invoice); // ✅ TypeScript safe access
    
    logger.warn('Invoice payment failed webhook received', {
      invoiceId: invoice.id,
      customerId,
      subscriptionId,
      attemptCount: invoice.attempt_count
    });
    
    // If this is a subscription renewal failure, consider downgrading after grace period
    if (subscriptionId && (invoice.attempt_count || 0) >= 3) {
      logger.warn('Multiple payment failures detected, considering account suspension', {
        customerId,
        invoiceId: invoice.id,
        attemptCount: invoice.attempt_count
      });
      
      // TODO: Implement grace period logic
      await updateUserSubscription(customerId, {
        subscriptionStatus: 'past_due'
      });
    }
  },

  // Subscription Events (for future recurring billing)
  async 'customer.subscription.created'(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    const planType = getPlanTypeFromPriceId(priceId || '');
    
    logger.info('Subscription created webhook received', {
      subscriptionId: subscription.id,
      customerId,
      planType,
      status: subscription.status
    });
    
    if (planType !== 'unknown' && subscription.status === 'active') {
      const dailyLimit = getDailyLimitForPlan(planType);
      const subscriptionEnd = new Date((subscription as any).current_period_end * 1000);
      
      await updateUserSubscription(customerId, {
        subscriptionStatus: 'active',
        currentPlan: planType,
        subscriptionId: subscription.id,
        subscriptionStart: new Date((subscription as any).current_period_start * 1000),
        subscriptionEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        dailyLimit
      });
    }
  },

  async 'customer.subscription.updated'(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;
    const planType = getPlanTypeFromPriceId(priceId || '');
    
    logger.info('Subscription updated webhook received', {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
    
    const subscriptionEnd = new Date((subscription as any).current_period_end * 1000);
    
    // Update user access based on subscription status
    if (subscription.status === 'active' && planType !== 'unknown') {
      const dailyLimit = getDailyLimitForPlan(planType);
      
      await updateUserSubscription(customerId, {
        subscriptionStatus: 'active',
        currentPlan: planType,
        subscriptionEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        dailyLimit
      });
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      await updateUserSubscription(customerId, {
        subscriptionStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        subscriptionEnd
      });
      
      if (subscription.status === 'canceled') {
        await updateUserSubscription(customerId, {
          currentPlan: undefined,
          dailyLimit: 5000 // Reset to free tier
        });
      }
    }
  },

  async 'customer.subscription.deleted'(event: Stripe.Event) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;
    
    logger.info('Subscription deleted webhook received', {
      subscriptionId: subscription.id,
      customerId
    });
    
    await updateUserSubscription(customerId, {
      subscriptionStatus: 'canceled',
      currentPlan: undefined,
      subscriptionId: undefined,
      dailyLimit: 5000 // Reset to free tier
    });
  },
};

/**
 * POST /api/v1/webhooks/stripe
 * Main Stripe webhook endpoint
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripe.webhookSecret;
  const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const clientIp = getClientIP(req);
  const userAgent = getUserAgent(req);
  
  if (!signature) {
    logger.error('Missing Stripe signature', { requestId, ip: clientIp });
    return res.status(400).send('Missing Stripe signature');
  }
  
  if (!webhookSecret) {
    logger.error('Missing webhook secret configuration', { requestId });
    return res.status(500).send('Webhook secret not configured');
  }

  // Verify webhook signature
  const event = verifyStripeSignature(req.body, signature, webhookSecret);
  if (!event) {
    logger.error('Invalid webhook signature', { 
      requestId, 
      ip: clientIp,
      userAgent
    });
    return res.status(400).send('Invalid signature');
  }

  logger.info('Webhook event received', {
    requestId,
    eventType: event.type,
    eventId: event.id,
    livemode: event.livemode,
    ip: clientIp
  });

  try {
    // Handle the event
    const handler = eventHandlers[event.type as keyof typeof eventHandlers];
    
    if (handler) {
      await handler(event);
      logger.info('Webhook event processed successfully', {
        requestId,
        eventType: event.type,
        eventId: event.id
      });
    } else {
      logger.info('Unhandled webhook event type', {
        requestId,
        eventType: event.type,
        eventId: event.id
      });
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ 
      received: true, 
      event: event.type, 
      id: event.id,
      processed: !!handler,
      requestId
    });

  } catch (error) {
    logger.error('Webhook processing error', {
      requestId,
      eventType: event.type,
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return 500 to tell Stripe to retry
    res.status(500).json({ 
      error: 'Webhook processing failed',
      event: event.type,
      id: event.id,
      requestId
    });
  }
});

/**
 * GET /api/v1/webhooks/stripe/health
 * Webhook health check
 */
router.get('/stripe/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    webhook_secret_configured: !!config.stripe.webhookSecret,
    supported_events: Object.keys(eventHandlers),
    timestamp: new Date().toISOString(),
  });
});

export default router;