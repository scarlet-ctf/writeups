FROM ubuntu
RUN apt update && apt install file qemu-system-x86 socat curl -y
RUN mkdir /app
WORKDIR /app

COPY run.sh .
RUN chmod +x run.sh

COPY bzImage .
COPY rootfs.cpio.gz .

RUN chmod -R o+r .
USER nobody

ENTRYPOINT [ "socat", "tcp-listen:5000,reuseaddr,fork", "exec:./run.sh" ]
