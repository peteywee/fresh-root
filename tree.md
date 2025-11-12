.
├── apps
│   └── web
│   ├── app
│   │   ├── actions
│   │   │   ├── createSchedule.ts
│   │   │   └── scheduleActions.ts
│   │   ├── api
│   │   │   ├── attendance
│   │   │   │   └── route.ts
│   │   │   ├── auth
│   │   │   │   └── mfa
│   │   │   │   ├── setup
│   │   │   │   │   └── route.ts
│   │   │   │   └── verify
│   │   │   │   └── route.ts
│   │   │   ├── health
│   │   │   │   └── route.ts
│   │   │   ├── healthz
│   │   │   │   └── route.ts
│   │   │   ├── internal
│   │   │   │   └── backup
│   │   │   │   └── route.ts
│   │   │   ├── items
│   │   │   │   └── route.ts
│   │   │   ├── join-tokens
│   │   │   │   └── route.ts
│   │   │   ├── metrics
│   │   │   │   └── route.ts
│   │   │   ├── onboarding
│   │   │   │   ├── activate-network
│   │   │   │   │   └── route.ts
│   │   │   │   ├── admin-form
│   │   │   │   │   └── route.ts
│   │   │   │   ├── create-network-corporate
│   │   │   │   │   └── route.ts
│   │   │   │   ├── create-network-org
│   │   │   │   │   ├── route-new.ts
│   │   │   │   │   └── route.ts
│   │   │   │   ├── join-with-token
│   │   │   │   │   └── route.ts
│   │   │   │   ├── profile
│   │   │   │   │   └── route.ts
│   │   │   │   ├── _shared
│   │   │   │   │   ├── rateLimit.ts
│   │   │   │   │   └── schemas.ts
│   │   │   │   ├── **tests**
│   │   │   │   │   ├── activate-network.test.ts
│   │   │   │   │   ├── admin-form.test.ts
│   │   │   │   │   ├── create-network-corporate.test.ts
│   │   │   │   │   ├── create-network-org.test.ts
│   │   │   │   │   ├── endpoints.test.ts
│   │   │   │   │   ├── join-with-token.test.ts
│   │   │   │   │   └── verify-eligibility.test.ts
│   │   │   │   └── verify-eligibility
│   │   │   │   └── route.ts
│   │   │   ├── organizations
│   │   │   │   ├── [id]
│   │   │   │   │   ├── members
│   │   │   │   │   │   ├── [memberId]
│   │   │   │   │   │   │   └── route.ts
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── positions
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── publish
│   │   │   │   └── route.ts
│   │   │   ├── schedules
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── session
│   │   │   │   ├── bootstrap
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── \_shared
│   │   │   │   ├── logging.ts
│   │   │   │   ├── middleware.ts
│   │   │   │   ├── security.ts
│   │   │   │   ├── **tests**
│   │   │   │   │   └── validation.test.ts
│   │   │   │   └── validation.ts
│   │   │   ├── shifts
│   │   │   │   ├── [id]
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── \_template
│   │   │   │   └── route.ts
│   │   │   ├── users
│   │   │   │   └── profile
│   │   │   │   └── route.ts
│   │   │   ├── venues
│   │   │   │   └── route.ts
│   │   │   └── zones
│   │   │   └── route.ts
│   │   ├── (app)
│   │   │   ├── demo
│   │   │   │   └── page.tsx
│   │   │   └── protected
│   │   │   ├── dashboard
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── page.tsx
│   │   │   └── schedules
│   │   │   ├── loading.tsx
│   │   │   ├── page.server.ts
│   │   │   └── page.tsx
│   │   ├── (auth)
│   │   │   └── login
│   │   │   └── page.tsx
│   │   ├── auth
│   │   │   └── callback
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FirebaseSignIn.tsx
│   │   │   ├── Inbox.tsx
│   │   │   ├── MonthView.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── ui
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── **tests**
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Card.test.tsx
│   │   │   │   └── Input.test.tsx
│   │   │   └── UploadStub.tsx
│   │   ├── fonts.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── lib
│   │   │   ├── auth-context.tsx
│   │   │   ├── cache.ts
│   │   │   ├── db.ts
│   │   │   ├── env.ts
│   │   │   ├── firebaseClient.ts
│   │   │   ├── http.ts
│   │   │   ├── registerServiceWorker.ts
│   │   │   ├── **tests**
│   │   │   │   └── http.test.ts
│   │   │   └── useCreateItem.ts
│   │   ├── middleware.ts
│   │   ├── onboarding
│   │   │   ├── admin-form
│   │   │   │   └── page.tsx
│   │   │   ├── admin-responsibility
│   │   │   │   └── page.tsx
│   │   │   ├── block-4
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── blocked
│   │   │   │   ├── email-not-verified
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── network-pending
│   │   │   │   │   └── page.tsx
│   │   │   │   └── staff-invite
│   │   │   │   └── page.tsx
│   │   │   ├── create-network-corporate
│   │   │   │   └── page.tsx
│   │   │   ├── create-network-org
│   │   │   │   └── page.tsx
│   │   │   ├── intent
│   │   │   │   └── page.tsx
│   │   │   ├── join
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile
│   │   │   │   └── page.tsx
│   │   │   └── \_wizard
│   │   │   └── OnboardingWizardContext.tsx
│   │   ├── page.tsx
│   │   ├── planning
│   │   │   └── page.tsx
│   │   ├── providers
│   │   │   ├── index.tsx
│   │   │   └── queryClient.ts
│   │   ├── RegisterServiceWorker.tsx
│   │   └── schedules
│   │   └── builder
│   │   └── page.tsx
│   ├── components
│   │   ├── Logo.tsx
│   │   └── ui
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Table.tsx
│   ├── docs
│   │   ├── API.md
│   │   ├── COMPONENTS.md
│   │   └── SERVICE_WORKER.md
│   ├── eslint.config.mjs
│   ├── instrumentation.ts
│   ├── lib
│   │   ├── animations.ts
│   │   ├── firebase-admin.ts
│   │   ├── onboarding
│   │   │   ├── adminFormDrafts.mts
│   │   │   ├── adminFormDrafts.ts
│   │   │   ├── corporates.code-search
│   │   │   └── createNetworkOrg.ts
│   │   └── urlState.ts
│   ├── next.config.mjs
│   ├── next-env.d.ts
│   ├── node_modules
│   │   ├── autoprefixer -> ../../../node_modules/.pnpm/autoprefixer@10.4.21_postcss@8.5.6/node_modules/autoprefixer
│   │   ├── clsx -> ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx
│   │   ├── @eslint
│   │   │   ├── eslintrc -> ../../../../node_modules/.pnpm/@eslint+eslintrc@3.3.1/node_modules/@eslint/eslintrc
│   │   │   └── js -> ../../../../node_modules/.pnpm/@eslint+js@9.38.0/node_modules/@eslint/js
│   │   ├── eslint -> ../../../node_modules/.pnpm/eslint@9.38.0_jiti@1.21.7/node_modules/eslint
│   │   ├── eslint-config-next -> ../../../node_modules/.pnpm/eslint-config-next@16.0.1_@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@1.21.7__typescr_z5tksnepgo4rpdanxqkmwjrugu/node*modules/eslint-config-next
│   │   ├── eslint-plugin-react -> ../../../node_modules/.pnpm/eslint-plugin-react@7.37.5_eslint@9.38.0_jiti@1.21.7*/node*modules/eslint-plugin-react
│   │   ├── eslint-plugin-react-hooks -> ../../../node_modules/.pnpm/eslint-plugin-react-hooks@7.0.1_eslint@9.38.0_jiti@1.21.7*/node*modules/eslint-plugin-react-hooks
│   │   ├── fake-indexeddb -> ../../../node_modules/.pnpm/fake-indexeddb@6.2.4/node_modules/fake-indexeddb
│   │   ├── firebase -> ../../../node_modules/.pnpm/firebase@12.4.0/node_modules/firebase
│   │   ├── firebase-admin -> ../../../node_modules/.pnpm/firebase-admin@13.6.0_encoding@0.1.13/node_modules/firebase-admin
│   │   ├── firebaseui -> ../../../node_modules/.pnpm/firebaseui@6.1.0_firebase@12.4.0/node_modules/firebaseui
│   │   ├── framer-motion -> ../../../node_modules/.pnpm/framer-motion@12.23.24_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/framer-motion
│   │   ├── @fresh-schedules
│   │   │   └── types -> ../../../../packages/types
│   │   ├── google-auth-library -> ../../../node_modules/.pnpm/google-auth-library@10.5.0/node_modules/google-auth-library
│   │   ├── happy-dom -> ../../../node_modules/.pnpm/happy-dom@20.0.10/node_modules/happy-dom
│   │   ├── idb -> ../../../node_modules/.pnpm/idb@7.1.1/node_modules/idb
│   │   ├── jsdom -> ../../../node_modules/.pnpm/jsdom@27.0.1_postcss@8.5.6/node_modules/jsdom
│   │   ├── next -> ../../../node_modules/.pnpm/next@16.0.0*@babel+core@7.28.5_@opentelemetry+api@1.9.0_@playwright+test@1.56.1_react-dom@18._erinpenpmt4kmv3uwitaoiw3di/node_modules/next
│   │   ├── nuqs -> ../../../node_modules/.pnpm/nuqs@2.7.2_next@16.0.0_@babel+core@7.28.5_@opentelemetry+api@1.9.0_@playwright+test@1.56.1_re_kln4gdtn57caduo25sxtp3gclm/node*modules/nuqs
│   │   ├── @opentelemetry
│   │   │   ├── api -> ../../../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api
│   │   │   ├── auto-instrumentations-node -> ../../../../node_modules/.pnpm/@opentelemetry+auto-instrumentations-node@0.66.0*@opentelemetry+api@1.9.0_@opentelemetry+core*tmrxr3y5enujasixrgvyywzlsq/node_modules/@opentelemetry/auto-instrumentations-node
│   │   │   ├── exporter-trace-otlp-http -> ../../../../node_modules/.pnpm/@opentelemetry+exporter-trace-otlp-http@0.207.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/exporter-trace-otlp-http
│   │   │   ├── resources -> ../../../../node_modules/.pnpm/@opentelemetry+resources@2.2.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/resources
│   │   │   ├── sdk-node -> ../../../../node_modules/.pnpm/@opentelemetry+sdk-node@0.207.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/sdk-node
│   │   │   ├── sdk-trace-base -> ../../../../node_modules/.pnpm/@opentelemetry+sdk-trace-base@2.2.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/sdk-trace-base
│   │   │   └── semantic-conventions -> ../../../../node_modules/.pnpm/@opentelemetry+semantic-conventions@1.37.0/node_modules/@opentelemetry/semantic-conventions
│   │   ├── papaparse -> ../../../node_modules/.pnpm/papaparse@5.5.3/node_modules/papaparse
│   │   ├── postcss -> ../../../node_modules/.pnpm/postcss@8.5.6/node_modules/postcss
│   │   ├── process -> ../../../node_modules/.pnpm/process@0.11.10/node_modules/process
│   │   ├── qrcode -> ../../../node_modules/.pnpm/qrcode@1.5.4/node_modules/qrcode
│   │   ├── react -> ../../../node_modules/.pnpm/react@18.3.1/node_modules/react
│   │   ├── react-dom -> ../../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom
│   │   ├── @sentry
│   │   │   └── nextjs -> ../../../../node_modules/.pnpm/@sentry+nextjs@10.25.0*@opentelemetry+context-async-hooks@2.2.0_@opentelemetry+api@1.9.0__@op*523cin73mz74se3nahuamov4ry/node_modules/@sentry/nextjs
│   │   ├── speakeasy -> ../../../node_modules/.pnpm/speakeasy@2.0.0/node_modules/speakeasy
│   │   ├── tailwindcss -> ../../../node_modules/.pnpm/tailwindcss@3.4.18_tsx@4.20.6_yaml@2.8.1/node_modules/tailwindcss
│   │   ├── tailwindcss-animate -> ../../../node_modules/.pnpm/tailwindcss-animate@1.0.7_tailwindcss@3.4.18_tsx@4.20.6_yaml@2.8.1*/node*modules/tailwindcss-animate
│   │   ├── @tanstack
│   │   │   ├── react-query -> ../../../../node_modules/.pnpm/@tanstack+react-query@5.59.0_react@18.3.1/node_modules/@tanstack/react-query
│   │   │   └── react-query-devtools -> ../../../../node_modules/.pnpm/@tanstack+react-query-devtools@5.59.0*@tanstack+react-query@5.59.0_react@18.3.1__react@18.3.1/node*modules/@tanstack/react-query-devtools
│   │   ├── @testing-library
│   │   │   ├── jest-dom -> ../../../../node_modules/.pnpm/@testing-library+jest-dom@6.9.1/node_modules/@testing-library/jest-dom
│   │   │   ├── react -> ../../../../node_modules/.pnpm/@testing-library+react@16.3.0*@testing-library+dom@10.4.1_@types+react-dom@18.3.7_@types+reac*lhv3dqhyypy7i6yrxas7zeka7q/node_modules/@testing-library/react
│   │   │   └── user-event -> ../../../../node_modules/.pnpm/@testing-library+user-event@14.6.1*@testing-library+dom@10.4.1/node*modules/@testing-library/user-event
│   │   ├── @types
│   │   │   ├── node -> ../../../../node_modules/.pnpm/@types+node@20.19.24/node_modules/@types/node
│   │   │   ├── papaparse -> ../../../../node_modules/.pnpm/@types+papaparse@5.5.0/node_modules/@types/papaparse
│   │   │   ├── qrcode -> ../../../../node_modules/.pnpm/@types+qrcode@1.5.6/node_modules/@types/qrcode
│   │   │   ├── react -> ../../../../node_modules/.pnpm/@types+react@18.3.26/node_modules/@types/react
│   │   │   ├── react-dom -> ../../../../node_modules/.pnpm/@types+react-dom@18.3.7*@types+react@18.3.26/node*modules/@types/react-dom
│   │   │   └── speakeasy -> ../../../../node_modules/.pnpm/@types+speakeasy@2.0.10/node_modules/@types/speakeasy
│   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   ├── @typescript-eslint
│   │   │   ├── eslint-plugin -> ../../../../node_modules/.pnpm/@typescript-eslint+eslint-plugin@8.46.2*@typescript-eslint+parser@8.46.2_eslint@9.38.0*jiti@1_mpj2sayn63s4v3a7yvxwqlglz4/node_modules/@typescript-eslint/eslint-plugin
│   │   │   └── parser -> ../../../../node_modules/.pnpm/@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@1.21.7__typescript@5.9.3/node_modules/@typescript-eslint/parser
│   │   ├── @vitejs
│   │   │   └── plugin-react -> ../../../../node_modules/.pnpm/@vitejs+plugin-react@5.1.0_vite@7.1.12*@types+node@20.19.24_jiti@1.21.7_terser@5.44.1_tsx@4.20.6_yaml@2.8.1_/node*modules/@vitejs/plugin-react
│   │   ├── @vitest
│   │   │   ├── coverage-v8 -> ../../../../node_modules/.pnpm/@vitest+coverage-v8@4.0.5_vitest@4.0.6*@types+debug@4.1.12_@types+node@20.19.24_@vitest+ui@4._zjd5pw37b5grqa2ao47xl6cuqq/node*modules/@vitest/coverage-v8
│   │   │   └── ui -> ../../../../node_modules/.pnpm/@vitest+ui@4.0.6_vitest@4.0.6/node_modules/@vitest/ui
│   │   ├── vitest -> ../../../node_modules/.pnpm/vitest@4.0.6*@types+debug@4.1.12_@types+node@20.19.24_@vitest+ui@4.0.6_happy-dom@20.0.10*jiti_v47pcypobrzlmragf7dayf63i4/node_modules/vitest
│   │   ├── xlsx -> ../../../node_modules/.pnpm/xlsx@0.18.5/node_modules/xlsx
│   │   ├── zod -> ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod
│   │   └── zustand -> ../../../node_modules/.pnpm/zustand@4.5.2*@types+react@18.3.26_react@18.3.1/node*modules/zustand
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── proxy.ts
│   ├── public
│   │   └── manifest.json
│   ├── README.md
│   ├── sentry.client.config.ts
│   ├── sentry.edge.config.ts
│   ├── sentry.server.config.ts
│   ├── src
│   │   ├── components
│   │   │   └── auth
│   │   │   └── ProtectedRoute.tsx
│   │   ├── lib
│   │   │   ├── actionCodeSettings.ts
│   │   │   ├── api
│   │   │   │   ├── authorization.test.ts
│   │   │   │   ├── authorization.ts
│   │   │   │   ├── csrf.test.ts
│   │   │   │   ├── csrf.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── rate-limit.test.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── redis-rate-limit.ts
│   │   │   │   ├── redis.ts
│   │   │   │   ├── sanitize.ts
│   │   │   │   ├── schedules.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── **tests**
│   │   │   │   │   ├── security.bench.ts
│   │   │   │   │   └── security-integration.test.ts
│   │   │   │   ├── validation.test.ts
│   │   │   │   └── validation.ts
│   │   │   ├── auth
│   │   │   │   └── pendingEmail.store.ts
│   │   │   ├── auth-context.tsx
│   │   │   ├── auth-helpers.ts
│   │   │   ├── env.server.ts
│   │   │   ├── env.ts
│   │   │   ├── error
│   │   │   │   ├── ErrorContext.tsx
│   │   │   │   └── reporting.ts
│   │   │   ├── eventLog.ts
│   │   │   ├── exports
│   │   │   ├── firebase.server.ts
│   │   │   ├── imports
│   │   │   │   └── \_template.import.ts
│   │   │   ├── labor
│   │   │   │   ├── computeLaborBudget.test.ts
│   │   │   │   └── computeLaborBudget.ts
│   │   │   ├── logger.ts
│   │   │   ├── onboarding
│   │   │   │   ├── adminFormDrafts.ts
│   │   │   │   ├── createNetworkOrg.test.ts
│   │   │   │   └── createNetworkOrg.ts
│   │   │   ├── otel.ts
│   │   │   ├── storage
│   │   │   │   └── kv.ts
│   │   │   ├── store.ts
│   │   │   ├── userOnboarding.ts
│   │   │   └── userProfile.ts
│   │   ├── middleware.ts
│   │   ├── **tests**
│   │   │   ├── api-security.spec.ts
│   │   │   ├── auth-helpers.spec.ts
│   │   │   ├── login-page.spec.tsx
│   │   │   ├── mfa.test.ts
│   │   │   ├── middleware.spec.ts
│   │   │   ├── security.test.ts
│   │   │   ├── session-api.spec.ts
│   │   │   └── session.test.ts
│   │   └── types
│   │   ├── fresh-schedules-types.d.ts
│   │   └── idb.d.ts
│   ├── tailwind.config.ts
│   ├── tests
│   │   └── e2e
│   │   └── onboarding-full-flow.spec.ts
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── vitest.bench.config.ts
│   ├── vitest.config.ts
│   ├── vitest.d.ts
│   └── vitest.setup.ts
├── BLOCK3_COMPLETION_REPORT.sh
├── CODEOWNERS
├── cspell.json
├── dist
│   └── agent
│   ├── agent.mjs
│   ├── agent.mjs.map
│   ├── lib
│   │   ├── logger.js
│   │   └── logger.js.map
│   └── tasks
│   ├── rbac.js
│   ├── rbac.js.map
│   ├── restructure.js
│   ├── restructure.js.map
│   ├── rules.js
│   └── rules.js.map
├── docs
│   ├── ai
│   │   ├── AGENTS
│   │   │   ├── Builder.md
│   │   │   ├── QA.md
│   │   │   └── ReleaseManager.md
│   │   ├── CHAT_CONTEXT.md
│   │   ├── CHATMODE.md
│   │   ├── README.md
│   │   ├── SYSTEM_PROMPT.md
│   │   └── TOOLS.md
│   ├── ARCHITECTURE_DIAGRAMS.md
│   ├── archive
│   │   ├── Biblev14_legacy.md
│   │   ├── BRANCH_CONSOLIDATION.md
│   │   ├── CI_EMULATOR_FIX.md
│   │   ├── CI_FIX_PNPM_VERSION.md
│   │   ├── ERROR_FIXES_SUMMARY.md
│   │   ├── fresh-root-legacy
│   │   │   ├── apps
│   │   │   │   └── web
│   │   │   │   ├── app
│   │   │   │   │   ├── (app)
│   │   │   │   │   │   ├── dashboard
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── schedule
│   │   │   │   │   │   ├── month
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── week
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── wizard
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── (auth)
│   │   │   │   │   │   └── onboarding
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── env.d.ts
│   │   │   │   │   ├── globals.css
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── providers
│   │   │   │   │   │   ├── AuthProvider.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   └── ThemeProvider.tsx
│   │   │   │   │   └── (public)
│   │   │   │   │   └── signin
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── components
│   │   │   │   │   ├── schedule
│   │   │   │   │   │   ├── DayCell.tsx
│   │   │   │   │   │   ├── MonthGrid.tsx
│   │   │   │   │   │   └── NewShiftDialog.tsx
│   │   │   │   │   └── ThemeToggle.tsx
│   │   │   │   ├── lib
│   │   │   │   │   ├── firebaseClient.ts
│   │   │   │   │   ├── firestore.ts
│   │   │   │   │   └── planning.ts
│   │   │   │   ├── next.config.ts
│   │   │   │   ├── node_modules
│   │   │   │   │   ├── autoprefixer -> ../../../node_modules/.pnpm/autoprefixer@10.4.21_postcss@8.5.6/node_modules/autoprefixer
│   │   │   │   │   ├── clsx -> ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx
│   │   │   │   │   ├── firebase -> ../../../node_modules/.pnpm/firebase@12.5.0/node_modules/firebase
│   │   │   │   │   ├── @hookform
│   │   │   │   │   │   └── resolvers -> ../../../../node_modules/.pnpm/@hookform+resolvers@3.10.0_react-hook-form@7.66.0_react@18.3.1*/node*modules/@hookform/resolvers
│   │   │   │   │   ├── lucide-react -> ../../../node_modules/.pnpm/lucide-react@0.452.0_react@18.3.1/node_modules/lucide-react
│   │   │   │   │   ├── next -> ../../../node_modules/.pnpm/next@15.0.0*@opentelemetry+api@1.9.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node*modules/next
│   │   │   │   │   ├── postcss -> ../../../node_modules/.pnpm/postcss@8.5.6/node_modules/postcss
│   │   │   │   │   ├── react -> ../../../node_modules/.pnpm/react@18.3.1/node_modules/react
│   │   │   │   │   ├── react-dom -> ../../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom
│   │   │   │   │   ├── react-hook-form -> ../../../node_modules/.pnpm/react-hook-form@7.66.0_react@18.3.1/node_modules/react-hook-form
│   │   │   │   │   ├── tailwindcss -> ../../../node_modules/.pnpm/tailwindcss@3.4.18/node_modules/tailwindcss
│   │   │   │   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   │   │   │   └── zod -> ../../../node_modules/.pnpm/zod@4.1.12/node_modules/zod
│   │   │   │   ├── package.json
│   │   │   │   ├── postcss.config.js
│   │   │   │   ├── tailwind.config.ts
│   │   │   │   └── tsconfig.json
│   │   │   ├── firebase.json
│   │   │   ├── firestore.rules
│   │   │   ├── functions
│   │   │   │   ├── node_modules
│   │   │   │   │   ├── firebase-admin -> ../../node_modules/.pnpm/firebase-admin@12.7.0/node_modules/firebase-admin
│   │   │   │   │   ├── firebase-functions -> ../../node_modules/.pnpm/firebase-functions@5.1.1_firebase-admin@12.7.0/node_modules/firebase-functions
│   │   │   │   │   └── typescript -> ../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   │   │   ├── package.json
│   │   │   │   └── tsconfig.json
│   │   │   ├── node_modules
│   │   │   ├── package.json
│   │   │   ├── packages
│   │   │   │   └── types
│   │   │   │   ├── node_modules
│   │   │   │   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   │   │   │   └── zod -> ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod
│   │   │   │   ├── package.json
│   │   │   │   ├── src
│   │   │   │   │   └── index.ts
│   │   │   │   └── tsconfig.json
│   │   │   ├── pnpm-lock.yaml
│   │   │   ├── pnpm-workspace.yaml
│   │   │   ├── storage.rules
│   │   │   └── tsconfig.json
│   │   ├── LEGACY_TREE.md
│   │   ├── SECURITY_FIXES.md
│   │   ├── SECURITY_FIXES_SUMMARY.md
│   │   ├── SYNC_AND_HEALING_SUMMARY.md
│   │   └── TEST_FIXES_ROUND2.md
│   ├── bible
│   │   ├── GAPS_v14.0.0.md
│   │   ├── index.md
│   │   ├── Project_Bible_v13.5.md
│   │   ├── Project_Bible_v14.0.0.md
│   │   ├── Project_Bible_v14.5.md
│   │   ├── Project_Bible_v15.0.0.md
│   │   ├── Project_Bible_v15_MIGRATION_PLAN.md
│   │   └── Project_Bible_v15_SCOPE_AND_AUTHORITY.md
│   ├── BLOCK3_CHECKLIST.md
│   ├── BLOCK3_COMPLETION_MANIFEST.md
│   ├── BLOCK3_DOCUMENTATION_INDEX.md
│   ├── BLOCK3_FINAL_SUMMARY.md
│   ├── BLOCK3_SIGN_OFF.md
│   ├── blocks
│   │   ├── BLOCK1_BLOCK2_PROGRESS.md
│   │   ├── BLOCK1_SLO_SUMMARY.md
│   │   ├── BLOCK3_API_REFERENCE.md
│   │   ├── BLOCK3_COMPLETION.md
│   │   ├── BLOCK3_IMPLEMENTATION.md
│   │   ├── BLOCK3_QUICK_START.md
│   │   ├── BLOCK3_SUMMARY.md
│   │   ├── BLOCK4_PLANNING.md
│   │   ├── PHASE2_IMPLEMENTATION.md
│   │   ├── PHASE2_OPTIONS.md
│   │   └── SCHEMA_CATALOG.md
│   ├── CACHE_MEMORY_MANAGEMENT.md
│   ├── CHANGELOG.md
│   ├── COMPLETE_TECHNICAL_DOCUMENTATION.md
│   ├── CONSOLIDATION_OPPORTUNITIES.md
│   ├── DOCS_INDEX.md
│   ├── FINAL_SUMMARY.md
│   ├── GOALS.md
│   ├── INDEX.md
│   ├── layers
│   │   ├── LAYER_00_DOMAIN_KERNEL.md
│   │   ├── LAYER_01_INFRASTRUCTURE.md
│   │   ├── LAYER_02_APP_LIBS.md
│   │   ├── LAYER_02_APPLICATION_LIBS.md
│   │   ├── LAYER_03_API_EDGE.md
│   │   └── LAYER_04_UI_UX.md
│   ├── mcp
│   │   ├── FIRECRAWL_MCP_SETUP.md
│   │   └── mcp.json
│   ├── migration
│   │   └── v15
│   │   ├── PHASE2_SCHEMA_CROSSWALK.md
│   │   ├── PHASE2_SPEC_CROSSWALK.md
│   │   ├── PHASE3_CODE_MIGRATION_CHECKLIST.md
│   │   ├── PHASE3_DATA_MIGRATION_CHECKLIST.md
│   │   └── PHASE4_HARDENING_AND_FREEZE.md
│   ├── migrations
│   │   ├── MIGRATION_NETWORK_TENANCY.md
│   │   └── PHASE1_IMPLEMENTATION_SUMMARY.md
│   ├── NPM_CONSOLIDATION_DECISIONS.md
│   ├── onboarding
│   │   ├── ONBOARDING_API.md
│   │   ├── ONBOARDING_BACKEND_COMPLETION.md
│   │   ├── ONBOARDING_BACKEND_QUICKREF.md
│   │   └── TODOonboarding.md
│   ├── PHASE1_COMPLETION_REPORT.md
│   ├── PHASE1_QUICK_REFERENCE.md
│   ├── PLANNING.md
│   ├── PR62_REVIEW_SUMMARY.md
│   ├── PR63_REVIEW_IMPLEMENTATION.md
│   ├── PR63_REVIEW_INDEX.md
│   ├── PROCESS.md
│   ├── prompts
│   │   ├── ISSUE_TEMPLATE.md
│   │   └── TEMPLATES.md
│   ├── quality
│   │   ├── AUTO_TAGGING.md
│   │   ├── CLEANUP_SUMMARY_2025-11-07.md
│   │   ├── CONSOLIDATION_OPPORTUNITIES.md
│   │   ├── PERFORMANCE.md
│   │   ├── slo.md
│   │   ├── TAGGING_SYSTEM.md
│   │   └── TECHNICAL_DEBT.md
│   ├── runbooks
│   │   ├── backup-scheduler.md
│   │   ├── logging-retention.md
│   │   ├── onboarding.md
│   │   ├── publish-notify.md
│   │   ├── restore.md
│   │   ├── scheduling.md
│   │   └── uptime-alerts.md
│   ├── schema-map.md
│   ├── schema-network.md
│   ├── SCOPE.md
│   ├── security
│   │   ├── SECURITY_ASSESSMENT.md
│   │   ├── SECURITY_HARDENING_2025-11-06.md
│   │   └── security.md
│   ├── SESSION_SUMMARY.md
│   ├── standards
│   │   ├── FILE_HEADER_STANDARD.md
│   │   ├── IMPORT_STANDARD.md
│   │   ├── ROUTE_API_STANDARD.md
│   │   └── SCHEMA_CATALOG_STANDARD.md
│   ├── TAGGING_QUICK_START.md
│   ├── todo-groups.todo.yml
│   ├── TODO.md
│   ├── TODO-v13.md
│   ├── TODO-v14.md
│   ├── tooling
│   │   ├── CI_WORKFLOW_STANDARDS.md
│   │   ├── CONTRIBUTING.md
│   │   ├── environment.md
│   │   ├── INTERACTIVE_TEST_RUNNER.md
│   │   ├── NPM_SCRIPTS_ANALYSIS.md
│   │   ├── REPO_STANDARDS.md
│   │   ├── SETUP.md
│   │   ├── STANDARDIZED_ERROR_RESPONSES.md
│   │   └── USAGE.md
│   ├── UX_PLAN.md
│   └── v14
│   ├── V14_FREEZE_COMPLETE_GUIDE.md
│   ├── V14_FREEZE_FINAL_INSPECTION.md
│   ├── V14_FREEZE_INSPECTION_REPORT.md
│   └── V14_ONBOARDING_FREEZE_SCOPE.md
├── emulator-data
│   ├── auth_export
│   │   ├── accounts.json
│   │   └── config.json
│   └── firebase-export-metadata.json
├── eslint.config.mjs
├── firebase.ci.json
├── firebase.json
├── firebase.test.json
├── firestore-debug.log
├── firestore.indexes.json
├── firestore.rules
├── fresh-root-10.code-workspace
├── functions
│   ├── node_modules
│   │   ├── firebase-admin -> ../../node_modules/.pnpm/firebase-admin@13.6.0_encoding@0.1.13/node_modules/firebase-admin
│   │   ├── firebase-functions -> ../../node_modules/.pnpm/firebase-functions@6.6.0_firebase-admin@13.6.0_encoding@0.1.13*/node*modules/firebase-functions
│   │   └── typescript -> ../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   ├── package.json
│   └── src
│   └── index.ts
├── jest.config.ts
├── jest-playwright.config.js
├── jest.rules.config.js
├── LICENSE
├── mcp
│   ├── filetag-server-enhanced.mjs
│   ├── filetag-server.mjs
│   └── firecrawl.mcp.json
├── node_modules
│   ├── ajv -> .pnpm/ajv@8.17.1/node_modules/ajv
│   ├── ajv-formats -> .pnpm/ajv-formats@3.0.1_ajv@8.17.1/node_modules/ajv-formats
│   ├── concurrently -> .pnpm/concurrently@9.2.1/node_modules/concurrently
│   ├── cspell -> .pnpm/cspell@8.19.4/node_modules/cspell
│   ├── @eslint
│   │   ├── config-array -> ../.pnpm/@eslint+config-array@0.21.1/node_modules/@eslint/config-array
│   │   ├── config-helpers -> ../.pnpm/@eslint+config-helpers@0.4.2/node_modules/@eslint/config-helpers
│   │   ├── core -> ../.pnpm/@eslint+core@0.16.0/node_modules/@eslint/core
│   │   ├── eslintrc -> ../.pnpm/@eslint+eslintrc@3.3.1/node_modules/@eslint/eslintrc
│   │   ├── js -> ../.pnpm/@eslint+js@9.38.0/node_modules/@eslint/js
│   │   ├── object-schema -> ../.pnpm/@eslint+object-schema@2.1.7/node_modules/@eslint/object-schema
│   │   └── plugin-kit -> ../.pnpm/@eslint+plugin-kit@0.4.1/node_modules/@eslint/plugin-kit
│   ├── eslint -> .pnpm/eslint@9.38.0_jiti@2.6.1/node_modules/eslint
│   ├── @eslint-community
│   │   ├── eslint-utils -> ../.pnpm/@eslint-community+eslint-utils@4.9.0_eslint@9.38.0_jiti@1.21.7*/node*modules/@eslint-community/eslint-utils
│   │   └── regexpp -> ../.pnpm/@eslint-community+regexpp@4.12.2/node_modules/@eslint-community/regexpp
│   ├── eslint-config-next -> .pnpm/eslint-config-next@16.0.1*@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@2.6.1__typescri_l6shbyhivrerju6sffz4d7wdr4/node*modules/eslint-config-next
│   ├── eslint-import-resolver-node -> .pnpm/eslint-import-resolver-node@0.3.9/node_modules/eslint-import-resolver-node
│   ├── eslint-import-resolver-typescript -> .pnpm/eslint-import-resolver-typescript@3.10.1_eslint-plugin-import@2.32.0_eslint@9.38.0_jiti@1.21.7*/node*modules/eslint-import-resolver-typescript
│   ├── eslint-module-utils -> .pnpm/eslint-module-utils@2.12.1*@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@2.6.1__typescr_llaolu7oikycezlt46o5u7ebf4/node*modules/eslint-module-utils
│   ├── eslint-plugin-import -> .pnpm/eslint-plugin-import@2.32.0*@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@2.6.1__typesc_gphy77xispyen5ospmvplkkpom/node*modules/eslint-plugin-import
│   ├── eslint-plugin-jsx-a11y -> .pnpm/eslint-plugin-jsx-a11y@6.10.2_eslint@9.38.0_jiti@1.21.7*/node*modules/eslint-plugin-jsx-a11y
│   ├── eslint-plugin-react -> .pnpm/eslint-plugin-react@7.37.5_eslint@9.38.0_jiti@2.6.1*/node*modules/eslint-plugin-react
│   ├── eslint-plugin-react-hooks -> .pnpm/eslint-plugin-react-hooks@7.0.1_eslint@9.38.0_jiti@2.6.1*/node*modules/eslint-plugin-react-hooks
│   ├── eslint-scope -> .pnpm/eslint-scope@8.4.0/node_modules/eslint-scope
│   ├── eslint-visitor-keys -> .pnpm/eslint-visitor-keys@4.2.1/node_modules/eslint-visitor-keys
│   ├── execa -> .pnpm/execa@9.6.0/node_modules/execa
│   ├── @firebase
│   │   └── rules-unit-testing -> ../.pnpm/@firebase+rules-unit-testing@5.0.0_firebase@12.5.0/node_modules/@firebase/rules-unit-testing
│   ├── firebase -> .pnpm/firebase@12.5.0/node_modules/firebase
│   ├── firebase-admin -> .pnpm/firebase-admin@13.5.0_encoding@0.1.13/node_modules/firebase-admin
│   ├── firebase-tools -> .pnpm/firebase-tools@14.24.0*@types+node@24.9.2_encoding@0.1.13_typescript@5.9.3/node*modules/firebase-tools
│   ├── glob -> .pnpm/glob@10.4.5/node_modules/glob
│   ├── husky -> .pnpm/husky@9.1.7/node_modules/husky
│   ├── import-in-the-middle -> .pnpm/import-in-the-middle@1.15.0/node_modules/import-in-the-middle
│   ├── jest -> .pnpm/jest@30.2.0*@types+node@24.9.2_ts-node@10.9.2*@types+node@24.9.2_typescript@5.9.3*/node*modules/jest
│   ├── markdownlint -> .pnpm/markdownlint@0.39.0/node_modules/markdownlint
│   ├── markdownlint-cli -> .pnpm/markdownlint-cli@0.40.0/node_modules/markdownlint-cli
│   ├── @modelcontextprotocol
│   │   └── sdk -> ../.pnpm/@modelcontextprotocol+sdk@1.21.1/node_modules/@modelcontextprotocol/sdk
│   ├── @next
│   │   └── eslint-plugin-next -> ../.pnpm/@next+eslint-plugin-next@16.0.1/node_modules/@next/eslint-plugin-next
│   ├── @playwright
│   │   └── test -> ../.pnpm/@playwright+test@1.56.1/node_modules/@playwright/test
│   ├── playwright -> .pnpm/playwright@1.56.1/node_modules/playwright
│   ├── postcss -> .pnpm/postcss@8.5.6/node_modules/postcss
│   ├── p-retry -> .pnpm/p-retry@7.1.0/node_modules/p-retry
│   ├── prettier -> .pnpm/prettier@3.6.2/node_modules/prettier
│   ├── prettier-plugin-tailwindcss -> .pnpm/prettier-plugin-tailwindcss@0.7.1_prettier@3.6.2/node_modules/prettier-plugin-tailwindcss
│   ├── prompts -> .pnpm/prompts@2.4.2/node_modules/prompts
│   ├── require-in-the-middle -> .pnpm/require-in-the-middle@7.5.2/node_modules/require-in-the-middle
│   ├── ts-jest -> .pnpm/ts-jest@29.4.5*@babel+core@7.28.5_@jest+transform@30.2.0_@jest+types@30.2.0_babel-jest@30.2.0*vhkhwadvxq5ndt7z24ckjelwse/node_modules/ts-jest
│   ├── tsx -> .pnpm/tsx@4.20.6/node_modules/tsx
│   ├── turbo -> .pnpm/turbo@2.6.0/node_modules/turbo
│   ├── @types
│   │   ├── eslint -> ../.pnpm/@types+eslint@9.6.1/node_modules/@types/eslint
│   │   ├── eslint-scope -> ../.pnpm/@types+eslint-scope@3.7.7/node_modules/@types/eslint-scope
│   │   ├── jest -> ../.pnpm/@types+jest@30.0.0/node_modules/@types/jest
│   │   ├── node -> ../.pnpm/@types+node@24.9.2/node_modules/@types/node
│   │   └── speakeasy -> ../.pnpm/@types+speakeasy@2.0.10/node_modules/@types/speakeasy
│   ├── typescript -> .pnpm/typescript@5.9.3/node_modules/typescript
│   ├── @typescript-eslint
│   │   ├── eslint-plugin -> ../.pnpm/@typescript-eslint+eslint-plugin@8.46.2*@typescript-eslint+parser@8.46.2_eslint@9.38.0*jiti@2_ggf5mqdoatlii7olg4quxrwtje/node_modules/@typescript-eslint/eslint-plugin
│   │   ├── parser -> ../.pnpm/@typescript-eslint+parser@8.46.2_eslint@9.38.0_jiti@2.6.1__typescript@5.9.3/node_modules/@typescript-eslint/parser
│   │   ├── project-service -> ../.pnpm/@typescript-eslint+project-service@8.46.2_typescript@5.9.3/node_modules/@typescript-eslint/project-service
│   │   ├── scope-manager -> ../.pnpm/@typescript-eslint+scope-manager@8.46.2/node_modules/@typescript-eslint/scope-manager
│   │   ├── tsconfig-utils -> ../.pnpm/@typescript-eslint+tsconfig-utils@8.46.2_typescript@5.9.3/node_modules/@typescript-eslint/tsconfig-utils
│   │   ├── types -> ../.pnpm/@typescript-eslint+types@8.46.2/node_modules/@typescript-eslint/types
│   │   ├── typescript-estree -> ../.pnpm/@typescript-eslint+typescript-estree@8.46.2_typescript@5.9.3/node_modules/@typescript-eslint/typescript-estree
│   │   ├── type-utils -> ../.pnpm/@typescript-eslint+type-utils@8.46.2_eslint@9.38.0_jiti@1.21.7__typescript@5.9.3/node_modules/@typescript-eslint/type-utils
│   │   ├── utils -> ../.pnpm/@typescript-eslint+utils@8.46.2_eslint@9.38.0_jiti@1.21.7__typescript@5.9.3/node_modules/@typescript-eslint/utils
│   │   └── visitor-keys -> ../.pnpm/@typescript-eslint+visitor-keys@8.46.2/node_modules/@typescript-eslint/visitor-keys
│   ├── typescript-eslint -> .pnpm/typescript-eslint@8.46.2_eslint@9.38.0_jiti@1.21.7__typescript@5.9.3/node_modules/typescript-eslint
│   ├── @vitejs
│   │   └── plugin-react -> ../.pnpm/@vitejs+plugin-react@5.1.0_vite@7.1.12*@types+node@24.9.2_jiti@2.6.1_terser@5.44.1_tsx@4.20.6_yaml@2.8.1_/node*modules/@vitejs/plugin-react
│   ├── vitest -> .pnpm/vitest@4.0.6*@types+debug@4.1.12_@types+node@24.9.2_@vitest+ui@4.0.6_happy-dom@20.0.10*jiti@2_ccakmjs4u52d7yedgopzlrf7ri/node_modules/vitest
│   ├── yaml -> .pnpm/yaml@2.8.1/node_modules/yaml
│   └── zod -> .pnpm/zod@4.1.12/node_modules/zod
├── package.json
├── packages
│   ├── config
│   │   ├── node_modules
│   │   │   └── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   ├── package.json
│   │   ├── src
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
│   ├── mcp-server
│   │   ├── dist
│   │   │   └── index.js
│   │   ├── node_modules
│   │   │   ├── fast-glob -> ../../../node_modules/.pnpm/fast-glob@3.3.3/node_modules/fast-glob
│   │   │   ├── jsonrpc-lite -> ../../../node_modules/.pnpm/jsonrpc-lite@2.2.0/node_modules/jsonrpc-lite
│   │   │   ├── ts-node -> ../../../node_modules/.pnpm/ts-node@10.9.2*@types+node@24.10.0_typescript@5.9.3/node*modules/ts-node
│   │   │   └── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   ├── rules-tests
│   │   ├── node_modules
│   │   │   ├── @firebase
│   │   │   │   └── rules-unit-testing -> ../../../../node_modules/.pnpm/@firebase+rules-unit-testing@5.0.0_firebase@12.4.0/node_modules/@firebase/rules-unit-testing
│   │   │   ├── firebase -> ../../../node_modules/.pnpm/firebase@12.4.0/node_modules/firebase
│   │   │   ├── firebase-admin -> ../../../node_modules/.pnpm/firebase-admin@13.6.0_encoding@0.1.13/node_modules/firebase-admin
│   │   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   │   └── vitest -> ../../../node_modules/.pnpm/vitest@4.0.6*@types+debug@4.1.12_@types+node@24.10.0_@vitest+ui@4.0.6_happy-dom@20.0.10*jiti@\_333dtj7adubpge3rl5ob5zcp6u/node_modules/vitest
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── rbac.test.ts
│   │   │   └── rules.test.ts
│   │   ├── tsconfig.json
│   │   ├── tsconfig.tsbuildinfo
│   │   └── vitest.config.ts
│   ├── types
│   │   ├── node_modules
│   │   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   │   └── zod -> ../../../node_modules/.pnpm/zod@4.1.12/node_modules/zod
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── attendance.ts
│   │   │   ├── compliance
│   │   │   │   ├── adminResponsibilityForm.ts
│   │   │   │   └── index.ts
│   │   │   ├── corporates.ts
│   │   │   ├── errors.ts
│   │   │   ├── events.ts
│   │   │   ├── index.ts
│   │   │   ├── join-tokens.ts
│   │   │   ├── links
│   │   │   │   ├── corpOrgLinks.ts
│   │   │   │   ├── corpOrgLinks.v14.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── orgVenueAssignments.ts
│   │   │   ├── memberships.ts
│   │   │   ├── networks.ts
│   │   │   ├── onboarding.ts
│   │   │   ├── orgs.ts
│   │   │   ├── positions.ts
│   │   │   ├── rbac.ts
│   │   │   ├── schedules.ts
│   │   │   ├── shifts.ts
│   │   │   ├── **tests**
│   │   │   │   ├── adminResponsibilityForm.test.ts
│   │   │   │   ├── attendance.test.ts
│   │   │   │   ├── corpOrgLinks.test.ts
│   │   │   │   ├── corpOrgLinks.v14.test.ts
│   │   │   │   ├── join-tokens.test.ts
│   │   │   │   ├── memberships.test.ts
│   │   │   │   ├── networks.test.ts
│   │   │   │   ├── onboarding.test.ts
│   │   │   │   ├── organizations.test.ts
│   │   │   │   ├── org-network.test.ts
│   │   │   │   ├── orgs.test.ts
│   │   │   │   ├── orgVenueAssignments.test.ts
│   │   │   │   ├── orgVenueAssignments.v14.test.ts
│   │   │   │   ├── positions.test.ts
│   │   │   │   ├── schedules.test.ts
│   │   │   │   ├── shifts.test.ts
│   │   │   │   ├── venue-network.test.ts
│   │   │   │   ├── venues.test.ts
│   │   │   │   └── zones.test.ts
│   │   │   ├── venues.ts
│   │   │   └── zones.ts
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
│   └── ui
│   ├── node_modules
│   │   ├── clsx -> ../../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx
│   │   ├── react -> ../../../node_modules/.pnpm/react@18.3.1/node_modules/react
│   │   ├── react-dom -> ../../../node_modules/.pnpm/react-dom@18.3.1_react@18.3.1/node_modules/react-dom
│   │   ├── tailwindcss -> ../../../node_modules/.pnpm/tailwindcss@3.4.18_tsx@4.20.6_yaml@2.8.1/node_modules/tailwindcss
│   │   ├── @types
│   │   │   ├── react -> ../../../../node_modules/.pnpm/@types+react@18.3.26/node_modules/@types/react
│   │   │   └── react-dom -> ../../../../node_modules/.pnpm/@types+react-dom@18.3.7*@types+react@18.3.26/node*modules/@types/react-dom
│   │   └── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   ├── package.json
│   ├── src
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── index.ts
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.cjs
├── public
│   └── manifest.json
├── README.md
├── scripts
│   ├── agent
│   │   ├── agent.mts
│   │   ├── lib
│   │   │   └── logger.ts
│   │   ├── tasks
│   │   │   ├── rbac.ts
│   │   │   ├── restructure.ts
│   │   │   └── rules.ts
│   │   └── tsconfig.json
│   ├── bench
│   │   └── http-bench.js
│   ├── bootstrap_scaffold.sh
│   ├── bootstrap_tier1.sh
│   ├── bootstrap_tier2.sh
│   ├── bootstrap_tier3.sh
│   ├── build_org_search_index_v15.ts
│   ├── ci
│   │   └── check-no-legacy.ts
│   ├── gen_api_catalog.ts
│   ├── gen_schema_catalog.ts
│   ├── gh-setup-labels.sh
│   ├── mcp
│   │   └── run-firecrawl-mcp.sh
│   ├── ops
│   │   ├── backup-firestore.sh
│   │   ├── create-backup-scheduler.sh
│   │   ├── create-uptime-alert.sh
│   │   ├── create-uptime-check.sh
│   │   ├── logging-setup.sh
│   │   ├── uptime-alert-policy.json
│   │   └── validate-schema-rules-parity.ts
│   ├── run-rules-tests.mjs
│   ├── run-tests-safe.sh
│   ├── run-typecheck.js
│   ├── seed
│   │   └── seed.emulator.ts
│   ├── setup-mcp.sh
│   ├── setup.sh
│   ├── tag-files.mjs
│   ├── test-interactive.mjs
│   ├── validate-schema-parity.mjs
│   └── watch-and-tag.mjs
├── services
│   └── api
│   ├── dist
│   │   ├── auth
│   │   │   └── types.js
│   │   ├── cache
│   │   │   ├── provider.js
│   │   │   └── redis.js
│   │   ├── env.js
│   │   ├── firebase.js
│   │   ├── index.js
│   │   ├── mw
│   │   │   ├── logger.js
│   │   │   ├── security.js
│   │   │   └── session.js
│   │   ├── obs
│   │   │   ├── log.js
│   │   │   ├── otel.js
│   │   │   └── sentry.js
│   │   ├── rbac.js
│   │   ├── src
│   │   │   ├── auth
│   │   │   │   └── types.js
│   │   │   ├── cache
│   │   │   │   ├── provider.js
│   │   │   │   └── redis.js
│   │   │   ├── env.js
│   │   │   ├── firebase.js
│   │   │   ├── index.js
│   │   │   ├── mw
│   │   │   │   ├── logger.js
│   │   │   │   ├── security.js
│   │   │   │   └── session.js
│   │   │   ├── obs
│   │   │   │   ├── log.js
│   │   │   │   ├── otel.js
│   │   │   │   └── sentry.js
│   │   │   └── rbac.js
│   │   └── test
│   │   ├── log.test.js
│   │   ├── otel.test.js
│   │   ├── rbac.test.js
│   │   └── security.test.js
│   ├── Dockerfile
│   ├── docs
│   │   └── PRODUCTION.md
│   ├── node_modules
│   │   ├── express -> ../../../node_modules/.pnpm/express@5.1.0/node_modules/express
│   │   ├── firebase-admin -> ../../../node_modules/.pnpm/firebase-admin@13.6.0_encoding@0.1.13/node_modules/firebase-admin
│   │   ├── @opentelemetry
│   │   │   ├── api -> ../../../../node_modules/.pnpm/@opentelemetry+api@1.9.0/node_modules/@opentelemetry/api
│   │   │   ├── auto-instrumentations-node -> ../../../../node_modules/.pnpm/@opentelemetry+auto-instrumentations-node@0.66.0*@opentelemetry+api@1.9.0_@opentelemetry+core*tmrxr3y5enujasixrgvyywzlsq/node_modules/@opentelemetry/auto-instrumentations-node
│   │   │   ├── exporter-trace-otlp-http -> ../../../../node_modules/.pnpm/@opentelemetry+exporter-trace-otlp-http@0.207.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/exporter-trace-otlp-http
│   │   │   ├── resources -> ../../../../node_modules/.pnpm/@opentelemetry+resources@2.2.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/resources
│   │   │   ├── sdk-node -> ../../../../node_modules/.pnpm/@opentelemetry+sdk-node@0.207.0*@opentelemetry+api@1.9.0/node*modules/@opentelemetry/sdk-node
│   │   │   └── semantic-conventions -> ../../../../node_modules/.pnpm/@opentelemetry+semantic-conventions@1.37.0/node_modules/@opentelemetry/semantic-conventions
│   │   ├── redis -> ../../../node_modules/.pnpm/redis@5.9.0/node_modules/redis
│   │   ├── @sentry
│   │   │   ├── node -> ../../../../node_modules/.pnpm/@sentry+node@10.25.0/node_modules/@sentry/node
│   │   │   └── profiling-node -> ../../../../node_modules/.pnpm/@sentry+profiling-node@10.22.0/node_modules/@sentry/profiling-node
│   │   ├── tsx -> ../../../node_modules/.pnpm/tsx@4.20.6/node_modules/tsx
│   │   ├── @types
│   │   │   ├── express -> ../../../../node_modules/.pnpm/@types+express@4.17.25/node_modules/@types/express
│   │   │   └── node -> ../../../../node_modules/.pnpm/@types+node@20.19.24/node_modules/@types/node
│   │   ├── typescript -> ../../../node_modules/.pnpm/typescript@5.9.3/node_modules/typescript
│   │   ├── vitest -> ../../../node_modules/.pnpm/vitest@4.0.6*@types+debug@4.1.12_@types+node@20.19.24_@vitest+ui@4.0.6_happy-dom@20.0.10_jiti_4llxqaedlqf33gduom2yrbwtiy/node_modules/vitest
│   │   └── zod -> ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod
│   ├── package.json
│   ├── src
│   │   ├── auth
│   │   │   └── types.ts
│   │   ├── cache
│   │   │   ├── provider.ts
│   │   │   └── redis.ts
│   │   ├── config
│   │   │   └── README.md
│   │   ├── env.ts
│   │   ├── firebase.ts
│   │   ├── index.ts
│   │   ├── mw
│   │   │   ├── logger.ts
│   │   │   ├── security.ts
│   │   │   └── session.ts
│   │   ├── obs
│   │   │   ├── log.ts
│   │   │   ├── otel.ts
│   │   │   └── sentry.ts
│   │   └── rbac.ts
│   ├── test
│   │   ├── log.test.ts
│   │   ├── otel.test.ts
│   │   ├── rbac.test.ts
│   │   └── security.test.ts
│   └── tsconfig.json
├── src
│   └── placeholder.py
├── storage.rules
├── tailwind.config.cjs
├── test-output.log
├── tests
│   ├── e2e
│   │   ├── auth-onboarding.spec.ts
│   │   ├── login_publish_logout.e2e.spec.ts
│   │   ├── onboarding-full-flow.spec.ts
│   │   └── onboarding-happy-path.spec.ts
│   ├── rules
│   │   ├── admin-form.spec.mts
│   │   ├── attendance.spec.mts
│   │   ├── firestore.spec.ts
│   │   ├── join-tokens.spec.mts
│   │   ├── memberships.spec.ts
│   │   ├── messages_receipts.spec.ts
│   │   ├── mfa.spec.ts
│   │   ├── networks.spec.mts
│   │   ├── node_modules
│   │   ├── organizations.spec.ts
│   │   ├── positions.spec.ts
│   │   ├── README.md
│   │   ├── schedules.spec.mts
│   │   ├── \_setup.ts
│   │   ├── shifts.spec.mts
│   │   ├── storage.fixed.spec.ts
│   │   ├── users.test.ts
│   │   ├── venues.spec.mts
│   │   ├── vitest.config.ts
│   │   └── zones.spec.mts
│   └── unit
│   └── middleware.test.ts
├── tmp
│   └── test-nextreq.cjs
├── tools
│   ├── diagnostics
│   │   ├── create_custom_token.js
│   │   └── playwright_login.js
│   ├── health
│   │   ├── postinstall.js
│   │   └── preinstall.js
│   └── sim
│   └── auth_sim.mts
├── tree.md
├── tree.txt
├── tsconfig.base.json
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── turbo.json
├── types
│   └── firebase-admin.d.ts
├── vitest.config.ts
└── vitest.global-setup.ts

433 directories, 589 files
