# HHC2026

Petit backend Go exposant une API pour parler au modèle OpenAI et interagir avec MariaDB, orchestré via Docker Compose (nginx + backend + base de données).

## Prérequis
- Docker + Docker Compose
- Clé API OpenAI (`OPENAI_APIKEY`)
- Optionnel : Go 1.22+ pour un lancement local sans Docker

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
2. (Optionnel) Ajouter vos migrations/données dans `srcs/mariadb/db-init/hhc.sql` si besoin.

## Démarrage rapide (Docker)
```bash
cd srcs
# Construire l’image Go consommée par docker-compose.yml
docker build -t hhc-backend backend
docker compose up
```
Services exposés :
- Backend : http://localhost:8080
- MariaDB : port 3306
- Nginx : http://localhost:80 (monte `nginx/website/` dans le conteneur)

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
  Retourne le texte généré par le modèle (clé `OPENAI_APIKEY` requise).

## Lancer le backend sans Docker
```bash
cd srcs/backend
export OPENAI_APIKEY=sk-...
export DB_HOST=localhost DB_PORT=3306 DB_USER=... DB_PASSWORD=... DB_NAME=...
go run ./...
```

## Dépannage rapide
- Clé OpenAI absente → l’API `/api/ai` renvoie une erreur.
- Connexion DB impossible → vérifier `DB_*` et que MariaDB écoute sur le bon host/port.
