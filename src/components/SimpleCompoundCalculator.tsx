import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Calendar, Percent, Repeat2 } from 'lucide-react';
import { cn, formatInputNumber, parseInputString, formatResultNumber, formatPercentage } from '@/lib/utils'; // Import new helper

interface CalculationStep {
  period: number;
  startingBalance: number;
  interestEarned: number;
  endingBalance: number;
  rateOfReturn: number;
}

const SimpleCompoundCalculator: React.FC = () => {
  // State for calculation values (numbers)
  const [principal, setPrincipal] = useState<number | ''>('');
  const [annualRate, setAnnualRate] = useState<number | ''>('');
  const [years, setYears] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<string>('annually');

  // State for input display values (strings with commas)
  const [principalInput, setPrincipalInput] = useState<string>('');
  const [annualRateInput, setAnnualRateInput] = useState<string>('');
  const [yearsInput, setYearsInput] = useState<string>('');

  // State for validation errors
  const [principalError, setPrincipalError] = useState<boolean>(false);
  const [annualRateError, setAnnualRateError] = useState<boolean>(false);
  const [yearsError, setYearsError] = useState<boolean>(false);


  const [result, setResult] = useState<number | null>(null);
  const [overallRateOfReturn, setOverallRateOfReturn] = useState<number | null>(null);
  const [steps, setSteps] = useState<CalculationStep[]>([]);

  const calculateSimpleCompoundInterest = () => {
    // Reset errors
    setPrincipalError(false);
    setAnnualRateError(false);
    setYearsError(false);

    let hasError = false;

    // Validate inputs
    if (principal === '') {
      setPrincipalError(true);
      hasError = true;
    }
    if (annualRate === '') {
      setAnnualRateError(true);
      hasError = true;
    }
    if (years === '') {
      setYearsError(true);
      hasError = true;
    }

    if (hasError) {
      setResult(null);
      setOverallRateOfReturn(null);
      setSteps([]);
      return;
    }

    // Convert state values to numbers for calculation
    const p = Number(principal);
    const r = Number(annualRate) / 100;
    const t = Number(years);

    let n: number; // Compounding frequency per year

    switch (frequency) {
      case 'annually': n = 1; break;
      case 'semiannually': n = 2; break;
      case 'quarterly': n = 4; break;
      case 'monthly': n = 12; break;
      case 'daily': n = 365; break;
      default: n = 1;
    }

    let currentBalance = p;
    const calculationSteps: CalculationStep[] = [];
    const totalPeriods = t * n;
    const ratePerPeriod = r / n;

    for (let i = 1; i <= totalPeriods; i++) {
      const startingBalance = currentBalance;
      const interestEarned = startingBalance * ratePerPeriod;
      const endingBalance = startingBalance + interestEarned;

       // Calculate cumulative rate of return relative to the initial principal (p)
      let rateOfReturn = 0;
      const cumulativeGainRelativeToPrincipal = endingBalance - p;

      if (p > 0) {
          rateOfReturn = (cumulativeGainRelativeToPrincipal / p) * 100;
      } else if (p === 0 && cumulativeGainRelativeToPrincipal > 0) {
          rateOfReturn = Infinity;
      } else {
          rateOfReturn = 0;
      }


      calculationSteps.push({
        period: i,
        startingBalance: startingBalance,
        interestEarned: interestEarned,
        endingBalance: endingBalance,
        rateOfReturn: rateOfReturn,
      });

      currentBalance = endingBalance;
    }

    setResult(currentBalance);

    let overallReturn = 0;
    const totalGainRelativeToPrincipal = currentBalance - p;
    if (p > 0) {
        overallReturn = (totalGainRelativeToPrincipal / p) * 100;
    } else if (p === 0 && totalGainRelativeToPrincipal > 0) {
        overallReturn = Infinity;
    } else {
        overallReturn = 0;
    }
    setOverallRateOfReturn(overallReturn);


    setSteps(calculationSteps);
  };

  // Update input state and calculation state on change
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const oldValue = principalInput; // Use the current state value before update
    const cursorPosition = e.target.selectionStart ?? 0;

    const cleanedValue = value.replace(/,/g, '');
    const formattedValue = formatInputNumber(cleanedValue, false); // No decimals
    const parsedValue = parseInputString(cleanedValue, false); // No decimals

    setPrincipalInput(formattedValue);
    setPrincipal(parsedValue);
    setPrincipalError(false);

    // Calculate new cursor position
    const oldCleanedPrefix = oldValue.substring(0, cursorPosition).replace(/,/g, '');
    const newCursorPosition = formatInputNumber(oldCleanedPrefix, false).length;


    requestAnimationFrame(() => {
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  const handleAnnualRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const oldValue = annualRateInput; // Use the current state value before update
    const cursorPosition = e.target.selectionStart ?? 0;

    const cleanedValue = value.replace(/,/g, '');
    const formattedValue = formatInputNumber(cleanedValue, true); // Allow decimals
    const parsedValue = parseInputString(cleanedValue, true); // Allow decimals

    setAnnualRateInput(formattedValue);
    setAnnualRate(parsedValue);
    setAnnualRateError(false);

    // Calculate new cursor position
    const oldCleanedPrefix = oldValue.substring(0, cursorPosition).replace(/,/g, '');
    const newCursorPosition = formatInputNumber(oldCleanedPrefix, true).length; // Use allowDecimals=true


    requestAnimationFrame(() => {
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const oldValue = yearsInput; // Use the current state value before update
    const cursorPosition = e.target.selectionStart ?? 0;

    const cleanedValue = value.replace(/,/g, '');
    const formattedValue = formatInputNumber(cleanedValue, false); // No decimals
    const parsedValue = parseInputString(cleanedValue, false); // No decimals

    setYearsInput(formattedValue);
    setYears(parsedValue);
    setYearsError(false);

    // Calculate new cursor position
    const oldCleanedPrefix = oldValue.substring(0, cursorPosition).replace(/,/g, '');
    const newCursorPosition = formatInputNumber(oldCleanedPrefix, false).length;


    requestAnimationFrame(() => {
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };


  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="bg-surface text-text rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text">복리 계산기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="principal" className="text-text flex items-center"><DollarSign className="mr-2 h-4 w-4" /> 초기 투자 금액</Label>
                <Input
                  id="principal"
                  type="text"
                  placeholder="예: 1,000,000"
                  value={principalInput}
                  onChange={handlePrincipalChange}
                  className={cn(
                    'bg-background text-text focus:ring-ring rounded-md',
                    principalError && 'is-error',
                    principalError ? 'border-warning' : 'border-border'
                  )}
                />
                 {principalError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="annualRate" className="text-text flex items-center"><Percent className="mr-2 h-4 w-4" /> 연 이자율 (%)</Label>
                <Input
                  id="annualRate"
                  type="text"
                  placeholder="예: 5"
                  value={annualRateInput}
                  onChange={handleAnnualRateChange}
                   className={cn(
                    'bg-background text-text focus:ring-ring rounded-md',
                    annualRateError && 'is-error',
                    annualRateError ? 'border-warning' : 'border-border'
                  )}
                />
                 {annualRateError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="years" className="text-text flex items-center"><Calendar className="mr-2 h-4 w-4" /> 투자 기간 (년)</Label>
                <Input
                  id="years"
                  type="text"
                  placeholder="예: 10"
                  value={yearsInput}
                  onChange={handleYearsChange}
                   className={cn(
                    'bg-background text-text focus:ring-ring rounded-md',
                    yearsError && 'is-error',
                    yearsError ? 'border-warning' : 'border-border'
                  )}
                />
                 {yearsError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-text flex items-center"><Repeat2 className="mr-2 h-4 w-4" /> 복리 계산 주기</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency" className="bg-background text-text border-border focus:ring-ring rounded-md">
                    <SelectValue placeholder="주기 선택" />
                  </SelectTrigger>
                  <SelectContent className="!bg-surface text-text border-border rounded-md">
                    <SelectItem value="annually">매년</SelectItem>
                    <SelectItem value="semiannually">매 반년</SelectItem>
                    <SelectItem value="quarterly">매 분기</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                    <SelectItem value="daily">매일</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button onClick={calculateSimpleCompoundInterest} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            계산하기
          </Button>

          {result !== null && (
            <div className="mt-6 space-y-4">
              <Separator className="bg-border" />
              {/* Changed text-primary to text-primary-light */}
              <h3 className="text-xl font-semibold text-primary-light">계산 결과</h3>
              <div className="text-lg text-text">
                <p>최종 금액: <span className="font-bold text-text">{formatResultNumber(result)}</span></p>
                <p>총 수익률: <span className="font-bold text-text">{formatPercentage(overallRateOfReturn)}</span></p>
              </div>

              {steps.length > 0 && (
                <>
                  <Separator className="bg-border" />
                  {/* Changed text-primary to text-primary-light */}
                  <h3 className="text-xl font-semibold text-primary-light">계산 과정</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className={cn("text-text", "text-xs sm:text-sm", "whitespace-nowrap")}>주기</TableHead>
                          <TableHead className={cn("text-text text-right", "text-xs sm:text-sm", "whitespace-nowrap")}>시작 금액</TableHead>
                          <TableHead className={cn("text-text text-right", "text-xs sm:text-sm", "whitespace-nowrap")}>수익</TableHead>
                          <TableHead className={cn("text-text text-right", "text-xs sm:text-sm", "whitespace-nowrap")}>종료 금액</TableHead>
                          <TableHead className={cn("text-text text-right", "text-xs sm:text-sm", "whitespace-nowrap")}>수익률 (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {steps.map((step, index) => (
                          <TableRow key={index} className="border-border">
                            <TableCell className={cn("font-medium text-text", "whitespace-normal", "overflow-wrap-break-word")}>
                               {`${step.period}${frequency === 'annually' ? '년차' : frequency === 'semiannually' ? '반년차' : frequency === 'quarterly' ? '분기차' : frequency === 'monthly' ? '개월차' : '일차'}`}
                            </TableCell>
                            <TableCell className={cn("text-right text-text", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.startingBalance)}</TableCell>
                            <TableCell className={cn("text-right text-text", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.interestEarned)}</TableCell>
                            <TableCell className={cn("text-right font-bold text-text", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.endingBalance)}</TableCell>
                            <TableCell className={cn("text-right text-text", "whitespace-normal", "overflow-wrap-break-word")}>{formatPercentage(step.rateOfReturn)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-textSecondary text-sm font-light">
        <p>최근 5년 주요 자산 연평균 성장률 (CAGR, 근사치):</p>
        <p className="mt-1">
          나스닥: ~19%, S&P 500: ~13%, 비트코인: ~38%, 금: ~8%
        </p>
        <p className="mt-2 text-xs opacity-75">
          * 위 수치는 과거 데이터 기반의 근사치이며, 미래 수익을 보장하지 않습니다.
        </p>
      </div>
    </div>
  );
};

export default SimpleCompoundCalculator;
