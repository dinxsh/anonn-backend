# MongoDB Connection Issue - Quick Fix Guide

## Problem
Server crashes with: `ECONNREFUSED 127.0.0.1:27017`

This means MongoDB is not running on your local machine.

## Solutions

### Option 1: Use MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anonn?retryWrites=true&w=majority
   ```

### Option 2: Install MongoDB Locally
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Keep `.env` as is:
   ```
   MONGODB_URI=mongodb://localhost:27017/anonn
   ```

### Option 3: Use Docker (If you have Docker installed)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After Setting Up MongoDB

1. Restart the server:
   ```bash
   npm start
   ```

2. You should see:
   ```
   ✅ Environment variables validated
   ✅ MongoDB Connected: <your-host>
   🚀 Server running in development mode on port 8000
   ```

3. Test the API:
   ```bash
   curl http://localhost:8000/health
   ```

4. Access Swagger UI:
   ```
   http://localhost:8000/api-docs
   ```
