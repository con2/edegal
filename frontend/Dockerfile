FROM node:12

WORKDIR /usr/src/app
EXPOSE 8080

COPY package.json package-lock.json tsconfig.json tslint.json /usr/src/app/

# Change proxy target to local backend
RUN sed -i -e 's@https://conikuvat.fi@http://backend:8000@' package.json

RUN npm install
COPY public /usr/src/app/public
COPY src /usr/src/app/src

USER node

CMD ["node_modules/.bin/react-scripts", "start"]
