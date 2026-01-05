# Bashir.inc ERP - Automated Setup Script
# Run this script in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BASHIR.INC ERP - SETUP WIZARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm installation
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 1: INSTALLING DEPENDENCIES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Installing npm packages..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check for .env file
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 2: ENVIRONMENT CONFIGURATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path .env) {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    $createEnv = Read-Host "Do you want to recreate it? (y/N)"
    if ($createEnv -ne "y" -and $createEnv -ne "Y") {
        Write-Host "Keeping existing .env file" -ForegroundColor Yellow
        $skipEnv = $true
    }
}

if (-not $skipEnv) {
    Write-Host ""
    Write-Host "Please provide your Supabase credentials:" -ForegroundColor Yellow
    Write-Host "(You can find these in your Supabase project settings)" -ForegroundColor Gray
    Write-Host ""
    
    $supabaseUrl = Read-Host "Enter your Supabase URL"
    $supabaseKey = Read-Host "Enter your Supabase Anon Key"
    
    # Create .env file
    @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@ | Out-File -FilePath .env -Encoding utf8
    
    Write-Host "✓ .env file created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 3: DATABASE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps for database setup:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to your Supabase Dashboard" -ForegroundColor White
Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
Write-Host "3. Copy the contents of 'supabase_schema.sql'" -ForegroundColor White
Write-Host "4. Paste and execute in SQL Editor" -ForegroundColor White
Write-Host ""

$openSchema = Read-Host "Would you like to open supabase_schema.sql now? (Y/n)"
if ($openSchema -ne "n" -and $openSchema -ne "N") {
    Start-Process notepad.exe supabase_schema.sql
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STEP 4: USER CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After running the SQL schema, create these users in Supabase:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Owner Account:" -ForegroundColor White
Write-Host "  Email: owner@bashir.inc" -ForegroundColor Gray
Write-Host "  Password: bashir123" -ForegroundColor Gray
Write-Host ""
Write-Host "Employee Account:" -ForegroundColor White
Write-Host "  Email: ali@bashir.inc" -ForegroundColor Gray
Write-Host "  Password: bashir123" -ForegroundColor Gray
Write-Host ""

$continueSetup = Read-Host "Have you created the users? (Y/n)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✓ All dependencies installed" -ForegroundColor Green
Write-Host "✓ Environment configured" -ForegroundColor Green
Write-Host "✓ Ready to run!" -ForegroundColor Green
Write-Host ""

Write-Host "To start the development server, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "Then open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Demo Login Credentials:" -ForegroundColor Yellow
Write-Host "  Owner: owner / bashir123" -ForegroundColor White
Write-Host "  Employee: ali / bashir123" -ForegroundColor White
Write-Host ""

$startNow = Read-Host "Would you like to start the dev server now? (Y/n)"
if ($startNow -ne "n" -and $startNow -ne "N") {
    Write-Host ""
    Write-Host "Starting development server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    npm run dev
} else {
    Write-Host ""
    Write-Host "You can start the server anytime with: npm run dev" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "For detailed documentation, see:" -ForegroundColor Cyan
Write-Host "  - README.md (Overview)" -ForegroundColor White
Write-Host "  - SETUP_GUIDE.md (Detailed setup)" -ForegroundColor White
Write-Host "  - QUICK_REFERENCE.md (Reference guide)" -ForegroundColor White
Write-Host ""
