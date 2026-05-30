param(
    [Parameter(Mandatory=$true)][string]$Name,
    [Parameter(Mandatory=$true)][string]$Email,
    [Parameter(Mandatory=$true)][string]$Mobile,
    [Parameter(Mandatory=$true)][string]$Github,
    [Parameter(Mandatory=$true)][string]$RollNo,
    [Parameter(Mandatory=$true)][string]$AccessCode
)

$body = @{
    name = $Name
    email = $Email
    mobileNo = $Mobile
    githubUsername = $Github
    rollNo = $RollNo
    accessCode = $AccessCode
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Method Post -Uri "http://4.224.186.213/evaluation-service/register" -ContentType "application/json" -Body $body -ErrorAction Stop
    $resp | ConvertTo-Json -Depth 10 | Out-File -FilePath "registration-response.json" -Encoding utf8
    Write-Host "Saved response to registration-response.json"
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
