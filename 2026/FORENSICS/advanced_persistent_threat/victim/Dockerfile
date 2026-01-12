FROM debian

RUN apt update && apt install unzip openssh-server curl binutils tar xz-utils -y

RUN rm -f /etc/apt/sources.list.d/*
COPY sources.list sources
RUN echo 'deb [trusted=yes] http://knowledge-universal/repo amd64/' > /etc/apt/sources.list
RUN cat sources >> /etc/apt/sources.list && rm -f sources

RUN echo 'root:root' | chpasswd
RUN service ssh start
COPY sshd_config /etc/ssh/sshd_config

RUN echo 'RUSEC{kn0ck_kn0ck_you_h4ve_a_p4ck4ge_in_th3_m41l}' > /root/flag.txt
ENTRYPOINT ["/usr/sbin/sshd", "-D"]