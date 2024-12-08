FROM node:22 AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22 AS dev
WORKDIR /usr/src/app
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package.json package-lock.json next.config.ts tsconfig.json .eslintrc.json ./
COPY src src

CMD [ "next", "dev" ]
