export interface CreateMcpOptions {
  name: string;
  description?: string;
  author?: string;
  transportTypes?: 'stdio' | 'http' | 'both';
  includeExamples?: boolean;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  skipInstall?: boolean;
  verbose?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface TemplateVariables {
  PROJECT_NAME: string;
  PROJECT_DESCRIPTION: string;
  PROJECT_AUTHOR: string;
  CURRENT_YEAR: string;
  MCP_SDK_VERSION: string;
}