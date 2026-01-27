package domain

import (
	"time"
)

// Patient represents the core patient entity
type Patient struct {
	ID          string    `json:"id"`
	MRN         string    `json:"mrn"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Gender      string    `json:"gender"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	Address     Address   `json:"address"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Address represents a patient's physical address
type Address struct {
	Line1      string `json:"line1"`
	Line2      string `json:"line2"`
	City       string `json:"city"`
	State      string `json:"state"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
}

// CreatePatientRequest is the payload for creating a new patient
type CreatePatientRequest struct {
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	DateOfBirth string  `json:"date_of_birth"`
	Gender      string  `json:"gender"`
	Phone       string  `json:"phone"`
	Email       string  `json:"email"`
	Address     Address `json:"address"`
}

// PatientRepository defines the interface for data access
type PatientRepository interface {
	Create(p *Patient) error
	GetByID(id string) (*Patient, error)
	List(page, limit int) ([]Patient, int, error)
}
