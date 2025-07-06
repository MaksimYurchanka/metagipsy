# MetaGipsy OWL Chess Engine

> AI Conversation Analysis with Chess-Style Scoring

MetaGipsy is a comprehensive web application that analyzes AI conversations using chess-style scoring (0-100) across four key dimensions: Strategic, Tactical, Cognitive, and Innovation. Get detailed insights into your ChatGPT and Claude conversations with real-time analysis, pattern detection, and actionable improvement suggestions.

## 🎯 Features

### Core Analysis
- **Chess-Style Scoring**: 0-100 point system with chess notation (!!,!,+,=,?,??)
- **Four Dimensions**: Strategic, Tactical, Cognitive, Innovation analysis
- **Platform Detection**: Auto-detect ChatGPT, Claude, and other AI platforms
- **Real-Time Analysis**: Live scoring as you paste conversations
- **Pattern Recognition**: Detect momentum, fatigue, and conversation patterns

### User Experience
- **Split-View Interface**: Input on left, analysis on right
- **Message-by-Message Breakdown**: Detailed scoring for each exchange
- **Better Move Suggestions**: Improvement recommendations for low scores
- **Floating Score Overlay**: Real-time feedback during analysis
- **Export Options**: PDF, Markdown, CSV, and JSON formats

### Analytics & Insights
- **Session History**: Track all your analyzed conversations
- **Score Trends**: Visualize improvement over time
- **Dimension Heatmaps**: Identify strengths and weaknesses
- **Pattern Analytics**: Understand conversation dynamics
- **Performance Dashboard**: Comprehensive analytics overview

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand for lightweight state management
- **UI Components**: Custom components with Radix UI primitives
- **Animations**: Framer Motion for smooth interactions

### Backend (Express + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization
- **Authentication**: Supabase Auth integration
- **API Documentation**: OpenAPI/Swagger specification
- **Rate Limiting**: Redis-based rate limiting

### Scoring Engine
- **Local Algorithm**: Weighted scoring across four dimensions
- **Claude Integration**: Optional enhanced analysis via Claude API
- **Pattern Detection**: Advanced conversation pattern recognition
- **Caching**: Intelligent caching for performance

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/metagipsy-owl.git
   cd metagipsy-owl
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd apps/api
   npm install
   
   # Install frontend dependencies
   cd ../web
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   
   # Edit the .env files with your configuration
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start the API server
   cd apps/api
   npm run dev
   
   # Terminal 2: Start the web server
   cd apps/web
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

### Docker Setup

For a complete setup with all services:

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📊 Scoring System

### Chess Notation Scale
| Score Range | Notation | Classification | Description |
|-------------|----------|----------------|-------------|
| 80-100      | !!       | Brilliant      | Exceptional strategic thinking and execution |
| 70-79       | !        | Excellent      | Strong performance with clear goals |
| 60-69       | +        | Good           | Solid approach with minor improvements needed |
| 40-59       | =        | Average        | Adequate but room for enhancement |
| 20-39       | ?        | Mistake        | Unclear or ineffective communication |
| 0-19        | ??       | Blunder        | Poor strategy or major communication issues |

### Scoring Dimensions

#### Strategic (30% weight)
- Goal alignment and clarity
- Resource efficiency
- Long-term thinking
- Problem decomposition

#### Tactical (30% weight)
- Specificity and clarity
- Actionable requests
- Context provision
- Example usage

#### Cognitive (25% weight)
- Mental load management
- Timing and pacing
- Attention optimization
- Complexity handling

#### Innovation (15% weight)
- Creative approaches
- Novel solutions
- Breakthrough potential
- Alternative perspectives

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/metagipsy"
REDIS_URL="redis://localhost:6379"

# Authentication
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
JWT_SECRET="your-jwt-secret"

# Optional: Claude API for enhanced analysis
CLAUDE_API_KEY="your-claude-api-key"

# Server
NODE_ENV="development"
PORT=3001
HOST="0.0.0.0"
```

#### Frontend (.env)
```bash
VITE_API_URL="http://localhost:3001/api/v1"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_ENABLE_CLAUDE_ANALYSIS=true
```

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend Tests
```bash
cd apps/web
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### End-to-End Tests
```bash
npm run test:e2e        # Run E2E tests
```

## 📚 API Documentation

### Core Endpoints

#### Analysis
```http
POST /api/v1/analyze
Content-Type: application/json

{
  "conversation": {
    "messages": [
      {
        "role": "user",
        "content": "I need help with React",
        "index": 0,
        "timestamp": "2024-01-01T00:00:00Z"
      }
    ],
    "platform": "claude"
  },
  "options": {
    "analysisDepth": "standard",
    "enablePatternDetection": true,
    "useClaudeAnalysis": false
  }
}
```

#### Sessions
```http
GET /api/v1/sessions              # List user sessions
GET /api/v1/sessions/:id          # Get specific session
DELETE /api/v1/sessions/:id       # Delete session
GET /api/v1/sessions/:id/export   # Export session data
```

#### Analytics
```http
GET /api/v1/sessions/analytics/overview  # Get analytics overview
```

### Response Format
```json
{
  "sessionId": "uuid",
  "messages": [...],
  "scores": [
    {
      "overall": 75,
      "dimensions": {
        "strategic": 80,
        "tactical": 75,
        "cognitive": 70,
        "innovation": 65
      },
      "classification": "excellent",
      "chessNotation": "!",
      "confidence": 0.85,
      "explanation": "Strong strategic approach...",
      "betterMove": "Consider being more specific..."
    }
  ],
  "summary": {
    "overallScore": 75,
    "trend": "improving",
    "patterns": [...],
    "insights": [...]
  }
}
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel --prod
```

### Render (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with auto-deploy enabled

### Docker Production
```bash
# Build and deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chess notation system inspired by chess analysis engines
- UI/UX patterns from modern AI tools
- Scoring methodology based on conversation analysis research
- Community feedback and contributions

## 📞 Support

- **Documentation**: [docs.metagipsy.com](https://docs.metagipsy.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/metagipsy-owl/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/metagipsy-owl/discussions)
- **Email**: support@metagipsy.com

---

**MetaGipsy OWL Chess Engine** - Elevate your AI conversations with chess-master precision.

