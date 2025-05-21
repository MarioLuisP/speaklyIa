"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Basic validation
    if (!email || !password) {
      setError('Por favor, completá todos los campos.');
      return;
    }
    // Mock login logic
    console.log('Login attempt:', { email, password });
    // On successful login:
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <Logo size="lg" className="mb-8" />
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="card-title text-2xl justify-center mb-4">Iniciar Sesión</h2>
          {error && <div role="alert" className="alert alert-error text-sm p-2 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div>}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <Mail className="w-4 h-4 opacity-70" />
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="grow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Contraseña</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <Lock className="w-4 h-4 opacity-70" />
              <input 
                type="password" 
                placeholder="Tu contraseña" 
                className="grow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </label>
            <label className="label">
              <a href="#" className="label-text-alt link link-hover">¿Olvidaste tu contraseña?</a>
            </label>
          </div>
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">Ingresar</button>
          </div>
          <p className="mt-4 text-center text-sm">
            ¿No tenés cuenta? <Link href="/signup" className="link link-primary">Registrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
