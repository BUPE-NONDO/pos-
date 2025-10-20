// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics, type Analytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA1jWbSs09XlTO2JU5sdKt7X-j9cobsHMM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'pos-28568.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'pos-28568',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'pos-28568.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '277291795693',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:277291795693:web:17881b2f33c5ac6d4178e4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ZB8WJ2K47Z',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null
if (typeof window !== 'undefined' && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  analytics = getAnalytics(app)
}

export { analytics }

// Helper to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.projectId)
}

export default app
