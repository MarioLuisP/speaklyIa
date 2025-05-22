
"use client";

import { Logo } from '@/components/ui/Logo';
import { Progress } from '@/components/ui/progress';

interface UserProgressHeaderProps {
  userName: string;
  xp: number;
  displayLevel: string; 
  levelUpMessage: string; 
  dailyLessonProgressPercentage: number;
  dailyLessonProgressLabel?: string; 
}

export function UserProgressHeader({
  userName,
  xp,
  displayLevel,
  levelUpMessage,
  dailyLessonProgressPercentage,
  dailyLessonProgressLabel,
}: UserProgressHeaderProps) {
  const progressLabel = dailyLessonProgressLabel || `${dailyLessonProgressPercentage}% para completar tu lección del día`;

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-md space-y-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-muted-foreground">{displayLevel}</p>
          <p className="text-xs text-muted-foreground mt-1">PUNTOS</p>
          <p className="text-3xl font-bold text-primary">{xp}</p>
        </div>
        <Logo size="sm" />
      </div>

      <div>
        <h1 className="text-2xl font-bold">¡Seguí así {userName}!</h1>
        <p className="text-sm text-muted-foreground">{levelUpMessage}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-1">{progressLabel}</p>
        <Progress value={dailyLessonProgressPercentage} className="h-3 rounded-full" />
      </div>
    </div>
  );
}
