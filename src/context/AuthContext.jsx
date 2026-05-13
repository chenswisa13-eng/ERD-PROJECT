// src/context/AuthContext.jsx
// Provides Firebase Auth state globally via React Context.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // Firebase Auth user
  const [student, setStudent] = useState(null);   // Firestore student doc
  const [loading, setLoading] = useState(true);

  // ── Sync auth state ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'Students', firebaseUser.uid));
          if (snap.exists()) {
            setStudent({ studentId: snap.id, ...snap.data() });
          } else {
            // New user — create a minimal record; OnboardingModal will complete it
            const defaultStudent = {
              name:  firebaseUser.displayName || firebaseUser.email,
              major: '', // empty = triggers onboarding
            };
            await setDoc(doc(db, 'Students', firebaseUser.uid), defaultStudent);
            setStudent({ studentId: firebaseUser.uid, ...defaultStudent });
          }
        } catch {
          setStudent({
            studentId: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email,
            major: '',
          });
        }
      } else {
        setStudent(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    return result;
  }, []);

  // ── Allow OnboardingModal to update local student state after save ───────────
  const updateStudent = useCallback((patch) => {
    setStudent((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, student, loading, signInWithGoogle, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
