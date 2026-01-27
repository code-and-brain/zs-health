# 🔒 GOLANG MICROSERVICES IMPLEMENTATION GUIDE
## Production-Grade Backend Architecture for zs-health Platform

**Version**: 1.0.0  
**Date**: January 26, 2026  
**Target**: Go 1.25.x Microservices  

---

## TABLE OF CONTENTS

1. [Microservice Scaffolding](#microservice-scaffolding)
2. [API Standards](#api-standards)
3. [Database Layer](#database-layer)
4. [FHIR Integration](#fhir-integration)
5. [Testing Strategy](#testing-strategy)
6. [Security Implementation](#security-implementation)
7. [Deployment](#deployment)

---

## MICROSERVICE SCAFFOLDING

### Project Structure Template

```
ms-{service-name}/
├── cmd/
│   ├── server/
│   │   └── main.go                    # Entry point
│   └── cli/
│       └── main.go                    # CLI tools
│
├── internal/
│   ├── domain/                        # Business logic
│   │   ├── models.go
│   │   ├── service.go
│   │   └── repository.go
│   │
│   ├── infrastructure/                # External integrations
│   │   ├── database/
│   │   │   ├── postgres.go
│   │   │   ├── redis.go
│   │   │   └── migrations/
│   │   │       ├── 001_create_tables.sql
│   │   │       └── 002_add_indexes.sql
│   │   │
│   │   └── cache/
│   │       └── redis_cache.go
│   │
│   ├── handler/                       # API handlers
│   │   ├── http/
│   │   │   ├── patient_handler.go
│   │   │   └── router.go
│   │   │
│   │   └── grpc/
│   │       ├── patient_grpc.pb.go
│   │       └── server.go
│   │
│   ├── config/
│   │   ├── config.go
│   │   └── env.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── logging.go
│   │   ├── cors.go
│   │   └── error_handler.go
│   │
│   └── utils/
│       ├── logger.go
│       ├── errors.go
│       └── validators.go
│
├── pkg/
│   ├── models/                        # Shared models
│   │   └── patient.go
│   │
│   └── fhir/                          # FHIR specific
│       ├── converter.go
│       └── validator.go
│
├── proto/                             # gRPC definitions
│   ├── patient.proto
│   └── patient_grpc.pb.go
│
├── api/                               # OpenAPI specs
│   └── patient-service-openapi.yaml
│
├── tests/
│   ├── unit/
│   │   └── service_test.go
│   │
│   ├── integration/
│   │   └── api_test.go
│   │
│   └── fixtures/
│       └── test_data.json
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.alpine
│   └── compose.yaml
│
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── secret.yaml
│
├── scripts/
│   ├── migrate.sh
│   ├── generate.sh
│   └── build.sh
│
├── go.mod
├── go.sum
├── Makefile
├── README.md
└── .env.example
```

---

## API STANDARDS

### RESTful API Implementation

**Example: Patient Registry Service**

```go
package http

import (
    "encoding/json"
    "net/http"
    "github.com/zs-health/ms-patient-registry/internal/domain"
    "github.com/zs-health/ms-patient-registry/pkg/models"
)

// PatientHandler handles patient-related HTTP requests
type PatientHandler struct {
    service domain.PatientService
    logger  domain.Logger
}

// CreatePatient creates a new patient
func (h *PatientHandler) CreatePatient(w http.ResponseWriter, r *http.Request) {
    var req models.CreatePatientRequest
    
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.respondError(w, http.StatusBadRequest, "Invalid request body")
        return
    }
    
    // Validate request
    if err := req.Validate(); err != nil {
        h.respondError(w, http.StatusBadRequest, err.Error())
        return
    }
    
    // Call service
    patient, err := h.service.CreatePatient(r.Context(), req)
    if err != nil {
        h.respondError(w, http.StatusInternalServerError, "Failed to create patient")
        return
    }
    
    h.respondJSON(w, http.StatusCreated, patient)
}

// GetPatient retrieves a patient by ID
func (h *PatientHandler) GetPatient(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    
    patient, err := h.service.GetPatient(r.Context(), id)
    if err != nil {
        h.respondError(w, http.StatusNotFound, "Patient not found")
        return
    }
    
    h.respondJSON(w, http.StatusOK, patient)
}

// ListPatients lists all patients with pagination
func (h *PatientHandler) ListPatients(w http.ResponseWriter, r *http.Request) {
    page := r.URL.Query().Get("page")
    limit := r.URL.Query().Get("limit")
    
    patients, total, err := h.service.ListPatients(r.Context(), page, limit)
    if err != nil {
        h.respondError(w, http.StatusInternalServerError, "Failed to list patients")
        return
    }
    
    response := map[string]interface{}{
        "data": patients,
        "pagination": map[string]int{
            "total": total,
        },
    }
    
    h.respondJSON(w, http.StatusOK, response)
}

// Response helpers
func (h *PatientHandler) respondJSON(w http.ResponseWriter, code int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "success",
        "data": data,
    })
}

func (h *PatientHandler) respondError(w http.ResponseWriter, code int, message string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "status": "error",
        "error": message,
    })
}
```

### gRPC Service Implementation

```protobuf
// proto/patient.proto
syntax = "proto3";

package zs.health.patient;

import "google/protobuf/timestamp.proto";

service PatientService {
    rpc CreatePatient(CreatePatientRequest) returns (PatientResponse);
    rpc GetPatient(GetPatientRequest) returns (Patient);
    rpc UpdatePatient(UpdatePatientRequest) returns (PatientResponse);
    rpc DeletePatient(DeletePatientRequest) returns (DeletePatientResponse);
    rpc ListPatients(ListPatientsRequest) returns (ListPatientsResponse);
    rpc SearchPatients(SearchPatientRequest) returns (SearchPatientResponse);
}

message Patient {
    string id = 1;
    string mrn = 2;
    string first_name = 3;
    string last_name = 4;
    string date_of_birth = 5;
    string gender = 6;
    string phone = 7;
    string email = 8;
    Address address = 9;
    google.protobuf.Timestamp created_at = 10;
    google.protobuf.Timestamp updated_at = 11;
}

message Address {
    string line1 = 1;
    string line2 = 2;
    string city = 3;
    string state = 4;
    string postal_code = 5;
    string country = 6;
}

message CreatePatientRequest {
    string first_name = 1;
    string last_name = 2;
    string date_of_birth = 3;
    string gender = 4;
    string phone = 5;
    string email = 6;
    Address address = 7;
}

message PatientResponse {
    bool success = 1;
    Patient patient = 2;
    string message = 3;
}

message GetPatientRequest {
    string id = 1;
}

message UpdatePatientRequest {
    string id = 1;
    Patient patient = 2;
}

message DeletePatientRequest {
    string id = 1;
}

message DeletePatientResponse {
    bool success = 1;
    string message = 2;
}

message ListPatientsRequest {
    int32 page = 1;
    int32 page_size = 2;
}

message ListPatientsResponse {
    repeated Patient patients = 1;
    int32 total = 2;
    int32 page = 3;
    int32 page_size = 4;
}

message SearchPatientRequest {
    string mrn = 1;
    string first_name = 2;
    string last_name = 3;
    string date_of_birth = 4;
}

message SearchPatientResponse {
    repeated Patient patients = 1;
}
```

---

## DATABASE LAYER

### PostgreSQL Integration

```go
package database

import (
    "context"
    "database/sql"
    "fmt"
    _ "github.com/lib/pq"
)

type Database struct {
    db *sql.DB
}

func New(dsn string) (*Database, error) {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }
    
    if err := db.PingContext(context.Background()); err != nil {
        return nil, err
    }
    
    return &Database{db: db}, nil
}

func (d *Database) CreatePatient(ctx context.Context, patient *models.Patient) error {
    query := `
        INSERT INTO patients (id, mrn, first_name, last_name, date_of_birth, 
                            gender, phone, email, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `
    
    _, err := d.db.ExecContext(ctx, query,
        patient.ID,
        patient.MRN,
        patient.FirstName,
        patient.LastName,
        patient.DateOfBirth,
        patient.Gender,
        patient.Phone,
        patient.Email,
        patient.CreatedAt,
        patient.UpdatedAt,
    )
    
    return err
}

func (d *Database) GetPatient(ctx context.Context, id string) (*models.Patient, error) {
    query := `
        SELECT id, mrn, first_name, last_name, date_of_birth, gender, phone, email, created_at, updated_at
        FROM patients
        WHERE id = $1
    `
    
    patient := &models.Patient{}
    err := d.db.QueryRowContext(ctx, query, id).Scan(
        &patient.ID,
        &patient.MRN,
        &patient.FirstName,
        &patient.LastName,
        &patient.DateOfBirth,
        &patient.Gender,
        &patient.Phone,
        &patient.Email,
        &patient.CreatedAt,
        &patient.UpdatedAt,
    )
    
    return patient, err
}

func (d *Database) ListPatients(ctx context.Context, page, pageSize int) ([]models.Patient, int, error) {
    // Count total
    countQuery := "SELECT COUNT(*) FROM patients"
    var total int
    if err := d.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
        return nil, 0, err
    }
    
    // Fetch records
    offset := (page - 1) * pageSize
    query := `
        SELECT id, mrn, first_name, last_name, date_of_birth, gender, phone, email, created_at, updated_at
        FROM patients
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `
    
    rows, err := d.db.QueryContext(ctx, query, pageSize, offset)
    if err != nil {
        return nil, 0, err
    }
    defer rows.Close()
    
    patients := []models.Patient{}
    for rows.Next() {
        var p models.Patient
        if err := rows.Scan(&p.ID, &p.MRN, &p.FirstName, &p.LastName, &p.DateOfBirth, 
                           &p.Gender, &p.Phone, &p.Email, &p.CreatedAt, &p.UpdatedAt); err != nil {
            return nil, 0, err
        }
        patients = append(patients, p)
    }
    
    return patients, total, rows.Err()
}

func (d *Database) Close() error {
    return d.db.Close()
}
```

---

## FHIR INTEGRATION

### FHIR Resource Conversion

```go
package fhir

import (
    "github.com/samply/golang-fhir-models/fhir-models/fhir"
    "github.com/zs-health/ms-patient-registry/pkg/models"
)

// ConvertToFHIRPatient converts domain patient to FHIR Patient resource
func ConvertToFHIRPatient(p *models.Patient) *fhir.Patient {
    return &fhir.Patient{
        ResourceType: fhir.String("Patient"),
        Id:           fhir.String(p.ID),
        Identifier: []fhir.Identifier{
            {
                System: fhir.String("urn:mrn"),
                Value:  fhir.String(p.MRN),
            },
        },
        Name: []fhir.HumanName{
            {
                Use:    fhir.String("official"),
                Family: fhir.String(p.LastName),
                Given:  []fhir.String{fhir.String(p.FirstName)},
            },
        },
        Gender:      fhir.String(p.Gender),
        BirthDate:   fhir.String(p.DateOfBirth.Format("2006-01-02")),
        Telecom: []fhir.ContactPoint{
            {
                System: fhir.String("phone"),
                Value:  fhir.String(p.Phone),
            },
            {
                System: fhir.String("email"),
                Value:  fhir.String(p.Email),
            },
        },
        Address: []fhir.Address{
            {
                Line:       []fhir.String{fhir.String(p.Address.Line1)},
                City:       fhir.String(p.Address.City),
                State:      fhir.String(p.Address.State),
                PostalCode: fhir.String(p.Address.PostalCode),
                Country:    fhir.String(p.Address.Country),
            },
        },
        Meta: &fhir.Meta{
            LastUpdated: fhir.String(p.UpdatedAt.Format("2006-01-02T15:04:05Z")),
        },
    }
}

// ConvertFromFHIRPatient converts FHIR Patient resource to domain patient
func ConvertFromFHIRPatient(fhirPatient *fhir.Patient) *models.Patient {
    p := &models.Patient{
        ID: *fhirPatient.Id,
    }
    
    if len(fhirPatient.Identifier) > 0 {
        p.MRN = *fhirPatient.Identifier[0].Value
    }
    
    if len(fhirPatient.Name) > 0 {
        p.FirstName = (*fhirPatient.Name[0].Given)[0].String()
        p.LastName = *fhirPatient.Name[0].Family
    }
    
    p.Gender = *fhirPatient.Gender
    p.DateOfBirth = parseDate(*fhirPatient.BirthDate)
    
    return p
}

// ValidateFHIRPatient validates FHIR Patient resource
func ValidateFHIRPatient(p *fhir.Patient) error {
    if p.Id == nil || *p.Id == "" {
        return NewValidationError("Patient ID is required")
    }
    
    if len(p.Name) == 0 {
        return NewValidationError("Patient name is required")
    }
    
    return nil
}
```

---

## TESTING STRATEGY

### Unit Tests

```go
package domain

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/zs-health/ms-patient-registry/internal/domain"
    "github.com/zs-health/ms-patient-registry/pkg/models"
)

func TestCreatePatient_Success(t *testing.T) {
    // Arrange
    mockRepo := &MockPatientRepository{}
    service := domain.NewPatientService(mockRepo)
    
    req := models.CreatePatientRequest{
        FirstName:   "Ahmad",
        LastName:    "Hassan",
        DateOfBirth: "1990-01-01",
        Gender:      "M",
        Phone:       "01712345678",
        Email:       "ahmad@example.com",
    }
    
    // Act
    patient, err := service.CreatePatient(context.Background(), req)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, patient)
    assert.Equal(t, "Ahmad", patient.FirstName)
    assert.Equal(t, "Hassan", patient.LastName)
}

func TestCreatePatient_InvalidEmail(t *testing.T) {
    mockRepo := &MockPatientRepository{}
    service := domain.NewPatientService(mockRepo)
    
    req := models.CreatePatientRequest{
        FirstName: "Ahmad",
        LastName:  "Hassan",
        Email:     "invalid-email",
    }
    
    _, err := service.CreatePatient(context.Background(), req)
    assert.Error(t, err)
}

type MockPatientRepository struct{}

func (m *MockPatientRepository) Create(ctx context.Context, p *models.Patient) error {
    return nil
}

func (m *MockPatientRepository) Get(ctx context.Context, id string) (*models.Patient, error) {
    return &models.Patient{ID: id}, nil
}
```

### Integration Tests

```go
package integration

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/zs-health/ms-patient-registry/internal/infrastructure/database"
)

func TestCreatePatient_IntegrationTest(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer db.Close()
    
    // Create patient
    patient := &models.Patient{
        ID:        "test-patient-1",
        MRN:       "12345",
        FirstName: "Ahmad",
        LastName:  "Hassan",
    }
    
    err := db.CreatePatient(context.Background(), patient)
    assert.NoError(t, err)
    
    // Retrieve and verify
    retrieved, err := db.GetPatient(context.Background(), patient.ID)
    assert.NoError(t, err)
    assert.Equal(t, patient.FirstName, retrieved.FirstName)
}

func setupTestDB(t *testing.T) *database.Database {
    // Create test database connection
    // Run migrations
    // Return DB instance
}
```

---

## SECURITY IMPLEMENTATION

### Authentication Middleware

```go
package middleware

import (
    "net/http"
    "strings"
    "github.com/golang-jwt/jwt/v4"
)

func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Missing authorization header", http.StatusUnauthorized)
            return
        }
        
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
            return
        }
        
        token, err := jwt.Parse(parts[1], func(token *jwt.Token) (interface{}, error) {
            return []byte("your-secret-key"), nil
        })
        
        if err != nil || !token.Valid {
            http.Error(w, "Invalid token", http.StatusUnauthorized)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

### Rate Limiting

```go
package middleware

import (
    "net/http"
    "golang.org/x/time/rate"
)

var limiter = rate.NewLimiter(100, 200) // 100 req/sec, burst of 200

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
            return
        }
        
        next.ServeHTTP(w, r)
    })
}
```

---

## DEPLOYMENT

### Docker Configuration

```dockerfile
# Dockerfile
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Production image
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=builder /app/server .

EXPOSE 8080
CMD ["./server"]
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ms-patient-registry
  namespace: zs-health
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ms-patient-registry
  template:
    metadata:
      labels:
        app: ms-patient-registry
    spec:
      containers:
      - name: ms-patient-registry
        image: zs-health/ms-patient-registry:1.0.0
        ports:
        - containerPort: 8080
        - containerPort: 50051
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: postgres-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 26, 2026

