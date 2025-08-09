# Krili Transaction Handler Setup Script for Windows
# PowerShell script to set up the Go transaction handler

param(
    [switch]$SkipDatabase,
    [switch]$SkipBuild,
    [string]$DBName = "krili_db",
    [string]$DBUser = "krili_user"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-GoInstallation {
    Write-Status "Checking Go installation..."
    
    if (-not (Test-Command "go")) {
        Write-Error "Go is not installed or not in PATH."
        Write-Status "Please install Go 1.21 or later from: https://golang.org/doc/install"
        exit 1
    }
    
    $goVersion = go version
    Write-Success "Go is installed: $goVersion"
}

function Test-MySQLInstallation {
    Write-Status "Checking MySQL installation..."
    
    if (-not (Test-Command "mysql")) {
        Write-Warning "MySQL client not found in PATH."
        Write-Status "Please ensure MySQL is installed and accessible."
        Write-Status "Download from: https://dev.mysql.com/downloads/mysql/"
    } else {
        Write-Success "MySQL client is available"
    }
}

function New-Directories {
    Write-Status "Creating necessary directories..."
    
    $directories = @("logs", "uploads", "backups", "certificates", "bin")
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Status "Created directory: $dir"
        }
    }
    
    Write-Success "Directories created successfully"
}

function Initialize-Environment {
    Write-Status "Setting up environment configuration..."
    
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Environment file created from example"
            Write-Warning "Please edit .env file with your actual configuration values"
        } else {
            Write-Error ".env.example file not found"
            exit 1
        }
    } else {
        Write-Warning ".env file already exists, skipping..."
    }
}

function Initialize-GoModules {
    Write-Status "Initializing Go modules..."
    
    if (-not (Test-Path "go.mod")) {
        go mod init krili-transaction-handler
    }
    
    Write-Status "Downloading Go dependencies..."
    go mod tidy
    go mod download
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Go modules initialized successfully"
    } else {
        Write-Error "Failed to initialize Go modules"
        exit 1
    }
}

function Initialize-Database {
    if ($SkipDatabase) {
        Write-Warning "Database setup skipped as requested"
        return
    }
    
    Write-Status "Setting up database..."
    
    $setupDB = Read-Host "Do you want to setup the database now? (y/n)"
    
    if ($setupDB -eq "y" -or $setupDB -eq "Y") {
        $rootPassword = Read-Host "Enter MySQL root password" -AsSecureString
        $rootPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword))
        
        $dbName = Read-Host "Enter database name (default: $DBName)"
        if ([string]::IsNullOrEmpty($dbName)) { $dbName = $DBName }
        
        $dbUser = Read-Host "Enter database user (default: $DBUser)"
        if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = $DBUser }
        
        $dbPassword = Read-Host "Enter database password" -AsSecureString
        $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
        
        Write-Status "Creating database and user..."
        
        $sqlCommands = @"
CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$dbUser'@'localhost' IDENTIFIED BY '$dbPasswordPlain';
GRANT ALL PRIVILEGES ON $dbName.* TO '$dbUser'@'localhost';
FLUSH PRIVILEGES;
"@
        
        try {
            $sqlCommands | mysql -u root -p$rootPasswordPlain
            Write-Success "Database and user created successfully"
            
            Write-Status "Running database schema..."
            Get-Content "transaction_schema.sql" | mysql -u root -p$rootPasswordPlain $dbName
            Write-Success "Database schema applied successfully"
            
            # Update .env file
            $envContent = Get-Content ".env"
            $envContent = $envContent -replace "DB_NAME=.*", "DB_NAME=$dbName"
            $envContent = $envContent -replace "DB_USER=.*", "DB_USER=$dbUser"
            $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$dbPasswordPlain"
            $envContent | Set-Content ".env"
            
            Write-Success "Environment file updated with database credentials"
        }
        catch {
            Write-Error "Database setup failed: $($_.Exception.Message)"
            Write-Warning "Please setup the database manually using transaction_schema.sql"
        }
    } else {
        Write-Warning "Database setup skipped. Please setup manually using transaction_schema.sql"
    }
}

function New-SecurityKeys {
    Write-Status "Generating security keys..."
    
    # Generate random keys
    $jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    $encryptionKey = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
    
    # Update .env file
    $envContent = Get-Content ".env"
    $envContent = $envContent -replace "JWT_SECRET=.*", "JWT_SECRET=$jwtSecret"
    $envContent = $envContent -replace "ENCRYPTION_KEY=.*", "ENCRYPTION_KEY=$encryptionKey"
    $envContent | Set-Content ".env"
    
    Write-Success "Security keys generated and updated in .env file"
}

function Build-Application {
    if ($SkipBuild) {
        Write-Warning "Build skipped as requested"
        return
    }
    
    Write-Status "Building the application..."
    
    go build -o "bin/transaction-handler.exe" transaction_handler.go
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application built successfully"
        Write-Status "Binary location: ./bin/transaction-handler.exe"
    } else {
        Write-Error "Build failed"
        exit 1
    }
}

function New-StartupScript {
    Write-Status "Creating startup script..."
    
    $startupScript = @'
@echo off
echo Starting Krili Transaction Handler...

REM Check if binary exists
if not exist "bin\transaction-handler.exe" (
    echo Binary not found. Please run setup.ps1 first.
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start the application
bin\transaction-handler.exe
pause
'@
    
    $startupScript | Out-File -FilePath "start.bat" -Encoding ASCII
    Write-Success "Startup script created: start.bat"
}

function New-BackupScript {
    Write-Status "Creating backup script..."
    
    $backupScript = @'
@echo off
echo Krili Transaction Handler Backup Script

REM Load environment variables from .env file
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" set %%a=%%b
)

REM Create backup directory
set BACKUP_DIR=backups\%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
mkdir "%BACKUP_DIR%"

REM Backup database
echo Backing up database...
mysqldump -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% > "%BACKUP_DIR%\database.sql"

REM Backup configuration
echo Backing up configuration...
copy .env "%BACKUP_DIR%\"
if exist logs xcopy logs "%BACKUP_DIR%\logs\" /E /I

REM Create archive (requires 7-Zip or similar)
echo Creating archive...
if exist "C:\Program Files\7-Zip\7z.exe" (
    "C:\Program Files\7-Zip\7z.exe" a "%BACKUP_DIR%.zip" "%BACKUP_DIR%\*"
    rmdir /s /q "%BACKUP_DIR%"
    echo Backup completed: %BACKUP_DIR%.zip
) else (
    echo Backup completed in directory: %BACKUP_DIR%
    echo Install 7-Zip for automatic archive creation
)

pause
'@
    
    $backupScript | Out-File -FilePath "backup.bat" -Encoding ASCII
    Write-Success "Backup script created: backup.bat"
}

function Show-CompletionMessage {
    Write-Success "Setup completed successfully!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "1. Edit .env file with your payment provider keys (Stripe, PayPal)"
    Write-Host "2. Review and adjust the configuration as needed"
    Write-Host "3. Start the application with: start.bat"
    Write-Host "4. Test the API endpoints"
    Write-Host ""
    Write-Status "API will be available at: http://localhost:8080"
    Write-Status "Health check: http://localhost:8080/health"
    Write-Host ""
    Write-Warning "Remember to:"
    Write-Host "- Keep your .env file secure and never commit it to version control"
    Write-Host "- Regularly backup your database using backup.bat"
    Write-Host "- Monitor the logs in the logs/ directory"
    Write-Host "- Configure Windows Firewall if needed"
}

function Main {
    Write-Status "Starting Krili Transaction Handler setup..."
    Write-Host ""
    
    try {
        Test-GoInstallation
        Test-MySQLInstallation
        New-Directories
        Initialize-Environment
        Initialize-GoModules
        Initialize-Database
        New-SecurityKeys
        Build-Application
        New-StartupScript
        New-BackupScript
        Show-CompletionMessage
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        exit 1
    }
}

# Run main function
Main