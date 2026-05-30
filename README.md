# 2300032592 - Campus Hiring Evaluation

Frontend submission for notifications task using React.

## Implemented

- Stage 1 to Stage 6 design: `logging_middleware/notification_system_design.md`
- Stage 7 frontend app:
	- all notifications view
	- priority notifications view (top `n`)
	- filter support for `notification_type`
	- query params support: `limit`, `page`, `notification_type`
	- viewed vs new state in UI
	- logging middleware API integration (`/evaluation-service/logs`)

Main files:
- `src/App.js`
- `src/App.css`

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Test

```bash
npm test -- --watchAll=false
```
