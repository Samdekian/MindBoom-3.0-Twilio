# MindBoom 3.0 - Twilio: Deployment Guide

This guide provides step-by-step instructions for deploying MindBoom 3.0 to various hosting platforms.

## Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Netlify Deployment](#netlify-deployment)
3. [AWS Deployment](#aws-deployment)
4. [Google Cloud Deployment](#google-cloud-deployment)
5. [Azure Deployment](#azure-deployment)
6. [Docker Deployment](#docker-deployment)
7. [DigitalOcean Deployment](#digitalocean-deployment)
8. [Self-Hosted Deployment](#self-hosted-deployment)

## Vercel Deployment (Recommended)

Vercel offers excellent support for Vite applications with zero-configuration deployment.

### Prerequisites

- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project configured

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### Step 4: Set Environment Variables

Via Vercel Dashboard:
1. Go to Project Settings > Environment Variables
2. Add each variable:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   VITE_APP_ENV = production
   VITE_APP_URL = https://your-domain.vercel.app
   ```

Or via CLI:

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_APP_ENV production
vercel env add VITE_APP_URL production
```

### Step 5: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 6: Configure Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS as instructed
4. SSL certificate is automatically provisioned

### Continuous Deployment

Connect your Git repository in Vercel dashboard:
- Production: main branch
- Preview: all other branches
- Automatic deployments on push

---

## Netlify Deployment

### Prerequisites

- Netlify account
- Git repository

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login

```bash
netlify login
```

### Step 3: Configure Project

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Step 4: Set Environment Variables

Via Netlify Dashboard:
1. Site Settings > Build & deploy > Environment
2. Add variables

Or via CLI:

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set VITE_APP_ENV "production"
```

### Step 5: Deploy

```bash
# Initialize site
netlify init

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Step 6: Custom Domain

1. Site Settings > Domain management
2. Add custom domain
3. Configure DNS
4. SSL automatically provisioned

---

## AWS Deployment

### Option A: AWS Amplify

#### Step 1: Install AWS Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
```

#### Step 2: Initialize Amplify

```bash
amplify init
```

Configuration:
```
? Enter a name for the project: mindboom30twilio
? Enter a name for the environment: production
? Choose your default editor: Visual Studio Code
? Choose the type of app: javascript
? What javascript framework: react
? Source Directory Path: src
? Distribution Directory Path: dist
? Build Command: npm run build
? Start Command: npm run dev
```

#### Step 3: Add Hosting

```bash
amplify add hosting
```

Select:
- Hosting with Amplify Console
- Continuous deployment

#### Step 4: Configure Environment

Create `amplify/backend/function/environment.json`:

```json
{
  "VITE_SUPABASE_URL": "https://your-project.supabase.co",
  "VITE_SUPABASE_ANON_KEY": "your-anon-key",
  "VITE_APP_ENV": "production"
}
```

#### Step 5: Deploy

```bash
amplify publish
```

### Option B: AWS S3 + CloudFront

#### Step 1: Build Application

```bash
npm run build:prod
```

#### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://mindboom-production
aws s3 website s3://mindboom-production --index-document index.html
```

#### Step 3: Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mindboom-production/*"
    }
  ]
}
```

#### Step 4: Upload Build

```bash
aws s3 sync dist/ s3://mindboom-production --delete
```

#### Step 5: Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --origin-domain-name mindboom-production.s3.amazonaws.com \
  --default-root-object index.html
```

#### Step 6: Configure Custom Error Pages

In CloudFront settings, add custom error response:
- 403 -> /index.html (200)
- 404 -> /index.html (200)

---

## Google Cloud Deployment

### Option A: Firebase Hosting

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Firebase

```bash
firebase init hosting
```

Configuration:
```
? What do you want to use as your public directory? dist
? Configure as a single-page app? Yes
? Set up automatic builds with GitHub? Yes (optional)
```

#### Step 3: Configure firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### Step 4: Build and Deploy

```bash
npm run build
firebase deploy --only hosting
```

### Option B: Cloud Run

#### Step 1: Create Dockerfile (see Docker section)

#### Step 2: Build and Push Image

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/mindboom-3.0-twilio
```

#### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy mindboom-production \
  --image gcr.io/PROJECT_ID/mindboom-3.0-twilio \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_SUPABASE_URL=https://your-project.supabase.co \
  --set-env-vars VITE_SUPABASE_ANON_KEY=your-key \
  --set-env-vars VITE_APP_ENV=production
```

---

## Azure Deployment

### Option A: Azure Static Web Apps

#### Step 1: Install Azure CLI

```bash
# macOS
brew install azure-cli

# Login
az login
```

#### Step 2: Create Static Web App

```bash
az staticwebapp create \
  --name mindboom-production \
  --resource-group mindboom-rg \
  --source https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

#### Step 3: Configure Build

Create `staticwebapp.config.json`:

```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff"
  }
}
```

#### Step 4: Set Environment Variables

```bash
az staticwebapp appsettings set \
  --name mindboom-production \
  --setting-names \
    VITE_SUPABASE_URL="https://your-project.supabase.co" \
    VITE_SUPABASE_ANON_KEY="your-key" \
    VITE_APP_ENV="production"
```

### Option B: Azure App Service

#### Step 1: Create App Service

```bash
az webapp create \
  --name mindboom-production \
  --resource-group mindboom-rg \
  --plan mindboom-plan \
  --runtime "NODE|18-lts"
```

#### Step 2: Configure Deployment

```bash
az webapp deployment source config \
  --name mindboom-production \
  --resource-group mindboom-rg \
  --repo-url https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio \
  --branch main \
  --manual-integration
```

---

## Docker Deployment

### Step 1: Build Image

```bash
docker build -t mindboom-3.0-twilio:latest .
```

### Step 2: Test Locally

```bash
docker run -d \
  -p 8080:80 \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
  -e VITE_APP_ENV="production" \
  --name mindboom-test \
  mindboom-3.0-twilio:latest
```

### Step 3: Push to Registry

#### Docker Hub

```bash
docker tag mindboom-3.0-twilio:latest username/mindboom-3.0-twilio:latest
docker push username/mindboom-3.0-twilio:latest
```

#### AWS ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag mindboom-3.0-twilio:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/mindboom-3.0-twilio:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/mindboom-3.0-twilio:latest
```

### Step 4: Deploy with Docker Compose

```yaml
version: '3.8'

services:
  app:
    image: mindboom-3.0-twilio:latest
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
      - VITE_APP_ENV=production
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "-", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy:

```bash
docker-compose up -d
```

---

## DigitalOcean Deployment

### Option A: App Platform

#### Step 1: Create App

1. Go to DigitalOcean Dashboard > Apps
2. Click "Create App"
3. Connect GitHub repository
4. Configure:
   - Branch: main
   - Source Directory: /
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Step 2: Add Environment Variables

In App Settings > Settings > Environment Variables:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-key
VITE_APP_ENV = production
```

#### Step 3: Deploy

Click "Deploy" - automatic deployments on every push to main.

### Option B: Droplet with Docker

#### Step 1: Create Droplet

```bash
# Create via doctl CLI
doctl compute droplet create mindboom-production \
  --size s-2vcpu-4gb \
  --image docker-20-04 \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID
```

#### Step 2: SSH and Deploy

```bash
ssh root@YOUR_DROPLET_IP

# Pull and run image
docker pull username/mindboom-3.0-twilio:latest
docker run -d \
  -p 80:80 \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-key" \
  --restart unless-stopped \
  --name mindboom-production \
  username/mindboom-3.0-twilio:latest
```

---

## Self-Hosted Deployment

### Prerequisites

- Ubuntu 20.04+ server
- Root or sudo access
- Domain name pointed to server

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone and Build

```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio.git mindboom
cd mindboom
sudo npm install
sudo npm run build:prod
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/mindboom`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/mindboom/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/mindboom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 5: Set Up Auto-Deployment

Create `/var/www/mindboom/deploy.sh`:

```bash
#!/bin/bash
cd /var/www/mindboom
git pull origin main
npm install
npm run build:prod
sudo systemctl reload nginx
```

Make executable:

```bash
chmod +x deploy.sh
```

### Step 6: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Post-Deployment Tasks

After deploying to any platform:

1. **Verify Deployment**
   ```bash
   curl -I https://yourdomain.com
   ```

2. **Test Critical Flows**
   - User registration
   - Login
   - Video session
   - File upload

3. **Configure Monitoring**
   - Set up uptime monitoring
   - Configure error tracking
   - Enable performance monitoring

4. **Update DNS**
   - Configure A records
   - Set up CDN (if using)
   - Configure SSL

5. **Security Scan**
   - Run security audit
   - Check SSL configuration
   - Verify headers

6. **Documentation**
   - Document deployment date
   - Record configuration
   - Update runbooks

## Rollback Procedures

### Vercel/Netlify

```bash
# Revert to previous deployment via dashboard or CLI
vercel rollback
# or
netlify rollback
```

### Docker

```bash
# Stop current container
docker stop mindboom-production

# Start previous version
docker run [previous-image-tag]
```

### Self-Hosted

```bash
cd /var/www/mindboom
git revert HEAD
npm install
npm run build:prod
sudo systemctl reload nginx
```

## Support

For deployment issues:
- Check platform status pages
- Review logs: `docker logs` / platform console
- Contact support: support@mindboom.com

## Additional Resources

- [Production Setup Guide](PRODUCTION_SETUP.md)
- [Security Checklist](SECURITY_CHECKLIST.md)
- [Architecture Overview](ARCHITECTURE.md)

---

**Last Updated**: 2025-10-27

