// apps/web/src/components/payment/CheckoutForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { X, CreditCard, Loader2, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  priceId: string;
  planName: string;
  planPrice: string;
  onClose: () => void;
  onSuccess?: (subscriptionId: string) => void;
}

interface PaymentFormProps {
  priceId: string;
  planName: string;
  planPrice: string;
  onClose: () => void;
  onSuccess?: (subscriptionId: string) => void;
}

// Main Checkout Modal Component
const CheckoutForm: React.FC<CheckoutFormProps> = ({
  priceId,
  planName,
  planPrice,
  onClose,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Create Payment Intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError('');

        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add auth header if needed
            // 'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            priceId,
            planName,
          }),
        });

        if (!response.ok) {
          throw new Error(`Payment setup failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      } catch (err) {
        console.error('Payment Intent creation failed:', err);
        setError(err instanceof Error ? err.message : 'Payment setup failed');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [priceId, planName]);

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#7c3aed',
        colorBackground: '#1f2937',
        colorText: '#f9fafb',
        colorDanger: '#ef4444',
        fontFamily: '"Inter", system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
        focusBoxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2)',
      },
      rules: {
        '.Input': {
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          color: '#f9fafb',
          boxShadow: 'none',
        },
        '.Input:focus': {
          border: '1px solid #7c3aed',
          boxShadow: '0 0 0 1px rgba(124, 58, 237, 0.2)',
        },
        '.Label': {
          color: '#d1d5db',
          fontWeight: '500',
        },
        '.Tab': {
          backgroundColor: '#374151',
          border: '1px solid #4b5563',
          color: '#d1d5db',
        },
        '.Tab:hover': {
          backgroundColor: '#4b5563',
          color: '#f9fafb',
        },
        '.Tab--selected': {
          backgroundColor: '#7c3aed',
          borderColor: '#7c3aed',
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-100">{planName}</h2>
            <p className="text-gray-400">Complete your upgrade</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Plan:</span>
              <span className="text-gray-100 font-semibold">{planName}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-300">Total:</span>
              <span className="text-2xl font-bold text-gray-100">{planPrice}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center text-sm text-gray-400">
                <Shield className="w-4 h-4 mr-2" />
                <span>Secure payment • Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <span className="ml-3 text-gray-300">Setting up payment...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-300">Payment setup failed</span>
              </div>
              <p className="text-red-200 text-sm mt-2">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Try Again
              </Button>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm
                priceId={priceId}
                planName={planName}
                planPrice={planPrice}
                onClose={onClose}
                onSuccess={onSuccess}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// Payment Form Component (inside Elements provider)
const PaymentForm: React.FC<PaymentFormProps> = ({
  priceId,
  planName,
  planPrice,
  onClose,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Confirm payment
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSuccess(true);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-100 mb-2">Payment Successful!</h3>
        <p className="text-gray-300 mb-4">
          Welcome to {planName}! Your upgrade is now active.
        </p>
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 text-sm">
            🎉 Your account has been upgraded with 100x more analysis capacity!
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Payment Information
        </label>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Terms */}
      <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <p>
          By completing this purchase, you agree to our{' '}
          <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
            Privacy Policy
          </a>
          . Your subscription will auto-renew unless cancelled.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onClose}
          disabled={loading}
          variant="outline"
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600 hover:border-gray-500"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            `Pay ${planPrice}`
          )}
        </Button>
      </div>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center">
          <Shield className="w-3 h-3 mr-1" />
          Secured by Stripe • Your payment information is encrypted
        </p>
      </div>
    </form>
  );
};

export default CheckoutForm;