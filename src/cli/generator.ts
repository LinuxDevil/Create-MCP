import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { CreateMcpOptions } from '../types/index.js';
import { processTemplate, findTemplateFiles } from '../utils/template-processor.js';
import { installDependencies } from '../utils/package-manager.js';
import { copyTemplateFiles } from '../utils/file-operations.js';

export async function generateProject(config: CreateMcpOptions): Promise<void> {
  const projectPath = path.join(process.cwd(), config.name);
  
  const spinner = ora({
    text: 'Creating project structure...',
    spinner: 'dots'
  }).start();

  try {
    // Check if directory already exists
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory ${config.name} already exists`);
    }

    // Create project directory
    spinner.text = 'Creating project directory...';
    await fs.ensureDir(projectPath);

    // Copy template files
    spinner.text = 'Copying template files...';
    await copyTemplateFiles(config, projectPath);

    // Process template variables
    spinner.text = 'Processing templates...';
    await processTemplateVariables(config, projectPath);

    spinner.succeed('Project structure created');

    // Install dependencies
    if (!config.skipInstall) {
      const installSpinner = ora({
        text: 'Installing dependencies...',
        spinner: 'dots'
      }).start();

      try {
        await installDependencies(projectPath, config.packageManager!);
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        console.log(chalk.yellow('⚠️  You can install dependencies manually later:'));
        console.log(chalk.gray(`  cd ${config.name}`));
        console.log(chalk.gray(`  ${config.packageManager} install`));
      }
    }

  } catch (error) {
    spinner.fail('Failed to generate project');
    throw error;
  }
}

async function processTemplateVariables(config: CreateMcpOptions, projectPath: string): Promise<void> {
  const templateVars = {
    PROJECT_NAME: config.name,
    PROJECT_DESCRIPTION: config.description || '',
    PROJECT_AUTHOR: config.author || '',
    CURRENT_YEAR: new Date().getFullYear().toString(),
    MCP_SDK_VERSION: '^1.0.0', // Latest stable version
  };

  // Process all .template files
  const templateFiles = await findTemplateFiles(projectPath);
  
  for (const file of templateFiles) {
    await processTemplate(file, templateVars);
  }
}