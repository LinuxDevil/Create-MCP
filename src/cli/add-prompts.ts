/**
 * CLI Prompts for Adding Components
 * Interactive prompts for configuring new MCP components
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { ComponentType, AddComponentOptions } from '../types/index.js';
import { validateComponentName } from '../utils/project-detector.js';

/**
 * Run interactive prompts for adding a component
 */
export async function runAddComponentPrompts(
  componentType?: ComponentType,
  componentName?: string,
  initialOptions: Partial<AddComponentOptions> = {}
): Promise<AddComponentOptions> {
  console.log(chalk.blue('🔧 Configure your new MCP component:\n'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'componentType',
      message: 'What type of component would you like to add?',
      choices: [
        {
          name: '🛠️  Tool - Add functionality and tools to your MCP server',
          value: 'tool',
          short: 'Tool'
        },
        {
          name: '📋 Resource - Add data and documentation resources',
          value: 'resource',
          short: 'Resource'
        },
        {
          name: '💡 Prompt - Add intelligent prompt templates',
          value: 'prompt',
          short: 'Prompt'
        },
        {
          name: '⚙️  Service - Add business logic and processing services',
          value: 'service',
          short: 'Service'
        },
        {
          name: '🌐 Transport - Add custom communication transports',
          value: 'transport',
          short: 'Transport'
        },
        {
          name: '🔧 Utility - Add helper functions and utilities',
          value: 'util',
          short: 'Utility'
        },
      ],
      when: !componentType,
      default: initialOptions.componentType || 'tool',
    },
    {
      type: 'input',
      name: 'componentName',
      message: (answers: any) => {
        const type = componentType || answers.componentType;
        return `Enter the ${type} name:`;
      },
      when: !componentName,
      validate: (input: string, answers?: any) => {
        const type = componentType || answers?.componentType || 'tool';
        const validation = validateComponentName(input, type);
        return validation.isValid || validation.error || 'Invalid component name';
      },
      filter: (input: string) => input.trim().replace(/\s+/g, '-').toLowerCase(),
    },
    {
      type: 'input',
      name: 'description',
      message: (answers: any) => {
        const type = componentType || answers.componentType;
        const name = componentName || answers.componentName;
        return `Enter a description for your ${type} '${name}':`;
      },
      default: (answers: any) => {
        const type = componentType || answers.componentType;
        const name = componentName || answers.componentName;
        return `Custom ${type} for ${name} functionality`;
      },
      when: !initialOptions.description,
      validate: (input: string) => input.trim().length > 0 || 'Description cannot be empty',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: process.env.USER || process.env.USERNAME || 'MCP Developer',
      when: !initialOptions.author,
    },
  ]);

  const specificConfig = await promptComponentSpecificConfig(
    componentType || answers.componentType,
    componentName || answers.componentName
  );

  return {
    componentType: componentType || answers.componentType,
    componentName: componentName || answers.componentName,
    description: initialOptions.description || answers.description,
    author: initialOptions.author || answers.author,
    verbose: initialOptions.verbose || false,
    skipValidation: initialOptions.skipValidation || false,
    ...specificConfig,
  };
}

/**
 * Prompt for component-specific configuration
 */
async function promptComponentSpecificConfig(
  componentType: ComponentType,
  componentName: string
): Promise<any> {
  console.log(chalk.blue(`\n⚙️  ${componentType} specific configuration:\n`));

  switch (componentType) {
    case 'tool':
      return await promptToolConfig(componentName);
    case 'resource':
      return await promptResourceConfig(componentName);
    case 'prompt':
      return await promptPromptConfig(componentName);
    case 'service':
      return await promptServiceConfig(componentName);
    case 'transport':
      return await promptTransportConfig(componentName);
    case 'util':
      return await promptUtilConfig(componentName);
    default:
      return {};
  }
}

/**
 * Tool-specific configuration prompts
 */
async function promptToolConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Which features should your tool include?',
      choices: [
        { name: 'Input validation with Zod schemas', value: 'validation', checked: true },
        { name: 'Error handling and logging', value: 'errorHandling', checked: true },
        { name: 'Async operation support', value: 'asyncSupport', checked: true },
        { name: 'Caching mechanism', value: 'caching', checked: false },
        { name: 'Rate limiting', value: 'rateLimiting', checked: false },
        { name: 'Progress tracking', value: 'progressTracking', checked: false },
      ],
    },
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Default output format:',
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'Plain text', value: 'text' },
        { name: 'Both (configurable)', value: 'both' },
      ],
      default: 'both',
    },
    {
      type: 'confirm',
      name: 'includeExamples',
      message: 'Include usage examples in the tool description?',
      default: true,
    },
  ]);

  return { toolConfig: answers };
}

/**
 * Resource-specific configuration prompts
 */
async function promptResourceConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'resourceTypes',
      message: 'What types of resources will this provide?',
      choices: [
        { name: 'Documentation and guides', value: 'documentation', checked: true },
        { name: 'Configuration data', value: 'configuration', checked: true },
        { name: 'Static files and assets', value: 'staticFiles', checked: false },
        { name: 'Dynamic data queries', value: 'dynamicData', checked: false },
        { name: 'API endpoints mapping', value: 'apiMapping', checked: false },
      ],
      validate: (choices: string[]) => choices.length > 0 || 'Select at least one resource type',
    },
    {
      type: 'list',
      name: 'dataFormat',
      message: 'Primary data format:',
      choices: [
        { name: 'JSON', value: 'json' },
        { name: 'Plain text', value: 'text' },
        { name: 'Markdown', value: 'markdown' },
        { name: 'Mixed formats', value: 'mixed' },
      ],
      default: 'json',
    },
    {
      type: 'confirm',
      name: 'supportCaching',
      message: 'Enable resource caching?',
      default: true,
    },
  ]);

  return { resourceConfig: answers };
}

/**
 * Prompt-specific configuration prompts
 */
async function promptPromptConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'promptFeatures',
      message: 'What features should your prompt template include?',
      choices: [
        { name: 'Dynamic parameters', value: 'dynamicParams', checked: true },
        { name: 'Multiple output formats', value: 'multipleFormats', checked: true },
        { name: 'Tone/style options', value: 'toneOptions', checked: true },
        { name: 'Context injection', value: 'contextInjection', checked: false },
        { name: 'Template variations', value: 'variations', checked: false },
        { name: 'Multi-step prompting', value: 'multiStep', checked: false },
      ],
    },
    {
      type: 'checkbox',
      name: 'outputFormats',
      message: 'Supported output formats:',
      choices: [
        { name: 'Detailed explanation', value: 'detailed', checked: true },
        { name: 'Summary/brief', value: 'summary', checked: true },
        { name: 'Bullet points', value: 'bulletPoints', checked: true },
        { name: 'Step-by-step guide', value: 'stepByStep', checked: false },
        { name: 'Code examples', value: 'codeExamples', checked: false },
      ],
      validate: (choices: string[]) => choices.length > 0 || 'Select at least one output format',
    },
    {
      type: 'checkbox',
      name: 'toneOptions',
      message: 'Available tone options:',
      choices: [
        { name: 'Professional', value: 'professional', checked: true },
        { name: 'Casual', value: 'casual', checked: true },
        { name: 'Academic', value: 'academic', checked: false },
        { name: 'Creative', value: 'creative', checked: false },
        { name: 'Technical', value: 'technical', checked: false },
      ],
    },
  ]);

  return { promptConfig: answers };
}

/**
 * Service-specific configuration prompts
 */
async function promptServiceConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'serviceFeatures',
      message: 'What features should your service include?',
      choices: [
        { name: 'Async operations', value: 'asyncOps', checked: true },
        { name: 'Error handling and retries', value: 'errorHandling', checked: true },
        { name: 'Configuration management', value: 'configManagement', checked: true },
        { name: 'Logging and monitoring', value: 'logging', checked: true },
        { name: 'Caching layer', value: 'caching', checked: false },
        { name: 'Event emission', value: 'events', checked: false },
        { name: 'Health checks', value: 'healthChecks', checked: false },
      ],
    },
    {
      type: 'input',
      name: 'maxRetries',
      message: 'Maximum retry attempts for failed operations:',
      default: '3',
      validate: (input: string) => {
        const num = parseInt(input, 10);
        return (num >= 0 && num <= 10) || 'Enter a number between 0 and 10';
      },
      filter: (input: string) => parseInt(input, 10),
    },
    {
      type: 'input',
      name: 'timeout',
      message: 'Default timeout (in milliseconds):',
      default: '5000',
      validate: (input: string) => {
        const num = parseInt(input, 10);
        return (num > 0 && num <= 300000) || 'Enter a number between 1 and 300000';
      },
      filter: (input: string) => parseInt(input, 10),
    },
  ]);

  return { serviceConfig: answers };
}

/**
 * Transport-specific configuration prompts
 */
async function promptTransportConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'transportType',
      message: 'What type of transport is this?',
      choices: [
        { name: 'HTTP/HTTPS', value: 'http' },
        { name: 'WebSocket', value: 'websocket' },
        { name: 'TCP Socket', value: 'tcp' },
        { name: 'Message Queue', value: 'messageQueue' },
        { name: 'File-based', value: 'file' },
        { name: 'Custom protocol', value: 'custom' },
      ],
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Transport features:',
      choices: [
        { name: 'Connection pooling', value: 'connectionPooling', checked: false },
        { name: 'Automatic reconnection', value: 'autoReconnect', checked: true },
        { name: 'Compression support', value: 'compression', checked: false },
        { name: 'Authentication', value: 'authentication', checked: false },
        { name: 'SSL/TLS encryption', value: 'encryption', checked: false },
        { name: 'Message queuing', value: 'messageQueuing', checked: false },
      ],
    },
    {
      type: 'input',
      name: 'defaultPort',
      message: 'Default port (if applicable):',
      default: '8080',
      when: (answers: any) => ['http', 'websocket', 'tcp'].includes(answers.transportType),
      validate: (input: string) => {
        if (!input) return true; // Optional
        const num = parseInt(input, 10);
        return (num > 0 && num <= 65535) || 'Enter a valid port number (1-65535)';
      },
      filter: (input: string) => input ? parseInt(input, 10) : undefined,
    },
  ]);

  return { transportConfig: answers };
}

/**
 * Utility-specific configuration prompts
 */
async function promptUtilConfig(componentName: string): Promise<any> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'utilityType',
      message: 'What type of utility is this?',
      choices: [
        { name: 'Data processing/transformation', value: 'dataProcessing' },
        { name: 'Validation and sanitization', value: 'validation' },
        { name: 'File operations', value: 'fileOps' },
        { name: 'String/text manipulation', value: 'textManipulation' },
        { name: 'Date/time utilities', value: 'dateTime' },
        { name: 'Math/calculation helpers', value: 'math' },
        { name: 'General purpose helper', value: 'general' },
      ],
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Utility features:',
      choices: [
        { name: 'Caching mechanism', value: 'caching', checked: true },
        { name: 'Error handling', value: 'errorHandling', checked: true },
        { name: 'Debug logging', value: 'debugLogging', checked: false },
        { name: 'Performance monitoring', value: 'performance', checked: false },
        { name: 'Input validation', value: 'validation', checked: true },
        { name: 'Async support', value: 'asyncSupport', checked: false },
      ],
    },
    {
      type: 'input',
      name: 'cacheSize',
      message: 'Cache size limit:',
      default: '100',
      when: (answers: any) => answers.features.includes('caching'),
      validate: (input: string) => {
        const num = parseInt(input, 10);
        return (num > 0 && num <= 10000) || 'Enter a number between 1 and 10000';
      },
      filter: (input: string) => parseInt(input, 10),
    },
  ]);

  return { utilConfig: answers };
}

/**
 * Confirm component configuration
 */
export async function confirmComponentConfig(config: AddComponentOptions): Promise<boolean> {
  console.log(chalk.yellow('\n📋 Component Configuration Summary:'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan(`Type:        ${config.componentType}`));
  console.log(chalk.cyan(`Name:        ${config.componentName}`));
  console.log(chalk.cyan(`Description: ${config.description}`));
  console.log(chalk.cyan(`Author:      ${config.author}`));
  console.log(chalk.gray('─'.repeat(50)));

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Create this component?',
      default: true,
    },
  ]);

  return confirmed;
}
