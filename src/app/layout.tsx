
import type {Metadata} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/providers/ThemeProvider';
import { MockAuthProvider } from '@/providers/MockAuthProvider';
import { PracticeProvider } from '@/providers/PracticeContext'; // Using alias

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SpeaklyAI',
  description: 'Mejorá tu vocabulario día a día con IA',
  icons: {
    icon: '/favicon.ico', // Ensure this file exists in public/
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="vocabmastertheme">
      <body className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <MockAuthProvider>
          <PracticeProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </PracticeProvider>
        </MockAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
