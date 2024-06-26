FROM node:20-alpine3.19 AS base
WORKDIR /usr/src/app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .

FROM node:20-alpine3.19 as release
WORKDIR /usr/src/app
RUN npm i -g pnpm
COPY --from=base /usr/src/app .
EXPOSE 3000
RUN npx prisma generate
CMD pnpm run start:dev