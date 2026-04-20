# Final Year Student Repository — Full Project Specification

> Built for Babcock University | Developed under SIDID Limited
> Stack: React 19 · TypeScript · Vite · Firebase · PHP (UMIS Proxy) · Tailwind CSS

---

## 1. Project Overview

A centralized repository for Babcock University final year students. Academic and personal data is seeded from the UMIS API (Babcock's student information system) to ensure accuracy. Students enrich their own profiles post-login. Lecturers access the system read-only to reference graduated students.

### Core Goals
- Pull verified student data from UMIS — no self-reported academic data
- Students authenticate using their existing UMIS credentials (matric number + password)
- Students update non-academic profile fields after login
- Lecturers and admin log in via email + password
- Admin (Mr. Adegboola) controls which lecturers have access
- Clean, minimal UI using Babcock University branding

---

## 2. User Roles

| Role | Login Method | Permissions |
|---|---|---|
| **Student** | Matric number + UMIS password | View & edit own profile only |
| **Lecturer** | Email + password (Firebase) | Read-only access to all student profiles |
| **Admin** | Email + password (Firebase) | All lecturer permissions + invite/revoke lecturers |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| State Management | React Context + useReducer (no Redux) |
| Backend / Auth | Firebase (Auth, Firestore, Storage) |
| UMIS Proxy | PHP 8.2 (deployed on Railway) |
| Notifications | Sonner |
| Forms | react-hook-form + zod |
| Icons | Lucide React |
| Deployment | Vercel (frontend) · Railway (PHP API) |

---

## 4. Design System

### 4.1 Brand Colors (Babcock University)

```css
:root {
  --color-primary:        #063A84;   /* Babcock Blue */
  --color-primary-light:  #154B9A;   /* Mid Blue */
  --color-primary-muted:  #E6EFFB;   /* Blue tint background */
  --color-gold:           #C39113;   /* Babcock Gold */
  --color-gold-light:     #FDF4DC;   /* Gold tint */
  --color-surface:        #FFFFFF;
  --color-background:     #F7F9FC;
  --color-border:         #E2E8F0;
  --color-text-primary:   #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted:     #94A3B8;
  --color-danger:         #C0392B;
  --color-danger-light:   #FDECEA;
}
```

### 4.2 Typography

```css
/* Google Fonts — add to index.html */
/* Display: DM Serif Display — used for headings */
/* Body: DM Sans — used for all UI text */

--font-display: 'DM Serif Display', serif;
--font-body:    'DM Sans', sans-serif;
```

### 4.3 Design Principles
- **Minimalist** — generous whitespace, no decorative clutter
- **Data-forward** — tables and cards that surface information clearly
- **Babcock-branded** — blue primary, gold accents, logo in header
- Borders use `--color-border`, not shadows by default
- Buttons: filled (primary blue) for primary actions, outlined for secondary
- No gradients except subtle `--color-primary-muted` backgrounds on cards
- All UMIS-sourced fields rendered in a read-only style (light grey background, lock icon)

### 4.4 Component Patterns

```
Buttons:
  Primary   → bg-[--color-primary] text-white rounded-lg px-4 py-2
  Secondary → border border-[--color-primary] text-[--color-primary] rounded-lg px-4 py-2
  Danger    → bg-[--color-danger] text-white rounded-lg px-4 py-2

Inputs:
  Default   → border border-[--color-border] rounded-lg px-3 py-2 focus:ring-[--color-primary]
  Readonly  → bg-gray-50 border border-[--color-border] text-[--color-text-secondary] cursor-not-allowed

Cards:
  Default   → bg-white border border-[--color-border] rounded-xl p-6

Badges:
  Active    → bg-[--color-primary-muted] text-[--color-primary] rounded-full px-2 py-0.5 text-xs
  Revoked   → bg-[--color-danger-light] text-[--color-danger] rounded-full px-2 py-0.5 text-xs
  Gold      → bg-[--color-gold-light] text-[--color-gold] rounded-full px-2 py-0.5 text-xs
```

---

## 5. Project Folder Structure

```
src/
├── assets/
│   └── babcock-logo.png
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── ReadonlyField.tsx       ← for UMIS-sourced fields
│   │
│   ├── layout/
│   │   ├── AppShell.tsx            ← sidebar + topbar wrapper
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── AuthLayout.tsx          ← centered card layout for login pages
│   │
│   ├── student/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileForm.tsx
│   │   ├── AvatarUpload.tsx
│   │   └── StudentRow.tsx          ← used in lecturer/admin tables
│   │
│   └── admin/
│       ├── LecturerTable.tsx
│       ├── InviteLecturerModal.tsx
│       └── RevokeLecturerModal.tsx
│
├── pages/
│   ├── auth/
│   │   ├── StudentLogin.tsx        ← matric + password form
│   │   └── StaffLogin.tsx          ← email + password form (lecturers + admin)
│   │
│   ├── student/
│   │   └── StudentProfile.tsx      ← student's own profile view + edit
│   │
│   ├── lecturer/
│   │   ├── LecturerDashboard.tsx   ← search + browse all students
│   │   └── StudentDetail.tsx       ← read-only full profile view
│   │
│   └── admin/
│       ├── AdminDashboard.tsx      ← same as lecturer + manage lecturers tab
│       └── ManageLecturers.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useStudent.ts
│   ├── useLecturers.ts
│   └── useUmisAuth.ts              ← calls PHP proxy, handles UMIS login flow
│
├── context/
│   └── AuthContext.tsx             ← global auth state, role detection
│
├── lib/
│   ├── firebase.ts                 ← Firebase app init
│   ├── firestore.ts                ← typed Firestore helpers
│   ├── storage.ts                  ← Firebase Storage helpers
│   └── umisProxy.ts                ← fetch wrapper for PHP API endpoints
│
├── types/
│   └── index.ts                    ← all shared TypeScript interfaces
│
├── routes/
│   └── index.tsx                   ← all route definitions + guards
│
└── main.tsx
```

---

## 6. TypeScript Types

```typescript
// src/types/index.ts

export type UserRole = 'student' | 'lecturer' | 'admin';

export interface UmisStudentData {
  matricNo: string;
  fullName: string;
  department: string;
  faculty: string;
  cgpa: number;
  level: string;
  graduationYear?: string;
}

export interface StudentProfile {
  // UMIS-sourced (read-only, never editable by student)
  matricNo: string;
  fullName: string;
  department: string;
  faculty: string;
  cgpa: number;
  level: string;
  graduationYear?: string;

  // Student-supplied (editable)
  photoURL?: string;
  projectTitle?: string;
  supervisorName?: string;
  contactEmail?: string;
  phoneNumber?: string;
  linkedInURL?: string;
  bio?: string;

  // System fields
  uid: string;
  createdAt: Date;
  updatedAt: Date;
  lastUmisSyncAt: Date;
  profileComplete: boolean;
}

export interface LecturerProfile {
  uid: string;
  fullName: string;
  email: string;
  department?: string;
  invitedBy: string;       // admin uid
  invitedAt: Date;
  status: 'active' | 'revoked';
}

export interface AdminProfile {
  uid: string;
  fullName: string;
  email: string;
}

export interface AuthUser {
  uid: string;
  role: UserRole;
  profile: StudentProfile | LecturerProfile | AdminProfile;
}
```

---

## 7. Firestore Collections & Security Rules

### 7.1 Collections

```
students/{matricNo}         — StudentProfile document
lecturers/{uid}             — LecturerProfile document
admins/{uid}                — AdminProfile document
```

### 7.2 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isActiveLecturer() {
      return exists(/databases/$(database)/documents/lecturers/$(request.auth.uid))
        && get(/databases/$(database)/documents/lecturers/$(request.auth.uid)).data.status == 'active';
    }

    function isStudent(matricNo) {
      return request.auth.token.matricNo == matricNo;
    }

    // Students collection
    match /students/{matricNo} {
      allow read: if isAdmin() || isActiveLecturer() || isStudent(matricNo);
      allow update: if isStudent(matricNo)
        && !request.resource.data.diff(resource.data).affectedKeys()
            .hasAny(['matricNo','fullName','department','faculty','cgpa','level','lastUmisSyncAt']);
      allow create: if false;  // Only created by UMIS proxy flow
      allow delete: if false;
    }

    // Lecturers collection
    match /lecturers/{uid} {
      allow read: if isAdmin() || request.auth.uid == uid;
      allow write: if isAdmin();
    }

    // Admins collection
    match /admins/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if false;  // Seeded manually
    }
  }
}
```

---

## 8. Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /students/{matricNo}/avatar.jpg {
      allow read: if request.auth != null;
      allow write: if request.auth.token.matricNo == matricNo
        && request.resource.size < 2 * 1024 * 1024    // max 2MB
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 9. Authentication Flows

### 9.1 Student Login (UMIS Proxy Flow)

```
1. Student enters matric number + password on /login/student
2. useUmisAuth hook POSTs to PHP proxy: POST https://your-proxy.railway.app/auth/umis
   Body: { matricNo, password }
3. PHP proxy forwards credentials to UMIS API
4. On UMIS success: PHP returns student data JSON
5. React calls Firebase Cloud Function: createStudentSession({ matricNo, umisData })
6. Cloud Function:
   a. Creates/updates students/{matricNo} doc with UMIS data
   b. Mints a Firebase Custom Token with { matricNo } as custom claim
   c. Returns token to client
7. React calls signInWithCustomToken(token)
8. Student is now authenticated in Firebase
9. Redirect to /student/profile
```

### 9.2 Staff Login (Lecturer / Admin)

```
1. Staff enters email + password on /login/staff
2. Firebase signInWithEmailAndPassword()
3. On success: check Firestore for doc in /admins/{uid} or /lecturers/{uid}
4. If admin → redirect to /admin/dashboard
5. If lecturer → check status === 'active', redirect to /lecturer/dashboard
6. If neither doc exists → sign out + show "Access not granted" error
```

### 9.3 Admin Inviting a Lecturer

```
1. Admin fills InviteLecturerModal (name, email, department)
2. Admin calls Firebase Cloud Function: inviteLecturer({ name, email, department })
3. Cloud Function:
   a. Creates Firebase Auth account with temp password
   b. Writes lecturers/{uid} doc with status: 'active'
   c. Sends password-reset email via Firebase Auth (lecturer sets own password)
4. Lecturer appears in ManageLecturers table
```

---

## 10. PHP UMIS Proxy (Railway)

```
File: umis-proxy/
├── index.php        ← router
├── auth.php         ← /auth/umis endpoint
└── .htaccess
```

### auth.php skeleton

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://your-vercel-app.vercel.app');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['error' => 'Method not allowed']));
}

$body = json_decode(file_get_contents('php://input'), true);
$matricNo = $body['matricNo'] ?? '';
$password  = $body['password'] ?? '';

if (!$matricNo || !$password) {
    http_response_code(400);
    exit(json_encode(['error' => 'Missing credentials']));
}

// TODO: Replace with actual UMIS API endpoint and payload
// when Mr. Adegboola provides the API documentation
$umisEndpoint = getenv('UMIS_API_URL');
$ch = curl_init($umisEndpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'matric' => $matricNo,
    'password' => $password
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($statusCode !== 200) {
    http_response_code(401);
    exit(json_encode(['error' => 'Invalid UMIS credentials']));
}

// Return UMIS data to React
echo $response;
```

---

## 11. Cloud Functions

### functions/src/index.ts — Required Functions

```typescript
// 1. createStudentSession
// Called after PHP proxy confirms UMIS auth
// Creates/updates student Firestore doc, mints custom token
export const createStudentSession = onCall(async (request) => { ... });

// 2. inviteLecturer
// Admin only — creates Firebase Auth account, writes Firestore doc, sends reset email
export const inviteLecturer = onCall(async (request) => { ... });

// 3. revokeLecturer
// Admin only — sets lecturers/{uid}.status = 'revoked'
export const revokeLecturer = onCall(async (request) => { ... });
```

---

## 12. Routes

```typescript
// Public
/login/student             ← StudentLogin page
/login/staff               ← StaffLogin page (lecturers + admin)

// Student (protected, role: student)
/student/profile           ← StudentProfile (view + edit own)

// Lecturer (protected, role: lecturer, status: active)
/lecturer/dashboard        ← search + browse all students
/lecturer/student/:matricNo ← read-only full profile

// Admin (protected, role: admin)
/admin/dashboard           ← same view as lecturer
/admin/student/:matricNo   ← read-only full profile
/admin/lecturers           ← ManageLecturers page
```

---

## 13. Page Breakdown

### StudentLogin (`/login/student`)
- Fields: Matric Number, Password
- Submits to UMIS proxy via `useUmisAuth`
- Error states: invalid credentials, UMIS unreachable, access error
- Link to `/login/staff` for lecturers

### StaffLogin (`/login/staff`)
- Fields: Email, Password
- Firebase `signInWithEmailAndPassword`
- Role detection post-login → redirect to correct dashboard

### StudentProfile (`/student/profile`)
- Top section: avatar upload + UMIS readonly fields (name, matric, dept, faculty, CGPA)
- Editable section: project title, supervisor, contact email, phone, LinkedIn, bio
- Save via react-hook-form + zod validation → Firestore update
- Profile completeness indicator (shows what's missing)

### LecturerDashboard (`/lecturer/dashboard`)
- Search bar (by name, matric, department)
- Filter by department, graduation year
- Table/grid of StudentProfile cards
- Click row → StudentDetail page

### StudentDetail (`/lecturer/student/:matricNo` or `/admin/student/:matricNo`)
- Full read-only view of StudentProfile
- All fields visible, no edit controls

### AdminDashboard (`/admin/dashboard`)
- Same as LecturerDashboard
- Extra tab: "Manage Lecturers" → ManageLecturers

### ManageLecturers (`/admin/lecturers`)
- Table of all lecturers (name, email, department, status, invited date)
- "Invite Lecturer" button → InviteLecturerModal
- Revoke/Restore buttons per row

---

## 14. Environment Variables

```env
# .env (Vite frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_UMIS_PROXY_URL=https://your-proxy.railway.app

# PHP proxy (Railway env vars)
UMIS_API_URL=https://umis.babcock.edu.ng/api/...   ← fill when Mr. Adegboola provides
ALLOWED_ORIGIN=https://your-app.vercel.app

# Firebase Functions (.env in functions/)
# No extra vars needed — uses Firebase Admin SDK service account automatically
```

---

## 15. Key Implementation Notes for Copilot

1. **UMIS fields are never editable** — the `ReadonlyField` component should always be used for: `fullName`, `matricNo`, `department`, `faculty`, `cgpa`, `level`. Never render these as `<input>` elements even in edit mode.

2. **Custom Token claims** — when `createStudentSession` Cloud Function mints the token, it must include `{ matricNo }` as a custom claim. The Firestore security rule `isStudent(matricNo)` reads from `request.auth.token.matricNo`.

3. **Profile completeness** — `profileComplete` field on the student doc should be computed as: `photoURL && projectTitle && supervisorName && contactEmail` all being non-empty.

4. **Lecturer status check** — do not just check if a Firestore doc exists under `/lecturers/{uid}`. Always check `status === 'active'`. A revoked lecturer who somehow holds a valid Firebase session should see an "Access revoked" screen, not the dashboard.

5. **No direct Firestore writes from student to UMIS fields** — enforce this both in Firestore Security Rules (see Section 7.2) and in the frontend form schema (zod schema should not include UMIS fields in the update payload).

6. **Babcock logo** — place `babcock-logo.png` in `src/assets/`. Render in `Sidebar.tsx` and `AuthLayout.tsx` header. Do not hardcode a URL.

7. **Sonner** for all toast notifications — import `{ toast } from 'sonner'` and wrap app in `<Toaster />` in `main.tsx`.

8. **react-hook-form + zod** for all forms — `StudentLogin`, `StaffLogin`, `ProfileForm`, `InviteLecturerModal`.
```
