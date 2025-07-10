import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const stats = {
    totalSessions: 24,
    totalMessages: 156,
    averageScore: 73,
    improvementRate: 12
  };

  const recentSessions = [
    {
      id: '1',
      title: 'React Component Help',
      platform: 'claude',
      messageCount: 8,
      averageScore: 78,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Python Debugging',
      platform: 'chatgpt',
      messageCount: 12,
      averageScore: 65,
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      title: 'API Design Discussion',
      platform: 'claude',
      messageCount: 15,
      averageScore: 82,
      createdAt: '2024-01-13T09:20:00Z'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 60) return 'text-sky-400';
    if (score >= 40) return 'text-gray-400';
    return 'text-orange-500';
  };

  const getPlatformBadge = (platform: string) => {
    const colors = {
      claude: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      chatgpt: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return (
      <Badge className={colors[platform as keyof typeof colors] || colors.other}>
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your conversation analysis progress and insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Sessions',
            value: stats.totalSessions,
            icon: BarChart3,
            color: 'text-blue-500',
            change: '+3 this week'
          },
          {
            title: 'Messages Analyzed',
            value: stats.totalMessages,
            icon: TrendingUp,
            color: 'text-green-500',
            change: '+24 this week'
          },
          {
            title: 'Average Score',
            value: stats.averageScore,
            icon: BarChart3,
            color: 'text-purple-500',
            change: '+5 points'
          },
          {
            title: 'Improvement Rate',
            value: `${stats.improvementRate}%`,
            icon: TrendingUp,
            color: 'text-emerald-500',
            change: '+2% this month'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dimension Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Dimension Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Strategic', score: 75, color: 'bg-purple-500' },
                  { name: 'Tactical', score: 78, color: 'bg-blue-500' },
                  { name: 'Cognitive', score: 70, color: 'bg-green-500' },
                  { name: 'Innovation', score: 68, color: 'bg-yellow-500' }
                ].map((dimension) => (
                  <div key={dimension.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{dimension.name}</span>
                      <span className="text-sm text-muted-foreground">{dimension.score}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dimension.color}`}
                        style={{ width: `${dimension.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {session.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{session.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{session.messageCount} messages</span>
                        <span>•</span>
                        <span>{formatDate(session.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getPlatformBadge(session.platform)}
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${getScoreColor(session.averageScore)}`}>
                        {session.averageScore}
                      </div>
                      <div className="text-xs text-muted-foreground">avg score</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-medium mb-2">Strong Strategic Thinking</h4>
                <p className="text-sm text-muted-foreground">
                  Your conversations show excellent goal alignment and clear objectives.
                </p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-medium mb-2">Improve Specificity</h4>
                <p className="text-sm text-muted-foreground">
                  Try being more specific in your requests for better AI responses.
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl mb-2">💡</div>
                <h4 className="font-medium mb-2">Innovation Opportunity</h4>
                <p className="text-sm text-muted-foreground">
                  Explore more creative approaches to unlock breakthrough insights.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;

