// apps/web/src/pages/PrivacyPage.tsx
import React from 'react';
import { ArrowLeft, Shield, Eye, Database, Settings, Lock, Users, Globe, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'overview',
      title: 'Privacy Overview',
      icon: <Eye className="w-5 h-5 text-blue-400" />,
      content: [
        'At MetaGipsy OWL Chess Engine, we are committed to protecting your privacy and ensuring transparent data practices.',
        'This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our 5D AI conversation analysis service.',
        'We process your data lawfully, fairly, and transparently, with your privacy rights at the forefront of our operations.',
        'By using MetaGipsy, you consent to the data practices described in this policy.'
      ]
    },
    {
      id: 'collection',
      title: 'Information We Collect',
      icon: <Database className="w-5 h-5 text-purple-400" />,
      content: [
        'Account Information: Email address, password (hashed), account preferences, and subscription status.',
        'Conversation Data: AI conversation text you submit for analysis, analysis results, and session metadata.',
        'Usage Analytics: Platform interactions, feature usage patterns, and performance metrics via Google Analytics (GA4).',
        'Payment Information: Payment details processed securely through Stripe (we do not store complete payment information).',
        'Technical Data: IP address, browser type, device information, and access timestamps for security and optimization.'
      ]
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: <Settings className="w-5 h-5 text-green-400" />,
      content: [
        'Service Provision: Process your conversations through our proprietary 5D analysis system (Strategic, Tactical, Cognitive, Innovation, Context).',
        'Account Management: Maintain your account, process subscriptions, and provide customer support.',
        'Product Improvement: Analyze usage patterns to enhance our Context Engineering methodology and user experience.',
        'Communication: Send service updates, security alerts, and subscription notifications (no marketing emails without consent).',
        'Security: Detect and prevent fraud, abuse, and security threats to protect our platform and users.'
      ]
    },
    {
      id: 'legal-basis',
      title: 'Legal Basis for Processing (GDPR)',
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      content: [
        'Contract Performance: Processing necessary to provide our 5D analysis service as agreed in our Terms of Service.',
        'Legitimate Interest: Improving our service, ensuring security, and analyzing usage patterns for platform optimization.',
        'Consent: Where you have explicitly consented, such as for analytics cookies or marketing communications.',
        'Legal Compliance: When required to comply with legal obligations, such as tax reporting or law enforcement requests.',
        'Vital Interests: In rare cases where processing is necessary to protect someone\'s life or prevent serious harm.'
      ]
    },
    {
      id: 'sharing',
      title: 'Data Sharing & Third Parties',
      icon: <Users className="w-5 h-5 text-yellow-400" />,
      content: [
        'We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.',
        'Service Providers: Supabase (authentication/database), Stripe (payments), Google Analytics (usage insights), Claude AI (optional analysis enhancement).',
        'Legal Requirements: We may disclose information when required by law, court order, or to protect our rights and safety.',
        'Business Transfers: In the event of a merger or acquisition, user data may be transferred with appropriate privacy protections.',
        'All third-party integrations are bound by strict data protection agreements and security standards.'
      ]
    },
    {
      id: 'storage',
      title: 'Data Storage & Security',
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
      content: [
        'Data Location: Your data is stored in secure cloud infrastructure with enterprise-grade encryption at rest and in transit.',
        'Security Measures: Industry-standard security protocols including SSL/TLS encryption, secure authentication, and regular security audits.',
        'Access Controls: Strict employee access controls with need-to-know principles and regular access reviews.',
        'Retention Policy: Account data retained while your account is active; conversation data retained for service improvement unless you request deletion.',
        'Backup & Recovery: Secure, encrypted backups maintained for business continuity and disaster recovery purposes.'
      ]
    },
    {
      id: 'rights',
      title: 'Your Privacy Rights',
      icon: <Settings className="w-5 h-5 text-emerald-400" />,
      content: [
        'Access: Request a copy of all personal data we hold about you in a portable format.',
        'Rectification: Correct any inaccurate or incomplete personal information we have about you.',
        'Erasure ("Right to be Forgotten"): Request deletion of your personal data, subject to legal retention requirements.',
        'Portability: Receive your data in a machine-readable format or have it transferred to another service.',
        'Objection: Object to processing based on legitimate interests or for direct marketing purposes.',
        'Restriction: Request that we limit how we process your personal data in certain circumstances.'
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies & Analytics',
      icon: <Globe className="w-5 h-5 text-orange-400" />,
      content: [
        'Essential Cookies: Necessary for authentication, security, and core platform functionality.',
        'Analytics Cookies: Google Analytics (GA4) to understand user behavior and improve our service quality.',
        'Performance Cookies: Monitor platform performance and identify technical issues for resolution.',
        'Cookie Control: You can manage cookie preferences through your browser settings, though this may limit functionality.',
        'Analytics Opt-out: Contact support to opt out of analytics tracking while maintaining full service access.'
      ]
    },
    {
      id: 'international',
      title: 'International Data Transfers',
      icon: <Globe className="w-5 h-5 text-rose-400" />,
      content: [
        'Our service operates globally and may transfer data across international borders for processing and storage.',
        'All international transfers comply with applicable data protection laws including GDPR Article 44-49.',
        'We use Standard Contractual Clauses (SCCs) and adequacy decisions to ensure appropriate safeguards.',
        'Data processors are carefully selected and bound by strict contractual privacy and security obligations.',
        'You can request information about specific data transfer mechanisms by contacting our privacy team.'
      ]
    },
    {
      id: 'children',
      title: 'Children\'s Privacy',
      icon: <Users className="w-5 h-5 text-pink-400" />,
      content: [
        'MetaGipsy is not intended for children under 16 years old (or minimum age in your jurisdiction).',
        'We do not knowingly collect personal information from children without parental consent.',
        'If we discover we have collected information from a child without proper consent, we will delete it promptly.',
        'Parents can contact us to review, delete, or refuse further collection of their child\'s information.',
        'Educational institutions may use our service for students with appropriate consent and supervision.'
      ]
    },
    {
      id: 'changes',
      title: 'Policy Updates',
      icon: <FileText className="w-5 h-5 text-gray-400" />,
      content: [
        'We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements.',
        'Material changes will be communicated via email and prominent platform notices at least 30 days in advance.',
        'Continued use of MetaGipsy after changes constitutes acceptance of the updated policy.',
        'Previous versions of this policy are available upon request for your reference.',
        'We maintain a change log documenting significant policy updates and effective dates.'
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
              <h1 className="text-xl font-bold text-slate-200">Privacy Policy</h1>
              <p className="text-sm text-slate-400">Last updated: July 21, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Introduction */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-600/20 rounded-full border border-green-500/30 mb-6">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your privacy is fundamental to our mission. Learn how we protect and handle your data with complete transparency.
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-full text-green-300 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            GDPR Compliant • Enterprise Security • Full Transparency
          </div>
        </div>

        {/* Key Principles */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl border border-green-800/30 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4 text-center">Our Privacy Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Security First</h3>
              <p className="text-slate-400 text-sm">Enterprise-grade encryption and security protocols</p>
            </div>
            <div className="text-center p-4">
              <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Full Transparency</h3>
              <p className="text-slate-400 text-sm">Clear communication about data collection and use</p>
            </div>
            <div className="text-center p-4">
              <Settings className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Your Control</h3>
              <p className="text-slate-400 text-sm">Complete control over your personal information</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center p-2 text-slate-300 hover:text-green-400 hover:bg-slate-700/30 rounded-lg transition-all text-sm"
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

        {/* Data Rights Action Center */}
        <div className="mt-12 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-2xl border border-green-800/30 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Exercise Your Data Rights</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              You have complete control over your personal data. Contact us to exercise any of your privacy rights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700/30">
              <Eye className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Access Data</h3>
              <p className="text-slate-400 text-xs">Download your information</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700/30">
              <Settings className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Correct Data</h3>
              <p className="text-slate-400 text-xs">Update inaccurate information</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700/30">
              <Trash2 className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Delete Data</h3>
              <p className="text-slate-400 text-xs">Request data removal</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl text-center border border-slate-700/30">
              <Database className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 text-sm mb-1">Port Data</h3>
              <p className="text-slate-400 text-xs">Transfer to another service</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.open('mailto:metagipsy@gmail.com?subject=Privacy%20Rights%20Request', '_blank')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Contact Privacy Team
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/terms')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              View Terms of Service
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
            GDPR Compliant Privacy Protection
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;