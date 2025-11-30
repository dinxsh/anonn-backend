# Vercel Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas database (free tier available at https://mongodb.com/atlas)
- Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Cluster**
   - Go to https://mongodb.com/atlas
   - Create a free M0 cluster
   - Click "Connect" → "Connect your application"
   - Copy your connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

2. **Whitelist Vercel IPs**
   - In Atlas, go to Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Vercel serverless functions

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your Git repository
   - Configure project:
     - Framework Preset: **Other**
     - Root Directory: `./` (or `backend` if in monorepo)
     - Build Command: Leave empty
     - Output Directory: Leave empty

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   JWT_SECRET=your_super_secret_jwt_key_min_32_chars
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
   POLYGON_RPC_URL=https://polygon-rpc.com
   ```

   **Important Security Notes:**
   - Generate strong secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - Never commit secrets to Git
   - Set CORS_ORIGIN to your actual frontend domain

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be live at: `https://your-project.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment
   vercel
   
   # Production deployment
   vercel --prod
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add JWT_REFRESH_SECRET
   # ... add all other variables
   ```

### Step 3: Verify Deployment

1. **Test Health Endpoint**
   ```bash
   curl https://your-project.vercel.app/health
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "Anonn Backend API is running",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "version": "1.0.0",
     "environment": "production"
   }
   ```

2. **Check API Documentation**
   Visit: `https://your-project.vercel.app/api-docs`

3. **Test Authentication**
   ```bash
   curl -X POST https://your-project.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
   ```

### Step 4: Seed Database (Optional)

You cannot run seed scripts directly on Vercel. Instead:

**Option 1: Seed from Local**
```bash
# Set MONGODB_URI to your Atlas connection string in .env
MONGODB_URI=mongodb+srv://... node scripts/seed.js
```

**Option 2: Create API Endpoint for Seeding**
- Add a protected admin route for seeding
- Implement authentication check
- Call from local environment or API client

### Common Issues & Solutions

#### Issue: "Cannot find package 'dotenv'"
**Solution:** Environment variables are injected by Vercel, dotenv is not needed in production
- Already handled in the code with conditional checks

#### Issue: "Database connection timeout"
**Solution:** 
- Verify MongoDB Atlas Network Access allows 0.0.0.0/0
- Check connection string is correct
- Ensure database user has read/write permissions

#### Issue: "CORS errors"
**Solution:**
- Set CORS_ORIGIN environment variable to your frontend URL
- For multiple origins: `https://app1.com,https://app2.com`
- Don't use `*` in production

#### Issue: "JWT errors / Invalid tokens"
**Solution:**
- Ensure JWT_SECRET is at least 32 characters
- Use the same secret across all deployments
- Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

#### Issue: "Rate limiting not working"
**Solution:**
- Vercel serverless functions are stateless
- Consider using Redis (Upstash) for distributed rate limiting
- Or use Vercel's built-in rate limiting

### Performance Optimization

1. **Enable Caching**
   Add to `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "s-maxage=1, stale-while-revalidate"
           }
         ]
       }
     ]
   }
   ```

2. **Use Connection Pooling**
   - Already configured in `database.js`
   - Mongoose handles connection reuse

3. **Monitor Performance**
   - Use Vercel Analytics
   - Check function execution time
   - Monitor cold starts

### Continuous Deployment

Once connected to Git:
- Every push to `main` branch triggers production deployment
- Pull requests create preview deployments
- Automatic rollbacks available

### Monitoring & Logs

1. **View Logs**
   ```bash
   vercel logs <deployment-url>
   ```

2. **Vercel Dashboard**
   - Go to your project → Deployments
   - Click on a deployment → View Function Logs
   - Monitor errors and performance

### Custom Domain

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed
   - SSL automatically provisioned

2. **Update Environment**
   - Update CORS_ORIGIN to include custom domain
   - Update any hardcoded URLs

### Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Network access configured (0.0.0.0/0)
- [ ] All environment variables set in Vercel
- [ ] JWT secrets are strong (64+ characters)
- [ ] CORS_ORIGIN set to frontend URL
- [ ] Database seeded with initial data
- [ ] Health check endpoint working
- [ ] Swagger docs accessible
- [ ] Authentication flow tested
- [ ] Custom domain configured (if applicable)
- [ ] Error tracking set up (Sentry, etc.)

### Scaling

Vercel automatically scales:
- Handles sudden traffic spikes
- No manual configuration needed
- Pay-per-use pricing

For high traffic:
- Consider Vercel Pro/Enterprise
- Use MongoDB Atlas clusters with more resources
- Implement caching (Redis/Upstash)
- Optimize database queries

### Cost Estimation

**Free Tier Includes:**
- 100GB bandwidth
- 100 hours serverless function execution
- Unlimited deployments
- SSL certificates

**Typical Costs:**
- Small app: Free
- Medium traffic (10k users/month): ~$20-50/month
- High traffic: Vercel Pro ($20/month) + usage

### Support & Resources

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Vercel Discord: https://vercel.com/discord
- Status Page: https://vercel-status.com

---

## Quick Reference

**Deploy Command:**
```bash
vercel --prod
```

**View Logs:**
```bash
vercel logs --follow
```

**Environment Variables:**
```bash
vercel env ls
vercel env add VARIABLE_NAME
```

**Redeploy:**
```bash
vercel --prod --force
```

Your API will be live at: **https://your-project.vercel.app**

Documentation: **https://your-project.vercel.app/api-docs**
