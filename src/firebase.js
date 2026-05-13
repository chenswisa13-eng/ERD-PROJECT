// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration and service exports.
//
// HOW TO SET UP YOUR OWN FIREBASE PROJECT:
//  1. Go to https://console.firebase.google.com and create a project.
//  2. Add a Web App to your project and copy the firebaseConfig object below.
//  3. In Firestore, create a database (start in test mode for development).
//  4. In Authentication, enable the Email/Password sign-in provider.
//  5. Replace the placeholder values in firebaseConfig with your real values.
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️  Replace these with your own Firebase project credentials.
const firebaseConfig = {
  apiKey: "AIzaSyCji5g2K325ujBFxsFT3IWgTh0dIjkLFGE",
  authDomain: "eduportal-b214c.firebaseapp.com",
  projectId: "eduportal-b214c",
  storageBucket: "eduportal-b214c.firebasestorage.app",
  messagingSenderId: "653226599225",
  appId: "1:653226599225:web:222bd9b701d56086837ee8",
  measurementId: "G-9KFCQ86BW5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
