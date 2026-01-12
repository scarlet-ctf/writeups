#./build.sh PROD
docker build -t melstudios-l4 .
docker run --rm -p 5000:5000 melstudios-l4
