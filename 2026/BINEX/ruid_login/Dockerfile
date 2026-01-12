FROM ubuntu AS app
RUN mkdir -p /app

FROM pwn.red/jail
COPY --from=app / /srv

COPY ruid_login /srv/app/run
COPY flag.txt /srv/app