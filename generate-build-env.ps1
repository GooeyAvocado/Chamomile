# generate-build-env.ps1

$frontendHash = git log -n 1 --pretty=format:"%h" -- chamomile.web
$backendHash = git log -n 1 --pretty=format:"%h" -- Chamomile.API Chamomile.Common Chamomile.Data Automatic1111.API AutomaticA111.Common
$timestamp = (Get-Date).ToString("o")  # ISO 8601 format: 2025-07-24T19:59:22.1234567-04:00

$envContent = @"
VITE_FRONTEND_BUILD=v3-$frontendHash
VITE_BACKEND_BUILD=v3-$backendHash
VITE_BUILD_TIMESTAMP=$timestamp
"@

Set-Content -Path .env -Value $envContent -Encoding ASCII

Write-Host "Updated .env:"
Write-Host $envContent