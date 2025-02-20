FROM node:20-alpine3.20 AS build
LABEL authors="nikanorov-sv"
WORKDIR /front
RUN npm install -g @angular/cli
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY nginx.conf /ect/nginx/conf.d/default.conf
COPY --from=build /front/dist/front/browser /usr/share/nginx/html
EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
