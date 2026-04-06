# Health Tracking Dashboard

## Running the Frontend
Run:
npm install
npm run dev

## Running the Backend
Run:
cd backend
npm install
node index.js

## If port 3001 is already in use (Windows)
Run:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess -Force
Stop-Process -Name node -Force