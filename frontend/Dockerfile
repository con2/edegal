FROM node:22

WORKDIR /usr/src/app

COPY package.json package-lock.json tsconfig.json tslint.json index.html vite.config.js /usr/src/app/
RUN npm ci
COPY src /usr/src/app/src

CMD ["node_modules/.bin/vite"]
