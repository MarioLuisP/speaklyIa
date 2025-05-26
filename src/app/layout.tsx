
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

const PLACEHOLDER_KEYS = [
  "pk_test_YOUR_KEY_HERE",
  "pk_test_YOUR_PUBLISHABLE_KEY",
  "pk_test_xxxxxxxxxxxxxxxxx" // Common placeholder pattern
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let isKeyMissingOrInvalid = false;
  let specificErrorReason = "";

  if (!clerkPublishableKey || clerkPublishableKey.trim() === "") {
    isKeyMissingOrInvalid = true;
    specificErrorReason = "La variable de entorno <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> no está definida o está vacía en tu archivo <code>.env.local</code>.";
  } else if (PLACEHOLDER_KEYS.some(placeholder => clerkPublishableKey.includes(placeholder)) || clerkPublishableKey.toLowerCase().includes("your_key") || clerkPublishableKey.toLowerCase().includes("xxxx")) {
    isKeyMissingOrInvalid = true;
    specificErrorReason = `El valor de <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> parece ser un placeholder (como "${clerkPublishableKey}"). Por favor, usa tu clave publicable REAL.`;
  }


  // Server-side log to help diagnose if Next.js is picking up the key
  if (typeof window === 'undefined') {
    console.log(
      '[SpeaklyAI Server Log] Clerk Publishable Key status in RootLayout:',
      clerkPublishableKey && clerkPublishableKey.trim() !== ""
        ? `Found (key starts with: ${clerkPublishableKey.substring(0, 10)}...). Is it a placeholder? ${PLACEHOLDER_KEYS.some(placeholder => clerkPublishableKey.includes(placeholder))}`
        : '!!! KEY NOT FOUND, Empty, or Undefined !!!'
    );
  }

  if (isKeyMissingOrInvalid) {
    // If the key is missing, empty, or a known placeholder, render a prominent error page.
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
              Error Crítico de Configuración: Problema con la Clave Publicable de Clerk
            </h1>
            <p style={{ marginBottom: '0.5rem', color: 'darkred', fontWeight: 'bold' }}>
              {specificErrorReason}
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Por favor, sigue estos pasos CUIDADOSAMENTE:
            </p>
            <ol style={{ textAlign: 'left', margin: '0 auto', display: 'inline-block', listStylePosition: 'inside' }}>
              <li style={{ marginBottom: '0.5rem' }}>1. Asegúrate de tener un archivo llamado exactamente <code>.env.local</code> en la **raíz** de tu proyecto (al mismo nivel que <code>package.json</code>).</li>
              <li style={{ marginBottom: '0.5rem' }}>2. Añade tu clave publicable de Clerk REAL (debe empezar con <code>pk_test_</code> o <code>pk_live_</code>) a este archivo. Ejemplo:</li>
            </ol>
            <pre style={{
              backgroundColor: '#f1f1f1',
              padding: '10px',
              marginTop: '10px',
              marginBottom: '1rem',
              textAlign: 'left',
              borderRadius: '4px',
              border: '1px solid #ddd',
              overflowX: 'auto',
              color: '#333'
            }}>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxx<br />
              CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxx
            </pre>
            <p style={{ marginBottom: '0.5rem' }}>
              (Reemplaza <code>pk_test_xxx...</code> con tu clave publicable REAL del <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>Dashboard de Clerk</a>. ¡No uses la clave secreta aquí para la publishable key!)
            </p>
            <p style={{ fontWeight: 'bold', color: 'darkred', marginTop: '1rem', marginBottom: '0.5rem' }}>
              3. MUY IMPORTANTE: Después de guardar el archivo <code>.env.local</code>, DETÉN tu servidor de desarrollo (Ctrl+C en la terminal) y VUELVE A INICIARLO con <code>npm run dev</code>.
            </p>
            <p>
              Si el problema persiste, verifica que no haya espacios extra alrededor de la clave en el archivo <code>.env.local</code> y que sea la clave correcta.
            </p>
          </div>
        </body>
      </html>
    );
  }

  // If the key exists, is not empty, and is not a known placeholder, proceed to render the app with ClerkProvider
  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey!} // Non-null assertion as we've checked above
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
