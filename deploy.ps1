# Linkology — Quick Deploy Script
# Run this after making any changes to push to GitHub automatically

$commitMessage = $args[0]

if (-not $commitMessage) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMessage = "Update: $timestamp"
}

Write-Host "`n🚀 Deploying Linkology to GitHub..." -ForegroundColor Cyan

git add .

$status = git status --porcelain
if (-not $status) {
    Write-Host "✅ Nothing new to deploy — files are already up to date." -ForegroundColor Yellow
    exit
}

git commit -m "$commitMessage"
git push

Write-Host "`n✅ Deployed! View live at: https://buildmyportfolio.github.io/Linkology/" -ForegroundColor Green
