# syntax=docker/dockerfile:1.4
FROM nginx:alpine

ARG SHARED_APP_URL
ARG SHARED_API_URL
ARG SHARED_APP_TITLE
ARG SHARED_DISPLAY_STATS
ARG SHARED_INVITE_ONLY
ENV SHARED_APP_URL=$SHARED_APP_URL
ENV SHARED_API_URL=$SHARED_API_URL
ENV SHARED_APP_TITLE=$SHARED_APP_TITLE
ENV SHARED_DISPLAY_STATS=$SHARED_DISPLAY_STATS
ENV SHARED_INVITE_ONLY=$SHARED_INVITE_ONLY

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/src/apps/frontend

COPY . .

WORKDIR /usr/src/apps/shared
COPY --from=apps-shared . .

WORKDIR /usr/src/packages/
COPY --from=packages . .

WORKDIR /usr/src/apps/frontend

RUN apk add --no-cache nodejs npm
RUN npm install
RUN npm run build 

RUN env

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]