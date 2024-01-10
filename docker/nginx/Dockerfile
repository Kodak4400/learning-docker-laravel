FROM nginx:1.25

WORKDIR /workspace

ENV TZ=UTC

ARG ARG_ENV

COPY ./docker/nginx/${ARG_ENV}/*.conf /etc/nginx/conf.d/
