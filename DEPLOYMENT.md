# MetaGipsy Production Deployment Guide

> **Revolutionary AI Conversation Analysis Platform - Production Deployment for 2025**

This guide covers deploying MetaGipsy to production using modern cloud infrastructure with Vercel (frontend), Render (backend), and enterprise-grade configurations.

## 🎯 Quick Overview

**MetaGipsy Architecture:**
- 🎨 **Frontend:** React + Vite → Vercel (Global CDN)
- 🔧 **Backend:** Express.js + TypeScript → Render (Auto-scaling)
- 🗄️ **Database:** PostgreSQL 16 → Render (Managed)
- ⚡ **Cache:** Redis 7.2 → Render (Performance)
- 🔐 **Auth:** Supabase (Enterprise-grade)
- 💳 **Payments:** Stripe (Live processing)

---

## 🚀 Prerequisites

### Required Accounts
- ✅ **GitHub:** Repository with clean, professional structure
- ✅ **Vercel:** Frontend deployment and global CDN
- ✅ **Render:** Backend services and managed databases
- ✅ **Supabase:** Authentication and additional data storage
- ✅ **Anthropic:** AI analysis capabilities (optional enhancement)
- ✅ **Stripe:** Payment processing (for Pro/Business plans)

### Repository Preparation

**Before deployment, ensure your repository is production-ready:**

```bash
# 1. Clean repository structure (run cleanup script)
./cleanup-repository.sh  # or cleanup-repository.bat on Windows

# 2. Verify no development artifacts remain
find . -name "*.backup*" -o -name "*_v*.ts" | wc -l  # Should be 0

# 3. Add professional environment examples
# Use the .env.example files provided in this guide

# 4. Test build process
cd apps/web && npm install && npm run build
cd ../api && npm install && npm run build
```

---

## 🗄️ Database Setup (Render PostgreSQL)

### 1. Create Managed PostgreSQL Service

1. **Go to Render Dashboard** → **New** → **PostgreSQL**
2. **Configure database:**
   - **Name:** `metagipsy-postgres`
   - **Database:** `metagipsy`
   - **User:** `metagipsy_user`
   - **Region:** Choose closest to your users
   - **Plan:** Starter ($7/month) or Standard ($20/month)

3. **Note the connection details:**
   - Internal Database URL (for backend service)
   - External Database URL (for local development)

### 2. Database Schema Setup

**Option A: Using Prisma (Recommended)**
```bash
# After backend deployment, Prisma will auto-create schema
# No manual SQL needed - handled by migration system
```

**Option B: Manual Setup (if needed)**
```sql
-- Run in Render PostgreSQL Dashboard → Web Shell
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Prisma will handle table creation automatically
-- This is just for reference/troubleshooting
```

---

## ⚡ Cache Setup (Render Redis)

### Create Managed Redis Service

1. **Go to Render Dashboard** → **New** → **Redis**
2. **Configure cache:**
   - **Name:** `metagipsy-redis`
   - **Region:** Same as PostgreSQL
   - **Plan:** Starter ($7/month)
   - **Maxmemory Policy:** `allkeys-lru`

3. **Note the Redis URL** for backend configuration

---

## 🔐 Authentication Setup (Supabase)

### 1. Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** → **New Project**
2. **Configure project:**
   - **Name:** `metagipsy-production`
   - **Database Password:** Generate secure password
   - **Region:** Choose closest to Render backend

### 2. Configure API Keys

1. **Go to Settings** → **API**
2. **Copy these values:**
   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Configure Authentication

1. **Go to Authentication** → **Providers**
2. **Enable desired providers:**
   - Email (always enabled)
   - Google OAuth (recommended)
   - GitHub OAuth (for developers)

3. **Set site URL:**
   ```
   Site URL: https://metagipsy.com
   Redirect URLs: https://metagipsy.com/auth/callback
   ```

---

## 💳 Payment Setup (Stripe)

### 1. Configure Stripe Account

1. **Go to [dashboard.stripe.com](https://dashboard.stripe.com)**
2. **Switch to Live mode** (top-right toggle)
3. **Go to Developers** → **API Keys**

### 2. Create Product Plans

```bash
# Daily Plan
stripe prices create \
  --unit-amount 999 \
  --currency usd \
  --recurring interval=day \
  --product-data name="MetaGipsy Pro (24 hours)"

# Monthly Plan  
stripe prices create \
  --unit-amount 19999 \
  --currency usd \
  --recurring interval=month \
  --product-data name="MetaGipsy Business (Monthly)"
```

### 3. Note Configuration Values

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_DAILY=price_...
STRIPE_PRICE_MONTHLY=price_...
```

---

## 🖥️ Backend Deployment (Render)

### 1. Create Web Service

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect GitHub repository:**
   - **Repository:** `https://github.com/MaksimYurchanka/metagipsy`
   - **Branch:** `main`

3. **Configure service:**
   - **Name:** `metagipsy-api`
   - **Environment:** `Node`
   - **Region:** Same as database
   - **Root Directory:** `apps/api`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

### 2. Environment Variables Configuration

**Add these variables in Render service settings:**

```bash
# Server Configuration
NODE_ENV=production
PORT=10000
HOST=0.0.0.0

# Database (from Render PostgreSQL)
DATABASE_URL=postgresql://metagipsy_user:password@hostname:port/metagipsy

# Cache (from Render Redis)  
REDIS_URL=redis://:password@hostname:port

# Authentication (from Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security
JWT_SECRET=your-secure-jwt-secret-minimum-32-characters

# AI Services (Optional)
ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-key

# CORS (will be updated after frontend deployment)
CORS_ORIGINS=https://metagipsy.com,https://your-app.vercel.app

# Payments (from Stripe)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_DAILY=price_your-daily-price-id
STRIPE_PRICE_MONTHLY=price_your-monthly-price-id

# Performance Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_MESSAGES_PER_ANALYSIS=50
MAX_SESSIONS_PER_MONTH=1000

# Monitoring
LOG_LEVEL=info
LOG_FORMAT=json
```

### 3. Deploy and Verify

1. **Trigger deployment:** Push to `main` branch
2. **Monitor logs:** Check for successful startup
3. **Test health endpoint:** `https://your-api.onrender.com/api/v1/health`
4. **Verify database connection:** Check logs for Prisma migrations

---

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy to Vercel

**Option A: Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd apps/web

# Deploy to production
vercel --prod
```

**Option B: Vercel Dashboard**
1. **Go to [vercel.com](https://vercel.com)** → **Import Project**
2. **Connect GitHub repository**
3. **Configure deployment:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2. Environment Variables Configuration

**Add these variables in Vercel project settings:**

```bash
# API Configuration
VITE_API_URL=https://your-api.onrender.com/api/v1

# Authentication (from Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Payments (from Stripe)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
VITE_STRIPE_PRICE_DAILY=price_your-daily-price-id
VITE_STRIPE_PRICE_MONTHLY=price_your-monthly-price-id
VITE_PRICE_DAILY_USD=9.99
VITE_PRICE_MONTHLY_USD=199.99

# Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_CLAUDE_ANALYSIS=true
VITE_ENABLE_PATTERN_DETECTION=true
VITE_ENABLE_EXPORT=true
VITE_DEBUG=false
```

### 3. Custom Domain Configuration (Optional)

1. **Go to Vercel Project** → **Settings** → **Domains**
2. **Add custom domain:** `metagipsy.com`
3. **Configure DNS records** as instructed
4. **SSL automatically provisioned** by Vercel

---

## 🔄 Final Configuration Updates

### 1. Update Backend CORS

**After frontend deployment, update backend environment:**
```bash
# In Render backend service settings
CORS_ORIGINS=https://metagipsy.com,https://your-app.vercel.app
```

### 2. Update Supabase URLs

**In Supabase dashboard:**
- **Site URL:** `https://metagipsy.com`
- **Redirect URLs:** `https://metagipsy.com/auth/callback`

### 3. Configure Stripe Webhooks

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint:** `https://your-api.onrender.com/api/v1/webhooks/stripe`
3. **Select events:**
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

## 📊 Monitoring and Verification

### Health Checks

**Test all endpoints after deployment:**

```bash
# Frontend health
curl https://metagipsy.com/health

# Backend health  
curl https://your-api.onrender.com/api/v1/health

# API documentation
curl https://your-api.onrender.com/api/v1/docs

# Authentication test
curl -X POST https://your-api.onrender.com/api/v1/auth/test
```

### Performance Monitoring

**Render Monitoring:**
- Monitor service metrics in dashboard
- Set up log drains if needed
- Configure autoscaling policies

**Vercel Analytics:**
- Enable Web Analytics in project settings
- Monitor Core Web Vitals
- Track user engagement metrics

**Supabase Monitoring:**
- Monitor database performance
- Track authentication metrics
- Review API usage statistics

---

## 🔧 Production Optimizations

### Backend Performance

```bash
# Environment optimizations
NODE_OPTIONS=--max-old-space-size=1024
PRISMA_QUERY_ENGINE_BINARY=/app/node_modules/.prisma/client/query-engine-rhel-openssl-1.0.x

# Connection pooling
DATABASE_URL=postgresql://user:pass@host:port/db?connection_limit=20&pool_timeout=60
```

### Frontend Performance

**Vercel optimizations:**
- Image optimization enabled by default
- Edge functions for dynamic content
- Global CDN with 100+ edge locations
- Automatic compression and caching

### Database Optimization

**PostgreSQL tuning:**
```sql
-- Connection limits
ALTER SYSTEM SET max_connections = 100;

-- Performance settings  
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
```

---

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
```bash
# Verify CORS_ORIGINS includes frontend domain
CORS_ORIGINS=https://metagipsy.com,https://your-app.vercel.app

# Check browser network tab for preflight requests
```

**2. Database Connection Issues**
```bash
# Test connection string
npx prisma migrate status

# Check Render service logs
# Verify DATABASE_URL format
```

**3. Authentication Problems**
```bash
# Verify Supabase configuration
# Check site URL and redirect URLs
# Test JWT_SECRET generation
```

**4. Payment Processing Issues**
```bash
# Verify Stripe webhook endpoint
# Check webhook secret configuration
# Test payment flow in Stripe dashboard
```

### Performance Issues

**Backend slow responses:**
- Monitor Render service metrics
- Check database query performance
- Verify Redis cache hit rates
- Optimize API endpoint logic

**Frontend loading issues:**
- Check Vercel deployment logs
- Verify environment variables
- Test API connectivity
- Monitor Core Web Vitals

---

## 💾 Backup and Recovery

### Database Backups

**Render PostgreSQL includes automatic backups:**
- Daily automated backups retained for 7 days
- Point-in-time recovery available
- Manual backup creation supported

**Additional backup strategy:**
```bash
# Create manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Scheduled backups (set up with GitHub Actions)
# See .github/workflows/backup.yml example
```

### Disaster Recovery

**Recovery procedures:**
1. **Database restore:** Use Render backup system
2. **Code rollback:** Git revert + redeploy
3. **Service recovery:** Render auto-restart policies
4. **DNS failover:** Vercel automatic edge routing

---

## 📈 Scaling Considerations

### Traffic Growth

**Frontend scaling (Vercel):**
- Automatic global CDN scaling
- Edge function optimization
- Image and asset optimization
- Bandwidth monitoring

**Backend scaling (Render):**
- Vertical scaling: Upgrade service plan
- Horizontal scaling: Multiple service instances
- Database scaling: Connection pooling optimization
- Cache optimization: Redis performance tuning

### Cost Optimization

**Current costs (estimated):**
- **Vercel:** $0 (Hobby) - $20/month (Pro)
- **Render:** $21/month (Starter) - $85/month (Standard)
- **Supabase:** $0 (Free) - $25/month (Pro)
- **Total:** ~$25-130/month based on usage

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Repository cleaned of development artifacts
- [ ] All environment variables configured
- [ ] Build process tested locally
- [ ] Docker files updated to 2025 standards

### Deployment
- [ ] Supabase project created and configured
- [ ] Render PostgreSQL service deployed
- [ ] Render Redis service deployed  
- [ ] Render backend service deployed
- [ ] Vercel frontend deployed
- [ ] Custom domain configured (optional)

### Post-deployment
- [ ] All health checks passing
- [ ] CORS configuration updated
- [ ] Stripe webhooks configured
- [ ] Monitoring and alerts set up
- [ ] Performance testing completed
- [ ] Backup procedures verified

---

## 🌟 Success Metrics

**Deployment complete when:**
- ✅ Frontend loads at production URL
- ✅ API health check returns 200
- ✅ User registration/login works
- ✅ Payment processing functional
- ✅ AI analysis pipeline operational
- ✅ All monitoring systems active

**Your MetaGipsy platform is now live and ready to transform human-AI collaboration worldwide!** 🚀

---

*For additional support, consult service-specific documentation: [Vercel Docs](https://vercel.com/docs), [Render Docs](https://render.com/docs), [Supabase Docs](https://supabase.com/docs)*