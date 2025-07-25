import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Target, Brain, Lightbulb, ArrowRight, CheckCircle, Compass, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const HomePage: React.FC = () => {
  // ✅ ENHANCED: 5D features array with Context dimension
  const features = [
    {
      icon: Target,
      title: 'Strategic Analysis',
      description: 'Evaluate goal alignment, progress tracking, and resource efficiency in your conversations.',
      color: 'text-purple-500'
    },
    {
      icon: Zap,
      title: 'Tactical Scoring',
      description: 'Measure clarity, specificity, and actionability of each message exchange.',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'Cognitive Assessment',
      description: 'Analyze mental load, timing, and attention management for optimal interactions.',
      color: 'text-green-500'
    },
    {
      icon: Lightbulb,
      title: 'Innovation Metrics',
      description: 'Discover creativity levels and breakthrough potential in your AI conversations.',
      color: 'text-yellow-500'
    },
    {
      icon: Compass,
      title: 'Context Awareness',
      description: 'Evaluate temporal understanding, state awareness, and conversation continuity.',
      color: 'text-cyan-500'
    }
  ];

  const benefits = [
    'Auto-detect ChatGPT and Claude conversations',
    'Real-time chess-style scoring (0-100)',
    'Message-by-message analysis with suggestions',
    'Pattern detection and trend analysis',
    'Export reports in multiple formats',
    'Session history and analytics dashboard'
  ];

  const chessNotations = [
    { symbol: '!!', name: 'Brilliant', score: '80-100', color: 'bg-emerald-500' },
    { symbol: '!', name: 'Excellent', score: '70-79', color: 'bg-blue-500' },
    { symbol: '+', name: 'Good', score: '60-69', color: 'bg-sky-400' },
    { symbol: '=', name: 'Average', score: '40-59', color: 'bg-gray-400' },
    { symbol: '?', name: 'Mistake', score: '20-39', color: 'bg-orange-500' },
    { symbol: '??', name: 'Blunder', score: '0-19', color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
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
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-4 py-2"
          >
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">OWL Chess Engine v1.0</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              MetaGipsy
            </span>
          </h1>
          
          {/* ✅ UPDATED: 5 dimensions description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Analyze your AI conversations with chess-like precision. Get detailed scoring across 
            5 dimensions and improve your prompting skills.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/analyze">
              <Zap className="w-5 h-5 mr-2" />
              Start Analyzing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link to="/dashboard">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Chess Notation System */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Chess-Style Scoring System</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each message gets a score from 0-100 and a chess notation based on its effectiveness
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {chessNotations.map((notation, index) => (
            <motion.div
              key={notation.symbol}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 ${notation.color} rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3`}>
                    {notation.symbol}
                  </div>
                  <h3 className="font-semibold mb-1">{notation.name}</h3>
                  <p className="text-sm text-muted-foreground">{notation.score}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ✅ UPDATED: Five Dimensions Features Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Five Dimensions of Analysis</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every message is evaluated across these key dimensions to provide comprehensive insights
          </p>
        </div>

        {/* ✅ ENHANCED: Grid for 5 dimensions (2-2-1 layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.slice(0, 4).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ✅ NEW: Context dimension in separate row for emphasis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex justify-center"
        >
          <div className="w-full md:w-1/2">
            <Card className="h-full hover:shadow-lg transition-shadow border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted text-cyan-500">
                    <Compass className="w-6 h-6" />
                  </div>
                  <span>Context Awareness</span>
                  <Badge variant="secondary" className="text-xs">NEW</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Evaluate temporal understanding, state awareness, and conversation continuity.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-muted/50 rounded-2xl p-8 md:p-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Key Features
              </Badge>
              <h2 className="text-3xl font-bold">
                Everything you need to master AI conversations
              </h2>
              <p className="text-lg text-muted-foreground">
                From automatic platform detection to detailed analytics, MetaGipsy provides 
                comprehensive tools for improving your AI interactions.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ✅ ENHANCED: Sample analysis with ALL 5 dimensions */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sample Analysis</span>
                  <Badge variant="secondary">Live Demo</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm">Strategic Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">85</span>
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        !
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm">Tactical Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">78</span>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        !
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm">Cognitive Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">82</span>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        !
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm">Innovation Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">75</span>
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        !
                      </div>
                    </div>
                  </div>

                  {/* ✅ NEW: Context score in sample analysis */}
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Context Score</span>
                      <Badge variant="outline" className="text-xs">NEW</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">72</span>
                      <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        !
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border-t-2 border-emerald-500">
                    <span className="text-sm font-semibold">Overall Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">79</span>
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        !
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="text-center space-y-8 py-12"
      >
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to improve your AI conversations?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start analyzing your ChatGPT and Claude conversations today. 
            Get instant feedback and actionable insights.
          </p>
        </div>

        <Button asChild size="lg" className="text-lg px-8 py-6">
          <Link to="/analyze">
            <Zap className="w-5 h-5 mr-2" />
            Analyze Your First Conversation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </motion.section>

      {/* ✅ NEW: Professional Contact & Creator Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="border-t border-border pt-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Creator Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                About the Creator
              </Badge>
              <h2 className="text-3xl font-bold">
                Built by Maksim Yurchanka
              </h2>
              <p className="text-lg text-muted-foreground">
                AI researcher and software engineer specializing in human-AI collaboration optimization. 
                Creator of the revolutionary Context Engineering methodology.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>MetaGipsy: live proof of revolutionary development methodology</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Revolutionary Context Awareness breakthrough</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span>Proven 99.1% cost reduction in AI development</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://github.com/MaksimYurchanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://www.linkedin.com/in/maksim-yurchanka-91208696/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
              
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://x.com/MaksimYurchanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X / Twitter
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Contact Card */}
          <div className="relative">
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>Get in Touch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Interested in collaboration, consulting, or have questions about MetaGipsy? 
                  Let's connect!
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm font-medium">Email</span>
                    <a 
                      href="mailto:metagipsy@gmail.com" 
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      metagipsy@gmail.com
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm font-medium">Location</span>
                    <span className="text-muted-foreground">Batumi, Georgia</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm font-medium">Expertise</span>
                    <span className="text-muted-foreground">AI Collaboration</span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <a href="mailto:metagipsy@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MetaGipsy OWL v1.0
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2025 MetaGipsy</span>
              <span>•</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <a 
                href="mailto:metagipsy@gmail.com" 
                className="hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;