# Health Tracking Dashboard — Full Overhaul

## Overview

A comprehensive upgrade of the existing React+Vite dashboard to include:
- **Backend**: Express.js + SQLite (easy to run, no Docker needed)
- **OCR**: Gemini Vision API extracts health values from uploaded PDFs/images
- **AI Chat**: Real Gemini API via backend proxy (just set `GEMINI_API_KEY` in `.env`)
- **Auth**: JWT login/register with themed pages matching the dashboard
- **Database**: SQLite via `better-sqlite3` — zero config, single file
- **Analytics Page**: Charts with PDF/CSV export button
- **Synced Metrics**: Report upload → OCR → DB write → dashboard auto-refreshes

> [!IMPORTANT]
> The user only needs to add `GEMINI_API_KEY=your_key` to `backend/.env`. Everything else works out of the box.

## Proposed Changes

---

### Backend (`Health Tracking Dashboard/backend/`)

#### [NEW] `backend/package.json`
Express, better-sqlite3, multer, @google/generative-ai, jsonwebtoken, bcryptjs, cors, dotenv

#### [NEW] `backend/index.js`
Main Express server entry. Sets up CORS, JSON body parsing, multer for file uploads, and mounts all route files.

#### [NEW] `backend/db.js`
SQLite database initialization with schema for:
- `users` (id, name, email, password_hash, created_at)
- `reports` (id, user_id, name, lab, date, type, notes, metrics_count, created_at)
- `metrics` (id, user_id, report_id, name, value, unit, status, normal_min, normal_max, category, recorded_at)
- `alerts` (id, user_id, metric_id, severity, title, message, recommendation, read, created_at)

#### [NEW] `backend/routes/auth.js`
- `POST /api/auth/register` — hash password, insert user, return JWT
- `POST /api/auth/login` — verify password, return JWT + user info
- `GET /api/auth/me` — return current user from JWT

#### [NEW] `backend/routes/reports.js`
- `POST /api/reports/upload` — accepts file via multer, sends to Gemini Vision for OCR, parses extracted metrics, writes to DB, recalculates health score
- `GET /api/reports` — list user's reports with metrics count

#### [NEW] `backend/routes/metrics.js`
- `GET /api/metrics` — all metrics for user (latest value per metric name)
- `GET /api/metrics/:id` — full history for a metric
- `POST /api/metrics` — manual metric entry

#### [NEW] `backend/routes/chat.js`
- `POST /api/chat` — accepts `{ messages, userHealthContext }`, calls Gemini API, returns AI response

#### [NEW] `backend/routes/analytics.js`
- `GET /api/analytics` — returns aggregated data: metrics over time, category scores, health score trend

#### [NEW] `backend/routes/alerts.js`
- `GET /api/alerts` — list alerts for user
- `PATCH /api/alerts/:id/read` — mark alert as read

#### [NEW] `backend/middleware/auth.js`
JWT verification middleware for protected routes.

#### [NEW] `backend/.env`
```
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

---

### Frontend Changes (`src/`)

#### [NEW] `src/app/lib/api.ts`
Centralized API client with base URL `http://localhost:3001/api`. Includes `authFetch` wrapper that auto-attaches JWT token from localStorage.

#### [NEW] `src/app/contexts/AuthContext.tsx`
React context for auth state: `user`, `token`, `login()`, `logout()`, `register()`. Persists JWT to localStorage.

#### [NEW] `src/app/pages/Login.tsx`
Themed login page matching the dashboard design. Fields: email, password. Links to register.

#### [NEW] `src/app/pages/Register.tsx`
Themed register page. Fields: name, email, password, confirm password.

#### [NEW] `src/app/components/ProtectedRoute.tsx`
Wraps routes — redirects to `/login` if user is not authenticated.

#### [MODIFY] [routes.ts](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/routes.ts)
Add `/login`, `/register` routes outside Layout. Wrap Layout children with ProtectedRoute. Add `/analytics` route.

#### [MODIFY] [App.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/App.tsx)
Wrap with `AuthProvider`.

#### [MODIFY] [Layout.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/components/Layout.tsx)
Add "Analytics" link to sidebar. Add user avatar/logout button in header.

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/Dashboard.tsx)
Replace all `mockData` imports with API calls: `/api/metrics`, `/api/reports`, `/api/alerts`. Show real health score computed from actual metrics.

#### [MODIFY] [UploadReport.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/UploadReport.tsx)
Real file upload to `POST /api/reports/upload`. Gemini Vision returns extracted fields. Shows real OCR'd values in review step. On save → metrics synced to DB + dashboard updates.

#### [MODIFY] [AIAssistant.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/AIAssistant.tsx)
Replace [getAIResponse()](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/AIAssistant.tsx#14-39) mock with real call to `POST /api/chat`. User health context (current metrics) is sent with every message for personalized responses.

#### [MODIFY] [MetricsOverview.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/MetricsOverview.tsx)
Fetch from `/api/metrics` instead of mockData.

#### [MODIFY] [MetricDetail.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/MetricDetail.tsx)
Fetch from `/api/metrics/:id`.

#### [MODIFY] [ReportHistory.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/ReportHistory.tsx)
Fetch from `/api/reports`.

#### [MODIFY] [Alerts.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/Alerts.tsx)
Fetch from `/api/alerts`, PATCH to mark read.

#### [MODIFY] [ManualEntry.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/ManualEntry.tsx)
POST to `/api/metrics`.

#### [MODIFY] [Profile.tsx](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/pages/Profile.tsx)
Fetch from `/api/auth/me`, PUT to update profile.

#### [NEW] `src/app/pages/Analytics.tsx`
Dedicated analytics page with:
- Line chart: health score over time
- Bar chart: metrics by category
- Radar chart: category scores
- Export button → generates CSV or printable PDF Report
- Themed to match dashboard (blue gradient header, white cards, recharts)

#### [MODIFY] [mockData.ts](file:///c:/Users/shrav/Downloads/Health%20Tracking%20Dashboard/src/app/data/mockData.ts)
Keep TypeScript interfaces/types only (used for type safety). Remove all hardcoded data exports.

---

## Verification Plan

### Setup
1. `cd "Health Tracking Dashboard/backend" && npm install && node index.js`
2. `cd "Health Tracking Dashboard" && npm install && npm run dev`

### Automated (Browser Tests via Subagent)
- Navigate to `http://localhost:5173`
- Verify redirect to `/login` when not authenticated
- Register new account → should redirect to dashboard
- Login with account → should show dashboard with empty state
- Upload a health report file → verify OCR extraction shows extracted fields
- Save report → verify dashboard metrics update
- Navigate to AI Assistant → send a message → verify real Gemini response
- Navigate to Analytics → verify charts render → click Export → verify download

### Manual Verification Steps
1. Open `http://localhost:5173/login`
2. Click "Register" → fill in name, email, password → Submit  
3. Should land on Dashboard with 0 reports, 0 metrics shown
4. Click "Upload Report" → drag/drop or select a PDF → wait for OCR
5. Review extracted fields → click Save
6. Return to Dashboard → metrics should now show real values
7. Go to AI Assistant → ask "What does my LDL mean?" → verify personalized response
8. Go to Analytics → check charts → click Export button
