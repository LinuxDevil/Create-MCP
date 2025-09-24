import fs from 'fs-extra';
import path from 'path';
import { CreateMcpOptions } from '../types/index.js';

export async function copyTemplateFiles(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const templatesDir = path.join(__dirname, '../../templates');
  
  // Copy base template files
  const baseTemplatesDir = path.join(templatesDir, 'base');
  if (await fs.pathExists(baseTemplatesDir)) {
    await fs.copy(baseTemplatesDir, projectPath);
  }
  
  // Copy source template files
  const srcTemplatesDir = path.join(templatesDir, 'src');
  if (await fs.pathExists(srcTemplatesDir)) {
    await fs.copy(srcTemplatesDir, path.join(projectPath, 'src'));
  }

  // Remove unused transport examples if needed
  await removeUnusedTransportCode(config, projectPath);
}

async function removeUnusedTransportCode(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const serverTemplatePath = path.join(projectPath, 'src/server.ts.template');
  
  if (await fs.pathExists(serverTemplatePath)) {
    let serverContent = await fs.readFile(serverTemplatePath, 'utf-8');

    if (config.transportTypes === 'stdio') {
      serverContent = removeHttpTransportCode(serverContent);
    } else if (config.transportTypes === 'http') {
      serverContent = removeStdioTransportCode(serverContent);
    }

    await fs.writeFile(serverTemplatePath, serverContent);
  }
}

function removeHttpTransportCode(content: string): string {
  // Remove HTTP-specific imports
  content = content.replace(/import.*StreamableHTTPServerTransport.*\n/g, '');
  content = content.replace(/import.*express.*\n/g, '');
  content = content.replace(/import.*randomUUID.*\n/g, '');
  
  // Remove HTTP transport method and related code
  const httpMethodRegex = /\/\*\*[\s\S]*?Start the server with HTTP transport[\s\S]*?\*\/[\s\S]*?async startHttp\([\s\S]*?\n  \}/g;
  content = content.replace(httpMethodRegex, '');
  
  // Remove HTTP case from main function
  content = content.replace(/case 'http':[\s\S]*?break;/g, '');
  
  return content;
}

function removeStdioTransportCode(content: string): string {
  // Remove Stdio-specific imports
  content = content.replace(/import.*StdioServerTransport.*\n/g, '');
  
  // Remove Stdio transport method
  const stdioMethodRegex = /\/\*\*[\s\S]*?Start the server with Stdio transport[\s\S]*?\*\/[\s\S]*?async startStdio\([\s\S]*?\n  \}/g;
  content = content.replace(stdioMethodRegex, '');
  
  // Remove Stdio case from main function
  content = content.replace(/case 'stdio':[\s\S]*?break;/g, '');
  
  return content;
}

export async function ensureDirectoryStructure(projectPath: string): Promise<void> {
  const directories = [
    'src',
    'src/services',
    'src/utils',
    'dist'
  ];

  for (const dir of directories) {
    await fs.ensureDir(path.join(projectPath, dir));
  }
}