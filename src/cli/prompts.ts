import inquirer from 'inquirer';
import chalk from 'chalk';
import { CreateMcpOptions } from '../types/index.js';

export async function runPrompts(
  projectName: string,
  initialOptions: Partial<CreateMcpOptions>
): Promise<CreateMcpOptions> {
  console.log(chalk.blue('📝 Configure your MCP server project:\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: `A Model Context Protocol server for ${projectName}`,
      when: !initialOptions.description,
      validate: (input: string) => input.trim().length > 0 || 'Description cannot be empty'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: process.env.USER || process.env.USERNAME || '',
      when: !initialOptions.author,
    },
    {
      type: 'list',
      name: 'transportTypes',
      message: 'Which transport types would you like to include?',
      choices: [
        { name: 'Both Stdio and HTTP (recommended)', value: 'both' },
        { name: 'Stdio only (for CLI tools)', value: 'stdio' },
        { name: 'HTTP only (for web services)', value: 'http' },
      ],
      default: 'both',
      when: !initialOptions.transportTypes,
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include example tools and resources?',
      default: true,
      when: initialOptions.includeExamples === undefined,
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'pnpm', value: 'pnpm' }
      ],
      default: 'npm',
      when: !initialOptions.packageManager,
    },
  ]);

  const config: CreateMcpOptions = {
    name: projectName,
    description: initialOptions.description || answers.description,
    author: initialOptions.author || answers.author || '',
    transportTypes: initialOptions.transportTypes || answers.transportTypes,
    includeExamples: initialOptions.includeExamples !== undefined ? initialOptions.includeExamples : answers.includeExamples,
    packageManager: initialOptions.packageManager || answers.packageManager,
  };

  // Display configuration summary
  console.log(chalk.green('\n📋 Configuration Summary:'));
  console.log(chalk.gray(`  Name: ${config.name}`));
  console.log(chalk.gray(`  Description: ${config.description}`));
  console.log(chalk.gray(`  Author: ${config.author || 'Not specified'}`));
  console.log(chalk.gray(`  Transport: ${config.transportTypes}`));
  console.log(chalk.gray(`  Examples: ${config.includeExamples ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  Package Manager: ${config.packageManager}`));
  console.log('');

  return config;
}