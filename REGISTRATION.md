Registration (Q1)

- Registered: 2026-05-30
- Registration was performed using PowerShell `Invoke-RestMethod` because the browser blocked the request (CORS).
- Proof / screenshots: `Q1_Registration/screenshots/` (desktop, mobile, and terminal outputs).
- Important: `clientID` / `clientSecret` and tokens are saved locally at `C:\Users\REVANTH\Documents` (registration-response.json, auth-token.json) and MUST NOT be committed to the repo.

How to get the authorization token (run locally in PowerShell):

```powershell
# Read saved credentials (do not paste these in public)
$cred = Get-Content "$env:USERPROFILE\Documents\registration-response.json" | ConvertFrom-Json

# Request an auth token and save it (outside the repo)
$authBody = @{ clientID = $cred.clientID; clientSecret = $cred.clientSecret } | ConvertTo-Json
$token = Invoke-RestMethod -Uri "http://4.224.186.213/evaluation-service/auth" -Method Post -ContentType "application/json" -Body $authBody
$token | ConvertTo-Json -Depth 10 | Out-File -FilePath "$env:USERPROFILE\Documents\auth-token.json" -Encoding utf8
Write-Host "Saved token to $env:USERPROFILE\Documents\auth-token.json"
```

What to commit to GitHub (only proof, never secrets):

- `Q1_Registration/screenshots/*` (screenshots of desktop, mobile, and terminal output)
- `REGISTRATION.md` (this file)

Commit & push example:

```powershell
git add Q1_Registration/screenshots REGISTRATION.md
git commit -m "Q1: registration proof and README"
git push origin main
```

If you did not save `clientID`/`clientSecret` earlier, contact the organisers immediately and attach the screenshots and PowerShell output showing the server response; include your roll number and email.

Quick scripts (fast):

1) Register using PowerShell (saves `registration-response.json` in project folder):

```powershell
.
\scripts\register.ps1 -Name "Your Name" -Email "you@domain" -Mobile "9999999999" -Github "your-gh" -RollNo "2300032592" -AccessCode "ACCESS_CODE"
```

2) Get auth token once you have `clientId`/`clientSecret` (saves `auth-token.json`):

```powershell
.
\scripts\get-auth.ps1 -ClientId "YOUR_CLIENT_ID" -ClientSecret "YOUR_CLIENT_SECRET" -OutFile "$env:USERPROFILE\Documents\auth-token.json"
```

3) Draft email to organisers: see `EMAIL_TO_ORG.txt` in repository root. Attach screenshots from `Q1_Registration/screenshots/`.

4) Commit placeholders or real screenshots and push:

```powershell
git add Q1_Registration/screenshots/* REGISTRATION.md EMAIL_TO_ORG.txt scripts/*
git commit -m "Q1: add helper scripts and email draft for credential recovery"
git push
```

