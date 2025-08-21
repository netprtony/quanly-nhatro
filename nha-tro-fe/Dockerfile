# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS build
WORKDIR /app
# Cài dep
COPY nha-tro-fe/package*.json ./
RUN npm ci --legacy-peer-deps || npm i
# Copy source và build
COPY nha-tro-fe/ ./
RUN npm run build

# Nginx serve build + proxy /api sang backend
FROM nginx:1.27-alpine
# Nginx config của frontend (proxy /api)
COPY nha-tro-fe/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80