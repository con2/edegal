FROM node:10

WORKDIR /usr/src/app
EXPOSE 8080
ENV REACT_APP_EDEGAL_LOGIN_URL https://conikuvat.fi/admin/oauth2/login/?next=/admin/

COPY package.json package-lock.json tsconfig.json tslint.json /usr/src/app/
RUN npm install
COPY public /usr/src/app/public
COPY src /usr/src/app/src

USER node

CMD ["node_modules/.bin/react-scripts-ts", "start"]
