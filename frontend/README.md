# CIT AlConn - Frontend Prototype

This repository contains a React + Vite frontend prototype for the CIT AlConn project. It demonstrates Firebase Authentication (email/password + email verification), Firebase Storage for media uploads, and a client-side Razorpay donation prototype. User profiles and meeting requests are stored in your Node/Express backend (MongoDB) in this current version.

Important notes & assumptions
- Firebase is used for authentication only (email/password + verification). Profiles and meeting requests are saved to the backend (MongoDB) via REST API calls. Posts and media uploads still use Firebase Storage/Firestore in the prototype; you can move them to your backend if desired.
- Email verification uses Firebase's sendEmailVerification flow.

Setup
1. Install dependencies (PowerShell):

```powershell
cd c:\Users\Pottr\OneDrive\Desktop\cit-alconn-me-frontend
npm install
```

2. Create a Firebase project and enable Email/Password auth, Firestore and Storage.
3. Create a `.env` in the project root with these variables (example):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_RAZORPAY_KEY=your_razorpay_key_id (test mode)

VITE_API_BASE_URL=http://localhost:4000  # base URL of your Node/Express backend (optional)
```

4. Start dev server:

```powershell
npm run dev
```

What this prototype includes
- Signup (role selection: admin/alumni/student), sends email verification and stores a profile in your backend under `/api/users`.
- Login (requires email verification). After login, users are redirected to role-specific dashboards.
- Admin dashboard: lists unverified alumni and posts; admin can mark alumni verified and soft-delete posts.
- Alumni & Student dashboards: view post feed; alumni can create posts and meeting requests.
- Post media uploads stored in Firebase Storage (posts stored in `posts` collection).
- Meeting requests are saved to your backend via `POST /api/meetings`. Admins can fetch requests from `GET /api/meetings` (backend responsibility).
- Donation button uses Razorpay checkout in client-only prototype (real integration requires backend order creation).

Required backend endpoints (this frontend expects these):

- POST /api/users
	- Create a user profile. Request body: { uid, email, role, verified, ... }
- GET /api/users/:uid
	- Return the profile for the Firebase uid.
- GET /api/users?role=alumni
	- Return array of users filtered by role (Admin dashboard uses this).
- PATCH /api/users/:id/verify
	- Mark the user as verified. Called by Admin dashboard.
- POST /api/meetings
	- Create a meeting request. Request body: { alumniId, link, date, time, status, createdAt }
- GET /api/meetings
	- Return meeting requests for admin view.

Other recommendations:
- Implement server-side Razorpay order creation and signature verification (required for production payments).
- Harden admin actions with server-side authorization checks (validate admin role using Firebase token or other auth).

If you want, I can:
- Switch remaining data operations (posts, donations) to call your Node/Express endpoints (if you provide their API surface),
- Add admin meeting UI to approve/disapprove requests via the backend,
- Add more UI polish, form validation, and tests,
- Add a small script to seed an admin account.

