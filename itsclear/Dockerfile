FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
COPY --from=frontend-build /app/dist ./dist
COPY public ./public
RUN mkdir -p /app/server/uploads && chown -R node:node /app
USER node
EXPOSE 5001
CMD ["node", "server/index.js"]
