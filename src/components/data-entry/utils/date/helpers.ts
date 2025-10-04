export const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };
  
  export const getDaysInMonth = (month: number, year?: number): number => {
    if (month === 2) {
      return year && isLeapYear(year) ? 29 : 28;
    }
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
  };
  
  export const getFormatSeparator = (dateFormat: string): string => {
    return dateFormat.includes('/') ? '/' : 
           dateFormat.includes('-') ? '-' : '.';
  };
  
  export const expandTwoDigitYear = (yearStr: string): string => {
    const currentYear = new Date().getFullYear();
    const century = currentYear.toString().substring(0, 2);
    const enteredYear = parseInt(yearStr);
    const twoDigitCurrentYear = currentYear % 100;
    
    // Use current century if year is ≤ current two-digit year, otherwise use previous century
    return enteredYear <= twoDigitCurrentYear 
      ? `${century}${yearStr.padStart(2, '0')}` 
      : `${parseInt(century) - 1}${yearStr.padStart(2, '0')}`;
  };