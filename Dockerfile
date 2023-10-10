FROM --platform=linux/amd64 node:20-slim

EXPOSE 3000

COPY src ./
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install
RUN npm run build

CMD ["npm", "start"]