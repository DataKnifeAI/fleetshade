# Build SPA (site marker baked in at build time)
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_SITE_MARKER
ARG VITE_STATUS_URL=/api/status
ENV VITE_SITE_MARKER=$VITE_SITE_MARKER
ENV VITE_STATUS_URL=$VITE_STATUS_URL
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN test -n "$VITE_SITE_MARKER" || (echo "VITE_SITE_MARKER build-arg required" && exit 1)
RUN npm run build

# Static UI + reverse-proxy /api to the read-only API service
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
