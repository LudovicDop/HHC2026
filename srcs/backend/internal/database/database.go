package database

import (
  "os"
  "fmt"
  "log"
  "database/sql"
)

var Db *sql.DB

func ConnectionToDatabaseInit() (*sql.DB, error) {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")
	dbHost := os.Getenv("DB_HOST")

maskedPwd := ""
if dbPassword != "" {
	maskedPwd = "****"
}

log.Printf("DB_USER=%q", dbUser)
log.Printf("DB_PASSWORD=%q (masked)", maskedPwd)
log.Printf("DB_NAME=%q", dbName)
log.Printf("DB_PORT=%q", dbPort)
log.Printf("DB_HOST=%q", dbHost)

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		dbUser,
		dbPassword,
		dbHost,
		dbPort,
		dbName,
	)
  var err error
  Db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Print("Erreur ouverture DB:", err)
		return Db, err
	}

	if err := Db.Ping(); err != nil {
		log.Print("Impossible de se connecter:", err)
		log.Fatal("Impossible de se connecter")
		return Db, err
	}

	return Db, nil
}




