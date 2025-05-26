
'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // For UserButton mock

// Simplified MockUser, avoiding direct Clerk type dependency for this mock setup
interface MockUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  imageUrl?: string;
  emailAddresses: Array<{ emailAddress: string; [key: string]: any }>; // Keep flexible for potential other email props
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
  username: 'mario_speakly',
  imageUrl: 'https://placehold.co/40x40.png?text=M', // Adjusted size for navbar
  dataAihint: 'mock user avatar',
  emailAddresses: [{ emailAddress: 'mario@speakly.ai' }],
};

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  // Start with user as null, login page will call signIn
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(true); // Simulate Clerk's loaded state

  const signIn = useCallback((callback?: () => void) => {
    setCurrentUser(hardcodedUser);
    if (callback) callback();
  }, []);

  const signOut = useCallback((callback?: () => void) => {
    setCurrentUser(null);
    if (callback) callback();
  }, []);

  const value = {
    user: currentUser,
    isLoaded: isLoaded,
    isSignedIn: !!currentUser,
    signIn,
    signOut,
  };

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
};

export const useUser = (): { user: MockUser | null; isLoaded: boolean; isSignedIn: boolean } => {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    // This error indicates incorrect setup, which is good for development
    // For a production-like mock, might return { user: null, isLoaded: true, isSignedIn: false }
    throw new Error('useUser must be used within a MockAuthProvider');
  }
  return { user: context.user, isLoaded: context.isLoaded, isSignedIn: context.isSignedIn };
};

// Mock <SignedIn> and <SignedOut> components for layout compatibility
export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return isSignedIn ? <>{children}</> : null;
};

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useUser();
  return !isSignedIn ? <>{children}</> : null;
};

// Mock <UserButton>
// This is a very basic mock. A real UserButton has a dropdown, links to profile, etc.
export const UserButton = ({ afterSignOutUrl }: { afterSignOutUrl?: string }) => {
  const context = useContext(MockAuthContext);
  const router = useRouter();

  if (!context) return null; // Should not happen if used correctly
  const { user, signOut: mockSignOut } = context;

  const handleSignOut = () => {
    mockSignOut(() => {
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
      {/* Basic sign out action for the mock */}
      <button 
        onClick={handleSignOut} 
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.875rem' }}
      >
        Cerrar Sesión (Mock)
      </button>
    </div>
  );
};
