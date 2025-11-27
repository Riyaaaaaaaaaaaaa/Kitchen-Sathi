# PowerShell script to create .env file for KitchenSathi backend

Write-Host "🔧 Creating .env file..." -ForegroundColor Cyan

$envContent = @"
MONGODB_URI=mongodb://localhost:27017/aajkyabanega
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123456789
EDAMAM_APP_ID=1500584f
EDAMAM_APP_KEY=721d0ae56f0fff7010e5ccbec75edeb6
CLOUDINARY_CLOUD_NAME=dqwvlnsgj
CLOUDINARY_API_KEY=447433452683274
CLOUDINARY_API_SECRET=TnVtMtTlZgmrCRkNXBBRb9kKHGc
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=kitchensathii@gmail.com
EMAIL_PASSWORD=xceb cvkt wkbp twai
EMAIL_FROM=KitchenSathi <kitchensathii@gmail.com>
FRONTEND_URL=http://localhost:5173
PORT=5000
"@

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path $scriptDir ".env"

# Create the .env file
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "✅ .env file created successfully at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "📋 File contents:" -ForegroundColor Yellow
Write-Host $envContent
Write-Host ""
Write-Host "🚀 Now restart your backend with: npx tsx src/index.ts" -ForegroundColor Cyan
Write-Host "   Look for: ✅ [EmailService] Initialized successfully" -ForegroundColor Green

