export const formatInputNumber = (value: string, allowDecimals: boolean = true): string => {
  // Remove all non-digit characters except a single decimal point if allowed
  const cleanedValue = allowDecimals ? value.replace(/[^\d.]/g, '') : value.replace(/\D/g, '');

  // Handle multiple decimal points if decimals are allowed
  const parts = cleanedValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with commas
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  if (allowDecimals && decimalPart !== undefined) {
    // Reconstruct with formatted integer part and original decimal part
    return `${formattedIntegerPart}.${decimalPart}`;
  }

  return formattedIntegerPart;
};

export const parseInputString = (value: string, allowDecimals: boolean = true): number | '' => {
  // Remove all non-digit characters except a single decimal point if allowed
  const cleanedValue = allowDecimals ? value.replace(/[^\d.]/g, '') : value.replace(/\D/g, '');

  if (cleanedValue === '' || cleanedValue === '.') {
    return '';
  }

  const parsedValue = allowDecimals ? parseFloat(cleanedValue) : parseInt(cleanedValue, 10);

  // Check if parsing resulted in a valid number
  if (isNaN(parsedValue)) {
    return '';
  }

  return parsedValue;
};

export const formatResultNumber = (value: number | null): string => {
  if (value === null || isNaN(value)) {
    return 'N/A';
  }
  // Format the number with commas and append '원' for Korean Won
  // Removed the "(금액)" suffix
  return `${value.toLocaleString('ko-KR')}원`;
};

export const formatPercentage = (value: number | null): string => {
  if (value === null || isNaN(value)) {
    return 'N/A';
  }
  // Format the percentage with one decimal place
  return `${value.toFixed(1)}%`;
};

export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
