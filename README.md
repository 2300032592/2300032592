# 2300032592 - Campus Notifications Frontend

React frontend for the notifications evaluation task.

## Features

- All Notifications view
- Priority Inbox view (top `n` unread notifications)
- Query params support for notifications API:
	- `limit`
	- `page`
	- `notification_type`
- Read/View state handling in UI
- Logging middleware integration:
	- `POST /evaluation-service/logs`

## Project Files

- Frontend UI: `src/App.js`
- Frontend styles: `src/App.css`
- Design writeup (Stage 1–6): `logging_middleware/notification_system_design.md`

## Run Locally

```bash
npm install
npm start
```

Application runs on:

`http://localhost:3000`

## Testing

```bash
npm test -- --watchAll=false
```

## Access Token (Required)

Paste a valid `access_token` in the app input before loading notifications.

Use this PowerShell command to generate a token:

```powershell
$body = @{
	clientID     = "YOUR_CLIENT_ID"
	clientSecret = "YOUR_CLIENT_SECRET"
} | ConvertTo-Json

$res = Invoke-RestMethod -Uri "http://4.224.186.213/evaluation-service/auth" `
	-Method Post `
	-ContentType "application/json" `
	-Body $body

$res.access_token
```

Paste only token value (without `Bearer`) in the UI.

## Notes

- `.gitignore` excludes `node_modules`, `.DS_Store`, and local credential artifacts.
- CRA proxy is configured in `package.json` to forward `/evaluation-service/*` during local development.
