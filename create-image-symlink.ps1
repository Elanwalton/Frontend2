# Run this script as Administrator to create a symbolic link for images
# This allows Next.js to serve images from the images directory

$sourcePath = "c:\xampp\htdocs\frontend2-dev\images"
$targetPath = "c:\xampp\htdocs\frontend2-dev\public\images"

# Check if source exists
if (-Not (Test-Path $sourcePath)) {
    Write-Host "Error: Source directory does not exist: $sourcePath" -ForegroundColor Red
    exit 1
}

# Check if target already exists
if (Test-Path $targetPath) {
    Write-Host "Warning: Target already exists: $targetPath" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove it and create a new symlink? (y/n)"
    if ($response -eq 'y') {
        Remove-Item $targetPath -Force -Recurse
    } else {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

# Create symbolic link
try {
    New-Item -ItemType SymbolicLink -Path $targetPath -Target $sourcePath -Force
    Write-Host "Successfully created symbolic link!" -ForegroundColor Green
    Write-Host "From: $targetPath" -ForegroundColor Cyan
    Write-Host "To: $sourcePath" -ForegroundColor Cyan
} catch {
    Write-Host "Error creating symbolic link: $_" -ForegroundColor Red
    Write-Host "Make sure you're running PowerShell as Administrator" -ForegroundColor Yellow
    exit 1
}
