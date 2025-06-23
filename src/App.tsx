import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CompoundCalculator from '@/components/CompoundCalculator';
import SimpleCompoundCalculator from '@/components/SimpleCompoundCalculator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-text p-4">
      <Tabs defaultValue="simple-compound" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="simple-compound">복리 계산기</TabsTrigger>
          <TabsTrigger value="compound">적립식 복리 계산기</TabsTrigger>
        </TabsList>
        <TabsContent value="simple-compound">
          <SimpleCompoundCalculator />
        </TabsContent>
        <TabsContent value="compound">
          <CompoundCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
