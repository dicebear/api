FROM node:20-slim AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:20-slim AS prod
EXPOSE 3000
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY versions /app/versions
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci --production

CMD ["npm", "start"]