Write-Host 'Запуск серверов разработки' -ForegroundColor Green
Write-Host ''

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Директория: $projectRoot" -ForegroundColor Cyan
Write-Host ''

# Запуск backend
if (Test-Path "$projectRoot\backend") {
    Write-Host 'Запуск backend сервера...' -ForegroundColor Yellow
    $backendCmd = "cd `'$projectRoot\backend`'; npm run dev"
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $backendCmd
    Write-Host 'Backend запущен в новом окне' -ForegroundColor Green
} else {
    Write-Host 'Папка backend не найдена' -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Поиск и запуск frontend
$frontendPaths = @("$projectRoot\frontend", "$projectRoot\tg-web-app", "$projectRoot\web-app")
$frontendFound = $false

foreach ($path in $frontendPaths) {
    if (Test-Path $path) {
        Write-Host "Запуск frontend сервера из $path..." -ForegroundColor Yellow
        $frontendCmd = "cd `'$path`'; npm run dev"
        Start-Process powershell -ArgumentList '-NoExit', '-Command', $frontendCmd
        Write-Host 'Frontend запущен в новом окне' -ForegroundColor Green
        $frontendFound = $true
        break
    }
}

if (-not $frontendFound) {
    Write-Host 'Папка frontend не найдена' -ForegroundColor Red
}

Write-Host ''
Write-Host 'Серверы запущены!' -ForegroundColor Green
Write-Host 'Backend:  http://localhost:4000' -ForegroundColor White
Write-Host 'Frontend: http://localhost:5173' -ForegroundColor White
Write-Host ''
Write-Host 'Нажмите любую клавишу для выхода...' -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')