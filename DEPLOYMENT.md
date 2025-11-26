# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Update `.env` with production values
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Configure MongoDB Atlas connection string
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origins for production domains
- [ ] Set up Web3 RPC URLs (Infura, Alchemy, etc.)

### 2. Security Hardening
- [ ] Review and test all rate limits
- [ ] Enable helmet security headers
- [ ] Configure CORS for production domains only
- [ ] Implement API key authentication (if needed)
- [ ] Set up SSL/TLS certificates
- [ ] Enable MongoDB encryption at rest
- [ ] Configure firewall rules

### 3. Database
- [ ] Create production MongoDB database
- [ ] Set up database backups
- [ ] Create indexes for performance
- [ ] Run migration scripts (if any)
- [ ] Test database connection

### 4. Monitoring & Logging
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure application monitoring (New Relic, DataDog)
- [ ] Set up log aggregation (CloudWatch, Loggly)
- [ ] Create alerting rules for critical errors
- [ ] Monitor API rate limits and quotas

### 5. Performance
- [ ] Enable caching (Redis recommended)
- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Implement pagination limits
- [ ] Enable compression middleware

## Deployment Options

### Option 1: Traditional VPS (AWS EC2, Dig italOcean, etc.)

1. **Server Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd backend
   
   # Install dependencies
   npm install --production
   
   # Start with PM2
   pm2 start src/server.js --name web3-social-api
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["node", "src/server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t web3-social-api .
   docker run -d -p 5000:5000 --env-file .env web3-social-api
   ```

### Option 3: Cloud Platforms (Heroku, Render, Railway)

1. **Heroku**
   ```bash
   heroku create web3-social-api
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=<your-mongodb-uri>
   git push heroku main
   ```

2. **Render**
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically on push

## Post-Deployment

### Health Checks
- Verify `/health` endpoint returns 200
- Test authentication flow
- Verify database connectivity
- Check Swagger UI at `/api-docs`
- Monitor error logs

### Performance Testing
- Run load tests (Apache Bench, k6)
- Monitor response times
- Check database query performance
- Verify rate limiting works

### Backup Strategy
- Configure automated database backups
- Test restore procedure
- Document backup schedule
- Set up offsite backup storage

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for session management
- Implement distributed rate limiting
- Use database read replicas

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable database connection pooling
- Implement caching layers

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review security advisories
- Monitor error rates
- Analyze performance metrics
- Clean up old data
- Rotate JWT secrets periodically

### Emergency Procedures
- Document rollback process
- Maintain incident response playbook
- Set up status page
- Configure emergency contacts

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for configuration
3. **Enable HTTPS** for all production traffic
4. **Rotate credentials** regularly
5. **Monitor for vulnerabilities** with npm audit
6. **Implement rate limiting** on all endpoints
7. **Sanitize user inputs** to prevent injection attacks
8. **Keep dependencies updated** with security patches
9. **Use strong JWT secrets** (min 64 characters recommended)
10. **Enable database encryption** at rest and in transit

## Troubleshooting

### Common Issues

**Database Connection Fails**
- Verify MongoDB URI is correct
- Check network/firewall rules
- Ensure IP whitelist includes server IP

**High Response Times**
- Enable database indexes
- Implement caching
- Optimize complex queries
- Scale horizontally

**Rate Limit Errors**
- Adjust rate limit thresholds
- Implement per-user rate limiting
- Consider using Redis for distributed limiting

**Memory Leaks**
- Monitor with PM2 or similar
- Review event listener cleanup
- Check for unclosed database connections

## Support & Monitoring

- **Application Logs**: Check PM2 logs or container logs
- **Error Tracking**: Configure Sentry or similar
- **Performance**: Use  APM tools (New Relic, DataDog)
- **Uptime**: Set up StatusCake or Pingdom

---

**Remember**: Always test in staging environment before production deployment!
