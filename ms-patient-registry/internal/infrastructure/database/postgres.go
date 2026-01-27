package database

import (
	"database/sql"
	_ "github.com/lib/pq"
	"github.com/zs-health/ms-patient-registry/internal/domain"
)

type PostgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(dsn string) (*PostgresRepository, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	return &PostgresRepository{db: db}, nil
}

func (r *PostgresRepository) Create(p *domain.Patient) error {
	query := `
		INSERT INTO patients (id, mrn, first_name, last_name, date_of_birth, gender, phone, email, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.Exec(query, p.ID, p.MRN, p.FirstName, p.LastName, p.DateOfBirth, p.Gender, p.Phone, p.Email, p.CreatedAt, p.UpdatedAt)
	return err
}

func (r *PostgresRepository) GetByID(id string) (*domain.Patient, error) {
	query := `SELECT id, mrn, first_name, last_name, date_of_birth, gender, phone, email, created_at, updated_at FROM patients WHERE id = $1`
	p := &domain.Patient{}
	err := r.db.QueryRow(query, id).Scan(&p.ID, &p.MRN, &p.FirstName, &p.LastName, &p.DateOfBirth, &p.Gender, &p.Phone, &p.Email, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *PostgresRepository) List(page, limit int) ([]domain.Patient, int, error) {
	var total int
	r.db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&total)

	offset := (page - 1) * limit
	query := `SELECT id, mrn, first_name, last_name, date_of_birth, gender, phone, email, created_at, updated_at FROM patients LIMIT $1 OFFSET $2`
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var patients []domain.Patient
	for rows.Next() {
		var p domain.Patient
		if err := rows.Scan(&p.ID, &p.MRN, &p.FirstName, &p.LastName, &p.DateOfBirth, &p.Gender, &p.Phone, &p.Email, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, 0, err
		}
		patients = append(patients, p)
	}
	return patients, total, nil
}
