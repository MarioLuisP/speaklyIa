
"use client";
import { Logo } from '@/components/ui/Logo';
import { ThemeController } from './ThemeController';
import { useUser, SignedIn, SignedOut, UserButton as MockUserButton } from "@/providers/MockAuthContext"; // Updated import path
import Link from 'next/link';
import { Button } from '../ui/button';
import React from 'react';

export function Navbar({ hideAuthButtons = false }: NavbarProps) {
  const { user, isLoaded } = useUser(); 

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
      <div className="navbar-start">
        <Link href={user ? "/home" : "/"} passHref legacyBehavior>
          <a className="hover:opacity-80 transition-opacity">
            <Logo />
          </a>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
      </div>
      <div className="navbar-end gap-2 items-center">
        <ThemeController />
        {isLoaded ? (
          <>
            <SignedIn> 
              <MockUserButton afterSignOutUrl="/" /> 
            </SignedIn>
            <SignedOut> 
              {!hideAuthButtons && (
                <>
                  <Link href="/login" legacyBehavior passHref>
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/signup" legacyBehavior passHref>
                    <Button variant="default">Registrarse</Button>
                  </Link>
                </>
              )}
            </SignedOut>
          </>
        ) : (
          <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div> 
        )}
      </div>
    </div>
  );
}

interface NavbarProps {
  hideAuthButtons?: boolean;
}
