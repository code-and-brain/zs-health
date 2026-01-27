package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	authHandler "github.com/zs-health/ms-auth-service/internal/handler/http"
	"github.com/zs-health/ms-auth-service/internal/infrastructure/database"
)

func main() {
	godotenv.Load()

	// Use a dummy repo for initialization if no DB yet
	// In production, connect to real DB
	dsn := os.Getenv("DATABASE_URL")
	repo, err := database.NewPostgresRepository(dsn)
	if err != nil {
		log.Printf("Warning: Database connection failed (expected during init): %v", err)
	}

	handler := authHandler.NewAuthHandler(repo)
	r := mux.NewRouter()
	handler.RegisterRoutes(r)

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("GET")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Auth Service starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
