package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
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
