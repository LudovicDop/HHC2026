package handlers

import (
	"net/http"
	routes "hhc/internal/server"
)

func InitHandler() {
	http.HandleFunc("/api/hello", routes.HelloHandler)
}
