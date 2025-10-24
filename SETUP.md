# Setup Guide

This guide provides detailed instructions for setting up the Fresh Schedules project for development and deployment.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Git** (for version control)

### Installing Prerequisites

#### Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm):

```bash
# Using nvm
nvm install 20
nvm use 20
```

#### pnpm

Install pnpm globally:

```bash
npm install -g pnpm
```

Or enable corepack (recommended):

```bash
corepack enable
```

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fresh-root
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo and its packages.

### 3. Environment Configuration

Create environment files for the web application:

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
# Firebase Client SDK Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Use emulators for local development
NEXT_PUBLIC_USE_EMULATORS=true

# Optional: Error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing one
3. Follow the setup wizard

### 2. Enable Services

#### Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - Email/Password
   - Google
   - Anonymous (optional)
3. Configure authorized domains:
   - Add `localhost` for development
   - Add your production domain

#### Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" for development (configure security rules later)

#### Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in test mode" for development

### 3. Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web app (</>) icon
4. Register your app with a nickname
5. Copy the config object values to your `.env.local`

### 4. Deploy Security Rules

From the project root:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (select hosting, firestore, storage)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage
```

## Development

### Start Development Server

```bash
# From project root
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Using Firebase Emulators (Recommended)

For local development with emulators:

1. **Start emulators**:

   ```bash
   firebase emulators:start
   ```

2. **Update environment**:
   Set `NEXT_PUBLIC_USE_EMULATORS=true` in `.env.local`

3. **Seed emulator data** (optional):

```bash
# Create seed script if needed
pnpm tsx scripts/seed/seed.emulator.ts
```

### 5. Install Additional Dependencies

For server-side Firebase operations, install the admin SDK:

```bash
cd apps/web
pnpm add -D firebase-admin @types/node
```

### Available Scripts

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build all packages
pnpm typecheck              # Run type checking
pnpm lint                   # Run linting

# Web app specific
cd apps/web
pnpm dev                    # Start web app dev server
pnpm build                  # Build web app
pnpm start                  # Start production server
pnpm typecheck              # Type check web app
```

## Testing

### Manual Testing

1. **Authentication**: Test sign-in/sign-up flows
2. **API Routes**: Test endpoints with tools like Postman or curl
3. **Protected Routes**: Verify authentication guards work
4. **Data Operations**: Test CRUD operations

### API Testing Examples

```bash
# Health check
curl http://localhost:3000/api/health

# Get items
curl http://localhost:3000/api/items

# Create item (requires authentication in production)
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item"}'
```

## Deployment

### Build for Production

```bash
pnpm build
```

### Firebase Hosting Deployment

1. **Build the app**:

   ```bash
   pnpm build
   ```

2. **Deploy to Firebase Hosting**:

   ```bash
   firebase deploy --only hosting
   ```

### Environment Variables for Production

Set environment variables in Firebase Console:

1. Go to **Functions** > **Configuration**
2. Add environment variables under "Environment variables"

Or use Firebase Hosting rewrites for server-side environment variables.

## Troubleshooting

### Common Issues

#### Build Errors

- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (should be >= 20.0.0)
- Clear cache: `pnpm store prune`

#### Firebase Connection Issues

- Verify environment variables are set correctly
- Check Firebase project configuration
- Ensure security rules allow your operations

#### TypeScript Errors

- Run type checking: `pnpm typecheck`
- Check for missing type definitions
- Update dependencies if needed

#### Port Conflicts

- Change dev server port in `apps/web/package.json`:

   ```json
   "dev": "next dev --port 3001"
   ```

### Getting Help

- Check the [README.md](README.md) for general information
- Review Firebase documentation for service-specific issues
- Check Next.js documentation for framework issues

## Next Steps

After setup is complete:

1. **Explore the codebase**: Familiarize yourself with the project structure
2. **Run the app**: Start development server and test features
3. **Customize**: Modify components, add features, update styling
4. **Deploy**: Set up CI/CD and deploy to production

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes**: Implement your feature
3. **Test locally**: Run dev server and test thoroughly
4. **Commit changes**: `git commit -m "Add your feature"`
5. **Push and create PR**: Push to remote and create pull request
6. **Code review**: Address feedback and merge

Happy coding! 🚀
