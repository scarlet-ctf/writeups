FROM python:slim AS app

FROM pwn.red/jail

ENV JAIL_ENV_FLAG="RUSEC{t0uhou_fum0_b4urs4k_orz0city_fn1x9fk3mdj1}"

COPY --from=app / /srv

COPY chal.py /srv/app/run
COPY graph.txt /srv/app/graph.txt
COPY colors.txt /srv/app/colors.txt

ENV JAIL_MEM=20M 
# Configrue this POW for real challenge or someth
# ENV JAIL_POW=5000 JAIL_ENV_NUM=5
