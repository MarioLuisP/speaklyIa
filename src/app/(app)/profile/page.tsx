
"use client";

import React, { useState, useEffect } from 'react';
import type { UserProfile as AppUserProfile } from '@/types'; // Renamed to avoid conflict
import { UserAvatar } from '@/components/UserAvatar';
import { Button } from '@/components/ui/button';
import { Shield, Star, Zap, Edit3, Mail, LogOut, Save } from 'lucide-react';
import { Input } from '@/components/ui/input'; 
import { useRouter } from 'next/navigation'; 
import { useUser, SignOutButton } from '@clerk/nextjs';

const MOCK_USER_SESSION_KEY = 'speaklyai_mock_user_session';

interface EffectiveUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // Clerk's user might not have this directly in the simple object
  dataAihint?: string;
}

// Mock user data - used if no Clerk user and no mock session
const defaultMockUser: AppUserProfile = {
  id: 'mock_user_mario_001',
  name: 'Mario (Default Mock)',
  email: 'mario-default@example.com',
  avatarUrl: 'https://placehold.co/150x150.png?text=M',
  dataAihint: "user avatar",
  userLevel: 'Novato',
  score: 75,
  wordsLearned: 20,
  consecutiveDays: 3,
  currentVocabularyLevel: 'Novice',
  learningGoals: 'General English improvement and travel vocabulary',
  tematic: 'Viajes',
  lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const levelIcons = {
  Novato: <Shield className="text-green-500" />, // Changed color to match theme better
  Intermedio: <Star className="text-blue-500" />, // Changed color
  Experto: <Zap className="text-purple-500" />,   // Changed color
};

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const router = useRouter(); 

  const [effectiveUser, setEffectiveUser] = useState<EffectiveUser | null>(null);
  const [userAppData, setUserAppData] = useState<AppUserProfile>(defaultMockUser); // Holds combined data for display

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');


  useEffect(() => {
    let userToUse: EffectiveUser | null = null;
    if (isClerkLoaded) {
      if (clerkUser) {
        userToUse = {
          id: clerkUser.id,
          name: clerkUser.firstName || clerkUser.username || 'Usuario Clerk',
          email: clerkUser.emailAddresses[0]?.emailAddress || 'clerk-user@example.com',
          avatarUrl: clerkUser.imageUrl,
          dataAihint: "clerk avatar"
        };
      } else {
        const mockSessionRaw = localStorage.getItem(MOCK_USER_SESSION_KEY);
        if (mockSessionRaw) {
          try {
            const mockStoredUser = JSON.parse(mockSessionRaw);
            userToUse = {
              id: mockStoredUser.id,
              name: mockStoredUser.firstName || 'Usuario Mock',
              email: mockStoredUser.email || 'mock-user@example.com',
              avatarUrl: `https://placehold.co/150x150.png?text=${(mockStoredUser.firstName || 'U')[0]}`,
              dataAihint: "mock avatar placeholder"
            };
          } catch (e) {
            console.error("Failed to parse mock user session", e);
          }
        }
      }
    }
    
    if (userToUse) {
        setEffectiveUser(userToUse);
        // Simulate fetching app-specific data for this user
        // In a real app, this would be an API call using userToUse.id
        setUserAppData(prev => ({
            ...prev, // keep some defaults like level, score if not in userToUse
            id: userToUse.id,
            name: userToUse.name,
            email: userToUse.email,
            avatarUrl: userToUse.avatarUrl || prev.avatarUrl,
            dataAihint: userToUse.dataAihint || prev.dataAihint
            // Other fields like score, userLevel would come from your backend
        }));
        setEditName(userToUse.name);
        setEditEmail(userToUse.email);
    } else if (isClerkLoaded && !clerkUser) { // Clerk loaded, no clerk user, no mock user
        setUserAppData(defaultMockUser); // Fallback to default mock if no one is "logged in"
        setEditName(defaultMockUser.name);
        setEditEmail(defaultMockUser.email);
    }

  }, [clerkUser, isClerkLoaded]);


  const handleEditToggle = () => {
    if (isEditing) {
      // Simulate saving profile changes - In real app, this would be an API call
      setUserAppData(prev => ({ ...prev, name: editName, email: editEmail }));
      if (effectiveUser?.id.startsWith('mock_')) { // Update mock session if it's a mock user
        const updatedMockUser = { ...JSON.parse(localStorage.getItem(MOCK_USER_SESSION_KEY) || '{}'), firstName: editName, email: editEmail };
        localStorage.setItem(MOCK_USER_SESSION_KEY, JSON.stringify(updatedMockUser));
      }
      console.log("Profile saved (simulated):", { name: editName, email: editEmail });
      // TODO: API call to backend to save profile for real users
    } else {
      setEditName(userAppData.name);
      setEditEmail(userAppData.email);
    }
    setIsEditing(!isEditing);
  };

  const handleMockLogout = () => {
    localStorage.removeItem(MOCK_USER_SESSION_KEY);
    router.push('/login'); 
  };

  if (!isClerkLoaded && !effectiveUser) {
     return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  // Determine which logout button to show
  let logoutButton;
  if (clerkUser) {
    logoutButton = <SignOutButton signOutCallback={() => router.push('/login')}><Button variant="ghost"><LogOut size={18} className="mr-2" />Cerrar Sesión (Clerk)</Button></SignOutButton>;
  } else if (effectiveUser?.id.startsWith('mock_')) {
    logoutButton = <Button variant="ghost" onClick={handleMockLogout}><LogOut size={18} className="mr-2" />Cerrar Sesión (Mock)</Button>;
  } else {
    // Fallback if no user but somehow on this page (middleware should prevent)
    logoutButton = <Button variant="ghost" onClick={() => router.push('/login')}><LogOut size={18} className="mr-2" />Ir a Login</Button>;
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
                  disabled // Email usually not editable if tied to auth provider
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
            {logoutButton}
          </div>
        </div>
      </Card>
    </div>
  );
}
