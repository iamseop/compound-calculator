import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to format number string with commas for input fields
export const formatInputNumber = (value: string, allowDecimals: boolean = false): string => {
  if (value === '') {
    return '';
  }

  // Remove all non-digit characters except potentially one decimal point
  let cleanedValue = value.replace(/[^\d.]/g, '');

  if (!allowDecimals) {
    // If decimals are not allowed, remove any decimal point and subsequent characters
    cleanedValue = cleanedValue.replace(/\./g, '');
  } else {
    // If decimals are allowed, ensure only one decimal point exists
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    // Handle leading decimal point, e.g., ".5" becomes "0.5"
    if (cleanedValue.startsWith('.') && cleanedValue.length > 1) {
        cleanedValue = '0' + cleanedValue;
    }
  }

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = cleanedValue.split('.');

  // Format the integer part with commas
  // Use Number() to handle cases like "0" or empty string from split
  const formattedInteger = new Intl.NumberFormat('ko-KR').format(Number(integerPart));

  // Recombine integer and decimal parts
  if (allowDecimals && decimalPart !== undefined) {
      // If the original cleaned value ended with a decimal point, preserve it
      if (cleanedValue.endsWith('.') && decimalPart === '') {
           return formattedInteger + '.';
      }
      return formattedInteger + '.' + decimalPart;
  }

  return formattedInteger;
};


// Helper to parse input string into a number
export const parseInputString = (inputString: string, allowDecimals: boolean = false): number | '' => {
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
     // Handle leading decimal point, e.g., ".5" becomes "0.5" before parsing
    if (cleanedString.startsWith('.') && cleanedString.length > 1) {
        cleanedString = '0' + cleanedString;
    }
    const parsed = parseFloat(cleanedString);
    return isNaN(parsed) ? '' : parsed;
  }
};

// Helper to format number with commas and round for results/table
export const formatResultNumber = (amount: number | '' | null): string => {
   if (amount === '' || amount === null || isNaN(amount)) {
    return '0';
  }
  // Round to 0 decimal places for results and table
  return new Intl.NumberFormat('ko-KR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format percentage
export const formatPercentage = (percentage: number | null): string => {
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
  }).format(percentage / 100);
};
