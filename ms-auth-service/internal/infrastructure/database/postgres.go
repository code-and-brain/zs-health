package database

import (
	"database/sql"

	_ "github.com/lib/pq"
	"github.com/zs-health/ms-auth-service/internal/domain"
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

func (r *PostgresRepository) GetByUsername(username string) (*domain.User, error) {
	query := `SELECT id, username, email, password, first_name, last_name, created_at, updated_at FROM users WHERE username = $1`
	u := &domain.User{}
	err := r.db.QueryRow(query, username).Scan(&u.ID, &u.Username, &u.Email, &u.Password, &u.FirstName, &u.LastName, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *PostgresRepository) Create(u *domain.User) error {
	query := `INSERT INTO users (id, username, email, password, first_name, last_name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := r.db.Exec(query, u.ID, u.Username, u.Email, u.Password, u.FirstName, u.LastName, u.CreatedAt, u.UpdatedAt)
	return err
}

func (r *PostgresRepository) GetByID(id string) (*domain.User, error) {
	query := `SELECT id, username, email, first_name, last_name, created_at, updated_at FROM users WHERE id = $1`
	u := &domain.User{}
	err := r.db.QueryRow(query, id).Scan(&u.ID, &u.Username, &u.Email, &u.FirstName, &u.LastName, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}
