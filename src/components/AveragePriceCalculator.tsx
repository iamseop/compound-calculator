import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Tag, PlusCircle, Trash2 } from 'lucide-react'; // Added icons
import { cn, formatInputNumber, parseInputString, formatResultNumber } from '@/lib/utils';

interface PurchaseEntry {
  id: number;
  amount: number | '';
  price: number | '';
  amountInput: string;
  priceInput: string;
  amountError: boolean;
  priceError: boolean;
}

interface CalculationResult {
  totalInvestment: number;
  totalQuantity: number;
  averagePrice: number;
}

const AveragePriceCalculator: React.FC = () => {
  const [purchaseEntries, setPurchaseEntries] = useState<PurchaseEntry[]>([
    { id: Date.now(), amount: '', price: '', amountInput: '', priceInput: '', amountError: false, priceError: false }
  ]);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [overallError, setOverallError] = useState<string | null>(null);

  const addPurchaseEntry = () => {
    setPurchaseEntries([
      ...purchaseEntries,
      { id: Date.now(), amount: '', price: '', amountInput: '', priceInput: '', amountError: false, priceError: false }
    ]);
  };

  const removePurchaseEntry = (id: number) => {
    setPurchaseEntries(purchaseEntries.filter(entry => entry.id !== id));
  };

  const handleInputChange = (id: number, field: 'amount' | 'price', value: string) => {
    const cleanedValue = value.replace(/,/g, '');
    const formattedValue = formatInputNumber(cleanedValue, field === 'price'); // Allow decimals for price
    const parsedValue = parseInputString(cleanedValue, field === 'price'); // Allow decimals for price

    setPurchaseEntries(purchaseEntries.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          [`${field}Input`]: formattedValue,
          [field]: parsedValue,
          [`${field}Error`]: false, // Reset error on change
        };
      }
      return entry;
    }));
  };

  const calculateAveragePrice = () => {
    let hasError = false;
    let updatedEntries = purchaseEntries.map(entry => {
      let entryError = false;
      if (entry.amount === '' || entry.amount === null || isNaN(Number(entry.amount))) {
        entry.amountError = true;
        entryError = true;
        hasError = true;
      } else {
         entry.amountError = false;
      }
      if (entry.price === '' || entry.price === null || isNaN(Number(entry.price)) || Number(entry.price) <= 0) {
        entry.priceError = true;
        entryError = true;
        hasError = true;
      } else {
         entry.priceError = false;
      }
      return entry;
    });

    setPurchaseEntries(updatedEntries);

    if (hasError) {
      setResult(null);
      setOverallError("모든 입력 필드에 유효한 숫자를 입력해 주세요. 단가는 0보다 커야 합니다.");
      return;
    }

    setOverallError(null); // Clear overall error

    let totalInvestment = 0;
    let totalQuantity = 0;

    purchaseEntries.forEach(entry => {
      const amount = Number(entry.amount);
      const price = Number(entry.price);

      if (amount > 0 && price > 0) {
         totalInvestment += amount;
         totalQuantity += amount / price;
      } else if (amount > 0 && price === 0) {
          // Handle case where amount is positive but price is zero - this is an error state already caught by validation
      }
       // If amount is 0, it doesn't contribute to total investment or quantity
    });


    let averagePrice = 0;
    if (totalQuantity > 0) {
      averagePrice = totalInvestment / totalQuantity;
    } else if (totalInvestment > 0 && totalQuantity === 0) {
       // This case should ideally not happen if amount > 0 and price > 0 are checked,
       // but as a fallback, indicate an issue or infinite price if amount > 0 and quantity is somehow 0.
       // Given the logic (amount/price), quantity will be > 0 if amount > 0 and price > 0.
       // If totalInvestment > 0 but totalQuantity is 0, it implies all entries had amount > 0 but price <= 0,
       // which is caught by validation.
       averagePrice = Infinity; // Or handle as an error
    } else {
       averagePrice = 0; // Total investment and total quantity are 0
    }


    setResult({
      totalInvestment,
      totalQuantity,
      averagePrice,
    });
  };

   // Helper to determine mobile font size based on text length
  const getMobileFontSizeClass = (text: string | number | null, baseSizeClass: string, longTextSizeClass: string, threshold: number = 10): string => {
      if (text === null || text === '' || typeof text === 'number' && isNaN(text)) {
          return baseSizeClass;
      }
      const formattedText = typeof text === 'number' ? text.toLocaleString('ko-KR') : String(text);
      return formattedText.length > threshold ? longTextSizeClass : baseSizeClass;
  };


  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="bg-surface text-text rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text">평단가 계산기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {purchaseEntries.map((entry, index) => (
            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="space-y-2">
                <Label htmlFor={`amount-${entry.id}`} className="text-text flex items-center"><DollarSign className="mr-2 h-4 w-4" /> 투자 금액 #{index + 1}</Label>
                <Input
                  id={`amount-${entry.id}`}
                  type="text"
                  placeholder="예: 1,000,000"
                  value={entry.amountInput}
                  onChange={(e) => handleInputChange(entry.id, 'amount', e.target.value)}
                   className={cn(
                    'bg-background text-text focus:ring-ring rounded-md',
                    entry.amountError && 'is-error',
                    entry.amountError ? 'border-warning' : 'border-border'
                  )}
                />
                 {entry.amountError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>}
              </div>
              <div className="space-y-2 relative"> {/* Added relative for absolute positioning of remove button */}
                {/* Flex container for Input and Button */}
                <Label htmlFor={`price-${entry.id}`} className="text-text flex items-center"><Tag className="mr-2 h-4 w-4" /> 단가 #{index + 1}</Label>
                <div className="flex items-center relative"> {/* New flex wrapper */}
                  <Input
                    id={`price-${entry.id}`}
                    type="text"
                    placeholder="예: 50,000"
                    value={entry.priceInput}
                    onChange={(e) => handleInputChange(entry.id, 'price', e.target.value)}
                     className={cn(
                      'flex-grow bg-background text-text focus:ring-ring rounded-md pr-10 w-full', // Added w-full and flex-grow
                      entry.priceError && 'is-error',
                      entry.priceError ? 'border-warning' : 'border-border'
                    )}
                  />
                   {purchaseEntries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePurchaseEntry(entry.id)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 h-8 w-8 text-textSecondary hover:text-error" // Position relative to the new flex wrapper
                        aria-label={`Remove purchase entry ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
                 {entry.priceError && <p className="error-message-text text-sm mt-1 font-light">0보다 큰 숫자를 입력해 주세요.</p>}
              </div>
            </div>
          ))}

          <Button onClick={addPurchaseEntry} variant="outline" className="w-full bg-background text-primary border-border hover:bg-surface/50 rounded-md">
            <PlusCircle className="mr-2 h-4 w-4" /> 추가 매수 항목 추가
          </Button>

          {overallError && <p className="error-message-text text-sm mt-1 font-light text-warning text-center">{overallError}</p>}


          <Button onClick={calculateAveragePrice} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            계산하기
          </Button>

          {result !== null && (
            <div className="mt-6 space-y-4">
              <Separator className="bg-border" />
              <h3 className="text-xl font-semibold text-primary-light">계산 결과</h3>
              <div className="text-lg text-text">
                <p>총 투자 금액: <span className="font-bold text-text">{formatResultNumber(result.totalInvestment)}</span></p>
                {/* 총 수량 표시 수정: formatResultNumber 대신 toLocaleString 사용 */}
                <p>총 수량: <span className="font-bold text-text">{result.totalQuantity.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}개</span></p>
                <p>평균 매수 단가: <span className="font-bold text-text">{formatResultNumber(result.averagePrice, true)}</span></p> {/* Allow decimals for price */}
              </div>

              {/* Optional: Display a summary table of entries */}
               <Separator className="bg-border" />
              <h3 className="text-xl font-semibold text-primary-light">매수 내역 요약</h3>
              <div className="">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className={cn("text-text", "text-[9px] font-light sm:text-sm sm:font-medium", "whitespace-nowrap")}>#</TableHead>
                      <TableHead className={cn("text-text text-right", "text-[9px] font-light sm:text-sm sm:font-medium", "whitespace-nowrap")}>투자 금액</TableHead>
                      <TableHead className={cn("text-text text-right", "text-[9px] font-light sm:text-sm sm:font-medium", "whitespace-nowrap")}>단가</TableHead>
                       <TableHead className={cn("text-text text-right", "text-[9px] font-light sm:text-sm sm:font-medium", "whitespace-nowrap")}>수량</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseEntries.map((entry, index) => {
                        const quantity = (Number(entry.amount) > 0 && Number(entry.price) > 0) ? Number(entry.amount) / Number(entry.price) : 0;
                        return (
                            <TableRow key={entry.id} className="border-border">
                                <TableCell className={cn("font-medium text-text", "text-[9px] font-light sm:text-sm sm:font-medium", "whitespace-nowrap")}>
                                    {index + 1}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right text-text",
                                        "whitespace-nowrap",
                                        getMobileFontSizeClass(entry.amount, "text-[9px]", "text-[8px]", 10),
                                        "font-light sm:text-sm sm:font-normal"
                                    )}
                                >
                                    {formatResultNumber(Number(entry.amount))}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        "text-right text-text",
                                        "whitespace-nowrap",
                                        getMobileFontSizeClass(entry.price, "text-[9px]", "text-[8px]", 10),
                                        "font-light sm:text-sm sm:font-normal"
                                    )}
                                >
                                    {formatResultNumber(Number(entry.price), true)}
                                </TableCell>
                                {/* 매수 내역 요약 테이블 수량 표시 수정: formatResultNumber 대신 toLocaleString 사용 */}
                                <TableCell
                                    className={cn(
                                        "text-right text-text",
                                        "whitespace-nowrap",
                                        getMobileFontSizeClass(quantity, "text-[9px]", "text-[8px]", 10),
                                        "font-light sm:text-sm sm:font-normal"
                                    )}
                                >
                                    {quantity.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}개
                                </TableCell>
                            </TableRow>
                        );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

       <div className="mt-8 text-center text-textSecondary text-sm font-light">
        <p>평단가 계산기는 여러 번에 걸쳐 자산을 매수했을 때의 평균 매수 단가를 계산합니다.</p>
        <p className="mt-1">
          총 투자 금액을 총 매수 수량으로 나누어 계산됩니다.
        </p>
      </div>
    </div>
  );
};

export default AveragePriceCalculator;
