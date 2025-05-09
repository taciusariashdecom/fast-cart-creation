/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 * Each function is documented for easy understanding by LLMs.
 */

import { DATE_FORMATS } from './constants';

/**
 * Formats a number as currency in BRL
 * @param value - Number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return value.toFixed(2);
}

/**
 * Formats a date string to localized format
 * @param dateString - ISO date string
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 */
export function formatDate(dateString: string, includeTime = false): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(DATE_FORMATS.LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
}

/**
 * Extracts Shopify draft order ID from full ID string
 * @param fullId - Full Shopify ID string
 * @returns Extracted order ID
 */
export function extractDraftOrderId(fullId: string): string {
  return fullId.replace('gid://shopify/DraftOrder/', '');
}

/**
 * Converts centimeters to millimeters
 * @param cm - Value in centimeters
 * @returns Value in millimeters
 */
export function cmToMm(cm: number): number {
  return Math.round(cm * 10);
}

/**
 * Converts millimeters to centimeters
 * @param mm - Value in millimeters
 * @returns Value in centimeters
 */
export function mmToCm(mm: number | string): number {
  const value = typeof mm === 'string' ? parseFloat(mm) : mm;
  return Number((value / 10).toFixed(1));
}

/**
 * Validates if a customer has any information filled
 * @param customer - Customer object to validate
 * @returns Boolean indicating if customer has info
 */
export function hasCustomerInfo(customer: Record<string, string>): boolean {
  return Object.values(customer).some(value => value && value.trim() !== '');
}

/**
 * Translates cord side from internal to display format
 * @param side - Internal cord side value
 * @returns Translated cord side
 */
export function translateCordSide(side: 'left' | 'right'): string {
  return side === 'left' ? 'esquerda' : 'direita';
}