# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN CI=true pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Render exposes configured variables as Docker build arguments. The app
# prerenders database-backed photo routes, so its build needs this real URL.
ARG DATABASE_URL

# Build-time env stubs (real values are injected at runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=${DATABASE_URL:-postgresql://placeholder:placeholder@localhost/placeholder}
ENV AUTH_SECRET=placeholder_placeholder_placeholder_placeholder
ENV ADMIN_EMAIL=placeholder@placeholder.com
ENV ADMIN_PASSWORD=placeholder123
ENV R2_ACCOUNT_ID=placeholder
ENV R2_ACCESS_KEY_ID=placeholder
ENV R2_SECRET_ACCESS_KEY=placeholder
ENV R2_BUCKET=placeholder
ENV R2_PUBLIC_URL=https://placeholder.r2.dev
ENV NEXT_PUBLIC_SITE_URL=https://placeholder.example

RUN pnpm build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache curl python3 && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
      -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp && \
    yt-dlp --version

ENV YT_DLP_PATH=/usr/local/bin/yt-dlp

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
