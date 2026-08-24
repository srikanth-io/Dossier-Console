# Dossier Admin - Background Service Launcher (Windows)
# Starts Supabase services as a detached background process that survives terminal closure

$ProjectName = "Dossier_Admin"
$LogDir = "$PSScriptRoot\..\.logs"
$LogFile = "$LogDir\backend.log"
$PidFile = "$LogDir\backend.pid"

# Create logs directory
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $LogFile -Append -Encoding utf8
}

function Stop-ExistingServices {
    Write-Host "Stopping any existing Supabase services..." -ForegroundColor Yellow
    npx supabase stop 2>$null | Out-Null
    Start-Sleep -Seconds 2
}

function Start-BackgroundServices {
    Write-Host "Starting Supabase services in background..." -ForegroundColor Cyan
    
    # Stop existing first
    Stop-ExistingServices
    
    # Start supabase as a detached process using cmd
    $supabaseCmd = "cd /d `"$PWD`" && npx supabase start"
    
    # Use Start-Process to detach from terminal
    $process = Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", $supabaseCmd `
        -WindowStyle Hidden `
        -PassThru `
        -RedirectStandardOutput "$LogDir\supabase-stdout.log" `
        -RedirectStandardError "$LogDir\supabase-stderr.log"
    
    $process.Id | Out-File -FilePath $PidFile -Encoding utf8
    Write-Log "Started supabase with PID: $($process.Id)"
    
    Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    return $process.Id
}

function Test-ServicesRunning {
    $running = docker ps --filter "name=$ProjectName" --format "{{.Names}}" 2>$null
    return ($running -ne $null)
}

function Show-Status {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Dossier Admin - Backend Services" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $containers = docker ps --filter "name=$ProjectName" --format "{{.Names}}|{{.Status}}" 2>$null
    
    if ($containers) {
        foreach ($c in $containers) {
            $parts = $c -split '\|'
            $name = ($parts[0] -replace ".*_", "") 
            $status = $parts[1]
            Write-Host "  " -NoNewline
            Write-Host "✓" -ForegroundColor Green -NoNewline
            Write-Host " $name - $status"
        }
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Endpoints:" -ForegroundColor Yellow
    Write-Host "  Studio:    http://127.0.0.1:54323"
    Write-Host "  API:       http://127.0.0.1:19001"
    Write-Host "  Mailpit:   http://127.0.0.1:54324"
    Write-Host "  Database:  postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    Write-Host ""
}

# Main execution
Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Dossier Admin - Background Service        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if already running
if (Test-ServicesRunning) {
    Write-Host "Services are already running!" -ForegroundColor Green
    Show-Status
} else {
    $pid = Start-BackgroundServices
    if (Test-ServicesRunning) {
        Write-Host "Services started successfully!" -ForegroundColor Green
        Show-Status
    } else {
        Write-Host "Warning: Services may still be starting. Check logs at:" -ForegroundColor Yellow
        Write-Host "  $LogDir\supabase-stderr.log" -ForegroundColor Gray
    }
}

Write-Host "Services will continue running after this terminal closes." -ForegroundColor Green
Write-Host "To stop: npm run backend:stop" -ForegroundColor Yellow
Write-Host ""
