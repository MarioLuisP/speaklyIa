
"use client";

import { Logo } from '@/components/ui/Logo';
import { Progress } from '@/components/ui/progress';
import type { UserProfile } from '@/types';

interface UserProgressHeaderProps {
  mainMessage: string; // Será "Bienvenido {userName}!" o "¡Seguí así {userName}!"
  score: number;
  userLevel: UserProfile["userLevel"];
  levelUpMessage: string; // Mensaje secundario
  dailyLessonProgressPercentage: number;
  dailyLessonProgressLabel?: string;
}

export function UserProgressHeader({
  mainMessage,
  score,
  userLevel,
  levelUpMessage,
  dailyLessonProgressPercentage,
  dailyLessonProgressLabel,
}: UserProgressHeaderProps) {
  const progressLabel = dailyLessonProgressLabel || `${dailyLessonProgressPercentage}% para completar tu lección del día`;

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-md space-y-4 mb-6">
      <div className="flex justify-between items-center">
        {/* Left: Level and Score */}
        <div>
          <p className="text-xs text-muted-foreground uppercase">{userLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">PUNTOS</p>
          <p className="text-3xl font-bold text-primary">{score}</p>
        </div>

        {/* Center: Welcome messages */}
        <div className="text-center mx-2 flex-grow">
          <h1 className="text-2xl font-semibold">{mainMessage}</h1>
          <p className="text-sm text-muted-foreground">{levelUpMessage}</p>
        </div>

        {/* Right: Logo */}
        <Logo size="sm" />
      </div>

      {/* Bottom Row: Progress Bar */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">{progressLabel}</p>
        <Progress value={dailyLessonProgressPercentage} className="h-3 rounded-full" />
      </div>
    </div>
  );
}
