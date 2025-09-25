import fs from 'fs-extra';
import path from 'path';
import { TemplateVariables } from '../types/index.js';

export async function processTemplate(
  templatePath: string,
  variables: TemplateVariables
): Promise<void> {
  try {
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const processedContent = processTemplateContent(templateContent, variables);
    
    const outputPath = templatePath.replace(/\.template$/, '');
    await fs.writeFile(outputPath, processedContent);
    
    await fs.remove(templatePath);
  } catch (error) {
    throw new Error(`Failed to process template ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function processTemplateContent(
  content: string,
  variables: TemplateVariables
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = variables[key];
    if (value !== undefined) {
      return value;
    }
    if (process.env.VERBOSE) {
      console.warn(`Warning: Template variable {{${key}}} not found, keeping original`);
    }
    return match;
  });
}

export async function findTemplateFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walk(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.name.endsWith('.template')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      throw new Error(`Failed to walk directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  await walk(directory);
  return files;
}

export function createTemplateVariables(
  projectName: string,
  description: string = '',
  author: string = '',
  additionalVars: Record<string, string> = {}
): TemplateVariables {
  const pascalCase = projectName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);
  
  const kebabCase = projectName.toLowerCase().replace(/[_]/g, '-');
  
  const snakeCase = projectName.toLowerCase().replace(/[-]/g, '_');

  return {
    PROJECT_NAME: projectName,
    PROJECT_NAME_PASCAL: pascalCase,
    PROJECT_NAME_CAMEL: camelCase,
    PROJECT_NAME_KEBAB: kebabCase,
    PROJECT_NAME_SNAKE: snakeCase,
    PROJECT_DESCRIPTION: description,
    PROJECT_AUTHOR: author,
    CURRENT_YEAR: new Date().getFullYear().toString(),
    CURRENT_DATE: new Date().toISOString().split('T')[0],
    MCP_SDK_VERSION: '^1.0.0',
    NODE_VERSION: process.version,
    ...additionalVars
  };
}

export async function processAllTemplates(
  projectPath: string,
  variables: TemplateVariables
): Promise<void> {
  try {
    const templateFiles = await findTemplateFiles(projectPath);
    
    if (process.env.VERBOSE) {
      console.log(`Found ${templateFiles.length} template files to process`);
    }
    
    for (const templateFile of templateFiles) {
      await processTemplate(templateFile, variables);
      
      if (process.env.VERBOSE) {
        console.log(`Processed template: ${path.relative(projectPath, templateFile)}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to process templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}