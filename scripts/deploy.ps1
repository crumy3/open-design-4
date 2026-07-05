param(
    [string]$Token = (Powershell -ExecutionPolicy Bypass -File (Join-Path (Split-Path -Parent $PSScriptRoot) "scripts\get-vercel-key.ps1")),
    [string]$ProjectId = 'prj_SPsfsIIAh7WNWCcbWrFS0XTK44Yi',
    [string]$TemplateDir = 'c:\Users\Administrator\Desktop\open design4.0\template'
)

# Collect all files, skip .vercel
$files = @()
Get-ChildItem -Path $TemplateDir -Recurse -File | Where-Object {
    $_.FullName -notmatch '\.vercel'
} | ForEach-Object {
    $relativePath = $_.FullName.Substring($TemplateDir.Length + 1).Replace('\', '/')
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $b64   = [Convert]::ToBase64String($bytes)
    $files += [PSCustomObject]@{
        file     = $relativePath
        data     = $b64
        encoding = 'base64'
    }
}

Write-Host "Deploying $($files.Count) files to Vercel..."

$body = [ordered]@{
    name    = 'cascade-web'
    project = $ProjectId
    target  = 'production'
    files   = $files
} | ConvertTo-Json -Depth 10 -Compress

$headers = @{
    Authorization  = "Bearer $Token"
    'Content-Type' = 'application/json'
}

try {
    $response = Invoke-RestMethod `
        -Uri 'https://api.vercel.com/v13/deployments' `
        -Method POST `
        -Headers $headers `
        -Body $body

    Write-Host "Deployment ID  : $($response.id)"
    Write-Host "State          : $($response.readyState)"
    Write-Host "Alias URL      : https://$($response.url)"
    Write-Host "Production URL : https://cascade-web-eight.vercel.app"
    Write-Host "DONE"
} catch {
    Write-Host "ERROR: $_"
    $_.Exception.Response | Select-Object StatusCode, StatusDescription | Format-List
}
