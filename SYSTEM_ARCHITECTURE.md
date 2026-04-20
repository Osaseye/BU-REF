# Babcock Reference System - System Architecture

This document outlines the high-level architecture, data flow, authentication mechanisms, and security model of the Babcock Reference System.

## 1. High-Level Architecture

The system is built on a serverless architecture using a decoupled frontend and backend, with a dedicated proxy for external API communication.

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS
- **Backend (BaaS):** Firebase (Authentication, Firestore, Storage, Cloud Functions)
- **Integration Layer:** PHP 8.2 Proxy (for UMIS API integration)

```text
[ React Frontend ] <----(HTTPS)----> [ Firebase Services ]
       |                                   |
    (Hooks/API)                            |
       |                                   v
[ PHP UMIS Proxy ]                 [ Cloud Functions ]
       |                                   |
   (cURL POST)                             |
       v                                   v
[ Babcock UMIS API ]              [ Firestore & Auth ]
```

## 2. Authentication Flow

Authentication is split into two distinct mechanisms to handle the different types of users (Students vs. Staff/Admins).

### 2.1 Student Authentication (UMIS Integration)
Instead of creating new passwords, students authenticate using their existing Babcock UMIS credentials.

1. **User Input:** Student enters Matric Number and Password on the frontend.
2. **Proxy Request:** Frontend sends credentials to the hosted `umis-proxy` (PHP).
3. **UMIS Verification:** The proxy forwards the request via cURL to the actual Babcock UMIS API.
4. **Proxy Response:** If successful, UMIS returns the student data. The proxy sends this back to the React frontend.
5. **Firebase Custom Token:** The frontend calls the Firebase Cloud Function (`createStudentSession`), passing the validated Matric Number.
6. **Token Minting:** The Cloud Function verifies the request, mints a Firebase Custom Auth Token with the claim `{ role: 'student', matricNo: '...' }`, and returns it.
7. **Sign In:** Frontend calls `signInWithCustomToken(token)` to establish a persistent Firebase session.

### 2.2 Lecturer & Admin Authentication
Staff members use traditional Firebase Email/Password authentication.

1. **User Input:** Staff enters Email and Password.
2. **Direct Auth:** Frontend calls `signInWithEmailAndPassword`.
3. **Role Verification:** The `AuthContext` reads the user's Firestore document (`/lecturers/{uid}`) or checks custom claims to verify if they are a `lecturer` or an `admin`.

## 3. Database Architecture (Firestore)

The system uses a NoSQL document database (Firestore).

### `students` Collection
*Document ID: Matriculation Number (e.g., "19/2143")*
- `matricNo` (string)
- `firstName`, `lastName` (string)
- `department`, `level` (string)
- `avatarUrl` (string - references Firebase Storage)
- `referenceData` (object) - Stores the actual reference content.

### `lecturers` Collection
*Document ID: Firebase Auth UID*
- `email` (string)
- `name` (string)
- `department` (string)
- `role` (string) - "lecturer" or "admin"
- `status` (string) - "active" or "revoked"

## 4. Security & Role-Based Access Control (RBAC)

Security is enforced at the database level using Firebase Security Rules, ensuring that malicious client-side code cannot bypass permissions.

- **Students:** Can only read and write their *own* document. They cannot view other students or staff records.
- **Lecturers:** Can read all student documents to provide references, but cannot modify student profiles.
- **Admins:** Have read/write access to the `lecturers` collection to invite or revoke staff privileges.

Firebase Cloud Functions run in a trusted Node.js environment with Admin SDK privileges, bypassing these rules safely to orchestrate auth tokens and invite links.

## 5. Cloud Functions (`functions/src/index.ts`)

Server-side business logic is handled by Google Cloud Functions:

1. `createStudentSession`: Mints custom JWTs for students after they pass UMIS proxy verification.
2. `inviteLecturer`: Allows Admins to securely generate a new lecturer account and send an onboarding link/email.
3. `revokeLecturer`: Temporarily or permanently disables a lecturer's account and updates their Firestore status.

## 6. Hosting and Deployment Strategy

- **Frontend:** Hosted on Firebase Hosting, Vercel, or Netlify. (Static assets built via `npm run build`).
- **Backend/Database:** Firebase ecosystem.
- **PHP Proxy:** Hosted on an external PHP-capable server (e.g., Railway, Heroku, or cPanel hosting) to ensure the `UMIS_API_URL` environment variables are kept secret from the public browser.
