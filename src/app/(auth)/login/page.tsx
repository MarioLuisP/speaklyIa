"use client";

// This page is now effectively replaced by /sign-in/[[...index]]/page.tsx
// You can redirect users to /sign-in or remove this page if Clerk handles all sign-in flows.
// For now, let's redirect to Clerk's sign-in page.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sign-in');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <p>Redirigiendo a inicio de sesión...</p>
    </div>
  );
}
