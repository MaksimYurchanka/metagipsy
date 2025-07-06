# MetaGipsy Deployment Guide

This guide covers deploying MetaGipsy to production environments using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account with the MetaGipsy repository
- Vercel account
- Render account
- Supabase project
- PostgreSQL database (Render provides this)
- Redis instance (Render provides this)

## Environment Setup

### 1. Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your keys:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Public anon key
   - `SUPABASE_SERVICE_KEY`: Service role key (keep secret)

3. Set up authentication providers in Authentication > Providers
4. Configure RLS policies for your tables

### 2. Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- We'll create a profiles table for additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  project_context TEXT,
  session_goal TEXT,
  message_count INTEGER DEFAULT 0,
  overall_score INTEGER,
  best_score INTEGER,
  worst_score INTEGER,
  trend TEXT,
  dimension_averages JSONB,
  patterns JSONB DEFAULT '[]',
  insights JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  index INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  overall INTEGER NOT NULL CHECK (overall >= 0 AND overall <= 100),
  dimensions JSONB NOT NULL,
  classification TEXT NOT NULL,
  chess_notation TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  explanation TEXT,
  better_move TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_index ON messages(session_id, index);
CREATE INDEX idx_scores_message_id ON scores(message_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages from own sessions" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = messages.session_id 
      AND sessions.user_id = auth.uid()
    )
  );

-- Scores policies
CREATE POLICY "Users can view scores from own messages" ON scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages 
      JOIN sessions ON sessions.id = messages.session_id
      WHERE messages.id = scores.message_id 
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scores to own messages" ON scores
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages 
      JOIN sessions ON sessions.id = messages.session_id
      WHERE messages.id = scores.message_id 
      AND sessions.user_id = auth.uid()
    )
  );
```

## Backend Deployment (Render)

### 1. Create Services on Render

1. **PostgreSQL Database**
   - Go to Render Dashboard > New > PostgreSQL
   - Choose a name: `metagipsy-postgres`
   - Select region closest to your users
   - Note the connection details

2. **Redis Instance**
   - Go to Render Dashboard > New > Redis
   - Choose a name: `metagipsy-redis`
   - Select same region as PostgreSQL
   - Note the connection URL

3. **Web Service for API**
   - Go to Render Dashboard > New > Web Service
   - Connect your GitHub repository
   - Configure:
     - **Name**: `metagipsy-api`
     - **Environment**: `Node`
     - **Region**: Same as database
     - **Branch**: `main`
     - **Root Directory**: `apps/api`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

### 2. Environment Variables for API

In your Render web service settings, add these environment variables:

```bash
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# Database (from your Render PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Redis (from your Render Redis)
REDIS_URL=redis://hostname:port

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters

# CORS (your frontend domain)
CORS_ORIGINS=https://your-app.vercel.app

# Optional: Claude API
CLAUDE_API_KEY=your-claude-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Analysis Limits
MAX_MESSAGES_PER_ANALYSIS=50
MAX_SESSIONS_PER_MONTH=100
MAX_MESSAGES_PER_MONTH=1000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. Deploy API

1. Push your code to GitHub
2. Render will automatically build and deploy
3. Check the logs for any errors
4. Test the health endpoint: `https://your-api.onrender.com/health`

## Frontend Deployment (Vercel)

### 1. Prepare Frontend

1. Update `apps/web/.env.production`:
```bash
VITE_API_URL=https://your-api.onrender.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_CLAUDE_ANALYSIS=true
VITE_ENABLE_PATTERN_DETECTION=true
VITE_ENABLE_EXPORT=true
VITE_DEBUG=false
```

### 2. Deploy to Vercel

1. **Via Vercel CLI**:
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd apps/web

# Deploy
vercel --prod
```

2. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `apps/web`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

### 3. Environment Variables for Frontend

In Vercel project settings, add:

```bash
VITE_API_URL=https://your-api.onrender.com/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ENABLE_CLAUDE_ANALYSIS=true
VITE_ENABLE_PATTERN_DETECTION=true
VITE_ENABLE_EXPORT=true
VITE_DEBUG=false
```

## Domain Configuration

### 1. Custom Domain (Optional)

**For Vercel (Frontend)**:
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

**For Render (Backend)**:
1. Go to Service Settings > Custom Domains
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Configure DNS records as instructed

### 2. Update CORS Settings

Update your backend environment variables:
```bash
CORS_ORIGINS=https://yourdomain.com,https://your-app.vercel.app
```

## SSL and Security

Both Vercel and Render provide automatic SSL certificates. Ensure:

1. All URLs use HTTPS in production
2. Update Supabase site URL to your production domain
3. Configure proper CORS origins
4. Use secure JWT secrets
5. Enable Supabase RLS policies

## Monitoring and Logging

### 1. Render Monitoring

- Check service logs in Render dashboard
- Set up log drains if needed
- Monitor resource usage

### 2. Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor performance and usage

### 3. Supabase Monitoring

- Monitor database performance
- Check authentication logs
- Review API usage

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS_ORIGINS includes your frontend domain
   - Check that API is accessible from frontend

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if database is accessible from Render
   - Ensure Prisma migrations are applied

3. **Authentication Issues**
   - Verify Supabase keys are correct
   - Check Supabase site URL configuration
   - Ensure RLS policies are properly set

4. **Build Failures**
   - Check build logs in Render/Vercel
   - Verify all dependencies are listed in package.json
   - Ensure TypeScript compilation succeeds

### Health Checks

Test these endpoints after deployment:

```bash
# API Health
curl https://your-api.onrender.com/health

# Frontend
curl https://your-app.vercel.app

# API Documentation
curl https://your-api.onrender.com/api/docs
```

## Performance Optimization

### 1. Backend Optimization

- Enable Redis caching
- Optimize database queries
- Use connection pooling
- Implement proper rate limiting

### 2. Frontend Optimization

- Enable Vercel Edge Functions if needed
- Optimize bundle size
- Use proper caching headers
- Implement code splitting

## Backup and Recovery

### 1. Database Backups

Render PostgreSQL includes automatic backups. For additional safety:
- Set up regular database dumps
- Store backups in external storage
- Test recovery procedures

### 2. Code Backups

- Ensure code is backed up in GitHub
- Tag releases for easy rollback
- Document deployment procedures

## Scaling Considerations

### 1. Backend Scaling

- Monitor Render service metrics
- Upgrade service plan as needed
- Consider horizontal scaling for high traffic

### 2. Database Scaling

- Monitor database performance
- Optimize queries and indexes
- Consider read replicas for high read loads

### 3. Frontend Scaling

Vercel automatically handles frontend scaling, but consider:
- CDN optimization
- Image optimization
- Bundle size optimization

---

This deployment guide should get MetaGipsy running in production. Monitor the services closely after deployment and be prepared to adjust configurations based on real-world usage patterns.

