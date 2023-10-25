FROM node:18 as builder

WORKDIR /usr/src/app

COPY client/package*.json ./
COPY client/pnpm-lock.yaml ./
RUN npm install pnpm -g && pnpm install

COPY client .
RUN pnpm build

FROM alpine:latest

WORKDIR /usr/src/app

RUN apk add --no-cache --update iputils-ping nodejs npm
COPY server/package*.json ./
COPY server/pnpm-lock.yaml ./
RUN npm install pnpm -g && pnpm install -P

COPY server .

COPY --from=builder /usr/src/app/dist /usr/src/app/dist

EXPOSE 8000

CMD [ "node", "index.js" ]