
"use client";

import React, { useState, useEffect } from 'react';
import type { UserProfile as AppUserProfile } from '@/types';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Shield, Star, Zap, Edit3, Mail, LogOut, Save, Loader2 } from 'lucide-react'; 
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/MockAuthContext'; // Updated import path

const defaultMockUserAppData: AppUserProfile = {
  id: 'user_mock_mario_123', 
  name: 'Mario',
  email: 'mario@speakly.ai',
  avatarUrl: 'https://placehold.co/150x150.png?text=M',
  dataAihint: "user avatar",
  userLevel: 'Intermedio',
  score: 650,
  wordsLearned: 120,
  consecutiveDays: 3,
  currentVocabularyLevel: 'Intermediate', 
  learningGoals: 'General English improvement and travel vocabulary',
  tematic: 'Viajes',
  lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const levelIcons = {
  Novato: <Shield className="text-green-500" />,
  Intermedio: <Star className="text-blue-500" />,
  Experto: <Zap className="text-purple-500" />,
};

export default function ProfilePage() {
  const { user, signOut: mockSignOut, isLoaded, isSignedIn, updateUserProfile } = useUser(); // Added updateUserProfile
  const router = useRouter();

  const [userAppData, setUserAppData] = useState<AppUserProfile>(defaultMockUserAppData);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');


  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setUserAppData(prev => ({
        ...defaultMockUserAppData, 
        id: user.id,
        name: user.firstName || 'Usuario',
        email: user.emailAddresses?.[0]?.emailAddress || 'no-email@example.com',
        avatarUrl: user.imageUrl || prev.avatarUrl,
        dataAihint: user.imageUrl ? "user avatar" : prev.dataAihint,
        score: user.score || prev.score,
        userLevel: user.userLevel || prev.userLevel,
        wordsLearned: user.wordsLearned || prev.wordsLearned,
        consecutiveDays: user.consecutiveDays || prev.consecutiveDays,
        currentVocabularyLevel: user.currentVocabularyLevel || prev.currentVocabularyLevel,
        learningGoals: user.learningGoals || prev.learningGoals,
        tematic: user.tematic || prev.tematic,
        lastLogin: user.lastLogin || prev.lastLogin,
      }));
      setEditName(user.firstName || 'Usuario');
      setEditEmail(user.emailAddresses?.[0]?.emailAddress || 'no-email@example.com');
    } else if (isLoaded && !isSignedIn) {
        router.push('/login');
    }
  }, [user, isLoaded, isSignedIn, router]);


  const handleEditToggle = () => {
    if (isEditing) {
      updateUserProfile({ firstName: editName }); 
      setUserAppData(prev => ({ ...prev, name: editName, email: editEmail }));
      console.log("Profile saved (simulated):", { name: editName, email: editEmail });
    } else {
      setEditName(userAppData.name);
      setEditEmail(userAppData.email);
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    mockSignOut(() => {
      router.push('/login');
    });
  };

  if (!isLoaded || (isSignedIn && !userAppData.id)) { 
     return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
     );
  }

  if (!isSignedIn) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Redirigiendo a inicio de sesión...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="lg:card-side bg-base-200 shadow-xl">
        <figure className="p-6 flex flex-col items-center justify-center lg:w-1/3">
          <UserAvatar src={userAppData.avatarUrl} name={userAppData.name} size="lg" dataAihint={userAppData.dataAihint}/>
          {isEditing && (
            <Button variant="outline" size="sm" className="mt-2">Cambiar Avatar (Próximamente)</Button>
          )}
        </figure>
        <div className="card-body lg:w-2/3">
          {isEditing ? (
            <>
              <label className="form-control w-full">
                <div className="label"><span className="label-text">Nombre</span></div>
                <Input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input input-bordered w-full bg-base-100"
                />
              </label>
              <label className="form-control w-full mt-2">
                <div className="label"><span className="label-text">Email</span></div>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input input-bordered w-full bg-base-100"
                  disabled 
                />
              </label>
            </>
          ) : (
            <>
              <h2 className="card-title text-3xl">{userAppData.name}</h2>
              <p className="text-base-content/80 flex items-center gap-2"><Mail size={16} /> {userAppData.email}</p>
            </>
          )}

          <div className="flex items-center gap-2 mt-4">
            <span className="text-xl font-semibold">Nivel:</span>
            <div className="badge badge-lg badge-outline gap-2 p-3">
              {levelIcons[userAppData.userLevel]}
              {userAppData.userLevel}
            </div>
          </div>

          <div className="divider my-4"></div>

          <div className="stats stats-vertical lg:stats-horizontal shadow bg-transparent">
            <div className="stat">
              <div className="stat-title">XP Total</div>
              <div className="stat-value text-primary">{userAppData.score}</div>
              <div className="stat-desc">Puntos de experiencia</div>
            </div>
            <div className="stat">
              <div className="stat-title">Palabras Aprendidas</div>
              <div className="stat-value text-secondary">{userAppData.wordsLearned}</div>
              <div className="stat-desc">Vocabulario dominado</div>
            </div>
            <div className="stat">
              <div className="stat-title">Racha Días</div>
              <div className="stat-value">{userAppData.consecutiveDays}</div>
              <div className="stat-desc">¡Seguí así!</div>
            </div>
          </div>

          <div className="card-actions justify-end mt-6 space-x-2">
            <Button onClick={handleEditToggle} className={`btn ${isEditing ? 'btn-success' : 'btn-outline btn-primary'}`}>
              {isEditing ? <Save size={18} className="mr-2"/> : <Edit3 size={18} className="mr-2"/>}
              {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
            </Button>
            <Button variant="ghost" onClick={handleLogout}><LogOut size={18} className="mr-2" />Cerrar Sesión (Mock)</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
