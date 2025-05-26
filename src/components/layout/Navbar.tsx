
"use client";
import { Logo } from '@/components/ui/Logo';
import { ThemeController } from './ThemeController';
import { UserButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { Button } from '../ui/button';
import React, { useEffect, useState } from 'react'; // Added React, useEffect, useState
import { useRouter } from 'next/navigation'; // Added useRouter

interface NavbarProps {
  hideAuthButtons?: boolean;
}

const MOCK_USER_SESSION_KEY = 'speaklyai_mock_user_session';

interface MockUserSession {
  id: string;
  firstName: string;
  email: string;
}

export function Navbar({ hideAuthButtons = false }: NavbarProps) {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [mockUser, setMockUser] = useState<MockUserSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isClerkLoaded && !clerkUser) {
      const mockSessionRaw = localStorage.getItem(MOCK_USER_SESSION_KEY);
      if (mockSessionRaw) {
        try {
          setMockUser(JSON.parse(mockSessionRaw));
        } catch (e) {
          localStorage.removeItem(MOCK_USER_SESSION_KEY); // Clear invalid session
        }
      } else {
        setMockUser(null); // Ensure mockUser is null if no session
      }
    } else if (clerkUser) {
      setMockUser(null); // Clear mock user if Clerk user exists
    }
  }, [clerkUser, isClerkLoaded]);

  const handleMockLogout = () => {
    localStorage.removeItem(MOCK_USER_SESSION_KEY);
    setMockUser(null);
    router.push('/login'); // Or refresh to let middleware handle if needed
  };

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
      <div className="navbar-start">
        <Link href={clerkUser || mockUser ? "/home" : "/"} passHref legacyBehavior>
          <a><Logo /></a>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        {/* Future navigation links can go here */}
      </div>
      <div className="navbar-end gap-2 items-center">
        <ThemeController />
        {isClerkLoaded ? (
          <>
            {clerkUser ? (
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                }
              }}/>
            ) : mockUser ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:inline">Mock: {mockUser.firstName}</span>
                <Button variant="ghost" size="sm" onClick={handleMockLogout}>Salir (Mock)</Button>
              </div>
            ) : (
              !hideAuthButtons && (
                <>
                  <Link href="/login" legacyBehavior passHref>
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/signup" legacyBehavior passHref>
                    <Button variant="default">Registrarse</Button>
                  </Link>
                </>
              )
            )}
          </>
        ) : (
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div> // Skeleton loader for user button area
        )}
      </div>
    </div>
  );
}
