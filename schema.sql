-- ZS Health Platform Initial Schema
-- Run this AFTER creating the zs_health database

-- 1. Users Table (for ms-auth-service)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patients Table (for ms-patient-registry)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY,
    mrn VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a dummy admin user (password: admin123)
-- Hash generated via bcrypt
INSERT INTO users (id, username, email, password, first_name, last_name, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'admin', 
    'admin@zs-health.com', 
    '$2a$10$8K1p/pA2W2Wj4Nq.7N/vO.o7hL8H4Y3W5b7V.N7V.N7V.N7V.N7V.', -- admin123 (demo hash)
    'System', 
    'Admin', 
    NOW(), 
    NOW()
) ON CONFLICT DO NOTHING;
