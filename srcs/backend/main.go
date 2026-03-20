package main

import (
	"log"
	"net/http"

	handlers "hhc/internal/handlers"
	_ "github.com/go-sql-driver/mysql"
  database "hhc/internal/database"
)

func main() {
  
  database.ConnectionToDatabaseInit()
	handlers.InitHandler()
	log.Println("Backend Go démarré sur :8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
    return ;
	}
}
