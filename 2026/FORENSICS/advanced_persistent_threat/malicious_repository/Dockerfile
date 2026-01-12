FROM httpd:bookworm
RUN apt update && apt install dpkg-dev zip -y

WORKDIR /usr/local/apache2/htdocs
RUN mkdir -p repo/amd64

COPY malware.deb repo/amd64/cmdtest.deb
WORKDIR repo
RUN dpkg-scanpackages -m ./amd64 > ./amd64/Packages

WORKDIR /usr/local/apache2/htdocs
COPY encoded_malware_script ./disk_cleanup
COPY authorization ./authorization
RUN zip -P very-normal-very-cool symbols.zip disk_cleanup
RUN rm disk_cleanup