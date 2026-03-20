# Define variables
PROJECT_NAME = hhc 
NETWORK = srcs_ohyeah
NGINX_IMAGE = nginx
MARIADB_IMAGE = mariadb
DB_VOL = srcs_mariadb_data
MYSQL_ROOT_PASSWORD = jesaispas123
MYSQL_DATABASE = hhc-db 
BACKEND_IMAGE= hhc-backend

# Default target: build all images
all: build

# Build container images
build:
	docker build -t $(NGINX_IMAGE) -f ./srcs/nginx/Dockerfile ./srcs/nginx
	docker build -t $(MARIADB_IMAGE) -f ./srcs/mariadb/Dockerfile ./srcs/mariadb
	docker build -t $(BACKEND_IMAGE) -f ./srcs/backend/Dockerfile ./srcs/backend
	cd ./srcs && docker compose up -d

save-bdd:
	@mkdir -p sauvegardes-bdd
	@ts=$$(date +"%Y%m%d-%H%M%S"); \
	docker exec -i mariadb sh -c 'mariadb-dump -u root -p"$(MYSQL_ROOT_PASSWORD)" $(MYSQL_DATABASE)' > "sauvegardes-bdd/sauvegarde-$${ts}.sql"
# Show running containers
status:
	docker ps -a
