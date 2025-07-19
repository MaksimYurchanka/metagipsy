// apps/web/src/components/payment/PricingPlans.tsx
import React, { useState } from 'react';
import { Check, Zap, Crown, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CheckoutForm from './CheckoutForm';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: {
    dailyChars: string;
    analyses: string;
    export: boolean;
    support: string;
  };
  buttonText: string;
  buttonStyle: string;
  popular?: boolean;
  icon: React.ReactNode;
  priceId?: string;
}

const PricingPlans: React.FC = () => {
  // Checkout modal state
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Environment variables for pricing (order matches backend cents: daily=999¢, monthly=19900¢)
  const dailyPrice = import.meta.env.VITE_PRICE_DAILY_USD || '9.99';
  const monthlyPrice = import.meta.env.VITE_PRICE_MONTHLY_USD || '199.00';
  const freeLimit = import.meta.env.VITE_FREE_TIER_CHARS_DAILY || '5,000';
  const proLimit = import.meta.env.VITE_PRO_DAILY_CHARS || '500,000';

  // Stripe Price IDs (order matches price variables)
  const dailyPriceId = import.meta.env.VITE_STRIPE_PRICE_DAILY;
  const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_MONTHLY;

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying MetaGipsy',
      features: [
        'Complete 5D analysis',
        'Chess notation scoring',
        'Export as JSON/CSV/Markdown',
        'Session history',
        'Community support',
        'Context awareness scoring'
      ],
      limits: {
        dailyChars: `${freeLimit} characters/day`,
        analyses: '~10 analyses/day',
        export: true,
        support: 'Community'
      },
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-700 text-gray-300 cursor-not-allowed border border-gray-600',
      icon: <Users className="w-6 h-6 text-gray-400" />,
    },
    {
      id: 'daily',
      name: 'Pro Daily',
      price: `$${dailyPrice}`,
      period: '24 hours',
      description: 'Perfect for batch processing',
      features: [
        'Complete 5D analysis',
        '24-hour access window', 
        'All export formats',
        'Session insights',
        'Email support',
        '100x more capacity',
        'Advanced pattern detection'
      ],
      limits: {
        dailyChars: `${proLimit} characters/24h`,
        analyses: '~1000 analyses/day',
        export: true,
        support: 'Email'
      },
      buttonText: 'Upgrade to Pro Daily',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white transition-colors border-0',
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      priceId: dailyPriceId,
    },
    {
      id: 'monthly',
      name: 'Pro Monthly', 
      price: `$${monthlyPrice}`,
      period: '30 days',
      description: 'Best value for professionals',
      features: [
        'Complete 5D analysis',
        'Daily 500k character limit',
        'All export formats',
        'Advanced session insights',
        'Priority email support',
        'Maximum capacity',
        'Trend analysis',
        'Custom suggestions'
      ],
      limits: {
        dailyChars: `${proLimit} characters daily`,
        analyses: '~1000 analyses/day',
        export: true,
        support: 'Priority'
      },
      buttonText: 'Upgrade to Pro Monthly',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all border-0',
      popular: true,
      icon: <Crown className="w-6 h-6 text-purple-400" />,
      priceId: monthlyPriceId,
    }
  ];

  const handleUpgrade = (plan: PricingPlan) => {
    if (plan.id === 'free') return;
    
    // Open checkout modal with selected plan
    setSelectedPlan(plan);
    setShowCheckout(true);
    setPaymentSuccess(false);
  };

  const handleCheckoutClose = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    setPaymentSuccess(false);
  };

  const handlePaymentSuccess = (subscriptionId: string) => {
    console.log('Payment successful:', subscriptionId);
    setPaymentSuccess(true);
    
    // Auto-close checkout modal after showing success
    setTimeout(() => {
      handleCheckoutClose();
    }, 3000);
    
    // TODO: Refresh user subscription status
    // TODO: Show success notification
    // TODO: Redirect to dashboard or updated pricing page
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-100 mb-4">
          Choose Your Chess Mastery Level
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Upgrade your AI conversation analysis with more capacity. 
          Same powerful 5D analysis, just higher limits for power users.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
              plan.popular 
                ? 'border-purple-500 shadow-purple-500/20 shadow-xl' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-100">{plan.price}</span>
                <span className="text-gray-400 ml-2">/ {plan.period}</span>
              </div>
            </div>

            {/* Limits */}
            <div className="mb-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">LIMITS</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <span className="w-4 text-center">📊</span>
                  <span className="ml-2">{plan.limits.dailyChars}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 text-center">⚡</span>
                  <span className="ml-2">{plan.limits.analyses}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 text-center">📤</span>
                  <span className="ml-2">Export: {plan.limits.export ? 'Unlimited' : 'Limited'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 text-center">🎧</span>
                  <span className="ml-2">Support: {plan.limits.support}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-300 mb-4">FEATURES</h4>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => handleUpgrade(plan)}
              disabled={plan.id === 'free' || showCheckout}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                showCheckout && selectedPlan?.id === plan.id
                  ? 'bg-purple-600 text-white opacity-75 cursor-not-allowed'
                  : plan.buttonStyle
              }`}
            >
              {showCheckout && selectedPlan?.id === plan.id 
                ? 'Opening Checkout...' 
                : plan.buttonText
              }
            </Button>

            {/* Value Proposition */}
            {plan.id !== 'free' && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  {plan.id === 'daily' && '70% savings vs hourly rates'}
                  {plan.id === 'monthly' && 'Best value for regular users'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-800/30">
        <h3 className="text-2xl font-bold text-gray-100 mb-4">
          Ready to Master AI Conversations?
        </h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join thousands of users who've improved their AI collaboration by 2x. 
          Every conversation becomes a learning opportunity with MetaGipsy's 5D analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => handleUpgrade(plans[1])}
            disabled={showCheckout}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              showCheckout 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {showCheckout ? 'Processing...' : `Try Pro Daily - $${dailyPrice}`}
          </Button>
          <Button
            onClick={() => handleUpgrade(plans[2])}
            disabled={showCheckout}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              showCheckout
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {showCheckout ? 'Processing...' : `Go Pro Monthly - $${monthlyPrice}`}
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && selectedPlan.priceId && (
        <CheckoutForm
          priceId={selectedPlan.priceId}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          onClose={handleCheckoutClose}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Success Notification */}
      {paymentSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 border border-green-500">
          <div className="flex items-center">
            <Check className="w-5 h-5 mr-2" />
            Payment successful! Welcome to {selectedPlan?.name}!
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPlans;