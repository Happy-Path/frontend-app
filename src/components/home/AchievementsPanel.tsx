
import React from 'react';
import { User } from '@/types';
import { Star } from 'lucide-react';

interface AchievementsPanelProps {
  user: User | undefined;
}

const AchievementsPanel = ({ user }: AchievementsPanelProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-happy-700">Your Achievements</h3>
      <div className="flex items-center justify-center py-4">
        <div className="flex gap-2">
          <Star className="h-8 w-8 fill-sunny-400 text-sunny-400" />
          <Star className="h-8 w-8 fill-sunny-400 text-sunny-400" />
          <Star className="h-8 w-8 fill-sunny-400 text-sunny-400" />
        </div>
      </div>
      <p className="text-center text-gray-600">Great job, {user?.name || 'Friend'}!</p>
      <p className="text-center text-gray-600">You've earned 3 stars!</p>
    </div>
  );
};

export default AchievementsPanel;
