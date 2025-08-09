#!/bin/bash

# Krili Transaction Handler Setup Script
# This script sets up the Go transaction handler with all dependencies

set -e

echo "🚀 Setting up Krili Transaction Handler..."

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

# Check if Go is installed
check_go() {
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.21 or later."
        print_status "Visit: https://golang.org/doc/install"
        exit 1
    fi
    
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    print_success "Go $GO_VERSION is installed"
}

# Check if MySQL is installed and running
check_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL client not found. Please ensure MySQL is installed."
        print_status "Visit: https://dev.mysql.com/downloads/mysql/"
    else
        print_success "MySQL client is available"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p uploads
    mkdir -p backups
    mkdir -p certificates
    
    print_success "Directories created"
}

# Copy environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Environment file created from example"
            print_warning "Please edit .env file with your actual configuration values"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping..."
    fi
}

# Initialize Go modules
init_go_modules() {
    print_status "Initializing Go modules..."
    
    if [ ! -f go.mod ]; then
        go mod init krili-transaction-handler
    fi
    
    print_status "Downloading Go dependencies..."
    go mod tidy
    go mod download
    
    print_success "Go modules initialized"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    read -p "Do you want to setup the database now? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
        echo
        
        read -p "Enter database name (default: krili_db): " DB_NAME
        DB_NAME=${DB_NAME:-krili_db}
        
        read -p "Enter database user (default: krili_user): " DB_USER
        DB_USER=${DB_USER:-krili_user}
        
        read -p "Enter database password: " -s DB_PASSWORD
        echo
        
        print_status "Creating database and user..."
        
        mysql -u root -p$MYSQL_ROOT_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
        
        print_status "Running database schema..."
        mysql -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME < transaction_schema.sql
        
        print_success "Database setup completed"
        
        # Update .env file with database credentials
        sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
        sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
        
        print_success "Environment file updated with database credentials"
    else
        print_warning "Database setup skipped. Please setup manually using transaction_schema.sql"
    fi
}

# Generate security keys
generate_keys() {
    print_status "Generating security keys..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    
    # Generate encryption key
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
    
    print_success "Security keys generated and updated in .env file"
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    go build -o bin/transaction-handler transaction_handler.go
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
        print_status "Binary location: ./bin/transaction-handler"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Create systemd service file (Linux only)
create_service() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_status "Creating systemd service file..."
        
        CURRENT_DIR=$(pwd)
        USER=$(whoami)
        
        cat > krili-transaction.service << EOF
[Unit]
Description=Krili Transaction Handler
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/bin/transaction-handler
Restart=always
RestartSec=5
Environment=GIN_MODE=release

[Install]
WantedBy=multi-user.target
EOF
        
        print_success "Service file created: krili-transaction.service"
        print_status "To install the service, run:"
        print_status "  sudo cp krili-transaction.service /etc/systemd/system/"
        print_status "  sudo systemctl daemon-reload"
        print_status "  sudo systemctl enable krili-transaction"
        print_status "  sudo systemctl start krili-transaction"
    fi
}

# Create startup script
create_startup_script() {
    print_status "Creating startup script..."
    
    cat > start.sh << 'EOF'
#!/bin/bash

# Krili Transaction Handler Startup Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if binary exists
if [ ! -f bin/transaction-handler ]; then
    echo "Binary not found. Please run setup.sh first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application
echo "Starting Krili Transaction Handler..."
./bin/transaction-handler 2>&1 | tee logs/transaction-$(date +%Y%m%d).log
EOF
    
    chmod +x start.sh
    print_success "Startup script created: start.sh"
}

# Create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > backup.sh << 'EOF'
#!/bin/bash

# Krili Transaction Handler Backup Script

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Create backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
echo "Backing up database..."
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/database.sql

# Backup configuration
echo "Backing up configuration..."
cp .env $BACKUP_DIR/
cp -r logs $BACKUP_DIR/ 2>/dev/null || true

# Create archive
echo "Creating archive..."
tar -czf $BACKUP_DIR.tar.gz -C backups $(basename $BACKUP_DIR)
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"
EOF
    
    chmod +x backup.sh
    print_success "Backup script created: backup.sh"
}

# Main setup function
main() {
    print_status "Starting Krili Transaction Handler setup..."
    
    check_go
    check_mysql
    create_directories
    setup_environment
    init_go_modules
    setup_database
    generate_keys
    build_application
    create_service
    create_startup_script
    create_backup_script
    
    print_success "Setup completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Edit .env file with your payment provider keys (Stripe, PayPal)"
    echo "2. Review and adjust the configuration as needed"
    echo "3. Start the application with: ./start.sh"
    echo "4. Test the API endpoints"
    echo
    print_status "API will be available at: http://localhost:8080"
    print_status "Health check: http://localhost:8080/health"
    echo
    print_warning "Remember to:"
    echo "- Keep your .env file secure and never commit it to version control"
    echo "- Regularly backup your database using ./backup.sh"
    echo "- Monitor the logs in the logs/ directory"
    echo "- Update your firewall rules if needed"
}

# Run main function
main "$@"