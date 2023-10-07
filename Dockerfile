FROM --platform=linux/amd64 oven/bun:1

EXPOSE 3000

COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun install