import { Logo } from '@/components/ui/Logo';
import { ThemeController } from './ThemeController';

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
        {!hideAuthButtons && (
          <>
            {/* These buttons would typically be ShadCN buttons styled with DaisyUI classes */}
            {/* For now, direct DaisyUI buttons */}
            {/* <Link href="/login" className="btn btn-ghost btn-sm">Log In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Sign Up</Link> */}
          </>
        )}
      </div>
    </div>
  );
}
