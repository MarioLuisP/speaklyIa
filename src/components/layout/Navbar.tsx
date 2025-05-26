
import { Logo } from '@/components/ui/Logo';
import { ThemeController } from './ThemeController';
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from 'next/link';
import { Button } from '../ui/button';


interface NavbarProps {
  hideAuthButtons?: boolean; // This prop might become less relevant with Clerk handling auth state
}

export function Navbar({ hideAuthButtons = false }: NavbarProps) {
  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-30">
      <div className="navbar-start">
        <Logo />
      </div>
      <div className="navbar-center hidden lg:flex">
        {/* Future navigation links can go here */}
      </div>
      <div className="navbar-end gap-2 items-center">
        <ThemeController />
        <SignedIn>
          <UserButton afterSignOutUrl="/" appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10", // Example to make avatar slightly larger
            }
          }}/>
        </SignedIn>
        <SignedOut>
          {!hideAuthButtons && (
            <>
              <Link href="/sign-in" legacyBehavior passHref>
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/sign-up" legacyBehavior passHref>
                <Button variant="default">Registrarse</Button>
              </Link>
            </>
          )}
        </SignedOut>
      </div>
    </div>
  );
}
