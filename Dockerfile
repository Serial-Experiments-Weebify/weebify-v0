FROM node:16

WORKDIR /app
COPY . .

WORKDIR /app/frontend

RUN npm i && npm run build

WORKDIR /app
RUN npm i

ENV AWS_ACCESS_KEY_ID=""
ENV AWS_SECRET_ACCESS_KEY=""

ENTRYPOINT ["npm", "run", "start"]