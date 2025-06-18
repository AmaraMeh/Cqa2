import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  institution: string;
  department: string;
  location: string;
  createdAt: Date;
  totalScans: number;
  totalTests: number;
  compliance: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile>) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, {
        displayName: profile.displayName
      });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: profile.displayName || '',
        role: profile.role || 'Utilisateur',
        institution: profile.institution || '',
        department: profile.department || '',
        location: profile.location || '',
        createdAt: new Date(),
        totalScans: 0,
        totalTests: 0,
        compliance: 0
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    try {
      const updatedProfile = { ...userProfile, ...updates };
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}