# ZS Health Master Makefile

.PHONY: help install-tools build-all dev-up clean

help:
	@echo "ZS Health Platform Management"
	@echo "----------------------------"
	@echo "install-tools : Install recommended tools (pnpm, etc.)"
	@echo "build-all     : Build all microservices and frontend apps"
	@echo "dev-up        : Start core infrastructure and services"
	@echo "clean         : Remove build artifacts"

install-tools:
	@echo "Installing pnpm..."
	npm install -g pnpm
	@echo "Checking for Docker..."
	@docker --version || echo "Please install Docker manually: https://docs.docker.com/get-docker/"

init-db:
	@echo "Initializing ZS Health Database..."
	psql -h localhost -U postgres -c "CREATE DATABASE zs_health;" || echo "Database might already exist"

build-frontend:
	cd esm-core && npm run build

# Add more targets as microservices are scaffolded
