# base images
FROM node:8.16.0-alpine

RUN apk add --update nginx && rm -rf /var/cache/apk/* && rm -v /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/

COPY ./build/ /usr/share/nginx/html/build/
RUN mkdir -p /run/nginx

WORKDIR /usr/

EXPOSE 9200
CMD ["nginx", "-g", "daemon off;"]