import { Logo } from '@/components/ui/Logo';
import { ThemeController } from './ThemeController';
// Removed Clerk's UserButton import as we are reverting Clerk integration for now

interface NavbarProps {
  hideAuthButtons?: boolean;
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
      <div className="navbar-end gap-2">
        <ThemeController />
        {/* 
          UserButton from Clerk was here. Removed as part of reverting Clerk.
          If you re-integrate Clerk, you would add <UserButton afterSignOutUrl="/" /> back.
        */}
        {!hideAuthButtons && (
          <>
            {/* Login/Signup buttons could be re-added here if needed for non-app pages */}
          </>
        )}
      </div>
    </div>
  );
}
