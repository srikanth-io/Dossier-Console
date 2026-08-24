# Dossier Admin - Auto-Recovery Service
# Creates a Windows scheduled task that monitors and restarts Supabase services

$TaskName = "DossierAdmin_BackendWatchdog"
$ProjectName = "Dossier_Admin"
$ScriptPath = "$PSScriptRoot\watchdog.ps1"

# Create the watchdog script
$watchdogContent = @'
# Watchdog - Runs every 60 seconds to ensure Supabase services are alive
$ProjectName = "Dossier_Admin"

$running = docker ps --filter "name=$ProjectName" --format "{{.Names}}" 2>$null
$all = docker ps -a --filter "name=$ProjectName" --format "{{.Names}}" 2>$null

if (-not $all) {
    # No containers exist, start fresh
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "cd /d `"$PWD`" && npx supabase start" -WindowStyle Hidden
    exit
}

$runningCount = ($running | Measure-Object).Count
$allCount = ($all | Measure-Object).Count

if ($runningCount -lt $allCount) {
    # Some containers are stopped, restart them
    $stopped = docker ps -a --filter "name=$ProjectName" --filter "status=exited" --format "{{.Names}}" 2>$null
    foreach ($container in $stopped) {
        docker start $container 2>$null | Out-Null
    }
}
'@

$watchdogContent | Out-File -FilePath $ScriptPath -Encoding utf8 -Force

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Create the scheduled task action
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Create trigger - every 60 seconds
$Trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Seconds 60) `
    -RepetitionDuration (New-TimeSpan -Days 9999)

# Create settings
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Register the task
Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Monitors and restarts Dossier Admin Supabase services" `
    -Force

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Watchdog Service Installed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Task Name: $TaskName" -ForegroundColor Cyan
Write-Host "Monitors containers every 60 seconds" -ForegroundColor Cyan
Write-Host "Auto-restarts any stopped containers" -ForegroundColor Cyan
Write-Host ""
Write-Host "To remove: Unregister-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Yellow
