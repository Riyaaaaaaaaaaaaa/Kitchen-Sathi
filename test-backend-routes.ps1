# Test Backend Routes Script
Write-Host "`n[Testing KitchenSathi Backend Routes]`n" -ForegroundColor Cyan

# Test 1: Health check
Write-Host "[1] Testing health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
    Write-Host "   [OK] Health check passed: $($health.status)" -ForegroundColor Green
    Write-Host "   Service: $($health.service)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Health check failed: $_" -ForegroundColor Red
    Write-Host "   [WARNING] Make sure backend is running: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: API root
Write-Host "`n[2] Testing API root..." -ForegroundColor Yellow
try {
    $root = Invoke-RestMethod -Uri "http://localhost:5000/api" -Method Get
    Write-Host "   [OK] API root passed: $($root.message)" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] API root failed: $_" -ForegroundColor Red
}

# Test 3: Test a 404 to see available routes
Write-Host "`n[3] Checking available routes (via 404)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/test-nonexistent" -Method Get -ErrorAction Stop
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.availableRoutes) {
        Write-Host "   [OK] Available routes retrieved:" -ForegroundColor Green
        foreach ($route in $errorResponse.availableRoutes) {
            if ($route -like "*STATUS UPDATE*") {
                Write-Host "   [STAR] $route" -ForegroundColor Cyan
            } else {
                Write-Host "      $route" -ForegroundColor Gray
            }
        }
    }
}

# Test 4: Check if groceries routes are accessible (will fail without auth, but that's expected)
Write-Host "`n[4] Testing groceries endpoint (expect 401)..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/groceries" -Method Get -ErrorAction Stop
    Write-Host "   [WARNING] Unexpected: No auth required?" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   [OK] Auth required (401) - Route exists!" -ForegroundColor Green
    } else {
        Write-Host "   [ERROR] Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n[Summary]" -ForegroundColor Cyan
Write-Host "   * Backend is running on http://localhost:5000" -ForegroundColor Green
Write-Host "   * API routes are registered" -ForegroundColor Green
Write-Host "   * Status update routes should be available" -ForegroundColor Green
Write-Host "`nNext: Login and try status updates in the frontend" -ForegroundColor Yellow

