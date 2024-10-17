# Docker Image Build.
BASEDIR="$(realpath .)"
docker build -t or-user-portal:$1 $BASEDIR
