const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    name: 'MetaGipsy API', 
    version: '1.0.0',
    status: 'running'
  });
});

app.post('/api/v1/analyze', (req, res) => {
  const { conversation } = req.body;
  
  if (!conversation || !conversation.messages) {
    return res.status(400).json({ error: 'Invalid conversation data' });
  }

  // Mock analysis response
  const messages = conversation.messages;
  const scores = messages.map((msg, i) => ({
    overall: Math.floor(Math.random() * 40) + 60, // 60-100 range
    dimensions: {
      strategic: Math.floor(Math.random() * 40) + 60,
      tactical: Math.floor(Math.random() * 40) + 60,
      cognitive: Math.floor(Math.random() * 40) + 60,
      innovation: Math.floor(Math.random() * 40) + 60
    },
    classification: 'good',
    chessNotation: '+',
    confidence: 0.85,
    explanation: 'This message demonstrates solid communication with clear intent.',
    betterMove: 'Consider being more specific about your requirements.'
  }));

  const overallScore = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;

  res.json({
    sessionId: 'demo-session-' + Date.now(),
    messages,
    scores,
    summary: {
      messageCount: messages.length,
      overallScore: Math.round(overallScore),
      trend: 'stable',
      bestScore: Math.max(...scores.map(s => s.overall)),
      worstScore: Math.min(...scores.map(s => s.overall)),
      dimensionAverages: {
        strategic: Math.round(scores.reduce((sum, s) => sum + s.dimensions.strategic, 0) / scores.length),
        tactical: Math.round(scores.reduce((sum, s) => sum + s.dimensions.tactical, 0) / scores.length),
        cognitive: Math.round(scores.reduce((sum, s) => sum + s.dimensions.cognitive, 0) / scores.length),
        innovation: Math.round(scores.reduce((sum, s) => sum + s.dimensions.innovation, 0) / scores.length)
      },
      patterns: [],
      insights: [
        {
          type: 'strength',
          title: 'Good Communication',
          description: 'Your conversation shows clear communication patterns.',
          actionable: false
        }
      ]
    },
    metadata: {
      analysisMethod: 'local',
      analysisDepth: 'standard',
      processingTime: 150,
      version: '1.0.0'
    }
  });
});

const port = 3001;
app.listen(port, '0.0.0.0', () => {
  console.log('MetaGipsy API running on port ' + port);
});

