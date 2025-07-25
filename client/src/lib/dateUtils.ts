// Date utility functions for Korean date format handling

/**
 * Converts short Korean date format (YY-MM-DD or YY.MM.DD) to full date format (YYYY-MM-DD)
 * @param dateStr - Date string in format like "25-06-14" or "25.06.14"
 * @returns Full date string in format "2025-06-14" or original string if not matching pattern
 */
export function convertKoreanShortDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  // Handle Korean short date format (YY-MM-DD or YY.MM.DD)
  const shortDateRegex = /^(\d{2})[-.](\d{2})[-.](\d{2})$/;
  const match = dateStr.match(shortDateRegex);
  
  if (match) {
    const [, year, month, day] = match;
    // Convert YY to full year (assuming 20YY for years 00-99)
    const fullYear = `20${year}`;
    return `${fullYear}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Converts full date format (YYYY-MM-DD) to Korean short format (YY-MM-DD)
 * @param dateStr - Date string in format like "2025-06-14"
 * @returns Short date string in format "25-06-14" or original string if not matching pattern
 */
export function convertToKoreanShortDate(dateStr: string): string {
  if (!dateStr) return dateStr;
  
  // Handle full date format (YYYY-MM-DD)
  const fullDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateStr.match(fullDateRegex);
  
  if (match) {
    const [, year, month, day] = match;
    // Convert YYYY to YY
    const shortYear = year.slice(-2);
    return `${shortYear}-${month}-${day}`;
  }
  
  return dateStr;
}

/**
 * Formats a Date object to Korean short format (YY-MM-DD)
 * @param date - Date object
 * @returns Short date string in format "25-06-14"
 */
export function formatDateToKoreanShort(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parses Korean short date format to Date object
 * @param dateStr - Date string in format like "25-06-14"
 * @returns Date object or null if invalid
 */
export function parseKoreanShortDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const fullDateStr = convertKoreanShortDate(dateStr);
  const date = new Date(fullDateStr);
  
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Validates Korean short date format
 * @param dateStr - Date string to validate
 * @returns true if valid format
 */
export function isValidKoreanShortDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const shortDateRegex = /^(\d{2})[-.](\d{2})[-.](\d{2})$/;
  const match = dateStr.match(shortDateRegex);
  
  if (!match) return false;
  
  const [, year, month, day] = match;
  const fullYear = parseInt(`20${year}`);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  
  // Basic validation
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  
  // Check if date is valid
  const date = new Date(fullYear, monthNum - 1, dayNum);
  return date.getFullYear() === fullYear && 
         date.getMonth() === monthNum - 1 && 
         date.getDate() === dayNum;
}