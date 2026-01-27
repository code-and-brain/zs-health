package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/zs-health/ms-patient-registry/internal/domain"
)

type PatientHandler struct {
	repo domain.PatientRepository
}

func NewPatientHandler(repo domain.PatientRepository) *PatientHandler {
	return &PatientHandler{repo: repo}
}

func (h *PatientHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/api/v1/patients", h.CreatePatient).Methods("POST")
	r.HandleFunc("/api/v1/patients/{id}", h.GetPatient).Methods("GET")
	r.HandleFunc("/api/v1/patients", h.ListPatients).Methods("GET")
}

func (h *PatientHandler) CreatePatient(w http.ResponseWriter, r *http.Request) {
	var req domain.CreatePatientRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	dob, _ := time.Parse("2006-01-02", req.DateOfBirth)

	patient := &domain.Patient{
		ID:          uuid.New().String(),
		MRN:         "MRN-" + strconv.FormatInt(time.Now().Unix(), 10),
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		DateOfBirth: dob,
		Gender:      req.Gender,
		Phone:       req.Phone,
		Email:       req.Email,
		Address:     req.Address,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.repo.Create(patient); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(patient)
}

func (h *PatientHandler) GetPatient(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	patient, err := h.repo.GetByID(id)
	if err != nil {
		http.Error(w, "Patient not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patient)
}

func (h *PatientHandler) ListPatients(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 { page = 1 }
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 { limit = 10 }

	patients, total, err := h.repo.List(page, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"data":  patients,
		"total": total,
		"page":  page,
		"limit": limit,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
