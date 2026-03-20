# HHC2026

## Configuration
1. Créer un fichier `.env` à la racine de `srcs/` (chargé par `docker-compose.yml`) :
   ```env
   # Backend
   OPENAI_APIKEY=sk-...
   DB_HOST=mariadb
   DB_PORT=3306
   DB_USER=hhc
   DB_PASSWORD=hhc
   DB_NAME=HHC

   # MariaDB
   MYSQL_DATABASE=HHC
   MYSQL_USER=hhc
   MYSQL_PASSWORD=hhc
   MYSQL_ROOT_PASSWORD=root

   # Nginx
   WEBSITE=localhost
   ```
