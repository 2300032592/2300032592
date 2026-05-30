param(
    [Parameter(Mandatory=$true)][string]$ClientId,
    [Parameter(Mandatory=$true)][string]$ClientSecret,
    [string]$OutFile = "auth-token.json"
)

$body = @{ clientId = $ClientId; clientSecret = $ClientSecret } | ConvertTo-Json
try {
    $auth = Invoke-RestMethod -Method Post -Uri "http://4.224.186.213/evaluation-service/auth" -ContentType "application/json" -Body $body -ErrorAction Stop
    $auth | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutFile -Encoding utf8
    Write-Host "Saved auth token to $OutFile"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
