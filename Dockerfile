FROM --platform=linux/amd64 node:18-slim

EXPOSE 3000

WORKDIR /dicebear-api

COPY . .
RUN npm install

CMD ["npm", "start"]