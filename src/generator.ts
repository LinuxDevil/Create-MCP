import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectConfig } from './prompts.js';
import { generateTemplateFiles } from './templates/index.js';
import { installDependencies } from './utils/package-manager.js';

export async function generateProject(config: ProjectConfig): Promise<void> {
  const projectDir = path.resolve(process.cwd(), config.name);
  
  const spinner = ora({
    text: 'Creating project structure...',
    spinner: 'dots'
  }).start();

  try {
    // Ensure project directory exists
    await fs.ensureDir(projectDir);

    // Generate all template files
    spinner.text = 'Generating template files...';
    const templateFiles = generateTemplateFiles(config);

    // Write all files
    for (const [filePath, content] of Object.entries(templateFiles)) {
      const fullPath = path.join(projectDir, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf-8');
      
      if (config.verbose) {
        console.log(chalk.gray(`  Created: ${filePath}`));
      }
    }

    spinner.succeed('Project structure created');

    // Install dependencies
    if (!config.skipInstall) {
      const installSpinner = ora({
        text: 'Installing dependencies...',
        spinner: 'dots'
      }).start();

      try {
        await installDependencies(projectDir, config.packageManager);
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