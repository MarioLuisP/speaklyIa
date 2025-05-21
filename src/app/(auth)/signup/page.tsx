"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Mail, Lock, User } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, completá todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Mock signup logic
    console.log('Signup attempt:', { name, email, password });
    // On successful signup:
    router.push('/home'); // Or to a "verify email" page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <Logo size="lg" className="mb-8" />
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="card-title text-2xl justify-center mb-4">Crear Cuenta</h2>
          {error && <div role="alert" className="alert alert-error text-sm p-2 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{error}</span></div>}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <User className="w-4 h-4 opacity-70" />
              <input 
                type="text" 
                placeholder="Tu nombre" 
                className="grow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </label>
          </div>
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
                placeholder="Creá una contraseña" 
                className="grow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirmar Contraseña</span>
            </label>
            <label className="input input-bordered flex items-center gap-2">
              <Lock className="w-4 h-4 opacity-70" />
              <input 
                type="password" 
                placeholder="Repetí la contraseña" 
                className="grow"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </label>
          </div>
          <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">Registrarme</button>
          </div>
          <p className="mt-4 text-center text-sm">
            ¿Ya tenés cuenta? <Link href="/login" className="link link-primary">Ingresá</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
