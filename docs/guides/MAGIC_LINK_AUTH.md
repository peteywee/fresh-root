---
title: "Magic Link Authentication Guide"
description: "Implementation guide for magic link authentication patterns"
keywords:
  - authentication
  - magic-link
  - login
  - passwordless
category: "guide"
status: "active"
audience:
  - developers
related-docs:
  - AUTH_TESTING.md
  - ../standards/SECURITY.md
---

# Magic Link Authentication Implementation Guide

**Status**: ✅ Complete  
**Date**: January 14, 2026  
**Agent**: GitHub Copilot  
**Priority**: P0 (Authentication Core)

---

## Executive Summary

You now have a **professional, magic link-based authentication system** that replaces password-based
signin with email magic links. The system includes:

✅ **Separate Signin vs Signup Flows** - Clear UX distinction  
✅ **Email Verification During Signup** - One-step account creation + email verification  
✅ **Professional UI Component** - Reusable `EmailMagicLinkAuth` with state management  
✅ **Dedicated UI/UX Agent** - Ensures all future auth components look professional  
✅ **Enhanced Callback Page** - Shows verification success with animations  
✅ **Google OAuth Support** - Maintained for alternative authentication

---

## What Was Changed

### 1. **New UI/UX Agent** ⭐

**Location**: `.github/prompts/ui-ux-agent.md`

A dedicated prompt file for a specialized UI/UX design agent that ensures:

- Professional, modern design with accessible components
- WCAG 2.1 AA compliance (color contrast, keyboard navigation)
- Consistent design system (colors, typography, spacing)
- User experience best practices
- Smooth animations and delightful interactions

**How to Use**: Mention `@ui-ux-agent` in PR descriptions or GitHub issues for design reviews.

### 2. **New Email Magic Link Component** ✨

**Location**: `apps/web/app/components/auth/EmailMagicLinkAuth.tsx`

A self-contained, professional authentication component with:

#### Features

- **Three-step flow**:
  1. **Choose** - Select Sign In vs Create Account
  2. **Enter Email** - Form with validation & error handling
  3. **Check Email** - Verification screen with resend countdown

- **Separate Signin/Signup Paths**: Users see different copy and styling based on their intent
- **Email Validation**: Real-time feedback before sending link
- **Resend with Countdown**: 60-second throttle prevents abuse
- **Accessible**: ARIA labels, keyboard navigation, error association
- **Professional Styling**: Uses design system (primary, secondary, success, danger colors)

#### Component Props

```typescript
interface EmailMagicLinkAuthProps {
  onSuccess?: () => void; // Called after link is sent
  onError?: (error: string) => void; // Called on errors
}
```

#### Usage

```tsx
import EmailMagicLinkAuth from "@/app/components/auth/EmailMagicLinkAuth";

export default function LoginPage() {
  return (
    <div className="card w-full max-w-md">
      <EmailMagicLinkAuth
        onSuccess={() => console.log("Link sent!")}
        onError={(msg) => console.error(msg)}
      />
    </div>
  );
}
```

### 3. **Refactored Login Page**

**Location**: `apps/web/app/(auth)/login/page.tsx`

#### What Changed

- ❌ Removed: Email/Password signin method
- ✨ Added: `EmailMagicLinkAuth` component (primary auth)
- ✅ Kept: Google OAuth via separate FirebaseUI instance
- 🎨 Enhanced: Professional card-based layout with animations

#### New Structure

```
Login Page
├── Header ("Welcome Back")
├── EmailMagicLinkAuth
│   ├── Choose Mode (Sign In / Create Account)
│   ├── Enter Email Form
│   └── Check Email Screen
├── Divider ("or continue with")
└── Google OAuth Button
```

#### Key Improvements

- Magic link is primary authentication (not an afterthought)
- Google option is below as secondary (maintains choice)
- Clear visual distinction between signin and signup flows
- Professional animations and state feedback

### 4. **Enhanced Auth Callback Page**

**Location**: `apps/web/app/auth/callback/page.tsx`

#### What Changed

- **Email Verification Success State**: Shows checkmark animation when email is verified
- **User Email Display**: Shows the email that was just verified
- **Better Error UI**: Clear error state with action ("Return to Login")
- **Professional Styling**: Matches new design system
- **Smooth Animations**: Spin → success → redirect flow

#### State Flow

```
1. "working" → Loading spinner with verification message
2. "email-verified" → Success checkmark, email display, brief pause
3. "error" → Error state with recovery link
4. Auto-redirect to home (or onboarding)
```

### 5. **Auth Helpers Enhancement**

**Location**: `apps/web/src/lib/auth-helpers.ts`

Added documentation clarifying that **Firebase automatically sets `emailVerified=true`** when user
completes magic link signin. This means:

- No manual email verification step needed
- User accounts are instantly verified upon magic link completion
- Seamless experience for signup flow

---

## How Email Verification Works (Seamless)

### User Flow: Sign Up with Magic Link

```
1. User clicks "Create Account" on login page
2. Enters email and taps "Send Magic Link"
3. EmailMagicLinkAuth sends link via sendEmailLinkRobust()
4. User receives email and clicks the link
5. Redirected to /auth/callback
6. callback page calls completeEmailLinkIfPresent()
7. Firebase automatically signs in user and sets emailVerified=true ✨
8. Server session is established
9. Success animation shows → User redirected to dashboard
```

### Key Points

- **No separate email verification step** - it happens automatically when clicking the magic link
- **`emailVerified` flag is set by Firebase** - not by your code
- **User can immediately access all features** that require email verification
- **Seamless onboarding** - signup + email verification = one action

---

## Component Architecture

### Authentication Layer Hierarchy

```
Login Page
├── EmailMagicLinkAuth (NEW)
│   ├── State Management (React hooks)
│   ├── Email Validation (regex + error handling)
│   └── Firebase Integration (sendEmailLinkRobust)
│
├── Firebase Auth Callback
│   ├── Email Link Handler (completeEmailLinkIfPresent)
│   ├── Google OAuth Handler (completeGoogleRedirectOnce)
│   └── Session Establishment (establishServerSession)
│
└── Server Session
    ├── POST /api/session (create session cookie)
    └── User authentication context
```

### Type Safety

All components use TypeScript with:

- `AuthMode` type for signin/signup distinction
- Proper error handling with Error interface
- Optional callback functions with correct signatures

---

## Design System Integration

### Colors Used

- **`primary`** - Main CTA (Sign In, Send Magic Link)
- **`secondary`** - Secondary option (Google)
- **`success`** - Email verified confirmation
- **`danger`** - Error messages and failed auth
- **`text-primary`** / **`text-muted`** - Text hierarchy
- **`surface`** / **`surface-card`** - Background layers

### Typography

- **Heading**: 2xl, font-bold (h1 titles)
- **Body**: base, font-normal (descriptions)
- **Small**: sm, font-normal (helper text)

### Spacing

- **Gaps between sections**: 4-6 units
- **Padding in forms**: px-4 py-3 (standard)
- **Card padding**: p-6 (outer), p-4 (inner sections)

### Animations

- **Spin**: Loading states (infinite)
- **Scale-up**: Success checkmark (celebration)
- **Fade-in**: Error/status messages
- **Slide-up**: Page entrance

---

## Security Considerations

### Magic Link Security

1. **Links expire in 24 hours** - Firebase default
2. **One-time use** - Link is invalid after first click
3. **Email verification built-in** - Proves email ownership
4. **No passwords stored** - Eliminates password breach risk
5. **Rate limiting** - Implemented in `sendEmailLinkRobust()`

### Email Sending

```typescript
await sendSignInLinkToEmail(auth, email, actionCodeSettings);
```

**Action Code Settings**:

- `url`: Redirects to `/auth/callback` after clicking
- `handleCodeInApp`: true (handles link in-app, not via email client)
- Prevents CSRF by binding email in localStorage

### Session Security

- **HTTP-only cookies** - Set by `/api/session` endpoint
- **Secure flag** - Only sent over HTTPS in production
- **SameSite=Lax** - CSRF protection
- **Short TTL** - Session expires appropriately

---

## Testing Checklist

### Unit Tests Needed

- [ ] `EmailMagicLinkAuth` renders all three states
- [ ] Email validation works correctly
- [ ] Resend button disabled during countdown
- [ ] Callbacks are called at right times
- [ ] Error messages display properly

### Integration Tests Needed

- [ ] Magic link signup flow end-to-end
- [ ] Magic link signin flow end-to-end
- [ ] Email verification happens automatically
- [ ] Expired link shows error state
- [ ] Google OAuth still works as fallback
- [ ] Session is created after auth callback

### E2E Tests Needed (Playwright)

- [ ] Full signup flow with email verification
- [ ] Full signin flow with magic link
- [ ] Callback page shows success animation
- [ ] Auto-redirect after callback
- [ ] Error recovery (resend link)

---

## Future Enhancements

### Phase 1: Email Verification Features

- [ ] Email verification status in account menu
- [ ] Option to change email (re-verify)
- [ ] Verification reminder emails (if not verified after 7 days)
- [ ] Resend verification from account settings

### Phase 2: Security Features

- [ ] Rate limiting per email (10 links/hour)
- [ ] Suspicious activity detection
- [ ] Login notifications ("Someone signed in from new device")
- [ ] Passwordless 2FA option (SMS/TOTP)

### Phase 3: UX Improvements

- [ ] QR code option for mobile email-to-app flow
- [ ] Social proof ("2,500 people signed up this week")
- [ ] Progressive profiling (gather info during signup)
- [ ] Multi-language support for auth emails

### Phase 4: Advanced

- [ ] WebAuthn/Passkey support
- [ ] Biometric signin (Face ID / Touch ID on mobile)
- [ ] Account linking (multiple emails per account)
- [ ] Enterprise SSO (Okta, Azure AD)

---

## Architecture Decisions

### Why Magic Links

✅ **No password management** - Simplifies security  
✅ **Email ownership verified** - One step process  
✅ **Mobile-friendly** - Click link, auto-signin  
✅ **Low friction** - No password to remember  
✅ **Modern UX** - Expected by modern apps

### Why Separate Signin/Signup

✅ **Clearer intent** - User knows what they're doing  
✅ **Different messaging** - "Sign in" vs "Create account"  
✅ **Future flexibility** - Can add different fields later  
✅ **A/B testing** - Can track signup vs signin separately

### Why Keep Google OAuth

✅ **User choice** - Some prefer OAuth  
✅ **Faster for existing users** - One-click signin  
✅ **Fallback option** - If email provider down  
✅ **Social proof** - Shows app is secure/popular

---

## File Reference

| File                                                  | Purpose                 | Status                  |
| ----------------------------------------------------- | ----------------------- | ----------------------- |
| `.github/prompts/ui-ux-agent.md`                      | UI/UX specialist prompt | ✅ New                  |
| `apps/web/app/components/auth/EmailMagicLinkAuth.tsx` | Magic link component    | ✅ New                  |
| `apps/web/app/(auth)/login/page.tsx`                  | Login page              | ✅ Modified             |
| `apps/web/app/auth/callback/page.tsx`                 | Auth callback handler   | ✅ Enhanced             |
| `apps/web/src/lib/auth-helpers.ts`                    | Auth utilities          | ✅ Enhanced (docs only) |

---

## Next Steps

### For You (Developer)

1. **Test the flows**:
   - Go to `/login`
   - Click "Create Account" → Enter email → Check terminal/email for link
   - Click link → Should see success animation
   - Should redirect to `/` with session established

2. **Customize UI**:
   - Update colors in `EmailMagicLinkAuth.tsx` if needed
   - Adjust animations/transitions
   - Add your logo to callback page

3. **Add tests**:
   - Create `apps/web/app/components/auth/__tests__/EmailMagicLinkAuth.test.tsx`
   - Add E2E tests in `e2e/auth-flow.spec.ts`

### For UI/UX Agent

Call the agent for:

- Design refinements to auth pages
- Accessibility audits (WCAG compliance)
- Animation polish (micro-interactions)
- Error state UX improvements
- Mobile responsiveness testing

### For Security Team

Review:

- Rate limiting implementation
- Email link expiration (24h)
- Session cookie security
- OWASP compliance (A04:2021 - Insecure Design)

---

## Common Questions

**Q: Why not use a password?**  
A: Magic links eliminate password management, reducing security breaches while improving UX.

**Q: What if user doesn't receive the email?**  
A: Resend button with countdown timer appears after sending. Check spam folder is mentioned
implicitly.

**Q: Can user change email after signup?**  
A: Yes, future enhancement - add "change email" in account settings that re-verifies.

**Q: How long is the link valid?**  
A: 24 hours (Firebase default). After that, user gets an error and can resend.

**Q: Does Google OAuth also verify email?**  
A: Yes, Google guarantees email verification on their end. `emailVerified=true` set automatically.

**Q: Can I disable Google OAuth?**  
A: Yes, remove the Google section from login page. Magic link becomes only option.

**Q: How do I customize the email that's sent?**  
A: The email is sent by Firebase/Gmail. You configure the action code settings in
`actionCodeSettings.ts`. Customize sender, template in Firebase Console.

---

## Related Documentation

- [Firebase Email Link Authentication](https://firebase.google.com/docs/auth/web/email-link-auth)
- [OWASP Passwordless Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#passwordless)
- [UI/UX Best Practices](./.github/prompts/ui-ux-agent.md)
- [Production Development Directive](./.github/instructions/01_MASTER_AGENT_DIRECTIVE.instructions.md)

---

**Version**: 1.0  
**Last Updated**: January 14, 2026  
**Maintained By**: GitHub Copilot + UI/UX Agent
