FROM node:20-alpine3.20 AS build
LABEL authors="nikanorov-sv"
WORKDIR /frontend
RUN npm install -g @angular/cli
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY nginx.conf /ect/nginx/conf.d/default.conf
COPY --from=build /frontend/dist/front/browser /usr/share/nginx/html
EXPOSE 9090
