# GoTaxi Setup Script for Windows
# This script sets up the development environment for GoTaxi

param(
    [switch]$SkipTests,
    [switch]$SkipLint
)

Write-Host "🚕 Setting up GoTaxi development environment..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
function Test-Node {
    Write-Status "Checking Node.js installation..."
    try {
        $nodeVersion = node --version
        Write-Success "Node.js is installed: $nodeVersion"
        return $true
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        return $false
    }
}

# Check if MongoDB is installed
function Test-MongoDB {
    Write-Status "Checking MongoDB installation..."
    try {
        $mongodbVersion = mongod --version
        Write-Success "MongoDB is installed"
        return $true
    }
    catch {
        Write-Warning "MongoDB is not installed. Please install MongoDB 5+ from https://www.mongodb.com/"
        Write-Warning "You can also use Docker: docker run -d -p 27017:27017 mongo:5.0"
        return $false
    }
}

# Check if Git is installed
function Test-Git {
    Write-Status "Checking Git installation..."
    try {
        $gitVersion = git --version
        Write-Success "Git is installed: $gitVersion"
        return $true
    }
    catch {
        Write-Error "Git is not installed. Please install Git from https://git-scm.com/"
        return $false
    }
}

# Install dependencies for backend
function Install-BackendDeps {
    Write-Status "Installing backend dependencies..."
    Set-Location go-taxi-backend
    try {
        if (Test-Path package-lock.json) {
            npm ci
        }
        else {
            npm install
        }
        Write-Success "Backend dependencies installed"
    }
    catch {
        Write-Error "Failed to install backend dependencies"
        throw
    }
    finally {
        Set-Location ..
    }
}

# Install dependencies for frontend mobile
function Install-MobileDeps {
    Write-Status "Installing frontend mobile dependencies..."
    Set-Location GoTaxiPassengerApp
    try {
        if (Test-Path package-lock.json) {
            npm ci
        }
        else {
            npm install
        }
        Write-Success "Frontend mobile dependencies installed"
    }
    catch {
        Write-Error "Failed to install frontend mobile dependencies"
        throw
    }
    finally {
        Set-Location ..
    }
}

# Install dependencies for admin panel
function Install-AdminDeps {
    Write-Status "Installing admin panel dependencies..."
    Set-Location go-taxi-admin-web
    try {
        if (Test-Path package-lock.json) {
            npm ci
        }
        else {
            npm install
        }
        Write-Success "Admin panel dependencies installed"
    }
    catch {
        Write-Error "Failed to install admin panel dependencies"
        throw
    }
    finally {
        Set-Location ..
    }
}

# Create environment files
function New-EnvFiles {
    Write-Status "Creating environment files..."
    
    # Backend .env
    if (-not (Test-Path "go-taxi-backend/.env")) {
        Copy-Item "go-taxi-backend/.env.example" "go-taxi-backend/.env"
        Write-Success "Created go-taxi-backend/.env"
    }
    else {
        Write-Warning "go-taxi-backend/.env already exists"
    }
    
    # Frontend mobile .env
    if (-not (Test-Path "GoTaxiPassengerApp/.env")) {
        Copy-Item "GoTaxiPassengerApp/.env.example" "GoTaxiPassengerApp/.env"
        Write-Success "Created GoTaxiPassengerApp/.env"
    }
    else {
        Write-Warning "GoTaxiPassengerApp/.env already exists"
    }
    
    # Admin panel .env
    if (-not (Test-Path "go-taxi-admin-web/.env")) {
        Copy-Item "go-taxi-admin-web/.env.example" "go-taxi-admin-web/.env"
        Write-Success "Created go-taxi-admin-web/.env"
    }
    else {
        Write-Warning "go-taxi-admin-web/.env already exists"
    }
}

# Install global dependencies
function Install-GlobalDeps {
    Write-Status "Installing global dependencies..."
    
    # Install Expo CLI
    try {
        $expoVersion = expo --version
        Write-Success "Expo CLI already installed: $expoVersion"
    }
    catch {
        npm install -g @expo/cli
        Write-Success "Expo CLI installed"
    }
    
    # Install other global tools
    npm install -g nodemon jest eslint prettier
    Write-Success "Global dependencies installed"
}

# Run linting
function Invoke-Lint {
    if ($SkipLint) {
        Write-Warning "Skipping linting"
        return
    }
    
    Write-Status "Running linting..."
    
    # Backend
    Set-Location go-taxi-backend
    npm run lint
    Set-Location ..
    
    # Frontend mobile
    Set-Location GoTaxiPassengerApp
    npm run lint
    Set-Location ..
    
    # Admin panel
    Set-Location go-taxi-admin-web
    npm run lint
    Set-Location ..
    
    Write-Success "Linting completed"
}

# Run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping tests"
        return
    }
    
    Write-Status "Running tests..."
    
    # Backend
    Set-Location go-taxi-backend
    npm test
    Set-Location ..
    
    # Frontend mobile
    Set-Location GoTaxiPassengerApp
    npm test
    Set-Location ..
    
    # Admin panel
    Set-Location go-taxi-admin-web
    npm test
    Set-Location ..
    
    Write-Success "Tests completed"
}

# Main setup function
function Start-Setup {
    Write-Host "🚕 GoTaxi Development Environment Setup" -ForegroundColor Blue
    Write-Host "======================================" -ForegroundColor Blue
    
    # Check prerequisites
    if (-not (Test-Node)) { exit 1 }
    if (-not (Test-MongoDB)) { Write-Warning "MongoDB not found, but continuing..." }
    if (-not (Test-Git)) { exit 1 }
    
    # Install dependencies
    Install-GlobalDeps
    Install-BackendDeps
    Install-MobileDeps
    Install-AdminDeps
    
    # Create environment files
    New-EnvFiles
    
    # Run linting and tests
    Invoke-Lint
    Invoke-Tests
    
    Write-Host ""
    Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Configure your environment variables in the .env files"
    Write-Host "2. Start MongoDB: mongod"
    Write-Host "3. Start the backend: cd go-taxi-backend; npm run dev"
    Write-Host "4. Start the mobile app: cd GoTaxiPassengerApp; npm start"
    Write-Host "5. Start the admin panel: cd go-taxi-admin-web; npm run dev"
    Write-Host ""
    Write-Host "For more information, see the documentation in the docs/ folder." -ForegroundColor Cyan
}

# Run main function
Start-Setup
