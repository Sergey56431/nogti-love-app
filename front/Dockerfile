FROM node:20-alpine3.20 AS build
LABEL authors="nikanorov-sv"

WORKDIR /front

# Install Angular CLI
RUN npm install -g @angular/cli

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the source code and build the application
COPY . .
RUN npm run build --prod

# Production stage
FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /home/admin/cashBack-app/front/dist/front/browser /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
