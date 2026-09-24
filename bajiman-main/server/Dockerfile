FROM node:22-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV VERCEL=0

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY . .

EXPOSE 5000
CMD ["node", "index.js"]
