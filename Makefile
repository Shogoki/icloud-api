.PHONY: build run clean docker-build docker-run docker-clean help

# Variables
APP_NAME = icloud-album-api
BINARY_NAME = api
PORT = 8080

help:
	@echo "Available commands:"
	@echo "  make build        - Build the Go binary"
	@echo "  make run         - Run the application locally"
	@echo "  make clean       - Remove binary and clean up"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run  - Run Docker container"
	@echo "  make docker-clean - Remove Docker image"

build:
	@echo "Building $(BINARY_NAME)..."
	@go build -o $(BINARY_NAME) main.go

run: build
	@echo "Running $(BINARY_NAME)..."
	@./$(BINARY_NAME)

clean:
	@echo "Cleaning up..."
	@rm -f $(BINARY_NAME)
	@go clean

docker-build:
	@echo "Building Docker image..."
	docker build -t $(APP_NAME) .

docker-run: docker-build
	@echo "Running Docker container..."
	docker run -p $(PORT):$(PORT) $(APP_NAME)

docker-clean:
	@echo "Removing Docker image..."
	docker rmi $(APP_NAME)

# Development helpers
dev:
	@echo "Starting development server with hot reload..."
	@which air > /dev/null || go install github.com/cosmtrek/air@latest
	air

test:
	@echo "Running tests..."
	@go test -v ./...

lint:
	@echo "Running linter..."
	@which golangci-lint > /dev/null || go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	golangci-lint run
