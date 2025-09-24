import path from 'path';
import fs from 'fs-extra';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export function validateProjectName(name: string): ValidationResult {
  // Check for empty name
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }

  // Check for valid characters
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return { 
      isValid: false, 
      error: 'Project name can only contain letters, numbers, hyphens, and underscores' 
    };
  }

  // Check for reserved names
  const reservedNames = [
    'node_modules',
    'package.json',
    'mcp',
    'test',
    'src',
    'dist',
    'build'
  ];

  if (reservedNames.includes(name.toLowerCase())) {
    return { 
      isValid: false, 
      error: `Project name "${name}" is reserved` 
    };
  }

  // Check for npm package name validity
  if (name.length > 214) {
    return { 
      isValid: false, 
      error: 'Project name must be less than 214 characters' 
    };
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    return { 
      isValid: false, 
      error: 'Project name cannot start with . or _' 
    };
  }

  // Check if directory already exists
  const projectPath = path.join(process.cwd(), name);
  if (fs.pathExistsSync(projectPath)) {
    return { 
      isValid: false, 
      error: `Directory "${name}" already exists` 
    };
  }

  return { isValid: true };
}

export function validateAuthor(author: string): ValidationResult {
  if (author && author.length > 100) {
    return { 
      isValid: false, 
      error: 'Author name must be less than 100 characters' 
    };
  }

  return { isValid: true };
}

export function validateDescription(description: string): ValidationResult {
  if (description && description.length > 500) {
    return { 
      isValid: false, 
      error: 'Description must be less than 500 characters' 
    };
  }

  return { isValid: true };
}
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

  return { isValid: true };
}