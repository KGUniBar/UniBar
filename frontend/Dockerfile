# 프론트엔드 (React) 개발용 Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

