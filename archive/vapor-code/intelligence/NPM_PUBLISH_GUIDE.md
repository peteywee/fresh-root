# NPM Registry Publication Guide

This guide walks you through publishing `testintel` to the npm registry.

---

## Prerequisites

1. **npm Account** - Create at https://www.npmjs.com/signup
2. **Node.js 18+** - Required for building
3. **Access to the repository** - You need push access

---

## Step 1: Create npm Account (if you don't have one)

1. Go to https://www.npmjs.com/signup
2. Create account with email
3. Verify your email
4. Enable 2FA (recommended)

---

## Step 2: Login to npm

```bash
npm login
# Enter username, password, email, and 2FA code
```

Verify login:

```bash
npm whoami
# Should print your username
```

---

## Step 3: Prepare the Package

### Option A: Publish from this repo (as standalone package)

```bash
# Navigate to the package directory
cd tests/intelligence

# Copy the npm-ready package.json
cp package.npm.json package.json

# Build the TypeScript files
npm run build

# Test locally
npm link
testintel --help
```

### Option B: Create a separate repository (recommended for public package)

```bash
# Create new repo
mkdir testintel
cd testintel

# Initialize git
git init
git remote add origin https://github.com/peteywee/testintel.git

# Copy files from tests/intelligence
cp -r /path/to/fresh-root/tests/intelligence/* .

# Use npm package.json
mv package.npm.json package.json

# Create tsconfig for build
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

# Install dependencies
npm install

# Build
npm run build

# Test
node dist/cli.js --help
```

---

## Step 4: Check Package Name Availability

```bash
npm view testintel
# If "npm ERR! 404" - name is available!
# If it shows package info - name is taken
```

**Alternative names if `testintel` is taken:**

- `@peteywee/testintel` (scoped - always available)
- `testintel-cli`
- `test-intelligence-cli`
- `ai-testintel`

---

## Step 5: Publish

### Dry Run (Test First!)

```bash
npm publish --dry-run
```

This shows what would be published without actually publishing.

### Publish for Real

```bash
# For public package
npm publish --access public

# For scoped package (@peteywee/testintel)
npm publish --access public
```

---

## Step 6: Verify Publication

```bash
# Check on npm
npm view testintel

# Install globally
npm install -g testintel

# Test
testintel --version
testintel --help
```

---

## Publishing Updates

### Versioning (Semantic Versioning)

```bash
# Patch (bug fixes): 1.0.0 -> 1.0.1
npm version patch

# Minor (new features): 1.0.0 -> 1.1.0
npm version minor

# Major (breaking changes): 1.0.0 -> 2.0.0
npm version major
```

### Publish Update

```bash
npm publish
```

---

## Scoped Package (@username/package)

If `testintel` is taken, use a scoped package:

1. **Update package.json name:**

```json
{
  "name": "@peteywee/testintel"
}
```

2. **Publish:**

```bash
npm publish --access public
```

3. **Users install with:**

```bash
npm install -g @peteywee/testintel
```

---

## Automation with GitHub Actions

Create `.github/workflows/npm-publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          registry-url: "https://registry.npmjs.org"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Publish
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Set up NPM Token:

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Generate new token (Automation type)
3. Add to GitHub Secrets as `NPM_TOKEN`

---

## Checklist Before Publishing

- [ ] Package name available or using scoped name
- [ ] Version number is correct
- [ ] README.md is present and complete
- [ ] LICENSE file is present
- [ ] All files listed in `files` array exist
- [ ] `npm run build` succeeds
- [ ] `npm publish --dry-run` shows correct files
- [ ] Tested locally with `npm link`
- [ ] Keywords are relevant for discoverability

---

## Troubleshooting

### "You must be logged in to publish packages"

```bash
npm login
```

### "Package name already exists"

Use a scoped name: `@peteywee/testintel`

### "You do not have permission to publish"

You don't own the package. Use a different name.

### "Cannot publish over existing version"

```bash
npm version patch
npm publish
```

---

## Quick Commands Reference

```bash
# Login
npm login

# Check login
npm whoami

# Check name availability
npm view testintel

# Dry run
npm publish --dry-run

# Publish (public)
npm publish --access public

# Version bump
npm version patch|minor|major

# Deprecate old version
npm deprecate testintel@1.0.0 "Use 2.0.0 instead"

# Unpublish (within 72 hours only!)
npm unpublish testintel@1.0.0
```

---

## Next Steps After Publishing

1. **Add badges to README:**

```markdown
[![npm version](https://badge.fury.io/js/testintel.svg)](https://www.npmjs.com/package/testintel)
[![npm downloads](https://img.shields.io/npm/dm/testintel.svg)](https://www.npmjs.com/package/testintel)
```

2. **Create GitHub Release:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

3. **Announce on social media / dev communities**

4. **Set up automated publishing on release**

---

## Contact

For help with publishing, contact:

- GitHub: @peteywee
- Email: dev@freshschedules.com
