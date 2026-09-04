import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, UserRole } from '../types';

const ADMIN_EMAILS = [
  'aki.sokpah.link@gmail.com',
  'makealuckspam@gmail.com'
];

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const isEmailAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
  };

  const syncUserProfile = async (user: User) => {
    try {
      const email = user.email || '';
      const isAdminRole = isEmailAdmin(email);
      const role: UserRole = isAdminRole ? 'admin' : 'student';

      const userDocRef = doc(db, 'users', user.uid);
      let existingData: UserProfile | null = null;

      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          existingData = snap.data() as UserProfile;
        }
      } catch (err) {
        console.warn('Could not fetch existing profile, will create fresh:', err);
      }

      const now = new Date().toISOString();
      const profile: UserProfile = {
        uid: user.uid,
        fullName: existingData?.fullName || user.displayName || email.split('@')[0] || 'Student',
        email: email,
        photoURL: user.photoURL || undefined,
        role: role,
        accountStatus: existingData?.accountStatus || 'active',
        createdAt: existingData?.createdAt || now,
        updatedAt: now,
      };

      await setDoc(userDocRef, profile, { merge: true });

      // If user is admin, register in admins collection to pass Firestore security rules check
      if (isAdminRole) {
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          await setDoc(adminDocRef, {
            uid: user.uid,
            email: email,
            verifiedAt: now,
          }, { merge: true });
        } catch (adminErr) {
          console.warn('Admin record sync note:', adminErr);
        }
      }

      setUserProfile(profile);
    } catch (err) {
      console.error('Error syncing user profile:', err);
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err?.message || 'Google sign-in could not be completed.');
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Email Sign-In Error:', err);
      setError(err?.message || 'Invalid academic credentials.');
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, fullName: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: fullName });
        await syncUserProfile(cred.user);
      }
    } catch (err: any) {
      console.error('Sign-Up Error:', err);
      setError(err?.message || 'Could not create account.');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(err?.message || 'Sign out failed.');
    }
  };

  const isAdmin = isEmailAdmin(currentUser?.email) || userProfile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        error,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
