FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

COPY ./build/src/* ./src

RUN npm install --production

CMD [ "node", "./src/index.js" ]
