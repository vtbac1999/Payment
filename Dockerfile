FROM node:18.20.2

WORKDIR /app

COPY ["package.json","./"]
COPY . .

RUN npm install -f

RUN npm run build

CMD ["npm", "run", "start:dev"]