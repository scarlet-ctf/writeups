docker build -t coloring_heist .
docker run --rm --privileged -p 5000:5000 coloring_heist

# TESTING
# docker run --rm --privileged  --name coloring_heist  --network mynet  -p 5000:5000  coloring_heist

