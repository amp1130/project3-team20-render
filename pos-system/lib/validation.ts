// Utility functions for input validation and sanitization

export function sanitizeString(input: string): string {
  // Remove any potentially dangerous characters
  return input.replace(/[<>'"]/g, '');
}

export function validateIngredientId(id: any): boolean {
  // Ensure it's a positive integer
  return Number.isInteger(Number(id)) && Number(id) > 0;
}

export function validateAmount(amount: any): boolean {
  // Ensure it's a positive number with up to 2 decimal places
  const num = Number(amount);
  return !isNaN(num) && num >= 0 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
}

export function validateIngredientName(name: string): boolean {
  // Ensure it's a non-empty string with reasonable length
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 255;
} 