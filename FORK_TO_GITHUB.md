# Forking MindBoom 3.0 - Twilio to GitHub

This guide provides step-by-step instructions to fork this application to GitHub with a fresh history, ready for production deployment.

## Prerequisites

- Git installed and configured
- GitHub account
- Command line access
- Write access to this repository

## Important Notes

⚠️ **Before proceeding:**

1. **Backup**: Ensure you have a backup of your current work
2. **Uncommitted Changes**: The fork will NOT include any uncommitted changes
3. **Fresh History**: This process creates a new repository with a clean commit history
4. **Environment Variables**: Remember to configure secrets in GitHub after forking

## Step-by-Step Guide

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Configure your repository:
   - **Repository name**: `MindBoom-3.0-Twilio`
   - **Description**: `AI-powered video therapy platform with Twilio WebRTC, Agora.io, and OpenAI integration`
   - **Visibility**: 
     - **Private** (recommended for initial setup)
     - **Public** (only if you want it open source)
   - **Initialize**: 
     - ❌ Do NOT add README
     - ❌ Do NOT add .gitignore
     - ❌ Do NOT add license
   - Click **"Create repository"**

### Step 2: Prepare Local Repository

Open your terminal and navigate to your project directory:

```bash
cd "/Users/rsmacair/Samdekian Dropbox/Samdekian Docs/Mac (2)/Documents/Dev/MindBloom/mind-bloom-therapy-ai"
```

### Step 3: Create Fresh Git History

Execute these commands to create a new repository with fresh history:

```bash
# Remove existing git history (if any)
rm -rf .git

# Initialize new git repository
git init

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: MindBoom 3.0 - Twilio

Version: 3.0.0
Date: 2025-10-27

Features:
- WebRTC video conferencing with Twilio TURN and Agora.io
- OpenAI Realtime API integration for AI features
- Supabase backend (Auth, Database, Storage, Edge Functions)
- HIPAA-compliant architecture
- Role-based access control (RBAC)
- Comprehensive test suite
- Production-ready Docker configuration
- CI/CD with GitHub Actions
- Complete documentation

This is a production-ready therapy platform with enterprise-grade
security, performance, and scalability."

# Create develop branch
git checkout -b develop

# Return to main
git checkout main
```

### Step 4: Connect to GitHub

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```bash
# Add GitHub remote (replace YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/MindBoom-3.0-Twilio.git

# Verify remote
git remote -v
```

### Step 5: Push to GitHub

```bash
# Push main branch
git push -u origin main

# Push develop branch
git checkout develop
git push -u origin develop

# Return to main
git checkout main
```

### Step 6: Configure GitHub Repository Settings

#### A. Branch Protection Rules

1. Go to your repository on GitHub
2. Navigate to **Settings > Branches**
3. Click **"Add branch protection rule"**
4. Branch name pattern: `main`
5. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
6. Click **"Create"**

Repeat for `develop` branch if desired.

#### B. Configure GitHub Secrets

Navigate to **Settings > Secrets and variables > Actions** and add:

##### Repository Secrets

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref

# Staging Environment
STAGING_SUPABASE_URL=https://staging.supabase.co
STAGING_SUPABASE_ANON_KEY=staging-anon-key
STAGING_SUPABASE_PROJECT_REF=staging-ref
STAGING_APP_URL=https://staging.yourdomain.com
STAGING_OPENAI_API_KEY=sk-...
STAGING_TWILIO_ACCOUNT_SID=ACxxxx
STAGING_TWILIO_AUTH_TOKEN=token
STAGING_AGORA_APP_ID=app-id
STAGING_AGORA_APP_CERTIFICATE=certificate

# Production Environment
PROD_SUPABASE_URL=https://prod.supabase.co
PROD_SUPABASE_ANON_KEY=prod-anon-key
PROD_SUPABASE_PROJECT_REF=prod-ref
PROD_APP_URL=https://yourdomain.com
PROD_OPENAI_API_KEY=sk-...
PROD_TWILIO_ACCOUNT_SID=ACxxxx
PROD_TWILIO_AUTH_TOKEN=token
PROD_AGORA_APP_ID=app-id
PROD_AGORA_APP_CERTIFICATE=certificate

# Deployment
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Optional - Notifications
SLACK_WEBHOOK=https://hooks.slack.com/...
EMAIL_USERNAME=notifications@yourdomain.com
EMAIL_PASSWORD=app-password
ALERT_EMAIL=alerts@yourdomain.com

# Optional - Security Scanning
SNYK_TOKEN=your-snyk-token
```

#### C. Configure Topics

1. Go to **About** section (top right of repository page)
2. Click the gear icon
3. Add topics:
   - `video-conferencing`
   - `therapy`
   - `mental-health`
   - `webrtc`
   - `twilio`
   - `agora`
   - `openai`
   - `react`
   - `typescript`
   - `supabase`
   - `hipaa-compliant`
   - `healthcare`

#### D. Enable GitHub Features

In **Settings > General**:
- ✅ Issues
- ✅ Discussions (optional)
- ✅ Projects (optional)
- ✅ Wiki (optional)
- ✅ Preserve this repository (optional)

### Step 7: Update Repository URLs

Update the URLs in your code to point to your new repository:

1. **package.json**: Update the repository URL
   ```bash
   # Use your actual GitHub username
   sed -i '' 's/YOUR_USERNAME/your-actual-username/g' package.json
   ```

2. **README.md**: Update links
   ```bash
   sed -i '' 's/YOUR_USERNAME/your-actual-username/g' README.md
   ```

3. **Dockerfile**: Update labels
   ```bash
   sed -i '' 's/YOUR_USERNAME/your-actual-username/g' Dockerfile
   ```

4. **GitHub Workflows**: Update placeholders
   ```bash
   find .github/workflows -type f -name "*.yml" -exec sed -i '' 's/YOUR_USERNAME/your-actual-username/g' {} +
   ```

5. Commit these changes:
   ```bash
   git add .
   git commit -m "chore: update repository URLs to actual GitHub username"
   git push origin main
   git push origin develop
   ```

### Step 8: Create Initial Release

1. Go to your repository on GitHub
2. Click **"Releases"** in the right sidebar
3. Click **"Create a new release"**
4. Configure:
   - **Tag**: `v3.0.0`
   - **Target**: `main`
   - **Title**: `MindBoom 3.0 - Twilio - Initial Release`
   - **Description**: Copy from CHANGELOG.md
   - Click **"Publish release"**

### Step 9: Set Up Development Environment

For other developers to work on this project:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MindBoom-3.0-Twilio.git
cd MindBoom-3.0-Twilio

# Install dependencies
npm install

# Copy environment variables
cp env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Step 10: Verify Everything Works

Test the following:

- [ ] GitHub repository is accessible
- [ ] CI/CD workflows are present
- [ ] Branch protection rules are active
- [ ] Secrets are configured
- [ ] Clone and run locally works
- [ ] Documentation is complete
- [ ] All links point to correct repository

## Quick Reference Commands

### Create New Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
# Make your changes
git add .
git commit -m "feat(scope): description"
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

### Update from Upstream

If you're contributing to someone else's fork:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/MindBoom-3.0-Twilio.git
git fetch upstream
git checkout develop
git merge upstream/develop
git push origin develop
```

### Create Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue
# Fix the issue
git commit -m "fix: critical issue description"
git push origin hotfix/critical-issue
# Create Pull Request to main
```

## Troubleshooting

### Permission Denied

If you get "Permission denied (publickey)":

1. Set up SSH key: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Or use HTTPS with personal access token

### Push Rejected

If push is rejected:

```bash
git pull origin main --rebase
git push origin main
```

### Large Files

If you have large files (>100MB):

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.mp4"
git lfs track "*.zip"

# Commit and push
git add .gitattributes
git commit -m "chore: configure Git LFS"
git push origin main
```

## Next Steps

After forking:

1. **Configure Production Deployment**
   - See [docs/PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md)
   - Set up Supabase production project
   - Deploy edge functions
   - Configure domain and SSL

2. **Set Up CI/CD**
   - GitHub Actions will run automatically
   - Monitor first workflow runs
   - Fix any issues

3. **Invite Collaborators**
   - Go to Settings > Collaborators
   - Add team members

4. **Create Project Board** (optional)
   - Set up project management
   - Create issues for tasks

5. **Documentation**
   - Customize documentation for your needs
   - Update contact information
   - Add team information

## Support

For questions or issues:
- Create an issue in your repository
- Check documentation in `docs/`
- Email: support@mindboom.com

## Security

**⚠️ IMPORTANT**: Never commit sensitive information to Git:
- API keys
- Passwords
- Private keys
- Database credentials
- Personal data

Always use environment variables and GitHub Secrets.

---

**Congratulations!** 🎉

You've successfully forked MindBoom 3.0 - Twilio to GitHub!

Your project is now ready for production deployment and team collaboration.

