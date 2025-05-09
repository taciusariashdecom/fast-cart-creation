/**
 * Logger Module
 * 
 * Provides structured logging functionality with:
 * - Group support for nested logging
 * - Different log levels (info, error, warn)
 * - Timestamp and context tracking
 */

class Logger {
  private groupLevel: number = 0;
  private readonly timeFormat: Intl.DateTimeFormat;

  constructor() {
    this.timeFormat = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  /**
   * Starts a new logging group
   * @param label - The group label
   */
  startGroup(label: string) {
    const time = this.timeFormat.format(new Date());
    console.group(`[${time}] ${label}`);
    this.groupLevel++;
  }

  /**
   * Ends the current logging group
   */
  endGroup() {
    if (this.groupLevel > 0) {
      console.groupEnd();
      this.groupLevel--;
    }
  }

  /**
   * Logs information messages
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  info(message: string, ...args: any[]) {
    const time = this.timeFormat.format(new Date());
    console.info(`[${time}] ℹ️ ${message}`, ...args);
  }

  /**
   * Logs error messages
   * @param message - The error message
   * @param error - The error object
   */
  error(message: string, error?: any) {
    const time = this.timeFormat.format(new Date());
    console.error(`[${time}] ❌ ${message}`, error);
  }

  /**
   * Logs warning messages
   * @param message - The warning message
   * @param args - Additional arguments to log
   */
  warn(message: string, ...args: any[]) {
    const time = this.timeFormat.format(new Date());
    console.warn(`[${time}] ⚠️ ${message}`, ...args);
  }

  /**
   * Logs success messages
   * @param message - The success message
   * @param args - Additional arguments to log
   */
  success(message: string, ...args: any[]) {
    const time = this.timeFormat.format(new Date());
    console.info(`[${time}] ✅ ${message}`, ...args);
  }
}

// Export a singleton instance
export const logger = new Logger();