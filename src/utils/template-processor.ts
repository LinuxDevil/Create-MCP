import fs from 'fs-extra';
import path from 'path';

export interface TemplateVariables {
  [key: string]: string;
}

export async function processTemplate(
  templatePath: string,
  variables: TemplateVariables
): Promise<void> {
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  const processedContent = processTemplateContent(templateContent, variables);
  
  // Remove .template extension
  const outputPath = templatePath.replace(/\.template$/, '');
  await fs.writeFile(outputPath, processedContent);
  
  // Remove the template file
  await fs.remove(templatePath);
}

export function processTemplateContent(
  content: string,
  variables: TemplateVariables
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

export async function findTemplateFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith('.template')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(directory);
  return files;
}