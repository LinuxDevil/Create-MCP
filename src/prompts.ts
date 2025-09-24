import inquirer from 'inquirer';
import chalk from 'chalk';
import { CreateMcpOptions } from './index.js';

export interface ProjectConfig extends Required<CreateMcpOptions> {
  name: string;
}

export async function runPrompts(projectName: string, options: Partial<CreateMcpOptions>): Promise<ProjectConfig> {
  console.log(chalk.blue('📝 Project Configuration\n'));

  const questions: any[] = [];

  // Description
  if (!options.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: `MCP server for ${projectName}`,
      validate: (input: string) => input.trim().length > 0 || 'Description cannot be empty'
    });
  }

  // Author
  if (!options.author) {
    questions.push({
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: process.env.USER || process.env.USERNAME || '',
    });
  }

  // Transport types
  if (!options.transportTypes) {
    questions.push({
      type: 'list',
      name: 'transportTypes',
      message: 'Which transport types would you like to include?',
      choices: [
        {
          name: 'Both (Stdio + HTTP) - Recommended for maximum flexibility',
          value: 'both',
          short: 'Both'
        },
        {
          name: 'Stdio only - For CLI tools and direct integrations',
          value: 'stdio',
          short: 'Stdio'
        },
        {
          name: 'HTTP only - For web services and remote integrations',
          value: 'http',
          short: 'HTTP'
        }
      ],
      default: 'both'
    });
  }

  // Include examples
  if (options.includeExamples === undefined) {
    questions.push({
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include example tools and resources?',
      default: true
    });
  }

  // Package manager (if not detected)
  if (!options.packageManager) {
    questions.push({
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'bun', value: 'bun' }
      ],
      default: 'npm'
    });
  }

  // Skip install
  if (options.skipInstall === undefined) {
    questions.push({
      type: 'confirm',
      name: 'skipInstall',
      message: 'Skip dependency installation?',
      default: false
    });
  }

  const answers = await inquirer.prompt(questions);

  // Merge options with answers
  const config: ProjectConfig = {
    name: projectName,
    description: options.description || answers.description,
    author: options.author || answers.author || '',
    transportTypes: options.transportTypes || answers.transportTypes,
    includeExamples: options.includeExamples !== undefined ? options.includeExamples : answers.includeExamples,
    packageManager: options.packageManager || answers.packageManager,
    skipInstall: options.skipInstall !== undefined ? options.skipInstall : answers.skipInstall,
    verbose: options.verbose || false
  };

  // Display configuration summary
  console.log(chalk.green('\n📋 Configuration Summary:'));
  console.log(chalk.gray(`  Name: ${config.name}`));
  console.log(chalk.gray(`  Description: ${config.description}`));
  console.log(chalk.gray(`  Author: ${config.author || 'Not specified'}`));
  console.log(chalk.gray(`  Transport: ${config.transportTypes}`));
  console.log(chalk.gray(`  Examples: ${config.includeExamples ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  Package Manager: ${config.packageManager}`));
  console.log(chalk.gray(`  Skip Install: ${config.skipInstall ? 'Yes' : 'No'}`));
  console.log('');

  return config;
}