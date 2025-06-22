import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CompoundCalculator from '@/components/CompoundCalculator';
import SimpleCompoundCalculator from '@/components/SimpleCompoundCalculator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-text p-4">
      {/* bg-background 클래스 제거 */} {/* 주석 위치 수정 */}
      <Tabs defaultValue="simple-compound" className="w-full max-w-3xl mx-auto"> {/* 기본값 변경 */}
        <TabsList className="grid w-full grid-cols-2 mb-6">
          {/* 순서 변경 및 이름 수정 */}
          <TabsTrigger value="simple-compound">복리 계산기</TabsTrigger> {/* 일반 복리 계산기 -> 복리 계산기 */}
          <TabsTrigger value="compound">적립식 복리 계산기</TabsTrigger> {/* 복리 계산기 -> 적립식 복리 계산기 */}
        </TabsList>
        {/* TabsContent 순서도 탭 순서에 맞게 변경 (value는 유지) */}
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
