FROM --platform=linux/amd64 node:20-slim

EXPOSE 3000

COPY dist ./
COPY .npmrc ./
COPY package.json ./
COPY package-lock.json ./

RUN npm install

CMD ["npm", "start"]