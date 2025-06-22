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
import { cn } from '@/lib/utils'; // cn 유틸리티 임포트

interface CalculationStep {
  period: number;
  startingBalance: number;
  interestEarned: number;
  additionalContribution: number;
  endingBalance: number;
  rateOfReturn: number; // Added rate of return for the period
}

// Helper to parse input string into a number
const parseInputString = (inputString: string, allowDecimals: boolean = false): number | '' => {
  if (inputString.trim() === '') {
    return '';
  }
  // Remove commas
  let cleanedString = inputString.replace(/,/g, '');

  if (!allowDecimals) {
    // Remove non-digits
    cleanedString = cleanedString.replace(/\D/g, '');
    const parsed = parseInt(cleanedString, 10);
    return isNaN(parsed) ? '' : parsed;
  } else {
    // Remove non-digits except one decimal point
    cleanedString = cleanedString.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = cleanedString.split('.');
    if (parts.length > 2) {
      cleanedString = parts[0] + '.' + parts.slice(1).join('');
    }
    const parsed = parseFloat(cleanedString);
    return isNaN(parsed) ? '' : parsed;
  }
};

// Helper to format number with commas for display in inputs
const formatInputDisplay = (value: number | '' | null): string => {
  if (value === '' || value === null || isNaN(value)) {
    return '';
  }
  // Format with commas, allow decimals for rate input display
   return new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 10, // Allow some decimals for display
  }).format(value);
};

// Helper to format number with commas and round for results/table
const formatResultNumber = (amount: number | '' | null): string => {
   if (amount === '' || amount === null || isNaN(amount)) {
    return '0'; // Display '0' for invalid/empty numbers in results
  }
  // Round to 0 decimal places for results and table
  return new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // Round to 0 decimals
  }).format(amount);
};

// Helper to format percentage
const formatPercentage = (percentage: number | null): string => {
  if (percentage === null || isNaN(percentage)) {
    return '0.00%';
  }
  // Handle Infinity case
  if (percentage === Infinity) {
      return '∞%';
  }
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(percentage / 100); // Divide by 100 because the input is a percentage value (e.g., 5 for 5%)
};


const CompoundCalculator: React.FC = () => {
  // State for calculation values (numbers)
  const [principal, setPrincipal] = useState<number | ''>('');
  const [annualRate, setAnnualRate] = useState<number | ''>('');
  const [years, setYears] = useState<number | ''>('');
  const [additionalContribution, setAdditionalContribution] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<string>('annually');

  // State for input display values (strings with commas)
  const [principalInput, setPrincipalInput] = useState<string>('');
  const [annualRateInput, setAnnualRateInput] = useState<string>('');
  const [yearsInput, setYearsInput] = useState<string>('');
  const [additionalContributionInput, setAdditionalContributionInput] = useState<string>('');

  // State for validation errors
  const [principalError, setPrincipalError] = useState<boolean>(false);
  const [annualRateError, setAnnualRateError] = useState<boolean>(false);
  const [yearsError, setYearsError] = useState<boolean>(false);
  const [additionalContributionError, setAdditionalContributionError] = useState<boolean>(false);


  const [result, setResult] = useState<number | null>(null);
  const [overallRateOfReturn, setOverallRateOfReturn] = useState<number | null>(null); // Added state for overall rate of return
  const [steps, setSteps] = useState<CalculationStep[]>([]);

  const calculateCompoundInterest = () => {
    // Reset errors
    setPrincipalError(false);
    setAnnualRateError(false);
    setYearsError(false);
    setAdditionalContributionError(false);

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
    // Additional contribution is optional, but if entered, should be a valid number
    // We only show error if the input string is non-empty but parsing failed (which parseInputString handles by returning '')
    // For this specific request, we only show error if the field is *empty* when calculation is triggered.
    // Let's assume additional contribution is optional and doesn't trigger an error if left blank.
    // If it were required, we would add:
    // if (additionalContribution === '') {
    //   setAdditionalContributionError(true);
    //   hasError = true;
    // }


    if (hasError) {
      setResult(null);
      setOverallRateOfReturn(null); // Reset overall rate of return
      setSteps([]);
      return; // Stop calculation if there are errors
    }

    // Convert state values to numbers for calculation
    const p = Number(principal);
    const r = Number(annualRate) / 100;
    const t = Number(years);
    const c = Number(additionalContribution); // Additional contribution amount

    // Basic validation for non-negative values and positive years
     if (p < 0 || r < 0 || t <= 0) {
       // Although we handle empty strings visually, we should still handle invalid numbers (like negative)
       // For simplicity based on the request, we focus on empty string validation visually.
       // A more robust app would handle negative numbers here as well, perhaps with different visual feedback.
       // For now, we proceed assuming valid numbers if not empty strings.
     }


    let n: number; // Compounding frequency per year
    let frequencyLabel: string;

    switch (frequency) {
      case 'annually': n = 1; frequencyLabel = '년'; break;
      case 'semiannually': n = 2; frequencyLabel = '반년'; break;
      case 'quarterly': n = 4; frequencyLabel = '분기'; break;
      case 'monthly': n = 12; frequencyLabel = '개월'; break;
      case 'daily': n = 365; frequencyLabel = '일'; break;
      default: n = 1; frequencyLabel = '년';
    }

    let currentBalance = p;
    const calculationSteps: CalculationStep[] = [];
    const totalPeriods = t * n;
    const ratePerPeriod = r / n;

    // Calculate total initial investment including contributions
    // const totalInitialInvestment = p + (c * (totalPeriods - 1)); // Initial principal + contributions for all periods except the first one (already included in starting balance)
    // Correction: Total investment is initial principal + total contributions over the period
    // const totalInvestment = p + (c * totalPeriods); // This was used for the previous overall return calculation

    for (let i = 1; i <= totalPeriods; i++) {
      const startingBalance = currentBalance;
      const interestEarned = startingBalance * ratePerPeriod;
      const currentContribution = c > 0 ? c : 0; // Additional contribution is added every compounding period if c > 0

      const endingBalance = startingBalance + interestEarned + currentContribution;

      // Calculate cumulative rate of return relative to the initial principal (p)
      let rateOfReturn = 0;
      // The gain relative to initial principal is endingBalance - p.
      // The percentage return relative to initial principal is (endingBalance - p) / p * 100.
      // We need to consider the contributions made up to this period when calculating the *gain* relative to the *initial* principal.
      // Total invested up to period i = p + c * i
      // Gain relative to initial principal = endingBalance - p - (c * i)
      // Rate of return relative to initial principal = (endingBalance - p - (c * i)) / p * 100
      // This calculation is unusual. A more standard approach for cumulative return is relative to *total invested capital*.
      // However, the user specifically requested "원금 비례" (proportional to principal) for the table.
      // Let's interpret "원금 비례" for the table as the cumulative gain (endingBalance - p) relative to the initial principal (p).
      // This ignores contributions in the denominator, which is non-standard but matches the literal request interpretation.
      const cumulativeGainRelativeToPrincipal = endingBalance - p;

      if (p > 0) {
          rateOfReturn = (cumulativeGainRelativeToPrincipal / p) * 100;
      } else if (p === 0 && cumulativeGainRelativeToPrincipal > 0) {
          rateOfReturn = Infinity; // Handle case where principal is 0 but balance grew
      } else {
          rateOfReturn = 0; // Principal is 0 and no gain or loss
      }


      calculationSteps.push({
        period: i,
        startingBalance: startingBalance,
        interestEarned: interestEarned,
        additionalContribution: currentContribution,
        endingBalance: endingBalance,
        rateOfReturn: rateOfReturn, // Store calculated rate of return
      });

      currentBalance = endingBalance;
    }

    setResult(currentBalance);

    // Calculate overall rate of return based on initial principal (p) for consistency with table
    let overallReturn = 0;
    const totalGainRelativeToPrincipal = currentBalance - p;
    if (p > 0) {
        overallReturn = (totalGainRelativeToPrincipal / p) * 100;
    } else if (p === 0 && totalGainRelativeToPrincipal > 0) {
        overallReturn = Infinity; // Handle case where principal is 0 but balance grew
    } else {
        overallReturn = 0; // Principal is 0 and no gain or loss
    }
    setOverallRateOfReturn(overallReturn);


    setSteps(calculationSteps);
  };

  // Update input state and calculation state on change
  const handlePrincipalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Filter out non-digits
    const filteredValue = value.replace(/\D/g, '');
    setPrincipalInput(filteredValue);
    setPrincipal(parseInputString(filteredValue, false));
    setPrincipalError(false); // Clear error on change
  };

  const handleAnnualRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Filter out non-digits except one decimal point
    let filteredValue = value.replace(/[^\d.]/g, '');
    const parts = filteredValue.split('.');
    if (parts.length > 2) {
      filteredValue = parts[0] + '.' + parts.slice(1).join('');
    }
    setAnnualRateInput(filteredValue);
    setAnnualRate(parseInputString(filteredValue, true));
    setAnnualRateError(false); // Clear error on change
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Filter out non-digits
    const filteredValue = value.replace(/\D/g, '');
    setYearsInput(filteredValue);
    setYears(parseInputString(filteredValue, false));
    setYearsError(false); // Clear error on change
  };

  const handleAdditionalContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Filter out non-digits
    const filteredValue = value.replace(/\D/g, '');
    setAdditionalContributionInput(filteredValue);
    setAdditionalContribution(parseInputString(filteredValue, false));
    setAdditionalContributionError(false); // Clear error on change
  };


  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="bg-surface text-text rounded-xl shadow-lg">
        <CardHeader>
          {/* text-primary -> text-text */}
          <CardTitle className="text-2xl font-bold text-text">적립식 복리 계산기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                {/* Changed text-textSecondary to text-text */}
                <Label htmlFor="principal" className="text-text flex items-center"><DollarSign className="mr-2 h-4 w-4" /> 초기 투자 금액</Label>
                <Input
                  id="principal"
                  type="text" // Changed to text
                  placeholder="예: 1,000,000"
                  value={principalInput} // Use input state
                  onChange={handlePrincipalChange} // Use handler
                  className={cn( // cn 유틸리티 사용
                    'bg-background text-text focus:ring-ring rounded-md',
                    principalError && 'is-error', // Add conditional 'is-error' class
                    principalError ? 'border-warning' : 'border-border' // Keep existing conditional border class
                  )}
                />
                {principalError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>} {/* Use custom class and font-light */}
              </div>
              <div className="space-y-2">
                {/* Changed text-textSecondary to text-text */}
                <Label htmlFor="annualRate" className="text-text flex items-center"><Percent className="mr-2 h-4 w-4" /> 연 이자율 (%)</Label>
                <Input
                  id="annualRate"
                  type="text" // Changed to text
                  placeholder="예: 5"
                  value={annualRateInput} // Use input state
                  onChange={handleAnnualRateChange} // Use handler
                   className={cn( // cn 유틸리티 사용
                    'bg-background text-text focus:ring-ring rounded-md',
                    annualRateError && 'is-error', // Add conditional 'is-error' class
                    annualRateError ? 'border-warning' : 'border-border' // Keep existing conditional border class
                  )}
                />
                 {annualRateError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>} {/* Use custom class and font-light */}
              </div>
              <div className="space-y-2">
                {/* Changed text-textSecondary to text-text */}
                <Label htmlFor="years" className="text-text flex items-center"><Calendar className="mr-2 h-4 w-4" /> 투자 기간 (년)</Label>
                <Input
                  id="years"
                  type="text" // Changed to text
                  placeholder="예: 10"
                  value={yearsInput} // Use input state
                  onChange={handleYearsChange} // Use handler
                   className={cn( // cn 유틸리티 사용
                    'bg-background text-text focus:ring-ring rounded-md',
                    yearsError && 'is-error', // Add conditional 'is-error' class
                    yearsError ? 'border-warning' : 'border-border' // Keep existing conditional border class
                  )}
                />
                 {yearsError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>} {/* Use custom class and font-light */}
              </div>
              <div className="space-y-2">
                {/* Changed text-textSecondary to text-text */}
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
            <div className="space-y-4">
               <div className="space-y-2">
                {/* Changed text-textSecondary to text-text */}
                <Label htmlFor="additionalContribution" className="text-text flex items-center"><DollarSign className="mr-2 h-4 w-4" /> 추가 투자 금액</Label>
                <Input
                  id="additionalContribution"
                  type="text" // Changed to text
                  placeholder="예: 100,000"
                  value={additionalContributionInput} // Use input state
                  onChange={handleAdditionalContributionChange} // Use handler
                   className={cn( // cn 유틸리티 사용
                    'bg-background text-text focus:ring-ring rounded-md',
                    additionalContributionError && 'is-error', // Add conditional 'is-error' class
                    additionalContributionError ? 'border-warning' : 'border-border' // Keep existing conditional border class (선택 사항이므로 에러 메시지는 없음)
                  )}
                />
                 {/* Additional contribution is optional, no error message needed if left blank */}
                 {/* {additionalContributionError && <p className="error-message-text text-sm mt-1 font-light">숫자를 입력해 주세요.</p>} */}
              </div>
            </div>
          </div>

          <Button onClick={calculateCompoundInterest} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
            계산하기
          </Button>

          {result !== null && (
            <div className="mt-6 space-y-4">
              <Separator className="bg-border" />
              <h3 className="text-xl font-semibold text-primary">계산 결과</h3>
              <div className="text-lg text-text">
                {/* 최종 금액 색상을 흰색으로 변경 (이미 text-text) */}
                <p>최종 금액: <span className="font-bold text-text">{formatResultNumber(result)}</span></p>
                 {/* Display overall rate of return */}
                <p>총 수익률: <span className="font-bold text-text">{formatPercentage(overallRateOfReturn)}</span></p>
              </div>

              <Separator className="bg-border" />
              <h3 className="text-xl font-semibold text-primary">계산 과정</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      {/* Changed text-textSecondary to text-text */}
                      <TableHead className="text-text">주기</TableHead>
                      {/* Changed text-textSecondary to text-text */}
                      <TableHead className="text-text text-right">시작 금액</TableHead>
                      {/* Changed text-textSecondary to text-text */}
                      <TableHead className="text-text text-right">수익</TableHead> {/* Changed from "획득 이자" to "수익" */}
                      {/* Changed text-textSecondary to text-text */}
                      <TableHead className="text-text text-right">추가 투자</TableHead>
                       {/* Swapped Rate of Return and Ending Amount Headers */}
                      <TableHead className="text-text text-right">종료 금액</TableHead>
                      <TableHead className="text-text text-right">수익률 (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {steps.map((step, index) => (
                      <TableRow key={index} className="border-border">
                        {/* Changed text-textSecondary to text-text */}
                        {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                        {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("font-medium text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>
                           {/* Display period based on frequency */}
                           {`${step.period}${frequency === 'annually' ? '년차' : frequency === 'semiannually' ? '반년차' : frequency === 'quarterly' ? '분기차' : frequency === 'monthly' ? '개월차' : '일차'}`}
                        </TableCell>
                        {/* Changed text-textSecondary to text-text */}
                         {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                         {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("text-right text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.startingBalance)}</TableCell>
                        {/* Changed text-textSecondary to text-text */}
                         {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                         {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("text-right text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.interestEarned)}</TableCell> {/* This cell displays the calculated interestEarned value */}
                        {/* Changed text-textSecondary to text-text */}
                         {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                         {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("text-right text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.additionalContribution)}</TableCell>
                         {/* Swapped Rate of Return and Ending Amount Cells */}
                         {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                         {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("text-right font-bold text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>{formatResultNumber(step.endingBalance)}</TableCell>
                        {/* Display Rate of Return */}
                         {/* Added whitespace-normal and overflow-wrap-break-word classes */}
                         {/* Added text-sm class for mobile font size reduction */}
                        <TableCell className={cn("text-right text-text text-sm", "whitespace-normal", "overflow-wrap-break-word")}>{formatPercentage(step.rateOfReturn)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 자산 성장률 정보 섹션 추가 */}
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

export default CompoundCalculator;
