docker build -t speedjournal .
docker run --rm --privileged -p 1337:5000 speedjournal