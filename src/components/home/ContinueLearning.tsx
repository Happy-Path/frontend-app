
import React from 'react';
import { LearningModule } from '@/types';
import ModuleCard from '@/components/ModuleCard';

interface ContinueLearningProps {
  modules: LearningModule[] | undefined;
  isLoading: boolean;
}

const ContinueLearning = ({ modules, isLoading }: ContinueLearningProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4 text-happy-700">
        Continue Learning
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p>Loading your learning journey...</p>
        ) : (
          modules?.slice(0, 2).map(module => (
            <ModuleCard key={module.id} module={module} />
          ))
        )}
      </div>
    </div>
  );
};

export default ContinueLearning;
