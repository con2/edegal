FROM node:7
WORKDIR /usr/src/app
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --pure-lockfile && rm -rf /root/.yarn-cache
COPY . /usr/src/app/
EXPOSE 8080

CMD ["node_modules/.bin/react-scripts-ts", "start"]
