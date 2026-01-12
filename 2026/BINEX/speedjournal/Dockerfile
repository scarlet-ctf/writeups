FROM ubuntu AS app
RUN mkdir -p /app

FROM pwn.red/jail
COPY --from=app / /srv

COPY speedjournal /srv/app/run
RUN chmod +x /srv/app/run
