export function generateUtilsIndex(): string {
  return `/**
 * Utility functions for the MCP server
 */

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function validateRequired<T>(value: T | undefined | null, name: string): T {
  if (value === undefined || value === null) {
    throw new Error(\`\${name} is required\`);
  }
  return value;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"'&]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '&': '&amp;',
    };
    return entities[char] || char;
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
`;
}