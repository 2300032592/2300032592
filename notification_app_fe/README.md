# notification_app_fe

This folder is added to satisfy the Stage 7 instruction: submit frontend response in a sub-directory within the same repository.

## Implemented Frontend Code Location
The actual React implementation is in the root CRA app:
- `src/App.js`
- `src/App.css`
- `src/App.test.js`

## Features Implemented (Stage 7)
- Runs on `http://localhost:3000`
- Uses provided notifications API route
- Supports query params: `limit`, `page`, `notification_type`
- Separate views:
  - All Notifications
  - Priority Notifications (Top N)
- Distinguishes New vs Viewed notifications
- Responsive layout for desktop and mobile
- Logging middleware integration using `POST /evaluation-service/logs`

## Run
```bash
npm install
npm start
```
