/**
 * Parse a date string in various formats for sorting
 * Handles DD/MM/YYYY, MM/DD/YYYY, YYYY/MM/DD with various separators
 */
export const parseDateForSorting = (dateStr: string): Date | null => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    
    // Clean up the date string - remove any extra spaces
    const cleanDateStr = dateStr.trim();
    
    // Try multiple formats
    
    // Format 1: DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD (with various separators)
  const dateMatch = cleanDateStr.match(/(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})/);
    if (dateMatch) {
      let day, month, year;
      
      // Determine format based on values
      const first = parseInt(dateMatch[1], 10);
      const second = parseInt(dateMatch[2], 10);
      const third = parseInt(dateMatch[3], 10);
      
      if (first > 31) {
        // YYYY/MM/DD format
        year = first;
        month = second;
        day = third;
      } else if (first > 12) {
        // DD/MM/YYYY format
        day = first;
        month = second;
        year = third;
      } else {
        // Assume MM/DD/YYYY for US format
        month = first;
        day = second;
        year = third;
      }
      
      // Handle two-digit years
      if (year < 100) {
        year = year >= 50 ? year + 1900 : year + 2000;
      }
      
      const date = new Date(year, month - 1, day);
      
      // Validate the date to ensure it's valid
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Format 2: Try standard Date parsing as fallback
    const fallbackDate = new Date(cleanDateStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }
    
    return null;
  };