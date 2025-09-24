import validateNpmName from 'validate-npm-package-name';
import path from 'path';
import fs from 'fs-extra';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function validateProjectName(name: string): ValidationResult {
  // Check if name is empty
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Project name cannot be empty'
    };
  }

  // Check npm package name validity
  const npmValidation = validateNpmName(name);
  if (!npmValidation.validForNewPackages) {
    const errors = [
      ...(npmValidation.errors || []),
      ...(npmValidation.warnings || [])
    ];
    
    return {
      isValid: false,
      error: `Invalid project name: ${errors.join(', ')}`
    };
  }

  // Check for reserved names
  const reservedNames = [
    'mcp',
    'modelcontextprotocol',
    'create-mcp',
    'node',
    'npm',
    'server',
    'test',
    'example'
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    return {
      isValid: false,
      error: `"${name}" is a reserved name and cannot be used`
    };
  }

  // Check if directory already exists
  const projectPath = path.resolve(process.cwd(), name);
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);
    if (files.length > 0) {
      return {
        isValid: false,
        error: `Directory "${name}" already exists and is not empty`
      };
    }
  }

  // Additional checks for common issues
  const warnings: string[] = [];
  
  if (name.length > 50) {
    warnings.push('Project name is quite long, consider using a shorter name');
  }

  if (name.includes('_')) {
    warnings.push('Consider using hyphens (-) instead of underscores (_) in the project name');
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function validateProjectConfig(config: any): ValidationResult {
  const errors: string[] = [];

  if (!config.name) {
    errors.push('Project name is required');
  }

  if (config.transportTypes && !['stdio', 'http', 'both'].includes(config.transportTypes)) {
    errors.push('Transport type must be one of: stdio, http, both');
  }

  if (config.packageManager && !['npm', 'yarn', 'pnpm', 'bun'].includes(config.packageManager)) {
    errors.push('Package manager must be one of: npm, yarn, pnpm, bun');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join(', ')
    };
  }

  return { isValid: true };
}