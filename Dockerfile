FROM node:16-alpine

ENV NODE_ENV=production \
    FORWARD_PROJECT='["wallet","http://10.8.103.46:3000"]&["lian","https://dev-gapi.lian.vn"]&["evisa","https://dev-gapi.evisavn.vip"]' \ 
    NGROK_AUTH_TOKEN='' \
    NGROK_HOST_NAME='' \ 
    PORT=9000

RUN mkdir /app

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 9000 4041

CMD ["npm", "start"]
