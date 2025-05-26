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
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Server-side log to help diagnose if Next.js is picking up the key
  if (typeof window === 'undefined') {
    console.log(
      '[SpeaklyAI Server Log] Clerk Publishable Key status in RootLayout:',
      clerkPublishableKey 
        ? `Found (key starts with: ${clerkPublishableKey.substring(0, 10)}...)` 
        : '!!! KEY NOT FOUND or Undefined !!!'
    );
  }

  if (!clerkPublishableKey) {
    // If the key is missing, render a prominent error page instead of trying to load Clerk.
    return (
      <html lang="es">
        <body className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 p-4`}>
          <div style={{ 
            border: '3px dashed red', 
            padding: '20px', 
            margin: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'red', marginBottom: '1rem' }}>
              Error Crítico de Configuración: Falta la Clave de Clerk
            </h1>
            <p style={{ marginBottom: '0.5rem' }}>
              La aplicación no puede iniciarse porque la variable de entorno <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> no está definida.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Por favor, sigue estos pasos:
            </p>
            <ol style={{ textAlign: 'left', margin: '0 auto', display: 'inline-block' }}>
              <li style={{ marginBottom: '0.5rem' }}>1. Asegúrate de tener un archivo llamado <code>.env.local</code> en la raíz de tu proyecto.</li>
              <li style={{ marginBottom: '0.5rem' }}>2. Añade tu clave publicable de Clerk a este archivo. Ejemplo:</li>
            </ol>
            <pre style={{ 
              backgroundColor: '#f1f1f1', 
              padding: '10px', 
              marginTop: '10px', 
              marginBottom: '1rem',
              textAlign: 'left', 
              borderRadius: '4px',
              border: '1px solid #ddd',
              overflowX: 'auto'
            }}>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx<br />
              CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxx
            </pre>
            <p style={{ marginBottom: '0.5rem' }}>
              (Reemplaza <code>pk_test_xxx...</code> con tu clave real del <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>Dashboard de Clerk</a>.)
            </p>
            <p>
              3. **Muy importante:** Después de guardar el archivo <code>.env.local</code>, **reinicia tu servidor de desarrollo** (detenlo con Ctrl+C y vuelve a ejecutar <code>npm run dev</code>).
            </p>
          </div>
        </body>
      </html>
    );
  }

  // If the key exists, proceed to render the app with ClerkProvider
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
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
