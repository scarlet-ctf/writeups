docker build -t ruid_login .
docker run --rm -p 5000:5000 --privileged ruid_login