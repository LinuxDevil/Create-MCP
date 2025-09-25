import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { CreateMcpOptions } from '../types/index.js';
import { 
  createTemplateVariables, 
  processAllTemplates 
} from '../utils/template-processor.js';
import { 
  ensureDirectoryExists, 
  copyDirectory, 
  getTemplatesDirectory, 
  validateTemplatesDirectory,
  formatFileSize,
  getDirectorySize
} from '../utils/file-operations.js';
import { 
  installDependencies 
} from '../utils/package-manager.js';

export async function generateProject(config: CreateMcpOptions): Promise<void> {
  const projectPath = path.join(process.cwd(), config.name);
  
  try {
    // Validate templates directory exists
    await validateTemplatesDirectory();
    
    // Check if directory already exists
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory ${config.name} already exists`);
    }

    console.log(chalk.blue('📁 Creating project directory...'));
    await ensureDirectoryExists(projectPath);

    // Copy template files
    console.log(chalk.blue('📋 Copying template files...'));
    await copyTemplateFiles(config, projectPath);

    // Process template variables
    console.log(chalk.blue('🔧 Processing templates...'));
    await processTemplateVariables(config, projectPath);

    // Remove unused transport code if needed
    if (config.transportTypes !== 'both') {
      console.log(chalk.blue('✂️  Removing unused transport code...'));
      await removeUnusedTransportCode(config, projectPath);
    }

    // Remove examples if not wanted
    if (!config.includeExamples) {
      console.log(chalk.blue('🗑️  Removing example implementations...'));
      await removeExampleCode(projectPath);
    }

    // Install dependencies
    if (!config.skipInstall) {
      console.log(chalk.blue('📦 Installing dependencies...'));
      await installDependencies(projectPath, config.packageManager!);
    }

    // Show project statistics
    await showProjectStatistics(projectPath);

    console.log(chalk.green('🎉 Project setup complete!'));

  } catch (error) {
    // Clean up on failure
    if (await fs.pathExists(projectPath)) {
      await fs.remove(projectPath);
    }
    throw error;
  }
}

async function copyTemplateFiles(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const templatesDir = getTemplatesDirectory();
  const spinner = ora('Copying template files...').start();
  
  try {
    // Copy base files (package.json, tsconfig.json, etc.)
    const baseDir = path.join(templatesDir, 'base');
    await copyDirectory(baseDir, projectPath);
    
    // Copy source files
    const srcDir = path.join(templatesDir, 'src');
    const projectSrcDir = path.join(projectPath, 'src');
    await copyDirectory(srcDir, projectSrcDir);

    spinner.succeed('Template files copied successfully');
  } catch (error) {
    spinner.fail('Failed to copy template files');
    throw new Error(`Failed to copy template files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processTemplateVariables(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const spinner = ora('Processing template variables...').start();
  
  try {
    const templateVars = createTemplateVariables(
      config.name,
      config.description || '',
      config.author || '',
      {
        // Modern feature flags
        ENABLE_OAUTH: config.enableOAuth ? 'true' : 'false',
        ENABLE_DNS_PROTECTION: config.enableDnsProtection !== false ? 'true' : 'false',
        ENABLE_STATELESS: config.enableStateless ? 'true' : 'false',
        INCLUDE_LLM_SAMPLING: config.includeLlmSampling !== false ? 'true' : 'false',
        INCLUDE_DYNAMIC_TOOLS: config.includeDynamicTools !== false ? 'true' : 'false',
        INCLUDE_ELICITATION: config.includeElicitation !== false ? 'true' : 'false',
        INCLUDE_EXAMPLES: config.includeExamples ? 'true' : 'false',
        TRANSPORT_TYPES: config.transportTypes || 'both',
        PACKAGE_MANAGER: config.packageManager || 'npm'
      }
    );

    await processAllTemplates(projectPath, templateVars);
    
    spinner.succeed('Template variables processed successfully');
  } catch (error) {
    spinner.fail('Failed to process template variables');
    throw new Error(`Failed to process templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function removeUnusedTransportCode(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const serverPath = path.join(projectPath, 'src', 'server.ts');
  
  if (!(await fs.pathExists(serverPath))) {
    return;
  }

  try {
    let serverContent = await fs.readFile(serverPath, 'utf-8');

    if (config.transportTypes === 'stdio') {
      // Remove HTTP-specific imports and code
      serverContent = removeHttpTransportCode(serverContent);
    } else if (config.transportTypes === 'http') {
      // Remove Stdio-specific imports and code
      serverContent = removeStdioTransportCode(serverContent);
    }

    await fs.writeFile(serverPath, serverContent);
  } catch (error) {
    throw new Error(`Failed to remove unused transport code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function removeHttpTransportCode(content: string): string {
  // Remove HTTP-specific imports
  content = content.replace(/import.*StreamableHTTPServerTransport.*\n/g, '');
  content = content.replace(/import.*express.*\n/g, '');
  content = content.replace(/import.*cors.*\n/g, '');
  content = content.replace(/import.*randomUUID.*\n/g, '');
  
  // Remove HTTP transport method and related code
  content = content.replace(/\/\*\*[\s\S]*?Start the server with.*HTTP transport[\s\S]*?\*\/[\s\S]*?async startHttp\([\s\S]*?\n  \}/g, '');
  
  // Remove HTTP-related switch case
  content = content.replace(/case 'http':[\s\S]*?break;/g, '');
  
  // Update main function to only use stdio
  content = content.replace(
    /const transportMode = process\.env\.MCP_TRANSPORT \|\| process\.argv\[2\] \|\| 'stdio';/,
    "const transportMode = 'stdio';"
  );
  
  // Clean up any remaining HTTP references
  content = content.replace(/Available modes: stdio, http/g, 'Available modes: stdio');
  
  return content;
}

function removeStdioTransportCode(content: string): string {
  // Remove Stdio-specific imports
  content = content.replace(/import.*StdioServerTransport.*\n/g, '');
  
  // Remove Stdio transport method
  content = content.replace(/\/\*\*[\s\S]*?Start the server with Stdio transport[\s\S]*?\*\/[\s\S]*?async startStdio\([\s\S]*?\n  \}/g, '');
  
  // Remove Stdio-related switch case
  content = content.replace(/case 'stdio':[\s\S]*?break;/g, '');
  
  // Update main function to only use http
  content = content.replace(
    /const transportMode = process\.env\.MCP_TRANSPORT \|\| process\.argv\[2\] \|\| 'stdio';/,
    "const transportMode = 'http';"
  );
  
  // Clean up any remaining Stdio references
  content = content.replace(/Available modes: stdio, http/g, 'Available modes: http');
  
  return content;
}

async function removeExampleCode(projectPath: string): Promise<void> {
  const serverPath = path.join(projectPath, 'src', 'server.ts');
  
  if (!(await fs.pathExists(serverPath))) {
    return;
  }

  try {
    let serverContent = await fs.readFile(serverPath, 'utf-8');
    
    // Remove example service import and usage
    serverContent = serverContent.replace(/import.*ExampleService.*\n/g, '');
    serverContent = serverContent.replace(/private exampleService: ExampleService;[\s\S]*?this\.exampleService = new ExampleService\(\);/g, '');
    
    // Remove example registrations
    serverContent = serverContent.replace(/private registerTools\(\): void \{[\s\S]*?\n  \}/g, 
      'private registerTools(): void {\n    // Add your custom tools here\n  }');
    
    serverContent = serverContent.replace(/private registerResources\(\): void \{[\s\S]*?\n  \}/g, 
      'private registerResources(): void {\n    // Add your custom resources here\n  }');
    
    serverContent = serverContent.replace(/private registerPrompts\(\): void \{[\s\S]*?\n  \}/g, 
      'private registerPrompts(): void {\n    // Add your custom prompts here\n  }');

    await fs.writeFile(serverPath, serverContent);

    // Remove example service file
    const exampleServicePath = path.join(projectPath, 'src', 'services', 'example.ts');
    if (await fs.pathExists(exampleServicePath)) {
      await fs.remove(exampleServicePath);
    }

  } catch (error) {
    throw new Error(`Failed to remove example code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function showProjectStatistics(projectPath: string): Promise<void> {
  try {
    const spinner = ora('Calculating project statistics...').start();
    
    const stats = await getProjectStatistics(projectPath);
    
    spinner.stop();
    
    console.log(chalk.cyan('\n📊 Project Statistics:'));
    console.log(chalk.gray(`  Files created: ${stats.fileCount}`));
    console.log(chalk.gray(`  Total size: ${formatFileSize(stats.totalSize)}`));
    console.log(chalk.gray(`  Lines of code: ${stats.linesOfCode}`));
  } catch (error) {
    // Don't fail if we can't get statistics
    if (process.env.VERBOSE) {
      console.log(chalk.yellow('Could not calculate project statistics'));
    }
  }
}

async function getProjectStatistics(projectPath: string): Promise<{
  fileCount: number;
  totalSize: number;
  linesOfCode: number;
}> {
  let fileCount = 0;
  let linesOfCode = 0;
  
  async function countFiles(dir: string): Promise<void> {
    const items = await fs.readdir(dir, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      
      if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
        await countFiles(itemPath);
      } else if (item.isFile()) {
        fileCount++;
        
        // Count lines of code for source files
        if (item.name.endsWith('.ts') || item.name.endsWith('.js') || item.name.endsWith('.json')) {
          try {
            const content = await fs.readFile(itemPath, 'utf-8');
            linesOfCode += content.split('\n').length;
          } catch (error) {
            // Ignore errors reading individual files
          }
        }
      }
    }
  }
  
  await countFiles(projectPath);
  const totalSize = await getDirectorySize(projectPath);
  
  return { fileCount, totalSize, linesOfCode };
}