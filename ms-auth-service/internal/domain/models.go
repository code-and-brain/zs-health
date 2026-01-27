package domain

import (
	"time"
)

// User represents the identity of a system user
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // Never export password
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Roles     []string  `json:"roles"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// LoginRequest is the payload for authentication
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthResponse is returned after successful login
type AuthResponse struct {
	User         User   `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token,omitempty"`
}

// AuthRepository defines the interface for auth data access
type AuthRepository interface {
	GetByUsername(username string) (*User, error)
	Create(u *User) error
	GetByID(id string) (*User, error)
}
