
'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile as AppUserProfile } from '@/types';
import Link from 'next/link'; // Added import

const MOCK_USER_SESSION_KEY = 'speaklyai_mock_user_session_v2'; // Incremented version

// Extended MockUser to include more AppUserProfile fields
interface MockUser extends Omit<AppUserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint'> {
  id: string;
  firstName?: string | null; // Standard Clerk-like field
  lastName?: string | null; // Standard Clerk-like field
  imageUrl?: string; // Standard Clerk-like field
  emailAddresses: Array<{ emailAddress: string; [key: string]: any }>; // Standard Clerk-like field
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (callback?: () => void) => void;
  signOut: (callback?: () => void) => void;
  updateUserProfile: (updates: Partial<MockUser>) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

// Default state for a new/logged-out user
const defaultMockUser: MockUser = {
  id: 'user_mock_mario_123',
  firstName: 'Mario',
  lastName: '',
  imageUrl: 'https://placehold.co/40x40.png?text=M',
  emailAddresses: [{ emailAddress: 'mario@speakly.ai' }],
  userLevel: 'Novato', // Default to Novato
  score: 0,
  wordsLearned: 0,
  consecutiveDays: 0,
  currentVocabularyLevel: 'Beginner', // Aligns with Novato
  learningGoals: 'General English improvement',
  tematic: 'Viajes', // Default tematic
  lastLogin: new Date().toISOString(),
  dailyLessonTarget: 5,
  dailyLessonProgress: 0,
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_SESSION_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Merge with defaults to ensure all fields are present if new ones were added
        setCurrentUser({ ...defaultMockUser, ...parsedUser, id: parsedUser.id || defaultMockUser.id });
      } else {
        // No user in storage, explicitly set to null or could set to defaultMockUser if auto-login on first visit
        // For now, start as null, signIn will set it.
      }
    } catch (error) {
      console.error("Failed to parse mock user session from localStorage", error);
      localStorage.removeItem(MOCK_USER_SESSION_KEY);
    }
    setIsLoaded(true);
  }, []);

  const signInHandler = useCallback((callback?: () => void) => {
    // On sign-in, we use the hardcoded default user to simulate a fresh session or specific test user.
    // If persistence of changes across sign-out/sign-in cycles is needed,
    // this could be adjusted to merge with localStorage if it exists.
    const userToSignIn = { ...defaultMockUser, lastLogin: new Date().toISOString() };
    localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(userToSignIn));
    setCurrentUser(userToSignIn);
    if (callback) callback();
  }, []);

  const signOutHandler = useCallback((callback?: () => void) => {
    localStorage.removeItem(MOCK_USER_SESSION_KEY);
    setCurrentUser(null);
    if (callback) callback();
  }, []);

  const updateUserProfileHandler = useCallback((updates: Partial<MockUser>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...updates };
      localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);


  const value: MockAuthContextType = {
    user: currentUser,
    isLoaded: isLoaded,
    isSignedIn: !!currentUser,
    signIn: signInHandler,
    signOut: signOutHandler,
    updateUserProfile: updateUserProfileHandler,
  };

  if (!isLoaded) {
    return null; // Or a global loader
  }

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

export const useUser = (): MockAuthContextType => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a MockAuthProvider');
  }
  return context;
};

// Components for conditional rendering based on auth state
export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return !isSignedIn ? <>{children}</> : null;
};

// Mock UserButton component
export const UserButton = ({ afterSignOutUrl }: { afterSignOutUrl?: string }) => {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(() => {
      router.push(afterSignOutUrl || '/'); // Redirect to home or specified URL after sign out
    });
  };

  if (!user) return null;

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
        <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
          <img alt={user.firstName || "User Avatar"} src={user.imageUrl || `https://placehold.co/32x32.png?text=${user.firstName?.charAt(0) || 'U'}`} data-ai-hint="user avatar" />
        </div>
      </label>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow bg-base-200 rounded-box w-52">
        <li className="p-2">
          <span className="font-semibold">{user.firstName || 'Usuario'}</span>
          <span className="text-xs text-base-content/70">{user.emailAddresses?.[0]?.emailAddress}</span>
        </li>
        <li><div className="divider my-0"></div></li>
        <li>
          <Link href="/profile" className="justify-between">
            Perfil
            <span className="badge badge-sm">Beta</span>
          </Link>
        </li>
        <li><Link href="/practice-settings">Config. Práctica</Link></li>
        <li><div className="divider my-0"></div></li>
        <li><button onClick={handleSignOut}>Cerrar Sesión (Mock)</button></li>
      </ul>
    </div>
  );
};
