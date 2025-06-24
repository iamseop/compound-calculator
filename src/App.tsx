import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CompoundCalculator from '@/components/CompoundCalculator';
import SimpleCompoundCalculator from '@/components/SimpleCompoundCalculator';
import AveragePriceCalculator from '@/components/AveragePriceCalculator'; // 평단가 계산기 컴포넌트 임포트
import Footer from '@/components/Footer'; // Footer 컴포넌트 임포트

const App: React.FC = () => {
  return (
    <div className="min-h-screen text-text p-4 flex flex-col"> {/* flex-col 추가 */}
      <div className="flex-grow"> {/* Tabs 컨테이너가 남은 공간을 차지하도록 설정 */}
        <Tabs defaultValue="simple-compound" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6"> {/* grid-cols-3으로 변경 */}
            <TabsTrigger value="simple-compound">복리 계산기</TabsTrigger>
            <TabsTrigger value="compound">적립식 복리 계산기</TabsTrigger>
            <TabsTrigger value="average-price">평단가 계산기</TabsTrigger> {/* 평단가 계산기 탭 추가 */}
          </TabsList>
          <TabsContent value="simple-compound">
            <SimpleCompoundCalculator />
          </TabsContent>
          <TabsContent value="compound">
            <CompoundCalculator />
          </TabsContent>
           <TabsContent value="average-price"> {/* 평단가 계산기 탭 콘텐츠 추가 */}
            <AveragePriceCalculator />
          </TabsContent>
        </Tabs>
      </div>
      <Footer /> {/* 푸터 컴포넌트 추가 */}
    </div>
  );
};


export default App;
