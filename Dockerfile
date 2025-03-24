# ========== 构建阶段 ==========
FROM node:18 AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 拷贝代码
COPY . .

# 设置构建时环境变量（编译进前端）
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 安装依赖并构建
RUN pnpm install
RUN pnpm build

# ========== 运行阶段 ==========
FROM node:18-slim AS runner

WORKDIR /app

# 安装 pnpm（可选，看你是否用它启动）
RUN npm install -g pnpm

# 只复制必要的构建产物，减小体积
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 暴露端口
EXPOSE 3000

# 启动 Next.js
CMD ["pnpm", "start"]