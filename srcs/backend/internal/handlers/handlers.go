package handlers

import (
	openai "hhc/internal/openai"
	routes "hhc/internal/server"
	"net/http"
)

func InitHandler() {
	http.HandleFunc("/api/hello", routes.HelloHandler)
	http.HandleFunc("/api/ai", openai.AiRequest)
	http.HandleFunc("/api/patients/grippe/retard", routes.OverdueFluVaccinesHandler)
	http.HandleFunc("/api/patients/imc-fumeur", routes.PatientsImcFumeurHandler)
	http.HandleFunc("/api/patients/rdv", routes.PatientRdvHandler)
}
