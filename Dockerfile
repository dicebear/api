FROM node:16-slim

EXPOSE 3000

WORKDIR /dicebear-api

COPY . .
RUN yarn install

CMD ["yarn", "start"]