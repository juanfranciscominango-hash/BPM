#!/usr/bin/env pwsh

# ============================================
# Naming Conventions Normalization Script
# PlantillaAngularBootstrap - InnovaConsulting Standards
# ============================================

Write-Host "Starting normalization of naming conventions..." -ForegroundColor Cyan

$AppPath = "src/app"
$Counter = @{
    Renamed = 0
    Failed  = 0
    Skipped = 0
}

# ============================================
# PHASE 1: Rename component files .ts to .component.ts
# ============================================

Write-Host "`nPHASE 1: Renaming component files..." -ForegroundColor Yellow

$ComponentPatterns = @(
    "src/app/features/login/login.ts",
    "src/app/features/dashboard/dashboard.ts",
    "src/app/features/dashboard-hibrido/dashboard-hibrido.ts",
    "src/app/features/analytics/analytics.ts",
    "src/app/features/analytics/metricas/metricas.ts",
    "src/app/features/analytics/reportes/reportes.ts",
    "src/app/features/configuracion/configuracion.ts",
    "src/app/features/configuracion/perfil/perfil.ts",
    "src/app/features/configuracion/sistema/sistema.ts",
    "src/app/features/documentacion/documentacion.ts",
    "src/app/features/documentacion/angular/angular.ts",
    "src/app/features/documentacion/apis/apis.ts",
    "src/app/features/documentacion/entra-id/entra-id.ts",
    "src/app/features/documentacion/redis/redis.ts",
    "src/app/features/documentacion/wcf/wcf.ts",
    "src/app/features/usuarios/usuarios.ts",
    "src/app/features/scroll-to-top/scroll-to-top.ts",
    "src/app/features/main-layout/main-layout.ts"
)

foreach ($File in $ComponentPatterns) {
    if (Test-Path $File) {
        $NewFile = $File -replace '\.ts$', '.component.ts'
        try {
            Rename-Item -Path $File -NewName (Split-Path $NewFile -Leaf) -Force
            Write-Host "  OK: Renamed" -ForegroundColor Green
            $Counter.Renamed++
        }
        catch {
            Write-Host "  ERROR: $_" -ForegroundColor Red
            $Counter.Failed++
        }
    }
    else {
        Write-Host "  SKIP: Not found" -ForegroundColor Gray
        $Counter.Skipped++
    }
}

# ============================================
# PHASE 2: Update imports in TypeScript files
# ============================================

Write-Host "`nPHASE 2: Updating imports..." -ForegroundColor Yellow

$FilesToUpdate = Get-ChildItem -Path $AppPath -Filter "*.ts" -Recurse | Where-Object { 
    $_ -notmatch '\.spec\.ts$' -and $_ -notmatch 'node_modules'
}

$ReplacementRules = @(
    @{ Old = "from './login'"; New = "from './login.component'" },
    @{ Old = "from './dashboard'"; New = "from './dashboard.component'" },
    @{ Old = "from './dashboard-hibrido'"; New = "from './dashboard-hibrido.component'" },
    @{ Old = "from './analytics'"; New = "from './analytics.component'" },
    @{ Old = "from './metricas'"; New = "from './metricas.component'" },
    @{ Old = "from './reportes'"; New = "from './reportes.component'" },
    @{ Old = "from './configuracion'"; New = "from './configuracion.component'" },
    @{ Old = "from './perfil'"; New = "from './perfil.component'" },
    @{ Old = "from './sistema'"; New = "from './sistema.component'" },
    @{ Old = "from './documentacion'"; New = "from './documentacion.component'" },
    @{ Old = "from './angular'"; New = "from './angular.component'" },
    @{ Old = "from './apis'"; New = "from './apis.component'" },
    @{ Old = "from './entra-id'"; New = "from './entra-id.component'" },
    @{ Old = "from './redis'"; New = "from './redis.component'" },
    @{ Old = "from './wcf'"; New = "from './wcf.component'" },
    @{ Old = "from './usuarios'"; New = "from './usuarios.component'" },
    @{ Old = "from './scroll-to-top'"; New = "from './scroll-to-top.component'" },
    @{ Old = "from './main-layout'"; New = "from './main-layout.component'" }
)

$UpdateCounter = 0
foreach ($File in $FilesToUpdate) {
    $Content = Get-Content -Path $File.FullName -Raw
    $Modified = $false
    
    foreach ($Rule in $ReplacementRules) {
        if ($Content -match [regex]::Escape($Rule.Old)) {
            $Content = $Content -replace [regex]::Escape($Rule.Old), $Rule.New
            $Modified = $true
            $UpdateCounter++
        }
    }
    
    if ($Modified) {
        Set-Content -Path $File.FullName -Value $Content -Encoding UTF8
        Write-Host "  OK: $($File.Name)" -ForegroundColor Green
    }
}

Write-Host "  Total imports updated: $UpdateCounter" -ForegroundColor Cyan

# ============================================
# PHASE 3: Update component selectors
# ============================================

Write-Host "`nPHASE 3: Updating component selectors..." -ForegroundColor Yellow

$SelectorRules = @(
    @{ Old = "selector: 'app-login'"; New = "selector: 'innova-login'" },
    @{ Old = "selector: 'app-dashboard'"; New = "selector: 'innova-dashboard'" },
    @{ Old = "selector: 'app-dashboard-hibrido'"; New = "selector: 'innova-dashboard-hibrido'" },
    @{ Old = "selector: 'app-analytics'"; New = "selector: 'innova-analytics'" },
    @{ Old = "selector: 'app-metricas'"; New = "selector: 'innova-metricas'" },
    @{ Old = "selector: 'app-reportes'"; New = "selector: 'innova-reportes'" },
    @{ Old = "selector: 'app-configuracion'"; New = "selector: 'innova-configuracion'" },
    @{ Old = "selector: 'app-perfil'"; New = "selector: 'innova-perfil'" },
    @{ Old = "selector: 'app-sistema'"; New = "selector: 'innova-sistema'" },
    @{ Old = "selector: 'app-documentacion'"; New = "selector: 'innova-documentacion'" },
    @{ Old = "selector: 'app-angular'"; New = "selector: 'innova-angular'" },
    @{ Old = "selector: 'app-apis'"; New = "selector: 'innova-apis'" },
    @{ Old = "selector: 'app-entra-id'"; New = "selector: 'innova-entra-id'" },
    @{ Old = "selector: 'app-redis'"; New = "selector: 'innova-redis'" },
    @{ Old = "selector: 'app-wcf'"; New = "selector: 'innova-wcf'" },
    @{ Old = "selector: 'app-usuarios'"; New = "selector: 'innova-usuarios'" },
    @{ Old = "selector: 'app-scroll-to-top'"; New = "selector: 'innova-scroll-to-top'" },
    @{ Old = "selector: 'app-main-layout'"; New = "selector: 'innova-main-layout'" },
    @{ Old = "selector: 'app'"; New = "selector: 'innova-app'" }
)

$SelectorCounter = 0
foreach ($File in $FilesToUpdate) {
    if ($File.Name -match '\.component\.ts$' -and $File.Name -notmatch '\.spec\.ts$') {
        $Content = Get-Content -Path $File.FullName -Raw
        $Modified = $false
        
        foreach ($Rule in $SelectorRules) {
            if ($Content -match [regex]::Escape($Rule.Old)) {
                $Content = $Content -replace [regex]::Escape($Rule.Old), $Rule.New
                $Modified = $true
                $SelectorCounter++
            }
        }
        
        if ($Modified) {
            Set-Content -Path $File.FullName -Value $Content -Encoding UTF8
            Write-Host "  OK: Selector updated" -ForegroundColor Green
        }
    }
}

Write-Host "  Total selectors updated: $SelectorCounter" -ForegroundColor Cyan

# ============================================
# PHASE 4: Update HTML templates
# ============================================

Write-Host "`nPHASE 4: Updating HTML templates..." -ForegroundColor Yellow

$HtmlFiles = Get-ChildItem -Path $AppPath -Filter "*.html" -Recurse

$HtmlRules = @(
    @{ Old = "<app-login"; New = "<innova-login" },
    @{ Old = "</app-login>"; New = "</innova-login>" },
    @{ Old = "<app-dashboard"; New = "<innova-dashboard" },
    @{ Old = "</app-dashboard>"; New = "</innova-dashboard>" },
    @{ Old = "<app-main-layout"; New = "<innova-main-layout" },
    @{ Old = "</app-main-layout>"; New = "</innova-main-layout>" },
    @{ Old = "<app-scroll-to-top"; New = "<innova-scroll-to-top" },
    @{ Old = "</app-scroll-to-top>"; New = "</innova-scroll-to-top>" },
    @{ Old = "<app-theme-toggle"; New = "<innova-theme-toggle" },
    @{ Old = "</app-theme-toggle>"; New = "</innova-theme-toggle>" }
)

$HtmlCounter = 0
foreach ($File in $HtmlFiles) {
    $Content = Get-Content -Path $File.FullName -Raw
    $Modified = $false
    
    foreach ($Rule in $HtmlRules) {
        if ($Content -match [regex]::Escape($Rule.Old)) {
            $Content = $Content -replace [regex]::Escape($Rule.Old), $Rule.New
            $Modified = $true
            $HtmlCounter++
        }
    }
    
    if ($Modified) {
        Set-Content -Path $File.FullName -Value $Content -Encoding UTF8
        Write-Host "  OK: Template updated" -ForegroundColor Green
    }
}

Write-Host "  Total templates updated: $HtmlCounter" -ForegroundColor Cyan

# ============================================
# Summary
# ============================================

Write-Host "`n===================================================" -ForegroundColor Cyan
Write-Host "NORMALIZATION SUMMARY" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`nPhase 1 (Rename files):" -ForegroundColor Green
Write-Host "   Renamed: $($Counter.Renamed)"
Write-Host "   Errors:  $($Counter.Failed)"
Write-Host "   Skipped: $($Counter.Skipped)"

Write-Host "`nPhase 2 (Imports):" -ForegroundColor Green
Write-Host "   Updated: $UpdateCounter"

Write-Host "`nPhase 3 (Selectors):" -ForegroundColor Green
Write-Host "   Updated: $SelectorCounter"

Write-Host "`nPhase 4 (Templates):" -ForegroundColor Green
Write-Host "   Updated: $HtmlCounter"

Write-Host "`n===================================================" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run: ng build --configuration development"
Write-Host "  2. Run: ng test --watch=false"
Write-Host "  3. Run: ng serve and verify in browser"
Write-Host "  4. If OK, commit: git commit -m `"refactor: normalize naming conventions to InnovaConsulting standards`""

Write-Host "`nNormalization completed successfully!" -ForegroundColor Green
