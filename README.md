---

# Node.js README.md


# Task Management System - Node.js Services

## Overview

Node.js microservices for the Task Management System.

Provides:

- Analytics
- Export Services
- Notifications
- Email Delivery
- Scheduled Jobs
- Socket.IO Real-Time Updates

---

## Deployment

### Platform Used

Render

### Why Render?

Render was selected because it provides:

- Easy Node.js deployment
- Free hosting option
- Automatic GitHub deployments
- Support for long-running Express services
- Support for Socket.IO and Cron Jobs

---

## Live URLs

### Node.js Service

https://task-management-node-services-bcuw.onrender.com/

### Laravel API

https://task-management-laravel-api-production.up.railway.app/

### React Frontend

https://task-management-laravel-h332l9xd8.vercel.app/

---

## Local Setup

### Clone Repository


git clone <repository-url>
cd task-management-node-services
Install Dependencies
npm install
Configure Environment Variables

Create a .env file:

PORT=3000

LARAVEL_API_URL=http://localhost:8000/api

EMAIL_USER=
EMAIL_PASS=

SYSTEM_EMAIL=
SYSTEM_PASSWORD=
Start Node.js Locally
npm start

or

node server.js

Default URL:

http://localhost:3000
Features
Analytics
Task Summary
Team Productivity
Upcoming Deadlines
Export

Supported formats:

JSON
CSV
XLSX
Notifications
Real-Time Notifications
Email Notifications
Notification Queue
Rate Limiting
Scheduled Jobs
Daily Digest
Deadline Reminder
Task Cleanup
Running Both Services Locally
Terminal 1 - Laravel
php artisan serve
Terminal 2 - Node.js
npm start
API Communication

Node.js communicates with Laravel through:

LARAVEL_API_URL=http://localhost:8000/api

Production:

LARAVEL_API_URL=https://task-management-laravel-api-production.up.railway.app/api
Author

Daryll Kendrick Zuniga
```md
