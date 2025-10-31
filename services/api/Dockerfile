# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /app

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY services/api/package.json services/api/tsconfig.json ./services/api/

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Fetch dependencies (including workspace root deps)
RUN pnpm fetch

COPY services/api ./services/api
RUN pnpm install -r --offline --filter @fresh-schedules/api... && \
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