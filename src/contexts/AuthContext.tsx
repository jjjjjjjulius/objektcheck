import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { displayName: string; companyName: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = 'Bei der Anmeldung ist ein Fehler aufgetreten';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'E-Mail-Adresse oder Passwort ist falsch';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut';
          break;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: { displayName: string; companyName: string }) => {
    try {
      setError(null);
      
      // Create the user account first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Create the user document in Firestore first
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: userData.displayName,
        companyName: userData.companyName,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Then update the profile
      await updateProfile(user, {
        displayName: userData.displayName
      });

    } catch (error: any) {
      let errorMessage = 'Bei der Registrierung ist ein Fehler aufgetreten';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet';
          break;
        case 'auth/weak-password':
          errorMessage = 'Das Passwort muss mindestens 6 Zeichen lang sein';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Ungültige E-Mail-Adresse';
          break;
        case 'permission-denied':
          errorMessage = 'Keine Berechtigung zum Erstellen des Kontos';
          break;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      setError('Beim Abmelden ist ein Fehler aufgetreten');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}