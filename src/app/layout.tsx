
import type {Metadata} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MockAuthProvider } from '@/providers/MockAuthProvider'; // Import MockAuthProvider

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SpeaklyAI',
  description: 'Mejorá tu vocabulario día a día con IA',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Removed Clerk-specific environment variable checks and error page
  // as we are now using MockAuthProvider.

  return (
    // ClerkProvider is replaced by MockAuthProvider
    <MockAuthProvider>
      <html lang="es" data-theme="vocabmastertheme">
        <body className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </MockAuthProvider>
  );
}
