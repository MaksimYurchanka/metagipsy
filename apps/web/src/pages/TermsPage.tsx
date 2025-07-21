// apps/web/src/pages/TermsPage.tsx
import React from 'react';
import { ArrowLeft, Shield, FileText, Users, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      content: [
        'By accessing and using MetaGipsy OWL Chess Engine (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.',
        'These terms constitute a legally binding agreement between you and AI-AutoCoding-DAO ("we," "us," or "our").',
        'If you do not agree to these terms, please discontinue use of the Service immediately.'
      ]
    },
    {
      id: 'service',
      title: 'Service Description',
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      content: [
        'MetaGipsy provides AI conversation analysis through our proprietary 5D analysis system, including Strategic, Tactical, Cognitive, Innovation, and Context dimensions.',
        'The Service offers chess-style scoring, conversation insights, export capabilities, and AI-powered recommendations for improving human-AI collaboration.',
        'We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with reasonable notice.'
      ]
    },
    {
      id: 'accounts',
      title: 'User Accounts & Responsibilities',
      icon: <Users className="w-5 h-5 text-green-400" />,
      content: [
        'You must provide accurate, complete, and current information when creating an account.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You must notify us immediately of any unauthorized access to your account.',
        'You may not share your account or allow others to access the Service through your credentials.',
        'You are responsible for all activities that occur under your account.'
      ]
    },
    {
      id: 'usage',
      title: 'Acceptable Use Policy',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      content: [
        'You may not use the Service for any unlawful purpose or in violation of these terms.',
        'Prohibited activities include: reverse engineering, attempting to access unauthorized areas, submitting malicious content, or overwhelming our systems.',
        'You may not upload conversations containing personal information of others without consent.',
        'Commercial use of the Service requires appropriate subscription plans.',
        'We reserve the right to suspend accounts that violate these policies.'
      ]
    },
    {
      id: 'payments',
      title: 'Payment Terms',
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      content: [
        'Subscription fees are billed in advance and are non-refundable except as required by law.',
        'Pro Daily subscriptions provide 24-hour access from time of purchase.',
        'Pro Monthly subscriptions renew automatically unless cancelled before the renewal date.',
        'Price changes will be communicated 30 days in advance for existing subscribers.',
        'Failed payments may result in account suspension until payment is updated.'
      ]
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      content: [
        'The Service, including our 5D analysis methodology and Context Engineering technology, is proprietary to AI-AutoCoding-DAO.',
        'You retain ownership of conversations you submit for analysis.',
        'By using the Service, you grant us a limited license to process your conversations for analysis purposes.',
        'You may not copy, modify, or redistribute our proprietary analysis algorithms or methodologies.',
        'Our trade names, trademarks, and logos are protected intellectual property.'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Protection',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      content: [
        'Your privacy is important to us. Please review our Privacy Policy for detailed information about data collection and use.',
        'We implement industry-standard security measures to protect your data.',
        'Conversation data is processed securely and is not shared with third parties except as described in our Privacy Policy.',
        'You may request deletion of your data at any time by contacting support.',
        'We comply with applicable data protection regulations including GDPR where applicable.'
      ]
    },
    {
      id: 'limitations',
      title: 'Limitations of Liability',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      content: [
        'The Service is provided "as is" without warranties of any kind, express or implied.',
        'We do not guarantee the accuracy, completeness, or usefulness of any analysis results.',
        'Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.',
        'We are not liable for indirect, incidental, special, or consequential damages.',
        'Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.'
      ]
    },
    {
      id: 'termination',
      title: 'Termination',
      icon: <Users className="w-5 h-5 text-red-400" />,
      content: [
        'You may terminate your account at any time by contacting support or through account settings.',
        'We may suspend or terminate accounts that violate these terms or for any reason with reasonable notice.',
        'Upon termination, your right to use the Service ceases immediately.',
        'We will retain your data for a reasonable period to comply with legal obligations.',
        'Termination does not relieve you of any payment obligations incurred before termination.'
      ]
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: <FileText className="w-5 h-5 text-gray-400" />,
      content: [
        'We reserve the right to modify these terms at any time.',
        'Material changes will be communicated via email or prominent notice in the Service.',
        'Continued use of the Service after changes constitutes acceptance of the new terms.',
        'If you do not agree to changes, you should discontinue use of the Service.',
        'We will maintain previous versions of terms for reference upon request.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to MetaGipsy
            </Button>
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-200">Terms of Service</h1>
              <p className="text-sm text-slate-400">Last updated: July 21, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Introduction */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full border border-blue-500/30 mb-6">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to MetaGipsy OWL Chess Engine. These terms govern your use of our revolutionary 5D AI conversation analysis platform.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center p-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/30 rounded-lg transition-all text-sm"
              >
                {section.icon}
                <span className="ml-2">{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-slate-700/50 rounded-full flex items-center justify-center mr-4">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-200">{section.title}</h2>
                  <p className="text-slate-400 text-sm">Section {index + 1}</p>
                </div>
              </div>
              <div className="space-y-4">
                {section.content.map((paragraph, idx) => (
                  <p key={idx} className="text-slate-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-800/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Questions About These Terms?</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service or need clarification on any provisions, 
            please don't hesitate to contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('mailto:metagipsy@gmail.com', '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/privacy')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              View Privacy Policy
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700/50 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 AI-AutoCoding-DAO. All rights reserved. 
            <span className="mx-2">•</span>
            MetaGipsy OWL Chess Engine
            <span className="mx-2">•</span>
            Revolutionary 5D AI Conversation Analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;