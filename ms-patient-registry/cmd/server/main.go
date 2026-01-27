package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	patientHandler "github.com/zs-health/ms-patient-registry/internal/handler/http"
	"github.com/zs-health/ms-patient-registry/internal/infrastructure/database"
)

func main() {
	// Load environment variables
	godotenv.Load()

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@localhost:5432/zs_health?sslmode=disable"
	}

	// Initialize repository
	repo, err := database.NewPostgresRepository(dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize handlers
	handler := patientHandler.NewPatientHandler(repo)

	// Setup router
	r := mux.NewRouter()
	handler.RegisterRoutes(r)

	// Add health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Printf("Patient Registry Service starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
