FROM python:slim AS app

FROM pwn.red/jail

ENV JAIL_ENV_FLAG="RUSEC{l1ar_li4R_pl4Nt5_f0r_h1r3_gqvhp9843}"

COPY --from=app / /srv

COPY chal.py /srv/app/run

ENV JAIL_MEM=20M 
# Configrue this POW for real challenge or someth
# ENV JAIL_POW=5000 JAIL_ENV_NUM=5
