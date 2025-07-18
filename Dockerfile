#STAGE1

FROM node:22 as build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

#STAGE2: Serve react app

FROM --platform=linux/amd64 nginx:stable-alpine
COPY --from=build /app/dist /user/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]

