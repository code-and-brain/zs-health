package http

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/zs-health/ms-auth-service/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	repo domain.AuthRepository
}

func NewAuthHandler(repo domain.AuthRepository) *AuthHandler {
	return &AuthHandler{repo: repo}
}

func (h *AuthHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/api/v1/auth/login", h.Login).Methods("POST")
	r.HandleFunc("/api/v1/auth/register", h.Register).Methods("POST")
	r.HandleFunc("/api/v1/auth/validate", h.Validate).Methods("GET")
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	user, err := h.repo.GetByUsername(req.Username)
	if err != nil {
		// In production, use generic error to prevent enumeration
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, _ := h.generateToken(user)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(domain.AuthResponse{
		User:        *user,
		AccessToken: token,
	})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var user domain.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.ID = uuid.New().String()
	user.Password = string(hashedPassword)
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	if err := h.repo.Create(&user); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) Validate(w http.ResponseWriter, r *http.Request) {
	// Simple validation for demonstration
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"valid": true}`))
}

func (h *AuthHandler) generateToken(user *domain.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID,
		"name":  user.Username,
		"roles": user.Roles,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
