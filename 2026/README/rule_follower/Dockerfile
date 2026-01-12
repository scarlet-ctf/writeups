FROM ubuntu
RUN apt update && apt install python3 socat -y
RUN mkdir /app
WORKDIR /app

COPY script.py .
RUN chmod +x script.py

RUN chmod -R o+r .
USER nobody

ENTRYPOINT [ "socat", "tcp-listen:5000,reuseaddr,fork", "exec:python3 script.py" ]
