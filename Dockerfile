FROM node:12.19.0-alpine3.12
WORKDIR /app

COPY ./ /app

RUN rm -rf node_modules
RUN rm -rf dist
RUN npm i

RUN npm run build

ENTRYPOINT if [ -f prod.env ]; then . prod.env; fi &&\
            node dist/main