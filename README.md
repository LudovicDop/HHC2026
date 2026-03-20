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

```
## Routes API
- `GET /api/hello`  
  Répond un JSON `{"message":"Hello from Go backend!"}` pour tester que le backend tourne.
- `POST /api/ai`  
  Proxy vers OpenAI. Corps JSON attendu :
  ```json
  {
    "user_prompt": "Texte utilisateur",
    "system_prompt": "Contexte système"
  }
  ```
