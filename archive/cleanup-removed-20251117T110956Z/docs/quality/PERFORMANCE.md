# Performance Optimization Checklist

## Performance Optimization Checklist

### Completed ✅

1. **Bundle Optimization**

- ✅ Added modularizeImports for lucide-react, date-fns, lodash-es
- ✅ Enabled AVIF/WebP image formats
- ✅ Added compression and removed production source maps
- ✅ Configured next/font with display:swap

1. **Caching Infrastructure**

- ✅ Created cache.ts with tagged caching helpers
- ✅ Implemented cache invalidation pattern
- ✅ Added server actions template with cache tags

1. **Security Headers**

- ✅ Configured comprehensive CSP in next.config
- ✅ Added middleware with defense-in-depth headers
- ✅ HSTS, COOP, COEP, CORP headers

1. **Database Optimization**

- ✅ Created db.ts with field masking patterns
- ✅ Indexed query examples (where + orderBy + limit)
- ✅ Lightweight type mappers to reduce payload

1. **Build & Tooling**

- ✅ Strict TypeScript config with noUncheckedIndexedAccess
- ✅ Path aliases for cleaner imports
- ✅ Unified ESLint and Prettier configs
- ✅ Fast build scripts with proper ordering

1. **UX Improvements**

- ✅ Loading states for protected routes
- ✅ Font optimization eliminates FOIT/FOUT
- ✅ Optimized Tailwind content scanning

### Next Steps (Fast Follow)

1. **Update Existing Firebase Client**

   ```bash
   ##  Replace direct process.env reads with ENV module
   apps/web/app/lib/firebaseClient.ts
   apps/web/src/lib/firebaseClient.ts
   ```

1. **Apply ISR to Read-Heavy Pages**

   ```typescript
   // Add to dashboard, schedules list, etc.
   export const revalidate = 60; // ISR
   export const fetchCache = "default-cache";
   ```

1. **Convert Client Fetches to Server Actions**

- Move mutation logic from client components to server actions
- Use cache tag invalidation after writes
- Example: `publishSchedule()` in `scheduleActions.ts`

1. **Add Bundle Analyzer**

   ```bash
   pnpm add -D @next/bundle-analyzer
   ##  Then: ANALYZE=true pnpm build
   ```

1. **Verify Performance**

- Run Lighthouse on production build
- Check bundle sizes with analyzer
- Monitor Firestore query costs in console

1. **Additional Optimizations**

- Add `<Link prefetch>` to primary nav
- Convert heavy client components to server components
- Add more loading.tsx files for nested routes
- Consider React Server Components for data-heavy pages

### Immediate Impact Wins

**Fastest to implement, biggest impact:**

1. Replace `process.env.*` with `ENV.*` everywhere
1. Add `export const revalidate = 60` to 3-5 top pages
1. Move 2-3 write operations to server actions
1. Run `ANALYZE=true pnpm build` to identify large bundles

### Metrics to Track

- **LCP** (Largest Contentful Paint): Target < 2.5s
- **FID** (First Input Delay): Target < 100ms
- **CLS** (Cumulative Layout Shift): Target < 0.1
- **Bundle size**: Aim for < 200KB initial JS
- **Firestore reads**: Track with Firebase console
