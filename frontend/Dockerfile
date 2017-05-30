FROM node:7

RUN npm i -g yarn

# speed up exit on SIGINT/SIGTERM
RUN wget -qO /tini https://github.com/krallin/tini/releases/download/v0.14.0/tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

WORKDIR /usr/src/app
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --pure-lockfile && rm -rf /root/.yarn-cache
COPY . /usr/src/app/
EXPOSE 8080

CMD ["node_modules/.bin/react-scripts-ts", "start"]
