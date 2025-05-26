"use client";

// This page is now effectively replaced by /sign-up/[[...index]]/page.tsx
// You can redirect users to /sign-up or remove this page if Clerk handles all sign-up flows.
// For now, let's redirect to Clerk's sign-up page.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/sign-up');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <p>Redirigiendo a registro...</p>
    </div>
  );
}
