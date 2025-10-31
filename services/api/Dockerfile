# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /app

# Only copy API workspace to keep image small
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY services/api/package.json services/api/tsconfig.json ./services/api/
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
RUN pnpm fetch --filter @fresh-schedules/api

COPY services/api ./services/api
RUN pnpm --filter @fresh-schedules/api install -r --offline && \
    pnpm --filter @fresh-schedules/api build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY --from=build /app/services/api/dist ./dist
COPY --from=build /app/services/api/package.json ./
COPY --from=build /app/services/api/node_modules ./node_modules
USER nonroot:nonroot
EXPOSE 4000
CMD ["dist/index.js"]