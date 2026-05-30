# Submission Checklist

## Code Deliverables
- [x] Stage 1 to Stage 6 written solution: `logging_middleware/notification_system_design.md`
- [x] Stage 7 React frontend implemented in `src/App.js` and `src/App.css`
- [x] Logging middleware integration added in frontend (`/evaluation-service/logs` calls)
- [x] Query params supported: `limit`, `page`, `notification_type`
- [x] Separate views for All Notifications and Priority Notifications
- [x] New vs Viewed state handled in frontend

## Run & Verify
1. Start app:
   - `npm start`
2. Open:
   - `http://localhost:3000`
3. Paste valid access token.
4. Load notifications with different filter combinations.
5. Open Priority view and set Top N.
6. Mark some notifications as read and verify badge changes from `New` to `Viewed`.

## Proof to Capture
- Desktop screenshots:
  - All Notifications page
  - Priority Notifications page
  - Filter + pagination controls in use
- Mobile screenshot (responsive layout)
- API proof screenshot (request/response with status)
- Logging middleware proof screenshot (log API success)
- Short video recording showing complete flow

## GitHub
- Commit all final proof files.
- Push latest branch.
- Submit repository link in evaluation form.
