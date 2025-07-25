// apps/web/src/pages/PricingPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Zap, 
  ArrowRight, 
  CreditCard,
  Sparkles,
  Target,
  Brain,
  Lightbulb,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PricingPlans from '@/components/payment/PricingPlans';
import { updateSEOAnalysisType } from '@/App';

/**
 * 🎯 PricingPage - Complete MetaGipsy Pricing & Payment Integration
 * 
 * Features:
 * - Enhanced PricingPlans component (version 2) with CheckoutForm integration
 * - SEO optimization for pricing page type
 * - Analytics tracking for revenue funnel
 * - Professional layout following HomePage.tsx patterns
 * - Mobile-responsive design with framer-motion animations
 * - Complete Stripe payment integration
 * - 5D analysis system showcase
 * 
 * Integration:
 * 1. Router: Add to App.tsx routes
 * 2. Navigation: Add to Layout.tsx navigation array
 * 3. Components: Uses enhanced PricingPlans-2 with CheckoutForm
 */

const PricingPage: React.FC = () => {
  // 📊 SEO & Analytics Integration
  useEffect(() => {
    // Update SEO for pricing page
    updateSEOAnalysisType('general');
    
    // 📈 Analytics tracking for pricing page visits
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: 'Pricing Plans - MetaGipsy',
        page_location: window.location.href,
        content_group1: 'Revenue',
        content_group2: 'Pricing',
        value: 199, // Monthly plan value for potential revenue tracking
      });

      // Track pricing page engagement
      gtag('event', 'pricing_page_visit', {
        event_category: 'Revenue',
        event_label: 'Pricing Page Load',
        value: 1
      });
    }

    console.log('💳 Pricing page loaded - Revenue generation ready');
  }, []);

  // 🎯 5D Analysis System Features
  // 🎯 5D Analysis System Features
  const dimensions = [
    {
      icon: Target,
      name: 'Strategic',
      description: 'Goal alignment & progress tracking',
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      name: 'Tactical',
      description: 'Clarity & actionability',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      name: 'Cognitive',
      description: 'Mental load & timing',
      color: 'text-green-500'
    },
    {
      icon: Lightbulb,
      name: 'Innovation',
      description: 'Creativity & breakthroughs',
      color: 'text-yellow-500'
    },
    {
      icon: Compass,
      name: 'Context',
      description: 'Temporal understanding',
      color: 'text-cyan-500'
    }
  ];

  // 💳 Plan comparison features
  const planFeatures = {
    free: [
      'Complete 5D analysis',
      'Chess notation scoring',
      'Basic export (JSON/CSV)',
      'Session history',
      'Community support',
      '5,000 characters/day'
    ],
    pro: [
      'Complete 5D analysis',
      'Advanced chess insights',
      'All export formats',
      'Session analytics',
      'Priority support',
      '500,000 characters/day',
      'Pattern recognition',
      'Trend analysis',
      'Custom suggestions'
    ]
  };

  return (
    <div className="space-y-20">
      {/* 🎯 Hero Section - Following HomePage.tsx patterns */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-2"
          >
            <Crown className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium">Professional AI Analysis</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choose Your Chess Mastery Level
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            Unlock the full potential of your AI conversations with our revolutionary 
            5D analysis system. Professional plans for serious AI collaborators.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
            <Link to="/analyze">
              <Zap className="w-5 h-5 mr-2" />
              Try Free Analysis
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => {
              document.querySelector('[data-pricing-plans]')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            <Crown className="w-5 h-5 mr-2" />
            View Pricing Plans
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.section>

      {/* 🧠 5D Analysis System Showcase */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            Revolutionary Technology
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            5D Analysis System
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Every conversation analyzed across five critical dimensions. 
            The world's first Context Awareness dimension for temporal understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {dimensions.map((dimension, index) => (
            <motion.div
              key={dimension.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 h-full">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 mx-auto mb-4 p-2 rounded-lg bg-muted ${dimension.color}`}>
                    <dimension.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold mb-2">{dimension.name}</h3>
                  <p className="text-sm text-muted-foreground">{dimension.description}</p>
                  {dimension.name === 'Context' && (
                    <Badge variant="secondary" className="mt-2 text-xs">NEW</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 💳 Pricing Plans Section - Main Component */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-8"
        data-pricing-plans
      >
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <CreditCard className="w-4 h-4 mr-2" />
            Secure Payment by Stripe
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Professional Analysis Plans
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Same powerful 5D analysis, just higher limits for power users. 
            Upgrade instantly with secure Stripe payments.
          </p>
        </div>

        {/* 🎨 Enhanced PricingPlans Component Integration */}
        <PricingPlans />
      </motion.section>



      {/* 🎯 Value Proposition Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-muted/50 rounded-2xl p-8 md:p-12"
      >
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose MetaGipsy Pro?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Join thousands of professionals who've transformed their AI collaboration 
              with our revolutionary analysis system.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Context Mastery</h3>
              <p className="text-muted-foreground">
                World's first Context Awareness dimension helps you eliminate confusion 
                and temporal understanding issues in AI conversations.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Professional Results</h3>
              <p className="text-muted-foreground">
                Sub-2 second analysis with 95% accuracy. Process 100x more conversations 
                with the same professional quality insights.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Instant Upgrade</h3>
              <p className="text-muted-foreground">
                Immediate access to pro features. Secure Stripe payments, 
                cancel anytime. No hidden fees or long-term commitments.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/50">
            <blockquote className="text-lg italic text-muted-foreground mb-4">
              "MetaGipsy's Context Awareness dimension alone saved me 5 hours per week. 
              The chess-style scoring helps me identify exactly where my AI conversations 
              go wrong and how to fix them instantly."
            </blockquote>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div className="text-left">
                <p className="font-semibold">Early Access User</p>
                <p className="text-sm text-muted-foreground">AI Researcher & Developer</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 🚀 Final CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center space-y-8 py-12"
      >
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Master AI Conversations?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join the revolution in human-AI collaboration. Start with free analysis, 
            upgrade when you need more power. Every conversation becomes a masterpiece.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
            <Link to="/analyze">
              <Zap className="w-5 h-5 mr-2" />
              Start Free Analysis
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => {
              document.querySelector('[data-pricing-plans]')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            <Crown className="w-5 h-5 mr-2" />
            Choose Pro Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default PricingPage;