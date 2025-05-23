import type {Metadata} from 'next';
import { Poppins } from 'next/font/google'; // Changed from Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/providers/ThemeProvider';

const poppins = Poppins({ // Instantiated Poppins
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Added common weights
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'SpeaklyAI', // Changed from VocabMaster AI
  description: 'Mejorá tu vocabulario día a día con IA', // Kept Spanish description
  icons: {
    icon: '/favicon.ico', // Standard path for favicon in the public directory
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="vocabmastertheme">
      <body className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}> {/* Used poppins variable */}
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
