
import React, { useState } from 'react';
import { LearningModule } from '@/types';
import ModuleCard from '@/components/ModuleCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';

interface LearningModulesListProps {
  modules: LearningModule[] | undefined;
  isLoading: boolean;
}

const LearningModulesList = ({ modules, isLoading }: LearningModulesListProps) => {
  const [filter, setFilter] = useState<string>('all');

  // Filter modules based on selected category
  const filteredModules = modules?.filter(module => 
    filter === 'all' || module.category === filter
  ) || [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-happy-700">
          Learning Modules
        </h2>
        
        <Button variant="ghost" className="text-happy-600 hover:text-happy-800 hover:bg-happy-100">
          View All <BookOpen className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid grid-cols-5 h-14 rounded-xl bg-happy-50">
          <TabsTrigger 
            value="all" 
            onClick={() => setFilter('all')}
            className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="numbers" 
            onClick={() => setFilter('numbers')}
            className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
          >
            Numbers
          </TabsTrigger>
          <TabsTrigger 
            value="letters" 
            onClick={() => setFilter('letters')}
            className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
          >
            Letters
          </TabsTrigger>
          <TabsTrigger 
            value="emotions" 
            onClick={() => setFilter('emotions')}
            className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
          >
            Emotions
          </TabsTrigger>
          <TabsTrigger 
            value="colors" 
            onClick={() => setFilter('colors')}
            className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
          >
            Colors
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-52 rounded-xl"></div>
          ))
        ) : filteredModules.length === 0 ? (
          <p className="col-span-2 text-center py-10 text-gray-500">
            No modules found in this category.
          </p>
        ) : (
          filteredModules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))
        )}
      </div>
    </div>
  );
};

export default LearningModulesList;
