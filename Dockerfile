# STAGE 1: Build React app
FROM node:22 as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# STAGE 2: Serve the app with Nginx
FROM --platform=linux/amd64 nginx:1.27.3-alpine-slim

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config to handle React Router routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
