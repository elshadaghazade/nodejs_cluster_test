FROM node:latest
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./

RUN npm install yarn
RUN yarn install
COPY . .

EXPOSE 8000
CMD [ "node", "index.js" ]