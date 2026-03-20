package handlers

import (
	"net/http"
	routes "hhc/internal/server"
	openai "hhc/internal/openai"
)

func InitHandler() {
	http.HandleFunc("/api/hello", routes.HelloHandler)
	http.HandleFunc("/api/ai", openai.AiRequest)
}
