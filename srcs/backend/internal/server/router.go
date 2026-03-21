package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"hhc/internal/database"
)

type User struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type HelloResponse struct {
	Message string `json:"message"`
}

type HealthResponse struct {
	Status string    `json:"status"`
	Time   time.Time `json:"time"`
}

type testResponse struct {
	Test string `json:"message"`
}

type PatientVaccination struct {
	IDPatient     string  `json:"id_patient"`
	Prenom        string  `json:"prenom"`
	Nom           string  `json:"nom"`
	Age           int     `json:"age"`
	Sexe          string  `json:"sexe"`
	DernierVaccin *string `json:"dernier_vaccin,omitempty"`
}

type PatientHealth struct {
	IDPatient string   `json:"id_patient"`
	IMC       *float64 `json:"imc,omitempty"`
	Fumeur    *bool    `json:"fumeur,omitempty"`
}

type PatientRdv struct {
	IDPatient string  `json:"id_patient"`
	Prenom    string  `json:"prenom"`
	Nom       string  `json:"nom"`
	Rdv       *string `json:"rdv,omitempty"`
}

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	resp := HelloResponse{Message: "Hello from Go backend!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	resp := HealthResponse{
		Status: "ok",
		Time:   time.Now(),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func Test(w http.ResponseWriter, r *http.Request) {
	resp := testResponse{
		Test: "test ok",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func CheckDatabaseHealth(w http.ResponseWriter, r *http.Request) {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbPort := os.Getenv("DB_PORT")

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
		dbUser,
		dbPassword,
		os.Getenv("DB_HOST"),
		dbPort,
		dbName,
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Erreur ouverture DB: %v", err)
	}

	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Impossible de se connecter: %v", err)
	}

	id := r.URL.Query().Get("id")

	var u User
	err2 := db.QueryRow("SELECT id, login, email FROM client WHERE id = ?", id).Scan(&u.ID, &u.Name, &u.Email)

	if err2 == sql.ErrNoRows {
		http.Error(w, "User not found", 404)
		return
	}
	if err2 != nil {
		http.Error(w, err2.Error(), 500)
		return
	}

	resp := User{
		ID:    u.ID,
		Name:  u.Name,
		Email: u.Email,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func OverdueFluVaccinesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	const query = `
SELECT 
    p.id_patient,
    p.prenom,
    p.nom,
    p.age,
    p.sexe,
    MAX(v.date_vaccin) AS dernier_vaccin
FROM patients p
LEFT JOIN vaccinations v 
    ON p.id_patient = v.id_patient
    AND v.type_vaccin = 'grippe'
GROUP BY p.id_patient, p.prenom, p.nom, p.age, p.sexe
ORDER BY dernier_vaccin ASC`

	rows, err := database.Db.Query(query)
	if err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de l'exécution de la requête: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []PatientVaccination
	for rows.Next() {
		var patient PatientVaccination
		var lastVaccin sql.NullTime

		if err := rows.Scan(&patient.IDPatient, &patient.Prenom, &patient.Nom, &patient.Age, &patient.Sexe, &lastVaccin); err != nil {
			http.Error(w, fmt.Sprintf("erreur lors de la lecture des résultats: %v", err), http.StatusInternalServerError)
			return
		}

		if lastVaccin.Valid {
			formatted := lastVaccin.Time.Format("2006-01-02")
			patient.DernierVaccin = &formatted
		}

		results = append(results, patient)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de la lecture des résultats: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de l'encodage des données: %v", err), http.StatusInternalServerError)
		return
	}
}

func PatientsImcFumeurHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	const query = `SELECT id_patient, imc, fumeur FROM patients`

	rows, err := database.Db.Query(query)
	if err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de l'exécution de la requête: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []PatientHealth
	for rows.Next() {
		var patient PatientHealth
		var imc sql.NullFloat64
		var fumeur sql.NullBool

		if err := rows.Scan(&patient.IDPatient, &imc, &fumeur); err != nil {
			http.Error(w, fmt.Sprintf("erreur lors de la lecture des résultats: %v", err), http.StatusInternalServerError)
			return
		}

		if imc.Valid {
			patient.IMC = &imc.Float64
		}
		if fumeur.Valid {
			patient.Fumeur = &fumeur.Bool
		}

		results = append(results, patient)
	}

	if err := rows.Err(); err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de la lecture des résultats: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de l'encodage des données: %v", err), http.StatusInternalServerError)
		return
	}
}

func PatientRdvHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	patientID := r.URL.Query().Get("id")
	if patientID == "" {
		http.Error(w, "parametre 'id' manquant", http.StatusBadRequest)
		return
	}

	const query = `
SELECT id_patient, prenom, nom, rdv
FROM patients
WHERE id_patient = ?`

	var patient PatientRdv
	var rdv sql.NullTime

	err := database.Db.QueryRow(query, patientID).Scan(&patient.IDPatient, &patient.Prenom, &patient.Nom, &rdv)
	if err == sql.ErrNoRows {
		http.Error(w, "patient non trouve", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de la lecture des données: %v", err), http.StatusInternalServerError)
		return
	}

	if rdv.Valid {
		formatted := rdv.Time.Format("2006-01-02")
		patient.Rdv = &formatted
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(patient); err != nil {
		http.Error(w, fmt.Sprintf("erreur lors de l'encodage des données: %v", err), http.StatusInternalServerError)
		return
	}
}
