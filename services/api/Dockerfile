# syntax=docker/dockerfile:1
FROM node:20-slim AS build
WORKDIR /app

# Copy workspace config and lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY services/api/package.json services/api/tsconfig.json ./services/api/

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

# Fetch all dependencies (including workspace root)
RUN pnpm fetch --no-optional

# Install all deps first, then build API
COPY services/api ./services/api
RUN pnpm install -r --offline --no-optional && \
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