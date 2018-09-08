FROM node:10

WORKDIR /usr/src/app
COPY package.json yarn.lock /usr/src/app/
RUN yarn install --pure-lockfile && rm -rf /root/.yarn-cache
COPY . /usr/src/app/
EXPOSE 8080
ENV REACT_APP_EDEGAL_LOGIN_URL https://beta.conikuvat.fi/admin/oauth2/login/?next=/admin/

CMD ["node_modules/.bin/react-scripts-ts", "start"]
