echo "Building application........................"

docker build . -t vn.lit.vn:1.0.0

docker-compose up -d

