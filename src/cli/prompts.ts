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
    {
      type: 'confirm',
      name: 'enableOAuth',
      message: 'Enable OAuth authentication for HTTP transport?',
      default: false,
      when: (answers: any) => !initialOptions.enableOAuth && (initialOptions.transportTypes === 'http' || initialOptions.transportTypes === 'both' || answers.transportTypes === 'http' || answers.transportTypes === 'both'),
    },
    {
      type: 'confirm', 
      name: 'enableDnsProtection',
      message: 'Enable DNS rebinding protection? (recommended for production)',
      default: true,
      when: (answers: any) => initialOptions.enableDnsProtection === undefined && (initialOptions.transportTypes === 'http' || initialOptions.transportTypes === 'both' || answers.transportTypes === 'http' || answers.transportTypes === 'both'),
    },
    {
      type: 'confirm',
      name: 'enableStateless',
      message: 'Enable stateless mode? (simpler deployment, no session persistence)',
      default: false,
      when: (answers: any) => initialOptions.enableStateless === undefined && (initialOptions.transportTypes === 'http' || initialOptions.transportTypes === 'both' || answers.transportTypes === 'http' || answers.transportTypes === 'both'),
    },
    {
      type: 'confirm',
      name: 'includeLlmSampling',
      message: 'Include LLM sampling examples? (allows tools to make LLM calls)',
      default: true,
      when: (answers: any) => initialOptions.includeLlmSampling === undefined && (initialOptions.includeExamples !== false && answers.includeExamples !== false),
    },
    {
      type: 'confirm',
      name: 'includeDynamicTools',
      message: 'Include dynamic tool management examples? (enable/disable tools at runtime)',
      default: true,
      when: (answers: any) => initialOptions.includeDynamicTools === undefined && (initialOptions.includeExamples !== false && answers.includeExamples !== false),
    },
    {
      type: 'confirm',
      name: 'includeElicitation',
      message: 'Include user input elicitation examples? (request additional input from users)',
      default: true,
      when: (answers: any) => initialOptions.includeElicitation === undefined && (initialOptions.includeExamples !== false && answers.includeExamples !== false),
    },
  ]);

  const config: CreateMcpOptions = {
    name: projectName,
    description: initialOptions.description || answers.description,
    author: initialOptions.author || answers.author || '',
    transportTypes: initialOptions.transportTypes || answers.transportTypes,
    includeExamples: initialOptions.includeExamples !== undefined ? initialOptions.includeExamples : answers.includeExamples,
    packageManager: initialOptions.packageManager || answers.packageManager,
    enableOAuth: initialOptions.enableOAuth !== undefined ? initialOptions.enableOAuth : answers.enableOAuth || false,
    enableDnsProtection: initialOptions.enableDnsProtection !== undefined ? initialOptions.enableDnsProtection : answers.enableDnsProtection !== undefined ? answers.enableDnsProtection : true,
    enableStateless: initialOptions.enableStateless !== undefined ? initialOptions.enableStateless : answers.enableStateless || false,
    includeLlmSampling: initialOptions.includeLlmSampling !== undefined ? initialOptions.includeLlmSampling : answers.includeLlmSampling !== undefined ? answers.includeLlmSampling : true,
    includeDynamicTools: initialOptions.includeDynamicTools !== undefined ? initialOptions.includeDynamicTools : answers.includeDynamicTools !== undefined ? answers.includeDynamicTools : true,
    includeElicitation: initialOptions.includeElicitation !== undefined ? initialOptions.includeElicitation : answers.includeElicitation !== undefined ? answers.includeElicitation : true,
  };

  console.log(chalk.green('\n📋 Configuration Summary:'));
  console.log(chalk.gray(`  Name: ${config.name}`));
  console.log(chalk.gray(`  Description: ${config.description}`));
  console.log(chalk.gray(`  Author: ${config.author || 'Not specified'}`));
  console.log(chalk.gray(`  Transport: ${config.transportTypes}`));
  console.log(chalk.gray(`  Examples: ${config.includeExamples ? 'Yes' : 'No'}`));
  console.log(chalk.gray(`  Package Manager: ${config.packageManager}`));
  
  if (config.transportTypes === 'http' || config.transportTypes === 'both') {
    console.log(chalk.blue('\n🚀 Modern Features:'));
    console.log(chalk.gray(`  OAuth Authentication: ${config.enableOAuth ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  DNS Protection: ${config.enableDnsProtection ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  Stateless Mode: ${config.enableStateless ? 'Yes' : 'No'}`));
  }
  
  if (config.includeExamples) {
    console.log(chalk.cyan('\n✨ Advanced Examples:'));
    console.log(chalk.gray(`  LLM Sampling: ${config.includeLlmSampling ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  Dynamic Tools: ${config.includeDynamicTools ? 'Yes' : 'No'}`));
    console.log(chalk.gray(`  User Elicitation: ${config.includeElicitation ? 'Yes' : 'No'}`));
  }
  
  console.log('');

  return config;
}