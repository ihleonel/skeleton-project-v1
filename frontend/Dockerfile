FROM node:25.9.0-alpine3.23

WORKDIR /src

RUN mkdir -p /src/node_modules && \
    chown -R node:node /src

USER node

CMD ["sh"]
