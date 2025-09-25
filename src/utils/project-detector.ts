/**
 * Project Detection and Validation Utilities
 * Detects existing MCP server projects and validates project structure
 */

import fs from 'fs-extra';
import path from 'path';
import { ProjectContext, ComponentType } from '../types/index.js';
// Note: We'll use console.warn instead of logger since logger is in another module

/**
 * Detect if the current directory contains a valid MCP server project
 */
export async function detectMcpProject(targetPath: string = process.cwd()): Promise<ProjectContext> {
  const context: ProjectContext = {
    isValidProject: false,
    projectPath: targetPath,
    srcPath: path.join(targetPath, 'src'),
    projectName: ''
  };

  try {
    const packageJsonPath = path.join(targetPath, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      return context;
    }

    const packageJson = await fs.readJson(packageJsonPath);
    context.packageJson = packageJson;
    context.projectName = packageJson.name || path.basename(targetPath);

    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const hasMcpSdk = '@modelcontextprotocol/sdk' in dependencies;
    
    if (!hasMcpSdk) {
      return context;
    }

    if (!await fs.pathExists(context.srcPath)) {
      return context;
    }

    const requiredFiles = [
      'server.ts',
      'core/mcp-server.ts',
      'tools/index.ts',
      'resources/index.ts',
      'prompts/index.ts'
    ];

    for (const file of requiredFiles) {
      if (!await fs.pathExists(path.join(context.srcPath, file))) {
        return context;
      }
    }

    context.isValidProject = true;
    return context;

  } catch (error) {
    console.warn(`Error detecting MCP project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return context;
  }
}

/**
 * Validate component name according to TypeScript and naming conventions
 */
export function validateComponentName(name: string, type: ComponentType): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Component name cannot be empty' };
  }

  const cleanName = name.trim().replace(/\s+/g, '-');
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cleanName)) {
    return { isValid: false, error: 'Component name must start with a letter and contain only letters, numbers, hyphens, and underscores' };
  }

  if (cleanName.length > 50) {
    return { isValid: false, error: 'Component name must be 50 characters or less' };
  }

  const reservedWords = ['index', 'server', 'config', 'main', 'default', 'export', 'import'];
  if (reservedWords.includes(cleanName.toLowerCase())) {
    return { isValid: false, error: `"${cleanName}" is a reserved word and cannot be used as a component name` };
  }

  switch (type) {
    case 'tool':
      if (cleanName.endsWith('-tool') || cleanName.endsWith('Tool')) {
        return { isValid: false, error: 'Tool names should not end with "tool" or "Tool" - it will be added automatically' };
      }
      break;
    case 'resource':
      if (cleanName.endsWith('-resource') || cleanName.endsWith('Resource')) {
        return { isValid: false, error: 'Resource names should not end with "resource" or "Resource" - it will be added automatically' };
      }
      break;
    case 'prompt':
      if (cleanName.endsWith('-prompt') || cleanName.endsWith('Prompt')) {
        return { isValid: false, error: 'Prompt names should not end with "prompt" or "Prompt" - it will be added automatically' };
      }
      break;
    case 'service':
      if (cleanName.endsWith('-service') || cleanName.endsWith('Service')) {
        return { isValid: false, error: 'Service names should not end with "service" or "Service" - it will be added automatically' };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Check if a component with the given name already exists
 */
export async function checkComponentExists(
  projectContext: ProjectContext,
  componentType: ComponentType,
  componentName: string
): Promise<{ exists: boolean; existingFile?: string }> {
  const componentDir = path.join(projectContext.srcPath, getComponentDirectory(componentType));
  const fileName = generateComponentFileName(componentName, componentType);
  const filePath = path.join(componentDir, fileName);

  const exists = await fs.pathExists(filePath);
  return { exists, existingFile: exists ? filePath : undefined };
}

/**
 * Get the directory for a specific component type
 */
export function getComponentDirectory(type: ComponentType): string {
  switch (type) {
    case 'tool': return 'tools';
    case 'resource': return 'resources';
    case 'prompt': return 'prompts';
    case 'service': return 'services';
    case 'transport': return 'transports';
    case 'util': return 'utils';
    default: throw new Error(`Unknown component type: ${type}`);
  }
}

/**
 * Generate the appropriate file name for a component
 */
export function generateComponentFileName(name: string, type: ComponentType): string {
  const cleanName = name.trim().replace(/\s+/g, '-').toLowerCase();
  
  switch (type) {
    case 'tool': return `${cleanName}-tool.ts`;
    case 'resource': return `${cleanName}-resource.ts`;
    case 'prompt': return `${cleanName}-prompt.ts`;
    case 'service': return `${cleanName}.ts`;
    case 'transport': return `${cleanName}-transport.ts`;
    case 'util': return `${cleanName}.ts`;
    default: return `${cleanName}.ts`;
  }
}

/**
 * Generate class name from component name
 */
export function generateClassName(name: string, type: ComponentType): string {
  const pascalName = name
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');

  switch (type) {
    case 'tool': return `${pascalName}Tool`;
    case 'resource': return `${pascalName}Resource`;
    case 'prompt': return `${pascalName}Prompt`;
    case 'service': return `${pascalName}Service`;
    case 'transport': return `${pascalName}Transport`;
    case 'util': return pascalName;
    default: return pascalName;
  }
}

/**
 * Generate variable name from component name
 */
export function generateVariableName(name: string, type: ComponentType): string {
  const camelName = name
    .split(/[-_\s]+/)
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');

  switch (type) {
    case 'tool': return `${camelName}Tool`;
    case 'resource': return `${camelName}Resource`;
    case 'prompt': return `${camelName}Prompt`;
    case 'service': return `${camelName}Service`;
    case 'transport': return `${camelName}Transport`;
    case 'util': return camelName;
    default: return camelName;
  }
}

/**
 * Generate registry key from component name
 */
export function generateRegistryKey(name: string): string {
  return name.trim().replace(/\s+/g, '-').toLowerCase();
}
