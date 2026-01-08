# Production Deployment Guide - Fresh Schedules v1.5.0
**Last Updated**: December 24, 2024\
**Version**: 1.5.0\
**Status**: Production Ready ✅

## Quick Start
### Prerequisites
- Node.js ≥20.10.0
- pnpm ≥9.0.0
- Vercel or Cloudflare account
- Firebase project configured

### Local Production Build
```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build production
pnpm --filter web build

# 3. Start production server
pnpm --filter web start

# 4. Verify at http://localhost:3000
```

## Deployment Options
### Option 1: Vercel (Recommended)
#### Initial Setup
1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   pnpm add -g vercel

   # Login and link project
   vercel login
   vercel link
   ```

1. **Configure Environment Variables**

   In Vercel Dashboard → Project → Settings → Environment Variables:

   ```bash
   # Firebase Configuration (required)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

   # Firebase Admin (required)
   FIREBASE_PROJECT_ID=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64=base64_encoded_service_account_json

   # Redis (optional, for rate limiting)
   UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token
   USE_REDIS_RATE_LIMIT=true

   # OpenTelemetry (optional)
   OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318/v1/traces

   # Node.js Configuration
   NODE_OPTIONS=--max-old-space-size=2048 --expose-gc
   SWC_NUM_THREADS=2
   ```

1. **Deploy**

   ```bash
   # Preview deployment (test first)
   vercel

   # Production deployment
   vercel --prod
   ```

#### Vercel Configuration
The project includes optimal Vercel settings in `next.config.mjs`:

- `output: "standalone"` - Optimized build output
- Security headers configured
- Image optimization enabled
- Compression enabled

### Option 2: Cloudflare Pages
#### Initial Setup
1. **Install Wrangler**

   ```bash
   pnpm add -g wrangler
   wrangler login
   ```

1. **Build for Cloudflare**

   ```bash
   pnpm --filter web build
   ```

1. **Deploy**

   ```bash
   wrangler pages deploy apps/web/.next/standalone --project-name fresh-schedules
   ```

1. **Configure Environment Variables**

   In Cloudflare Dashboard → Pages → Settings → Environment Variables:

   - Add all Firebase variables (same as Vercel list above)
   - Note: Firebase Admin SDK has limited support on Edge runtime

#### Cloudflare Considerations
- Edge runtime limitations (no full Node.js APIs)
- Firebase Admin SDK may require REST API fallback
- `process.exit` not supported (handled in code)

## Environment Variables Reference
### Required Variables
| Variable                                     | Purpose                  | Example                   |
| -------------------------------------------- | ------------------------ | ------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`               | Firebase client config   | `AIza...`                 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`           | Firebase auth domain     | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`            | Firebase project ID      | `my-project-123`          |
| `NEXT_PUBLIC_FIREBASE_APP_ID`                | Firebase app ID          | `1:123:web:abc`           |
| `FIREBASE_PROJECT_ID`                        | Server-side project ID   | `my-project-123`          |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64` | Service account (base64) | `eyJ0eXA...`              |

### Optional Variables
| Variable                      | Purpose                 | Default                     |
| ----------------------------- | ----------------------- | --------------------------- |
| `UPSTASH_REDIS_REST_URL`      | Redis for rate limiting | In-memory fallback          |
| `UPSTASH_REDIS_REST_TOKEN`    | Redis token             | N/A                         |
| `USE_REDIS_RATE_LIMIT`        | Enable Redis            | `false`                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OpenTelemetry endpoint  | Disabled                    |
| `NODE_OPTIONS`                | Node memory/GC          | `--max-old-space-size=1536` |
| `SWC_NUM_THREADS`             | Build parallelism       | CPU cores                   |

### How to Encode Service Account
```bash
# From service account JSON file
cat service-account.json | base64 -w 0 > service-account.base64.txt

# Copy the base64 string to GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64
```

## Deployment Checklist
### Pre-Deployment
- \[ ] All tests passing (`pnpm test`, `pnpm test:e2e`, `pnpm test:rules`)
- \[ ] TypeScript compiles (`pnpm typecheck`)
- \[ ] ESLint clean (`pnpm lint`)
- \[ ] Local production build successful (`pnpm --filter web build`)
- \[ ] Local production server runs (`pnpm --filter web start`)

### Staging Deployment
- \[ ] Environment variables configured
- \[ ] Staging URL accessible
- \[ ] Homepage loads without errors
- \[ ] Login/authentication works
- \[ ] Firebase connection verified
- \[ ] No console errors in browser
- \[ ] Smoke test: create/view a schedule

### Production Deployment
- \[ ] Staging verification complete
- \[ ] PR merged to `main` branch
- \[ ] Git tag created (`v1.5.0`)
- \[ ] Production environment variables configured
- \[ ] Production deployment successful
- \[ ] Domain DNS configured
- \[ ] SSL certificate active
- \[ ] Monitoring enabled (Sentry, Firebase)
- \[ ] Post-deployment smoke test complete

## Troubleshooting
### Build Failures
#### "Dynamic server usage: cookies"
**Cause**: Routes using cookies can't be statically rendered\
**Solution**: This is expected behavior. Next.js will render these routes on-demand.

#### "Firebase env validation failed"
**Cause**: Missing Firebase environment variables\
**Solution**: Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set

#### "Google Fonts fetch failed"
**Cause**: No internet access during build\
**Solution**: System font fallback is already configured

### Runtime Errors
#### "Firebase Admin not initialized"
**Cause**: Missing or invalid service account credentials\
**Solution**: Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON_BASE64` is correctly set and
base64-encoded

#### "Rate limit exceeded"
**Cause**: In-memory rate limiter in multi-instance deployment\
**Solution**: Configure Redis with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

#### "OpenTelemetry warnings"
**Cause**: Optional tracing dependencies\
**Solution**: These are non-blocking warnings. Can be ignored or configure OTEL endpoint.

## Performance Optimization
### CDN Configuration
- Enable Vercel Edge Network (automatic)
- Or configure Cloudflare CDN
- Cache static assets aggressively

### Database Optimization
- Enable Firestore indexes (check console warnings)
- Use composite indexes for complex queries
- Monitor Firebase quota usage

### Monitoring Setup
#### Sentry
```bash
# Already configured via @sentry/nextjs
# Set SENTRY_DSN in environment variables
```

#### Firebase Performance
```javascript
// Already imported in Firebase config
// Automatically tracks page loads and API calls
```

#### Google Analytics
```bash
# Set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
# Analytics will track automatically
```

## Security Checklist
- \[x] HTTPS enforced
- \[x] Security headers configured (CSP, HSTS, etc.)
- \[x] CSRF protection enabled
- \[x] Rate limiting configured
- \[x] Firebase rules deployed
- \[x] Input validation via Zod
- \[x] Console logs removed in production
- \[ ] Regular dependency audits (`pnpm audit`)
- \[ ] Secrets rotation policy
- \[ ] Firewall rules configured

## Rollback Procedure
### Vercel
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Cloudflare
```bash
# Redeploy previous build
wrangler pages deploy apps/web/.next/standalone --project-name fresh-schedules
```

### Manual Rollback
```bash
# Revert to previous git tag
git checkout v1.4.0
pnpm --filter web build
# Deploy as normal
```

## Post-Deployment Verification
### Automated Checks
```bash
# Run Lighthouse audit
node scripts/audit/lighthouse-audit.mjs --url=https://your-domain.com

# Check critical pages
curl -I https://your-domain.com
curl -I https://your-domain.com/login
curl -I https://your-domain.com/dashboard
```

### Manual Checks
1. **Homepage**: Loads, displays navigation
2. **Login**: Authentication flow works
3. **Dashboard**: Protected route accessible
4. **Schedules**: Can create/view schedules
5. **Console**: No JavaScript errors
6. **Performance**: Pages load <3 seconds

## Support
### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Platform](https://vercel.com/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### Internal Docs
- `docs/FAST_TRACK_TO_PRODUCTION.md` - Deployment checklist
- `docs/production/LIGHTHOUSE_AUDIT_REPORT.md` - Performance guide
- `.github/instructions/` - Development standards

### Getting Help
- GitHub Issues: <https://github.com/peteywee/fresh-root/issues>
- Team Chat: \[Your team channel]
- On-call: \[Your on-call rotation]

---

**Deployment Confidence**: ✅ High\
**Last Verified**: December 24, 2024\
**Next Review**: March 2025
