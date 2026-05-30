# Stage 1

## Goal
Design REST APIs and JSON contracts for a notification platform where students receive notifications for `Event`, `Result`, and `Placement`.

## Core Actions
- Create notification
- Get all notifications of a student
- Get unread notifications
- Mark one notification as read
- Mark all notifications as read
- Get top `n` priority unread notifications

## API Contracts

### 1) Create Notification
**POST** `/api/v1/notifications`

Request:
```json
{
  "studentId": "1042",
  "type": "Placement",
  "title": "Hiring Update",
  "message": "CSX Corporation hiring",
  "priority": 3,
  "createdBy": "hr-system"
}
```

Success Response (201):
```json
{
  "id": "n_001",
  "studentId": "1042",
  "type": "Placement",
  "title": "Hiring Update",
  "message": "CSX Corporation hiring",
  "priority": 3,
  "isRead": false,
  "createdAt": "2026-05-30T10:00:00Z"
}
```

### 2) Get Notifications
**GET** `/api/v1/students/{studentId}/notifications?limit=20&page=1&notification_type=Placement`

Success Response (200):
```json
{
  "page": 1,
  "limit": 20,
  "total": 120,
  "notifications": [
    {
      "id": "n_001",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "priority": 3,
      "createdAt": "2026-05-30T10:00:00Z"
    }
  ]
}
```

### 3) Get Unread
**GET** `/api/v1/students/{studentId}/notifications/unread?limit=20&page=1`

### 4) Mark One as Read
**PATCH** `/api/v1/students/{studentId}/notifications/{notificationId}`

Request:
```json
{
  "isRead": true
}
```

Response (200):
```json
{
  "id": "n_001",
  "isRead": true,
  "updatedAt": "2026-05-30T10:05:00Z"
}
```

### 5) Mark All as Read
**PATCH** `/api/v1/students/{studentId}/notifications/read-all`

Response (200):
```json
{
  "updatedCount": 15
}
```

### 6) Top Priority Unread
**GET** `/api/v1/students/{studentId}/notifications/priority?top=10`

Response (200):
```json
{
  "top": 10,
  "notifications": [
    {
      "id": "n_010",
      "type": "Placement",
      "priority": 3,
      "message": "Advanced Micro Devices hiring",
      "createdAt": "2026-05-30T09:50:00Z"
    }
  ]
}
```

## Headers
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

---

# Stage 2

## DB Choice
Use PostgreSQL.

## Why
- Strong support for filters, sort, pagination.
- Reliable transactions and constraints.
- Good indexing options for large read-heavy tables.

## Schema

### students
- `id` (PK)
- `name`
- `email` (unique)
- `created_at`

### notifications
- `id` (PK)
- `student_id` (FK -> students.id)
- `type` (enum: `Event`, `Result`, `Placement`)
- `title`
- `message`
- `priority` (1 to 3)
- `is_read` (boolean, default false)
- `created_at`
- `updated_at`

### recommended indexes
- `(student_id, is_read, created_at DESC)`
- `(student_id, type, created_at DESC)`
- `(student_id, is_read, priority DESC, created_at DESC)`

## Volume Growth Handling
- Use pagination with `limit` and `page`.
- Archive old rows by month if table grows heavily.
- Add read replicas if read traffic becomes high.
- Cache top unread results for short TTL.

## Example Queries

Unread notifications:
```sql
SELECT id, type, title, message, priority, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

Mark one as read:
```sql
UPDATE notifications
SET is_read = true, updated_at = NOW()
WHERE id = $1 AND student_id = $2;
```

Top priority unread:
```sql
SELECT id, type, message, priority, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY priority DESC, created_at DESC
LIMIT $2;
```

---

# Stage 3

## Given Query
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

## Is it accurate?
Partially.
- It fetches unread notifications of the student.
- But `SELECT *` returns all columns (extra payload).
- Sorting oldest first (`ASC`) is usually not ideal for UI. Latest should be first.

## Why slow?
- No `LIMIT`, so it may scan and return many rows.
- If proper composite index is missing, DB scans large data.
- `SELECT *` increases IO and network transfer.

## Better query
```sql
SELECT id, type, title, message, priority, created_at
FROM notifications
WHERE student_id = $1 AND is_read = false
ORDER BY created_at DESC
LIMIT 50;
```

## Cost of improvement
- Slight extra storage for indexes.
- Slightly slower writes because index updates happen on insert/update.
- Large gain on read performance and API response time.

## Should we add indexes on every column?
No.
- Too many indexes slow writes and consume space.
- Add indexes only for common filter/sort patterns.

## Query for students with Placement notifications in last 7 days
```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Stage 4

## Problem
Notifications are fetched on every page load for every student, causing DB pressure and poor UX.

## Recommended Solution
1. Pagination + filtering at API level (`limit`, `page`, `notification_type`).
2. Cache recent unread list (short TTL, e.g., 30 to 60 sec).
3. Cursor-based pagination for very large datasets.
4. Background pre-computation of unread count and top priority list.
5. Read replicas for heavy read traffic.

## Tradeoffs
- Cache improves speed but can be stale for short time.
- More infra (cache/replicas) increases operational complexity.
- Cursor pagination is faster but less direct than page numbers.

---

# Stage 5

## Issue in given pseudocode
Current logic runs each step in a loop and does not handle partial failures safely.
If `send_email` fails for some students, state can become inconsistent.

## Better design
- Use queue-based fan-out.
- Save notification first (source of truth).
- Process email and app push asynchronously with retries.
- Keep idempotency key to prevent duplicate sends.

## Revised pseudocode
```text
function notify_all(student_ids, message):
    batch_id = create_batch(message)

    for student_id in student_ids:
        notification_id = save_notification(batch_id, student_id, message)
        enqueue_job("send_email", {notification_id, student_id, message})
        enqueue_job("push_in_app", {notification_id, student_id, message})

worker send_email(job):
    try:
        call_email_service(job.student_id, job.message)
        mark_email_sent(job.notification_id)
    except:
        retry_with_backoff(job)
        if retries_exhausted:
            mark_email_failed(job.notification_id)

worker push_in_app(job):
    try:
        push_to_app(job.student_id, job.message)
        mark_push_sent(job.notification_id)
    except:
        retry_with_backoff(job)
```

## Why this is reliable
- DB write and delivery are decoupled.
- Failures are retried.
- Each channel has status tracking.

---

# Stage 6

## Requirement
Show top `n` important unread notifications with priority order:
`Placement > Result > Event`, then newest first.

## Working JavaScript logic
```js
const TYPE_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getTopPriorityNotifications(notifications, n) {
  return notifications
    .filter((x) => !x.read)
    .sort((a, b) => {
      const weightDiff = (TYPE_WEIGHT[b.type] || 0) - (TYPE_WEIGHT[a.type] || 0);
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, n);
}
```

## How to maintain top 10 when new data arrives
- Insert new notification into in-memory list.
- Recompute only top 10 sorted subset for display.
- For large scale, maintain a Redis sorted set per student using score = priority weight + time.

## Complexity
- Basic sort approach: `O(m log m)` for `m` unread notifications.
- For frequent updates, use min-heap of size `n` to keep `O(m log n)`.

---

## Final Note
- Stage 7 frontend implementation is already completed in the React app (`src/App.js` + `src/App.css`).
- This document covers Stage 1 to Stage 6 in simple, practical submission format.
