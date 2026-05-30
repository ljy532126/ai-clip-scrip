# ============================================
# AI全能剪辑脚本生成平台 — Docker 部署
# ============================================

# Stage 1: 前端构建
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Stage 2: 后端运行时
FROM node:20-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production --silent
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ./public
COPY .env ./.env
RUN mkdir -p output

EXPOSE 3013
CMD ["node", "src/app.js"]
