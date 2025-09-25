export interface CreateMcpOptions {
  name: string;
  description?: string;
  author?: string;
  transportTypes?: 'stdio' | 'http' | 'both';
  includeExamples?: boolean;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  skipInstall?: boolean;
  verbose?: boolean;
  // Modern MCP features
  enableOAuth?: boolean;
  enableDnsProtection?: boolean;
  enableStateless?: boolean;
  includeLlmSampling?: boolean;
  includeDynamicTools?: boolean;
  includeElicitation?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface TemplateVariables {
  PROJECT_NAME: string;
  PROJECT_NAME_PASCAL?: string;
  PROJECT_NAME_CAMEL?: string;
  PROJECT_NAME_KEBAB?: string;
  PROJECT_NAME_SNAKE?: string;
  PROJECT_DESCRIPTION?: string;
  PROJECT_AUTHOR?: string;
  CURRENT_YEAR?: string;
  CURRENT_DATE?: string;
  MCP_SDK_VERSION?: string;
  NODE_VERSION?: string;
  ENABLE_OAUTH?: string;
  ENABLE_DNS_PROTECTION?: string;
  ENABLE_STATELESS?: string;
  INCLUDE_LLM_SAMPLING?: string;
  INCLUDE_DYNAMIC_TOOLS?: string;
  INCLUDE_ELICITATION?: string;
  INCLUDE_EXAMPLES?: string;
  TRANSPORT_TYPES?: string;
  PACKAGE_MANAGER?: string;
  [key: string]: string | undefined; // Allow additional variables
}