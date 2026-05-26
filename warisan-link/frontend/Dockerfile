# Stage 1: Build React app
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME="WARISAN LINK"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via nginx
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
