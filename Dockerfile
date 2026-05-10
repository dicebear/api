FROM node:24-slim AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:24-slim AS prod
EXPOSE 3000
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=build /app/fonts /app/fonts
COPY --from=build /app/data /app/data
COPY LICENSE /app/LICENSE
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci --production

CMD ["node", "./dist/server.js"]
