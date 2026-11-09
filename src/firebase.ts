import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDocFromServer,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId if configured
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Admin email configured for Career Genius platform
export const BOOTSTRAP_ADMIN_EMAIL = 'uutkarsh319@gmail.com';

export function isUserAdmin(user: { email?: string | null; role?: string } | null | undefined): boolean {
  if (!user) return false;
  if (user.email && user.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return true;
  return user.role === 'admin';
}

// Structured error handling matching the Firebase integration standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      return true;
    }
    await getDoc(doc(db, 'users', auth.currentUser.uid));
    return true;
  } catch (error) {
    // Silently fall back to cached / offline state if connection is resolving
    return false;
  }
}

// Helper for Google Sign-In via popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Helper for Sign Out
export async function logOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
    throw error;
  }
}

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
};
export type { FirebaseUser };
