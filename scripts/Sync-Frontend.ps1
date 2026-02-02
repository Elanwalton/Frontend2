# Sync-Frontend.ps1
# This script mirrors the frontend files from root to Sunleaf-frontend

$Source = "C:\xampp\htdocs\frontend2-dev"
$Destination = "C:\xampp\htdocs\frontend2-dev\Sunleaf-frontend"

# Define items to sync (Frontend core)
$FrontendItems = @(
    "app", 
    "components", 
    "styles", 
    "utils", 
    "store", 
    "context", 
    "hooks", 
    "types", 
    "lib", 
    "public", 
    "assets",
    "scripts",
    "MinorComponents",
    "middleware.ts",
    "next.config.ts",
    "package.json",
    "package-lock.json",
    "postcss.config.js",
    "tailwind.config.js",
    "tsconfig.json"
)

Write-Host "Starting sync from $Source to $Destination..." -ForegroundColor Cyan

foreach ($Item in $FrontendItems) {
    $SourcePath = Join-Path $Source $Item
    $DestPath = Join-Path $Destination $Item
    
    if (Test-Path $SourcePath) {
        Write-Host "Syncing $Item..." -ForegroundColor DarkCyan
        if (Test-Path $SourcePath -PathType Container) {
            # Use Robocopy for robust folder mirroring
            # /MIR mirrors, /XF excludes files, /XD excludes dirs
            # We exclude node_modules and .next as they are bulky
            robocopy "$SourcePath" "$DestPath" /MIR /XF *.php /XD node_modules .next | Out-Null
        } else {
            Copy-Item "$SourcePath" "$DestPath" -Force
        }
    } else {
        Write-Warning "Source item not found: $Item"
    }
}

Write-Host "Sync Complete!" -ForegroundColor Green
