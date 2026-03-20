#!/bin/bash

# Démarre MariaDB en arrière-plan
service mysql start

# Attendre que MariaDB soit prêt
until mysqladmin ping --silent; do
  echo "⏳ En attente de MariaDB..."
  sleep 1
done

# Importer la base si elle n'existe pas déjà
if ! mysql -u root -e "USE HHC;" 2>/dev/null; then
  echo "📦 Import de la base HHC..."
  mysql -u root < /docker-entrypoint-initdb.d/hhc.sql
else
  echo "✅ Base HHC déjà existante, aucun import effectué."
fi

# Garder le conteneur actif
tail -f /dev/null
