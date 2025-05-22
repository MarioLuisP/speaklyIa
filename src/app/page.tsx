import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Logo } from '@/components/ui/Logo';

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="hero min-h-[calc(100vh-10rem)]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <Logo size="lg" className="justify-center mb-6" />
              <h1 className="text-5xl font-bold text-base-content">SpeaklyAI</h1> {/* Changed from VocabMaster AI */}
              <p className="py-6 text-lg text-base-content/80">
                Mejorá tu vocabulario día a día con IA. Descubrí nuevas palabras y alcanzá la fluidez.
              </p>
              <div className="space-x-4">
                <Link href="/login" className="btn btn-primary btn-wide">
                  Log In
                </Link>
                <Link href="/signup" className="btn btn-secondary btn-wide">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - Todos los derechos reservados por SpeaklyAI</p> {/* Changed from VocabMaster AI */}
        </aside>
      </footer>
    </div>
  );
}
