import type {Metadata} from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from "@clerk/localizations";

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
  // This log runs on the server-side when Next.js builds/renders the layout.
  // Check your terminal (where you run `npm run dev`) for this message.
  if (typeof window === 'undefined') { // Ensure this only logs on the server
    console.log(
      '[SpeaklyAI Server Log] Attempting to load Clerk Publishable Key in RootLayout:',
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Found' : 'NOT Found or Undefined'
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY} // This is where the key is passed
      localization={esES}
    >
      <html lang="es" data-theme="vocabmastertheme">
        <body className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col`}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
