
"use client";

import React, { useState } from 'react';
import type { UserProfile } from '@/types';
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Shield, Star, Zap, Edit3, Mail, LogOut, Save } from 'lucide-react';
import { Input } from '@/components/ui/input'; 
import { useRouter } from 'next/navigation'; 

// Mock user data - replace with actual data fetching
const mockUser: UserProfile = {
  id: '1',
  name: 'Mario',
  email: 'mario@example.com',
  avatarUrl: 'https://placehold.co/150x150.png?text=M',
  dataAihint: "user avatar",
  level: 'Novato',
  xp: 75,
  wordsLearned: 20,
  consecutiveDays: 3,
  currentVocabularyLevel: 'Novice',
  learningGoals: 'General English improvement and travel vocabulary',
};

const levelIcons = {
  Novato: <Shield className="text-success" />,
  Intermedio: <Star className="text-info" />,
  Experto: <Zap className="text-primary" />,
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const router = useRouter(); 

  const handleEditToggle = () => {
    if (isEditing) {
      setUser(prev => ({ ...prev, name: editName, email: editEmail }));
      console.log("Profile saved:", { name: editName, email: editEmail });
    } else {
      setEditName(user.name);
      setEditEmail(user.email);
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    console.log("User logged out, redirecting to login...");
    router.push('/login'); 
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="card lg:card-side bg-base-200 shadow-xl">
        <figure className="p-6 flex flex-col items-center justify-center lg:w-1/3">
          <UserAvatar src={user.avatarUrl} name={user.name} size="lg" dataAihint={user.dataAihint}/>
          {isEditing && (
            <button className="btn btn-xs btn-outline mt-2">Cambiar Avatar</button>
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
                />
              </label>
            </>
          ) : (
            <>
              <h2 className="card-title text-3xl">{user.name}</h2>
              <p className="text-base-content/80 flex items-center gap-2"><Mail size={16} /> {user.email}</p>
            </>
          )}
          
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xl font-semibold">Nivel:</span>
            <div className="badge badge-lg badge-outline gap-2 p-3">
              {levelIcons[user.level]}
              {user.level}
            </div>
          </div>

          <div className="divider my-4"></div>
          
          <div className="stats stats-vertical lg:stats-horizontal shadow bg-transparent">
            <div className="stat">
              <div className="stat-title">XP Total</div>
              <div className="stat-value text-primary">{user.xp}</div>
              <div className="stat-desc">Puntos de experiencia</div>
            </div>
            <div className="stat">
              <div className="stat-title">Palabras Aprendidas</div>
              <div className="stat-value text-secondary">{user.wordsLearned}</div>
              <div className="stat-desc">Vocabulario dominado</div>
            </div>
            <div className="stat">
              <div className="stat-title">Racha Días</div>
              <div className="stat-value">{user.consecutiveDays}</div>
              <div className="stat-desc">¡Seguí así!</div>
            </div>
          </div>

          <div className="card-actions justify-end mt-6 space-x-2">
            <Button onClick={handleEditToggle} className={`btn ${isEditing ? 'btn-success' : 'btn-outline btn-primary'}`}>
              {isEditing ? <Save size={18} className="mr-2"/> : <Edit3 size={18} className="mr-2"/>}
              {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
            </Button>
            <Button className="btn btn-ghost" onClick={handleLogout}> 
              <LogOut size={18} className="mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
