---
title: "Magic Link Auth: Quick Start & Testing Guide"
description: "Quick start guide and testing strategies for magic link authentication"
keywords:
  - authentication
  - magic-link
  - testing
  - e2e
  - login
category: "guide"
status: "active"
audience:
  - developers
  - qa-engineers
related-docs:
  - MAGIC_LINK_AUTH.md
  - ../standards/TEST_PATTERNS.md
---

# Magic Link Auth: Quick Start & Testing Guide

## 🚀 Get Started in 5 Minutes

### 1. Navigate to Login

```bash
# App is already running at http://localhost:3000
# Go to: http://localhost:3000/login
```

### 2. Choose Your Flow

#### Option A: Sign Up (Create Account)

```
1. Click "Create Account" button
2. Enter your email (can be fake: test@example.com)
3. Click "Send Magic Link"
4. You'll see "Check Your Email" screen
5. For local testing:
   - Check browser console for errors
   - If Firebase Emulator running: check emulator UI
   - If Production: check your email inbox
6. Click the magic link
7. You'll see success animation ✓
8. Redirected to home page
```

#### Option B: Sign In (Existing User)

```
1. Click "Sign In" button
2. Same flow as signup (indistinguishable to user)
3. Different button copy communicates intent
```

#### Option C: Google OAuth (Fallback)

```
1. Scroll down
2. Click "Google" button
3. Authenticate with Google
4. Redirected to dashboard
```

---

## 🧪 Testing Scenarios

### Test Case 1: Happy Path (Complete Signup)

**Time**: ~2 min | **Outcome**: Account created, email verified

```
1. Click "Create Account"
2. Enter: user@test.com
3. Click "Send Magic Link"
4. ✓ See success screen with "user@test.com" displayed
5. ✓ See resend button with countdown timer (60s)
6. Click magic link in email/terminal
7. ✓ See "Email Verified!" with checkmark animation
8. ✓ Auto-redirected to / (home page)
9. ✓ User is logged in (check localStorage/cookies)
```

**Success Criteria**:

- ✅ Link sent without errors
- ✅ Email address echoed back
- ✅ Resend button shows countdown
- ✅ Verification success animation plays
- ✅ Auto-redirect happens
- ✅ User session exists

### Test Case 2: Email Validation

**Time**: ~1 min | **Outcome**: Form validates email properly

```
Test Invalid Emails:
1. "invalid" → Error: "not a valid email"
2. "user@" → Error: "not a valid email"
3. "@example.com" → Error: "not a valid email"
4. "user @example.com" → Error: "not a valid email"

Test Valid Emails:
1. "user@example.com" → ✓ Accepts
2. "test+tag@example.co.uk" → ✓ Accepts
3. "a@b.c" → ✓ Accepts (minimum valid)
```

**Success Criteria**:

- ✅ Invalid emails prevented before sending
- ✅ Error message is clear
- ✅ Valid emails all accepted
- ✅ Send button disabled until valid email entered

### Test Case 3: Resend Link (Rate Limiting)

**Time**: ~2 min | **Outcome**: Resend throttled appropriately

```
1. Click "Create Account"
2. Enter: user@test.com
3. Click "Send Magic Link"
4. See "Check Your Email" screen
5. Click "Resend link" button
   ✗ Button should be disabled
   ✓ Shows countdown: "Resend in 60s"
6. Wait for countdown (or open DevTools console and fast-forward time)
7. After 60s, button enables
8. Click "Resend link"
9. ✓ Link sent again, countdown resets
```

**Success Criteria**:

- ✅ Resend disabled immediately after sending
- ✅ Countdown shows (60s)
- ✅ Button enables after countdown
- ✅ Can send multiple times if needed
- ✅ Each resend starts new countdown

### Test Case 4: Error Recovery

**Time**: ~1 min | **Outcome**: User can change email

```
1. Click "Create Account"
2. Enter: user@test.com
3. Click "Send Magic Link"
4. See "Check Your Email" screen
5. Click "Use different email" button
   ✓ Back to email entry form
   ✓ Email field is cleared
6. Enter: newuser@test.com
7. Click "Send Magic Link"
8. ✓ New link sent to new email
```

**Success Criteria**:

- ✅ "Use different email" button visible
- ✅ Clicking it returns to step 2
- ✅ Previous email is forgotten
- ✅ New email can be entered and sent

### Test Case 5: Signin vs Signup Copy

**Time**: ~1 min | **Outcome**: Different messaging based on flow

```
Path A: Sign In Flow
- Button text: "Sign In"
- Description: "Use email magic link"
- Form text: "Enter your email to receive a sign-in link"

Path B: Create Account Flow
- Button text: "Create Account"
- Description: "Sign up with email"
- Form text: "Enter your email to get started"

Success Criteria:
- ✅ Copy changes based on user choice
- ✅ User understands their action
- ✅ Visual distinction maintained (colors, styling)
```

### Test Case 6: Expired Link (Manual Test)

**Time**: ~5 min | **Outcome**: User sees error, can recover

```
1. Complete happy path (Test Case 1)
2. Note the link from email
3. Wait 24+ hours OR
4. Manually manipulate the link (change a character)
5. Try to click the link
6. ✓ Redirected to /auth/callback
7. ✓ See "Authentication Failed" state
8. ✓ Shows error message: "link may have expired or is invalid"
9. Click "Return to Login"
10. ✓ Back at /login to try again
```

**Success Criteria**:

- ✅ Expired link recognized
- ✅ Clear error message displayed
- ✅ Error state shows action (return to login)
- ✅ User can retry with new email

### Test Case 7: Google OAuth (Fallback)

**Time**: ~2 min | **Outcome**: Google signin still works

```
1. Scroll to "or continue with" section
2. Click "Google" button
3. OAuth popup opens (if allowed by browser)
4. Authenticate with Google account
5. ✓ Popup closes
6. ✓ Session created
7. ✓ Redirected to / (home)
```

**Success Criteria**:

- ✅ Google popup works
- ✅ Authentication succeeds
- ✅ Session established
- ✅ Redirect happens

### Test Case 8: Mobile Responsiveness

**Time**: ~2 min | **Outcome**: Works on mobile screens

```
1. Open DevTools (F12)
2. Toggle mobile view (Ctrl+Shift+M)
3. Test with different devices:
   - iPhone 12 (390x844)
   - iPhone 14 Pro (430x932)
   - Pixel 6 (412x915)
   - iPad (768x1024)
4. For each device:
   ✓ Layout responsive (no horizontal scroll)
   ✓ Buttons easily tappable (44px+ height)
   ✓ Text readable (no shrinking)
   ✓ Forms fill full width
   ✓ Animations work smoothly
```

**Success Criteria**:

- ✅ No horizontal overflow on narrow screens
- ✅ Touch targets at least 44x44 pixels
- ✅ Text readable at 16px minimum
- ✅ Proper padding/spacing maintained
- ✅ Animations don't lag

### Test Case 9: Accessibility (Keyboard Navigation)

**Time**: ~2 min | **Outcome**: Fully keyboard accessible

```
1. On login page
2. Press Tab to focus first element
   ✓ Focus indicator visible
3. Keep pressing Tab:
   ✓ Focus moves through all interactive elements
   ✓ Order makes sense (sign in → create account → google)
4. Press Enter when button focused
   ✓ Button activates (same as click)
5. On email entry form:
   ✓ Email field focused
   ✓ Tab to error text (if invalid)
   ✓ Tab to Submit button
   ✓ Enter submits form
6. Press Escape (if applicable)
   ✓ Modal/overlay closes (if any)
```

**Success Criteria**:

- ✅ All elements reachable via Tab key
- ✅ Focus order is logical
- ✅ Focus indicator is clearly visible
- ✅ Enter key activates buttons
- ✅ Form submission works with keyboard

### Test Case 10: Error States & Messages

**Time**: ~2 min | **Outcome**: Clear error messaging

```
Test Network Error:
1. Open DevTools
2. Go to Network tab
3. Check "Offline" to simulate offline
4. Try to send magic link
5. ✓ Error message appears: "Failed to send..."
6. ✓ User can try again
7. Uncheck "Offline"

Test Invalid Firebase Config:
(Only if you have a broken Firebase config)
1. ✓ Error message on load
2. ✓ Suggests checking env vars

Test Rate Limiting (if enabled):
1. Send multiple emails in short time
2. ✓ After limit: "Too many requests, try again later"
3. ✓ User can still retry later
```

**Success Criteria**:

- ✅ Errors are user-friendly (not technical)
- ✅ Errors suggest action
- ✅ Users aren't blocked permanently
- ✅ Recovery path is clear

---

## 📊 Testing Checklist

### Before Merging to Main

- [ ] Test Case 1: Happy path (signup → verify → redirect)
- [ ] Test Case 2: Email validation (invalid & valid emails)
- [ ] Test Case 3: Resend link (countdown, throttling)
- [ ] Test Case 4: Error recovery (change email)
- [ ] Test Case 5: Copy differences (signin vs signup)
- [ ] Test Case 7: Google OAuth works
- [ ] Test Case 8: Mobile responsive (iPhone + Android)
- [ ] Test Case 9: Keyboard accessible (Tab, Enter, Escape)

### Nice to Have

- [ ] Test Case 6: Expired link handling
- [ ] Test Case 10: Error messages
- [ ] E2E tests with Playwright
- [ ] Performance testing (lighthouse)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## 🔍 Debugging Tips

### I don't see the magic link email

**Check**:

1. Firebase Emulator running? Check UI at http://localhost:4000
2. Check terminal output (email logged there)
3. Check browser console for errors
4. Check Firebase project settings (email sending enabled?)
5. Check spam folder (if using real email)

### Resend button won't enable

**Check**:

1. Open DevTools console
2. Check for JavaScript errors
3. Look for network errors in Network tab
4. Verify email is valid format

### Link works but no redirect

**Check**:

1. Check /auth/callback page loads
2. Open console for errors
3. Verify `establishServerSession` succeeds
4. Check `/api/session` endpoint responds

### Mobile layout looks broken

**Check**:

1. DevTools mobile mode enabled?
2. Try different device sizes
3. Check for CSS overflow (DevTools Elements tab)
4. Verify Tailwind classes are correct

### Google OAuth doesn't work

**Check**:

1. Firebase Console: Google provider enabled?
2. Authorized domains includes localhost?
3. Browser allows popups from localhost?
4. Try disabling ad blocker (might block OAuth)

---

## 📱 Testing on Real Device

### Test on iPhone

```bash
# Get local IP
ifconfig | grep inet

# Serve on all interfaces
# (already running at http://100.115.92.204:3000)

# On iPhone, visit: http://100.115.92.204:3000/login

# Send yourself magic link to test email
```

### Test on Android

```bash
# Same as iPhone
# Visit: http://100.115.92.204:3000/login from Android device
```

### Test on Tablet

```bash
# Same approach
# Test both portrait and landscape orientations
```

---

## 🎥 Demo Script (for showing others)

### 30-Second Demo

```
1. "Let me show you how signup works now"
2. Click "Create Account"
3. "Type your email"
4. Type: demo@example.com
5. "Hit Send Magic Link"
6. Click button
7. "Check your email - we sent a link"
8. Refresh to get link (or click in terminal)
9. "Click the link"
10. Click link
11. *Animation plays* "Email Verified!"
12. Auto-redirects
13. "You're signed up and email verified - done!"
```

### Full Demo (2 minutes)

```
Same as above, plus:
- Show "Sign In" flow is identical
- Show Google option
- Explain you can change email before sending
- Show resend countdown
- Mention 24-hour link expiration
```

---

## 📝 Test Results Template

```markdown
# Auth Testing Results

**Date**: [Date] **Tester**: [Name] **App Version**: [commit hash]

## Test Cases

- [ ] Test Case 1: Happy Path ✓/✗/⚠️
- [ ] Test Case 2: Email Validation ✓/✗/⚠️
- [ ] Test Case 3: Resend Link ✓/✗/⚠️
- [ ] Test Case 4: Error Recovery ✓/✗/⚠️
- [ ] Test Case 5: Copy Differences ✓/✗/⚠️
- [ ] Test Case 7: Google OAuth ✓/✗/⚠️
- [ ] Test Case 8: Mobile ✓/✗/⚠️
- [ ] Test Case 9: Accessibility ✓/✗/⚠️

## Issues Found

1. [Issue description]
2. [Issue description]

## Notes

[Any observations or feedback]
```

---

## Need Help

### Common Issues

1. **Email not arriving**: Check Firebase Emulator or email logs
2. **Link not working**: Verify `handleCodeInApp: true` in settings
3. **Session not created**: Check `/api/session` endpoint
4. **Auth failing**: Check Firebase Auth Emulator is running

### Questions

- Review [MAGIC_LINK_AUTH_GUIDE.md](./MAGIC_LINK_AUTH_GUIDE.md) for architecture
- Check [EmailMagicLinkAuth component](../apps/web/app/components/auth/EmailMagicLinkAuth.tsx) for
  code
- Review auth helpers in `apps/web/src/lib/auth-helpers.ts`

---

**Last Updated**: January 14, 2026  
**Version**: 1.0  
**Maintained By**: Development Team
