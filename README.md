# Daily Flow — Personal Story Diary & Multimedia Vault

A responsive personal story diary web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase v10+**, styled with Apple's **"Liquid Glass"** aesthetic and featuring **strict user-level data isolation**.

---

## ✨ Features

### 1. Apple "Liquid Glass" Visual Aesthetic
- **Serene Fixed Pastel Canvas:** Multi-point mesh gradient blending soft sky blue, subtle lavender, and warm pearl white across the entire viewport.
- **Translucent Frosted Glass Surfaces:** Translucent glass panels (`bg-white/60 backdrop-blur-2xl`), crisp luminous borders (`border border-white/60`), subtle inner highlights, and generous rounded corners (`rounded-3xl`).
- **Apple Typography & Polish:** Clean system sans-serif hierarchy, subtle hover elevations, and smooth modal transitions.

### 2. Built-in Live Clock, Calendar & Time Tracking
- **Live Updating Date & Clock:** Sticky header pill displaying day of the week, full date, and real-time clock (e.g. `Saturday, Nov 21, 2026 • 1:50:24 PM`).
- **Interactive Monthly Calendar Widget:** 
  - Desktop sidebar and collapsible mobile drawer.
  - Highlights today's date with a luminous pill.
  - Glowing indicator dots beneath every date with at least one diary entry.
  - Single-click date filtering with a clear **"Show All Memories"** button to reset.
- **Automatic Entry Timestamps:** Automatically captures both the memory date (defaults to today's `YYYY-MM-DD`, with date picker to backdate) and exact time written formatted via Firebase `serverTimestamp()`.

### 3. Strict User Data Isolation & Security
- **Authentication:** Centered Liquid Glass authentication card for Email/Password sign-up, sign-in, and sign-out. Unauthenticated users are isolated to the login screen.
- **Instant Demo Mode:** Click *"Explore Demo Mode (Instant Preview)"* to immediately experience the app pre-populated with multimedia memories even before configuring Firebase keys.
- **Private Firestore Vault:** Each user's data is strictly isolated under `users/{uid}/entries/{entryId}`.
- **Private Media Storage:** All photos and videos upload under `users/{uid}/{entryId}/{fileName}`.
- **Enforced Security Rules:** Includes `firestore.rules` and `storage.rules` in the project root enforcing `request.auth != null && request.auth.uid == userId` on all CRUD operations.

### 4. Core Story Diary & Media Management
- **New Memory Composer:** Frosted-glass modal with multi-file drag-and-drop supporting images (`image/*`) and videos (`video/*`), thumbnail previews, remove buttons, and real-time upload progress bars.
- **Spacious Story Feed:** Reverse-chronological cards with date pills, time stamps, full story text, inline video players with native controls, and photos.
- **Full-Screen Lightbox:** High-resolution photo preview with keyboard navigation (Esc, Left/Right arrows), zoom toggle, and download.
- **Search & Filters:** Real-time search by story title or text, plus filters for All, Photos, or Videos.
- **Edit & Delete:** Edit title, note content, or memory date, and delete entries (which automatically purges associated media files from Firebase Storage).

---

## 🚀 Getting Started

### 1. Clone & Install
The project is already initialized in this directory. To run in dev mode:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Configure Firebase (Optional for Cloud Sync)
Open [`.env.local`](file:///d:/gravity%20file/.env.local) and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy Security Rules
Deploy the generated security rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules,storage
```

---

## 📁 Project Structure

```
├── app/
│   ├── globals.css              # Apple Liquid Glass styles & mesh gradient
│   ├── layout.tsx               # Root layout & AuthProvider wrapper
│   └── page.tsx                 # Main diary workspace & feed
├── components/
│   ├── AuthScreen.tsx           # Liquid Glass login & sign-up card
│   ├── HeaderClock.tsx          # Live date & real-time clock pill
│   ├── MonthlyCalendar.tsx      # Interactive calendar with glowing memory dots
│   ├── MobileCalendarDrawer.tsx # Responsive mobile calendar drawer
│   ├── MemoryCard.tsx           # Story feed cards with inline media
│   ├── MemoryComposerModal.tsx  # New memory composer with upload progress
│   ├── MemoryEditModal.tsx      # Edit memory title, note, date, and media
│   ├── MediaLightbox.tsx        # Full-screen photo lightbox with keyboard nav
│   ├── DeleteConfirmModal.tsx   # Deletion confirmation modal
│   ├── FeedControls.tsx         # Search bar, media filters & date reset
│   └── PrivacyCard.tsx          # User-level privacy status badge
├── contexts/
│   └── AuthContext.tsx          # Firebase Auth & Demo Mode state
├── lib/
│   ├── firebase.ts              # Safe Firebase v10 client initialization
│   ├── types.ts                 # TypeScript interfaces
│   └── dateUtils.ts             # Date matrix, calendar, and clock formatters
├── services/
│   └── diaryService.ts          # Firestore & Storage operations
├── firestore.rules              # Strict Firestore user isolation rules
├── storage.rules                # Strict Firebase Storage user isolation rules
└── .env.local                   # Firebase environment variables
```
