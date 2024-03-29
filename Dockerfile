FROM node:latest

WORKDIR /

COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "run", "start"]