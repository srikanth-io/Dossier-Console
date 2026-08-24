# Dossier Admin - Backend Services Manager (Windows)
# Keeps all Supabase services running with auto-restart

$ProjectName = "Dossier_Admin"
$CheckInterval = 10
$MaxRestartAttempts = 5

$Host.UI.RawUI.WindowTitle = "Dossier Admin - Service Manager"

function Write-Info { param([string]$Msg) Write-Host "[INFO] $Msg" -ForegroundColor Cyan }
function Write-Ok { param([string]$Msg) Write-Host "[OK] $Msg" -ForegroundColor Green }
function Write-Warn { param([string]$Msg) Write-Host "[WARN] $Msg" -ForegroundColor Yellow }
function Write-Err { param([string]$Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }

$RestartCounts = @{}

function Get-AllContainers {
    docker ps -a --filter "name=$ProjectName" --format "{{.Names}}" 2>$null
}

function Get-RunningContainers {
    docker ps --filter "name=$ProjectName" --format "{{.Names}}" 2>$null
}

function Get-StoppedContainers {
    docker ps -a --filter "name=$ProjectName" --filter "status=exited" --format "{{.Names}}" 2>$null
}

function Test-ContainerRunning {
    param([string]$Container)
    $status = docker inspect -f '{{.State.Running}}' $Container 2>$null
    return $status -eq "true"
}

function Restart-Container {
    param([string]$Container)
    
    $currentCount = if ($RestartCounts.ContainsKey($Container)) { $RestartCounts[$Container] } else { 0 }
    
    if ($currentCount -ge $MaxRestartAttempts) {
        Write-Err "$Container exceeded max restart attempts ($MaxRestartAttempts). Skipping."
        return $false
    }
    
    Write-Warn "Restarting $Container (attempt $($currentCount + 1)/$MaxRestartAttempts)..."
    docker start $Container 2>$null | Out-Null
    $RestartCounts[$Container] = $currentCount + 1
    
    Start-Sleep -Seconds 3
    
    if (Test-ContainerRunning $Container) {
        Write-Ok "$Container restarted successfully"
        return $true
    } else {
        Write-Err "$Container failed to restart"
        return $false
    }
}

function Check-Fix-Services {
    $stopped = Get-StoppedContainers
    
    if (-not $stopped) { return }
    
    foreach ($container in $stopped) {
        if ($container) {
            Restart-Container $container | Out-Null
        }
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Dossier Admin - Service Status" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $runningCount = 0
    $totalCount = 0
    
    foreach ($container in Get-AllContainers) {
        if ($container) {
            $totalCount++
            if (Test-ContainerRunning $container) {
                $runningCount++
                $shortName = $container -replace ".*_", ""
                Write-Host "  " -NoNewline
                Write-Host "✓" -ForegroundColor Green -NoNewline
                Write-Host " $shortName"
            }
        }
    }
    
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    if ($runningCount -eq $totalCount) {
        Write-Host "  " -NoNewline
        Write-Host "All $totalCount services running" -ForegroundColor Green
    } else {
        Write-Host "  " -NoNewline
        Write-Host "$runningCount/$totalCount services running" -ForegroundColor Yellow
    }
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Endpoints {
    Write-Host "Endpoints:" -ForegroundColor Cyan
    Write-Host "  Studio:    http://127.0.0.1:54323"
    Write-Host "  API:       http://127.0.0.1:19001"
    Write-Host "  Mailpit:   http://127.0.0.1:54324"
    Write-Host "  Database:  postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    Write-Host ""
}

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Dossier Admin - Service Manager       ║" -ForegroundColor Cyan
Write-Host "║   Press Ctrl+C to stop monitoring        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Info "Starting Supabase services..."
try {
    npx supabase start 2>$null
} catch {
    Write-Warn "Supabase start returned warnings (non-critical)"
}

Start-Sleep -Seconds 5

Show-Endpoints
Show-Status

Write-Info "Monitoring services (checking every ${CheckInterval}s)..."

try {
    while ($true) {
        Start-Sleep -Seconds $CheckInterval
        Check-Fix-Services
        Show-Status
    }
} finally {
    Write-Info "Shutting down monitor..."
}
