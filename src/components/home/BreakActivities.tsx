
import React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Music } from 'lucide-react';

const BreakActivities = () => {
  return (
    <div className="bg-nature-50 border border-nature-200 p-6 rounded-xl shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-nature-700 flex items-center">
        <Music className="mr-2 h-5 w-5" /> Fun Break Activities
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="bg-white hover:bg-nature-100 border-nature-200 text-nature-700">
          <Image className="mr-2 h-4 w-4" /> Coloring
        </Button>
        <Button variant="outline" className="bg-white hover:bg-nature-100 border-nature-200 text-nature-700">
          <Music className="mr-2 h-4 w-4" /> Music
        </Button>
        <Button variant="outline" className="bg-white hover:bg-nature-100 border-nature-200 text-nature-700">
          Puzzles
        </Button>
        <Button variant="outline" className="bg-white hover:bg-nature-100 border-nature-200 text-nature-700">
          Games
        </Button>
      </div>
    </div>
  );
};

export default BreakActivities;
