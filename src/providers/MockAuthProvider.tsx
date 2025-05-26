
'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For UserButton mock

const MOCK_USER_SESSION_KEY = 'speaklyai_mock_user_session';

// Simplified MockUser
interface MockUser {
  id: string;
  firstName?: string | null;
  imageUrl?: string;
  emailAddresses: Array<{ emailAddress: string; [key: string]: any }>;
}

interface MockAuthContextType {
  user: MockUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: (callback?: () => void) => void;
  signOut: (callback?: () => void) => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const hardcodedUser: MockUser = {
  id: 'user_mock_mario_123',
  firstName: 'Mario',
  imageUrl: 'https://placehold.co/40x40.png?text=M',
  emailAddresses: [{ emailAddress: 'mario@speakly.ai' }],
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false); // Start as false, set to true after checking storage

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(MOCK_USER_SESSION_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse mock user session from localStorage", error);
      localStorage.removeItem(MOCK_USER_SESSION_KEY);
    }
    setIsLoaded(true); // Auth state is now "loaded"
  }, []);

  const signInHandler = useCallback((callback?: () => void) => {
    localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(hardcodedUser));
    setCurrentUser(hardcodedUser);
    if (callback) callback();
  }, []);

  const signOutHandler = useCallback((callback?: () => void) => {
    localStorage.removeItem(MOCK_USER_SESSION_KEY);
    setCurrentUser(null);
    if (callback) callback();
  }, []);

  const value: MockAuthContextType = {
    user: currentUser,
    isLoaded: isLoaded,
    isSignedIn: !!currentUser,
    signIn: signInHandler,
    signOut: signOutHandler,
  };

  if (!isLoaded) {
    // Optional: Render a loading state or null while checking localStorage
    // This prevents a flash of "logged out" content if the user is actually mock-logged-in
    return null; // Or a global loader component
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

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return !isSignedIn ? <>{children}</> : null;
};

export const UserButton = ({ afterSignOutUrl }: { afterSignOutUrl?: string }) => {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    signOut(() => {
      router.push(afterSignOutUrl || '/');
    });
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} title="User menu (Mock)">
      {user.imageUrl && (
        <img
          src={user.imageUrl}
          alt={user.firstName || 'User'}
          data-ai-hint="user avatar"
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
        />
      )}
      <button
        onClick={handleSignOut}
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}
      >
        Cerrar Sesión (Mock)
      </button>
    </div>
  );
};
