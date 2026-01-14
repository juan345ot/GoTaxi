#!/bin/bash

# GoTaxi Setup Script
# This script sets up the development environment for GoTaxi

set -e

echo "🚕 Setting up GoTaxi development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is installed
check_mongodb() {
    print_status "Checking MongoDB installation..."
    if command -v mongod &> /dev/null; then
        MONGODB_VERSION=$(mongod --version | head -n1)
        print_success "MongoDB is installed: $MONGODB_VERSION"
    else
        print_warning "MongoDB is not installed. Please install MongoDB 5+ from https://www.mongodb.com/"
        print_warning "You can also use Docker: docker run -d -p 27017:27017 mongo:5.0"
    fi
}

# Check if Git is installed
check_git() {
    print_status "Checking Git installation..."
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git is installed: $GIT_VERSION"
    else
        print_error "Git is not installed. Please install Git from https://git-scm.com/"
        exit 1
    fi
}

# Install dependencies for backend
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd go-taxi-backend
    if [ -f package-lock.json ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    print_success "Backend dependencies installed"
}

# Install dependencies for frontend mobile
install_mobile_deps() {
    print_status "Installing frontend mobile dependencies..."
    cd GoTaxiPassengerApp
    if [ -f package-lock.json ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    print_success "Frontend mobile dependencies installed"
}

# Install dependencies for admin panel
install_admin_deps() {
    print_status "Installing admin panel dependencies..."
    cd go-taxi-admin-web
    if [ -f package-lock.json ]; then
        npm ci
    else
        npm install
    fi
    cd ..
    print_success "Admin panel dependencies installed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f go-taxi-backend/.env ]; then
        cp go-taxi-backend/.env.example go-taxi-backend/.env
        print_success "Created go-taxi-backend/.env"
    else
        print_warning "go-taxi-backend/.env already exists"
    fi
    
    # Frontend mobile .env
    if [ ! -f GoTaxiPassengerApp/.env ]; then
        cp GoTaxiPassengerApp/.env.example GoTaxiPassengerApp/.env
        print_success "Created GoTaxiPassengerApp/.env"
    else
        print_warning "GoTaxiPassengerApp/.env already exists"
    fi
    
    # Admin panel .env
    if [ ! -f go-taxi-admin-web/.env ]; then
        cp go-taxi-admin-web/.env.example go-taxi-admin-web/.env
        print_success "Created go-taxi-admin-web/.env"
    else
        print_warning "go-taxi-admin-web/.env already exists"
    fi
}

# Install global dependencies
install_global_deps() {
    print_status "Installing global dependencies..."
    
    # Install Expo CLI
    if ! command -v expo &> /dev/null; then
        npm install -g @expo/cli
        print_success "Expo CLI installed"
    else
        print_success "Expo CLI already installed"
    fi
    
    # Install other global tools
    npm install -g nodemon jest eslint prettier
    print_success "Global dependencies installed"
}

# Run linting
run_lint() {
    print_status "Running linting..."
    
    # Backend
    cd go-taxi-backend
    npm run lint
    cd ..
    
    # Frontend mobile
    cd GoTaxiPassengerApp
    npm run lint
    cd ..
    
    # Admin panel
    cd go-taxi-admin-web
    npm run lint
    cd ..
    
    print_success "Linting completed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend
    cd go-taxi-backend
    npm test
    cd ..
    
    # Frontend mobile
    cd GoTaxiPassengerApp
    npm test
    cd ..
    
    # Admin panel
    cd go-taxi-admin-web
    npm test
    cd ..
    
    print_success "Tests completed"
}

# Main setup function
main() {
    echo "🚕 GoTaxi Development Environment Setup"
    echo "======================================"
    
    # Check prerequisites
    check_node
    check_mongodb
    check_git
    
    # Install dependencies
    install_global_deps
    install_backend_deps
    install_mobile_deps
    install_admin_deps
    
    # Create environment files
    create_env_files
    
    # Run linting and tests
    run_lint
    run_tests
    
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your environment variables in the .env files"
    echo "2. Start MongoDB: mongod"
    echo "3. Start the backend: cd go-taxi-backend && npm run dev"
    echo "4. Start the mobile app: cd GoTaxiPassengerApp && npm start"
    echo "5. Start the admin panel: cd go-taxi-admin-web && npm run dev"
    echo ""
    echo "For more information, see the documentation in the docs/ folder."
}

# Run main function
main "$@"
