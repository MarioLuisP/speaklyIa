"use client";

import React, { useState } from 'react';
import type { UserProfile, LeaderboardUser } from '@/types';
import { UserAvatar } from '@/components/UserAvatar';
import { TrendingUp, Zap, Shield, Star, Award } from 'lucide-react';

// Mock data
const mockCurrentUser: UserProfile = {
  id: '1',
  name: 'Usuario Demo',
  email: 'demo@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=UD',
  dataAihint: "profile avatar",
  level: 'Novato',
  xp: 75,
  wordsLearned: 20,
  consecutiveDays: 3,
  currentVocabularyLevel: 'Novice',
  learningGoals: 'General English improvement and travel vocabulary',
};

const mockLeaderboard: LeaderboardUser[] = [
  { id: '2', name: 'Ana C.', avatarUrl: 'https://placehold.co/40x40.png?text=AC', dataAihint: "leaderboard avatar", xp: 1250, level: 'Experto' },
  { id: '3', name: 'Luis G.', avatarUrl: 'https://placehold.co/40x40.png?text=LG', dataAihint: "leaderboard avatar", xp: 980, level: 'Intermedio' },
  { id: '1', name: 'Usuario Demo', avatarUrl: 'https://placehold.co/40x40.png?text=UD', dataAihint: "profile avatar", xp: 75, level: 'Novato' }, // Current user
  { id: '4', name: 'Sofia M.', avatarUrl: 'https://placehold.co/40x40.png?text=SM', dataAihint: "leaderboard avatar", xp: 55, level: 'Novato' },
  { id: '5', name: 'Carlos P.', avatarUrl: 'https://placehold.co/40x40.png?text=CP', dataAihint: "leaderboard avatar", xp: 30, level: 'Novato' },
].sort((a, b) => b.xp - a.xp);


const levelDetails = {
  Novato: { icon: Shield, color: 'text-success', nextLevelXP: 100, title: 'Novato Aspirante' },
  Intermedio: { icon: Star, color: 'text-info', nextLevelXP: 250, title: 'Intermedio Destacado' },
  Experto: { icon: Zap, color: 'text-primary', nextLevelXP: Infinity, title: 'Experto Lingüista' }, // Or some high number
};

export default function ProgressPage() {
  const [currentUser] = useState<UserProfile>(mockCurrentUser);
  const [leaderboard] = useState<LeaderboardUser[]>(mockLeaderboard);

  const currentLevelDetail = levelDetails[currentUser.level];
  const progressToNextLevel = currentLevelDetail.nextLevelXP === Infinity ? 100 : (currentUser.xp / currentLevelDetail.nextLevelXP) * 100;
  const pointsToNextLevel = currentLevelDetail.nextLevelXP === Infinity ? 0 : currentLevelDetail.nextLevelXP - currentUser.xp;
  const currentUserRank = leaderboard.findIndex(u => u.id === currentUser.id) + 1;

  const getLevelIcon = (level: 'Novato' | 'Intermedio' | 'Experto') => {
    const Icon = levelDetails[level].icon;
    return <Icon size={16} className={levelDetails[level].color} />;
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Current Progress Section */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-1">Tu Progreso Actual</h2>
          <div className="flex items-center gap-2">
            {React.createElement(levelDetails[currentUser.level].icon, { size: 20, className: levelDetails[currentUser.level].color })}
            <span className={`font-semibold text-lg ${levelDetails[currentUser.level].color}`}>{levelDetails[currentUser.level].title}</span>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>XP Actual: {currentUser.xp}</span>
              {currentLevelDetail.nextLevelXP !== Infinity && <span>Próximo Nivel: {currentLevelDetail.nextLevelXP} XP</span>}
            </div>
            <progress 
                className={`progress ${levelDetails[currentUser.level].color.replace('text-','progress-')} w-full`} 
                value={progressToNextLevel} 
                max="100">
            </progress>
            {pointsToNextLevel > 0 && (
              <p className="text-sm text-center mt-2 text-accent">
                Te faltan <span className="font-bold">{pointsToNextLevel}</span> puntos para subir de nivel. ¡Vos podés!
              </p>
            )}
            {currentLevelDetail.nextLevelXP === Infinity && (
                <p className="text-sm text-center mt-2 text-primary">¡Alcanzaste el máximo nivel de maestría!</p>
            )}
          </div>

          <div className="stats stats-vertical md:stats-horizontal shadow-md mt-6 bg-base-100 rounded-lg">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Award size={32} />
              </div>
              <div className="stat-title">Palabras Aprendidas</div>
              <div className="stat-value">{currentUser.wordsLearned}</div>
              <div className="stat-desc">Total de vocabulario</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <TrendingUp size={32} />
              </div>
              <div className="stat-title">Racha de Práctica</div>
              <div className="stat-value">{currentUser.consecutiveDays} días</div>
              <div className="stat-desc">¡Mantené la constancia!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Tabla de Posiciones</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Pos.</th>
                  <th>Usuario</th>
                  <th>Nivel</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user.id} className={user.id === currentUser.id ? 'bg-primary/20' : ''}>
                    <th className="font-semibold">
                      {index + 1}
                      {index === 0 && <span className="ml-1 text-yellow-400">👑</span>}
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <UserAvatar src={user.avatarUrl} name={user.name} size="xs" dataAihint={user.dataAihint} />
                        <div>
                          <div className="font-bold">{user.name}</div>
                          {user.id === currentUser.id && <span className="badge badge-sm badge-outline">Vos</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {getLevelIcon(user.level)}
                        {user.level}
                      </div>
                    </td>
                    <td className="font-medium">{user.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentUserRank > 0 && (
            <p className="text-center mt-4 text-lg">
              Estás en la <span className="font-bold text-primary">posición #{currentUserRank}</span> del ranking.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
