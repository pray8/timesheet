FROM node:16 as builder

RUN mkdir /timesheet-app

# Copy all files from current directory to docker image.
COPY . /timesheet-app

WORKDIR /timesheet-app

RUN set NODE_OPTIONS=--openssl-legacy-provider
RUN export NODE_OPTIONS=--openssl-legacy-provider

# Install and cache application dependencies.
RUN yarn install

RUN yarn add crypto-browserify

# Build the project.
RUN yarn build


FROM nginx:alpine

# Remove default nginx index page.
RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /timesheet-app/build /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /timesheet-app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
