export function generateLogger(): string {
  return `/**
 * Structured logging utility for MCP server
 * Provides different log levels and structured output
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): string {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
      ...(error && { error: { message: error.message, stack: error.stack } })
    };

    // In development, use pretty printing
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        debug: '\\x1b[36m', // cyan
        info: '\\x1b[32m',  // green
        warn: '\\x1b[33m',  // yellow
        error: '\\x1b[31m'  // red
      };
      const reset = '\\x1b[0m';
      
      let output = \`\${colors[level]}[\${level.toUpperCase()}]\${reset} \${message}\`;
      
      if (data) {
        output += \`\\n  Data: \${JSON.stringify(data, null, 2)}\`;
      }
      
      if (error) {
        output += \`\\n  Error: \${error.message}\`;
        if (error.stack) {
          output += \`\\n  Stack: \${error.stack}\`;
        }
      }
      
      return output;
    }

    // In production, use JSON format
    return JSON.stringify(entry);
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const errorObj = error instanceof Error ? error : 
                      (error && typeof error === 'object' && error.message) ? error :
                      new Error(String(error));
      console.error(this.formatMessage('error', message, undefined, errorObj));
    }
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLevel(): LogLevel {
    return this.logLevel;
  }
}

export const logger = new Logger();
export default logger;
`;
}