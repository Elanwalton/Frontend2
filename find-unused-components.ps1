# PowerShell script to find unused components
$componentsDir = "c:\xampp\htdocs\frontend2-dev\components"
$projectDir = "c:\xampp\htdocs\frontend2-dev"

# Get all component files
$components = Get-ChildItem -Path $componentsDir -Filter "*.tsx" -Recurse | Where-Object { $_.Name -notlike "*test*" -and $_.Name -notlike "*spec*" }

$unusedComponents = @()

foreach ($component in $components) {
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($component.Name)
    
    # Search for imports of this component
    $searchPattern = "from '@/components/$componentName'"
    $searchPattern2 = "from `"@/components/$componentName`""
    $searchPattern3 = "from '../components/$componentName'"
    $searchPattern4 = "from './components/$componentName'"
    
    # Search in app and other components (excluding the component itself)
    $found = $false
    
    # Search in TypeScript/JavaScript files
    $files = Get-ChildItem -Path $projectDir -Include "*.tsx","*.ts","*.jsx","*.js" -Recurse -ErrorAction SilentlyContinue | 
             Where-Object { $_.FullName -notlike "*node_modules*" -and 
                           $_.FullName -notlike "*.next*" -and
                           $_.FullName -ne $component.FullName }
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -match [regex]::Escape($componentName)) {
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $unusedComponents += [PSCustomObject]@{
            Name = $componentName
            Path = $component.FullName.Replace("c:\xampp\htdocs\frontend2-dev\", "")
        }
    }
}

# Output results
Write-Host "`n=== UNUSED COMPONENTS ===" -ForegroundColor Yellow
Write-Host "Total components checked: $($components.Count)" -ForegroundColor Cyan
Write-Host "Unused components found: $($unusedComponents.Count)" -ForegroundColor Red
Write-Host ""

if ($unusedComponents.Count -gt 0) {
    $unusedComponents | Format-Table -AutoSize
} else {
    Write-Host "All components are being used!" -ForegroundColor Green
}
