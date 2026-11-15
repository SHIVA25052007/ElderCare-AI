/**
 * Firebase Integration Architecture for ELDERCARE AI
 * 
 * In this Catalyst Hackathon prototype, demo authentication and LocalStorage persistence
 * are active by default to enable immediate evaluator testing without external credentials.
 * 
 * When deploying to production:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password, Phone Auth for SOS SMS alerts, Google Sign-In)
 * 3. Enable Cloud Firestore & Firebase Cloud Messaging (for push notifications)
 * 4. Populate your .env file with VITE_FIREBASE_* credentials
 */

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Safely retrieve environment variables without throwing
export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Returns true if real Firebase production credentials are provided
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY'
);

export const authModeDescription = isFirebaseConfigured
  ? 'Live Firebase Authentication & Cloud Firestore Active'
  : 'Demo Prototype Mode Active (LocalStorage Persistence & Mock Role Engine)';
