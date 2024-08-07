# syntax=docker/dockerfile:1.4
FROM node:20

WORKDIR /usr/src/apps/backend

COPY package.json .
# COPY yarn.lock .

RUN npm i -g @nestjs/cli
RUN npm i

# RUN apt update

COPY . .

WORKDIR /usr/src/apps/shared
COPY --from=apps-shared . .
RUN yarn install

WORKDIR /usr/src/packages/
COPY --from=packages . .

WORKDIR /usr/src/apps/backend

RUN yarn build 

# output the folder structure to the docker desktop logs
# RUN ls -la

CMD ["sh", "-c", "ls -lad && cat nest-cli.json && yarn start:prod"]