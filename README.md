# MindBoom 3.0 - Twilio

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)

> AI-powered video therapy platform with secure, HIPAA-compliant communication powered by Twilio Video, breakout rooms, and OpenAI integration

## Overview

MindBoom 3.0 - Twilio is a comprehensive video therapy platform designed for mental health professionals and their clients. It combines cutting-edge real-time communication technologies with AI-powered features to create a secure, reliable, and feature-rich telehealth solution.

## Key Features

### 🎥 Video Conferencing
- **Twilio Video SDK**: Enterprise-grade video infrastructure with up to 50 participants
- **Breakout Rooms**: Split group sessions into separate rooms for focused discussions
- **Automatic Assignment**: Random or manual participant distribution to breakout rooms
- **Real-time Management**: Move participants between rooms during active sessions
- **Adaptive Quality**: Dynamic bitrate adjustment based on network conditions
- **Network Quality Monitoring**: Real-time connection quality indicators
- **Automatic Reconnection**: Seamless recovery from connection drops
- **Screen Sharing**: Share presentations and documents during sessions

### 🤖 AI Integration
- **OpenAI Realtime API**: Voice-to-voice AI assistant integration
- **Real-time Transcription**: Live speech-to-text conversion
- **Meeting Insights**: Automated session summaries and notes
- **Sentiment Analysis**: Emotional state detection and tracking

### 🔐 Security & Compliance
- **End-to-End Encryption**: AES-256-GCM encryption for media streams
- **HIPAA Compliant**: Healthcare data protection standards
- **Role-Based Access Control**: Granular permission management
- **Audit Logging**: Comprehensive security event tracking
- **Two-Factor Authentication**: Optional 2FA for enhanced security

### 👥 User Management
- **Multi-Role System**: Support for patients, therapists, and administrators
- **Profile Management**: Comprehensive user profiles with preferences
- **Availability Scheduling**: Therapist availability and appointment booking
- **Patient Management**: Client lists, notes, and treatment tracking

### 📊 Analytics & Monitoring
- **Session Analytics**: Real-time quality metrics and statistics
- **Performance Dashboard**: System health and performance monitoring
- **Connection Quality**: Network diagnostics and optimization
- **Usage Reports**: Detailed analytics for administrators

### 🗓️ Scheduling & Calendar
- **Appointment Booking**: Integrated scheduling system
- **Calendar Sync**: Google Calendar and Calendly integration
- **Reminders**: Automated email/SMS notifications
- **Timezone Support**: Multi-timezone scheduling

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **TailwindCSS** for modern, responsive UI
- **shadcn/ui** component library
- **React Query** for efficient data fetching
- **React Router** for navigation

### Backend & Services
- **Supabase** (PostgreSQL, Auth, Storage, Realtime)
- **Supabase Edge Functions** (Deno runtime)
- **Twilio** for TURN servers and reliable WebRTC connections
- **Agora.io** for video streaming and cloud recording
- **OpenAI API** for AI features and transcription

### WebRTC Stack
- **Native WebRTC** implementation
- **Custom signaling** via Supabase Realtime
- **ICE server management** with Twilio TURN
- **Adaptive bitrate streaming**

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **bun**
- **Supabase CLI** (for local development)
- **Git**

### Required Service Accounts

You'll need to set up accounts with the following services:

1. **Supabase** - https://supabase.com
2. **Twilio** - https://twilio.com (for TURN servers)
3. **Agora.io** - https://agora.io (for video conferencing)
4. **OpenAI** - https://openai.com (for AI features)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/samdekian/MindBoom-3.0-Twilio.git
cd MindBoom-3.0-Twilio
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` and fill in your actual credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:5173
```

### 4. Supabase Setup

#### Option A: Link to Existing Project

```bash
supabase link --project-ref your-project-id
```

#### Option B: Start Local Development

```bash
supabase start
```

### 5. Configure Supabase Secrets

Add the following secrets in your Supabase Dashboard under Settings > Edge Functions > Secrets:

```bash
OPENAI_API_KEY=sk-proj-...
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
```

### 6. Run Database Migrations

```bash
supabase db push
```

### 7. Deploy Edge Functions (Optional for local dev)

```bash
supabase functions deploy
```

### 8. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for production with optimization
npm run build:prod

# Preview production build
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate test coverage
npm run test:coverage

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

### Project Structure

```
mindboom-3.0-twilio/
├── src/
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── therapist/    # Therapist-specific components
│   │   ├── patient/      # Patient-specific components
│   │   ├── video-conference/  # Video conferencing UI
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
├── public/               # Static assets
└── tests/               # Test files
```

## Staging Environment

**Quick Start**: See [STAGING_QUICK_START.md](STAGING_QUICK_START.md) for rapid staging setup!

### Staging Resources

- **Supabase Project**: `aoumioacfvttagverbna`
- **Repository**: https://github.com/Samdekian/mind-boom-spark

### Staging Setup Guides

- **[Staging Quick Start](STAGING_QUICK_START.md)** - Get staging running in minutes
- **[Staging Setup Guide](docs/STAGING_SETUP.md)** - Complete staging configuration
- **[Secrets Configuration](docs/SECRETS_CONFIGURATION_GUIDE.md)** - Configure all API keys
- **[Edge Functions Guide](docs/EDGE_FUNCTIONS_DEPLOY_GUIDE.md)** - Deploy backend functions
- **[Frontend Deploy Guide](docs/FRONTEND_DEPLOY_GUIDE.md)** - Deploy React application
- **[Staging Checklist](STAGING_CHECKLIST.md)** - Validation checklist

### Automated Setup

```bash
# One-command staging setup
./scripts/setup-staging.sh

# Validate staging environment
./scripts/validate-staging.sh
```

## Production Deployment

See the comprehensive production setup guides:

- **[Production Setup Guide](docs/PRODUCTION_SETUP.md)** - Complete deployment instructions
- **[Security Checklist](docs/SECURITY_CHECKLIST.md)** - Pre-production security audit
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Platform-specific deployment steps
- **[Agora Setup](docs/AGORA_PRODUCTION_SETUP.md)** - Agora.io configuration
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture overview

### Quick Production Checklist

- [ ] Configure production environment variables
- [ ] Set up Supabase production project
- [ ] Deploy database migrations
- [ ] Deploy edge functions
- [ ] Configure Twilio TURN servers
- [ ] Set up Agora.io project
- [ ] Configure OpenAI API access
- [ ] Set up domain and SSL/TLS
- [ ] Configure CORS policies
- [ ] Enable security features (2FA, audit logging)
- [ ] Set up monitoring and alerts
- [ ] Test all critical flows
- [ ] Review security checklist
- [ ] Set up backup procedures

## Docker Deployment

### Build Docker Image

```bash
docker build -t mindboom-3.0-twilio .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080`

## Testing

### Run Unit Tests

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Architecture

For detailed architecture documentation, see:

- [System Architecture](docs/ARCHITECTURE.md)
- [RBAC System](docs/rbac-system.md)
- [Video Conference Setup](docs/video-conference/)

## Security

Security is a top priority. Please refer to:

- [Security Checklist](docs/SECURITY_CHECKLIST.md)
- [HIPAA Compliance Guidelines](docs/PRODUCTION_SETUP.md#hipaa-compliance)

For security issues, please email: security@mindboom.com (DO NOT open public issues)

## License

UNLICENSED - This is proprietary software. See [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/Samdekian/mind-boom-spark/issues)
- Email: support@mindboom.com

## Acknowledgments

- Built with [Supabase](https://supabase.com)
- Video powered by [Twilio](https://twilio.com) and [Agora.io](https://agora.io)
- AI features powered by [OpenAI](https://openai.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**MindBoom 3.0 - Twilio** - Transforming mental health care through technology

