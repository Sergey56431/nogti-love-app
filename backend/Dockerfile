FROM node:20-alpine3.20 AS build
LABEL authors="vladislav-nik"
WORKDIR /backend
RUN npm install -g @nestjs/cli
COPY package.json .
RUN npm install
COPY . .
RUN npm run start

EXPOSE 3000
