/**
 * Add Component Functionality
 * Main logic for adding new components to existing MCP server projects
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { AddComponentOptions, ProjectContext, ComponentTemplate, ComponentType } from '../types/index.js';
import { 
  detectMcpProject,
  checkComponentExists,
  generateComponentFileName,
  getComponentDirectory 
} from '../utils/project-detector.js';
import { generateComponentTemplate } from '../utils/component-templates.js';
import { 
  updateComponentIndex,
  applyRegistryUpdates,
  backupRegistryFiles,
  restoreRegistryFiles 
} from '../utils/registry-updater.js';

/**
 * Add a new component to an existing MCP server project
 */
export async function addComponent(
  config: AddComponentOptions,
  targetPath: string = process.cwd()
): Promise<void> {
  const spinner = ora();
  let backupPaths: string[] = [];
  let projectContext: ProjectContext | undefined;

  try {
    spinner.start('🔍 Detecting MCP server project...');
    projectContext = await detectMcpProject(targetPath);
    
    if (!projectContext.isValidProject) {
      spinner.fail('❌ Not a valid MCP server project');
      console.log(chalk.red('\nThis command must be run in an existing MCP server project directory.'));
      console.log(chalk.gray('Create a new MCP server project first using:'));
      console.log(chalk.cyan('  npx mcp-server-generator my-project'));
      return;
    }
    
    spinner.succeed(`✅ Found MCP project: ${chalk.cyan(projectContext.projectName)}`);

    spinner.start(`🔍 Checking if ${config.componentType} '${config.componentName}' already exists...`);
    const existsCheck = await checkComponentExists(
      projectContext,
      config.componentType,
      config.componentName
    );

    if (existsCheck.exists) {
      spinner.fail(`❌ ${config.componentType} '${config.componentName}' already exists`);
      console.log(chalk.red(`\nA ${config.componentType} with this name already exists at:`));
      console.log(chalk.gray(`  ${existsCheck.existingFile}`));
      console.log(chalk.yellow('\nChoose a different name or remove the existing component first.'));
      return;
    }
    
    spinner.succeed(`✅ Component name '${config.componentName}' is available`);

    spinner.start(`📝 Generating ${config.componentType} template...`);
    const template = generateComponentTemplate(
      config.componentType,
      config.componentName,
      {
        description: config.description,
        author: config.author,
        projectName: projectContext.projectName,
      }
    );
    spinner.succeed(`✅ Generated ${config.componentType} template`);

    spinner.start('💾 Creating backup of registry files...');
    backupPaths = await backupRegistryFiles(projectContext);
    spinner.succeed(`✅ Created backup (${backupPaths.length} files)`);

    const componentDir = path.join(
      projectContext.srcPath,
      getComponentDirectory(config.componentType)
    );
    await fs.ensureDir(componentDir);

    spinner.start(`📝 Creating ${config.componentType} file...`);
    const fileName = generateComponentFileName(config.componentName, config.componentType);
    const filePath = path.join(componentDir, fileName);
    
    await fs.writeFile(filePath, template.templateContent, 'utf-8');
    spinner.succeed(`✅ Created ${chalk.cyan(fileName)}`);

    spinner.start('📚 Updating component index...');
    await updateComponentIndex(
      projectContext,
      config.componentType,
      template.indexUpdateContent
    );
    spinner.succeed('✅ Updated component index');

    if (template.registryUpdates.length > 0) {
      spinner.start('🔧 Updating component registries...');
      await applyRegistryUpdates(projectContext, template.registryUpdates);
      spinner.succeed(`✅ Updated ${template.registryUpdates.length} registr${template.registryUpdates.length === 1 ? 'y' : 'ies'}`);
    }

    console.log(chalk.green.bold('\n🎉 Component added successfully!'));
    console.log(chalk.cyan(`\n📁 Created: ${path.relative(targetPath, filePath)}`));
    
    showNextSteps(config, projectContext, filePath);

  } catch (error) {
    spinner.fail('❌ Failed to add component');
    
    if (backupPaths.length > 0 && projectContext) {
      try {
        console.log(chalk.yellow('\n🔄 Restoring from backup...'));
        await restoreRegistryFiles(projectContext, backupPaths);
        console.log(chalk.green('✅ Registry files restored'));
      } catch (restoreError) {
        console.error(chalk.red('❌ Failed to restore backup:'), restoreError);
      }
    }

    if (config.verbose && error instanceof Error) {
      console.error(chalk.red('\n🐛 Error details:'));
      console.error(chalk.gray(error.stack || error.message));
    } else {
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    throw error;
  }
}

/**
 * Show next steps after successful component creation
 */
function showNextSteps(
  config: AddComponentOptions,
  projectContext: ProjectContext,
  filePath: string
): void {
  console.log(chalk.yellow('\n🚀 Next steps:'));
  console.log(chalk.gray('─'.repeat(50)));

  console.log(chalk.cyan('1. Customize your component:'));
  console.log(chalk.gray(`   Open: ${path.relative(projectContext.projectPath, filePath)}`));
  console.log(chalk.gray('   Look for TODO comments to implement your custom logic'));

  console.log(chalk.cyan('\n2. Test your component:'));
  switch (config.componentType) {
    case 'tool':
      console.log(chalk.gray('   npm run test:tools'));
      console.log(chalk.gray('   npm run inspector:cli'));
      break;
    case 'resource':
      console.log(chalk.gray('   npm run test:resources'));
      console.log(chalk.gray('   npm run inspector:cli'));
      break;
    case 'prompt':
      console.log(chalk.gray('   npm run test:prompts'));
      console.log(chalk.gray('   npm run inspector:cli'));
      break;
    default:
      console.log(chalk.gray('   npm run build'));
      console.log(chalk.gray('   npm test'));
  }

  console.log(chalk.cyan('\n3. Start your MCP server:'));
  console.log(chalk.gray('   npm run dev:stdio    # For CLI tools'));
  console.log(chalk.gray('   npm run dev:http     # For web integration'));

  console.log(chalk.cyan('\n💡 Tips:'));
  switch (config.componentType) {
    case 'tool':
      console.log(chalk.gray('   • Define input schemas using Zod for validation'));
      console.log(chalk.gray('   • Handle errors gracefully and return meaningful messages'));
      console.log(chalk.gray('   • Test with MCP Inspector to verify tool behavior'));
      break;
    case 'resource':
      console.log(chalk.gray('   • Provide both human-readable and machine-readable formats'));
      console.log(chalk.gray('   • Consider caching for expensive resource operations'));
      console.log(chalk.gray('   • Use clear URI patterns for resource identification'));
      break;
    case 'prompt':
      console.log(chalk.gray('   • Make prompts flexible with optional parameters'));
      console.log(chalk.gray('   • Provide good defaults for tone and format options'));
      console.log(chalk.gray('   • Test with different argument combinations'));
      break;
    case 'service':
      console.log(chalk.gray('   • Implement proper error handling and retries'));
      console.log(chalk.gray('   • Add logging for debugging and monitoring'));
      console.log(chalk.gray('   • Consider making services configurable'));
      break;
    case 'transport':
      console.log(chalk.gray('   • Implement connection pooling for performance'));
      console.log(chalk.gray('   • Handle reconnection scenarios gracefully'));
      console.log(chalk.gray('   • Add proper cleanup in the close() method'));
      break;
    case 'util':
      console.log(chalk.gray('   • Export both class and helper function variants'));
      console.log(chalk.gray('   • Implement caching for expensive operations'));
      console.log(chalk.gray('   • Make utilities as generic and reusable as possible'));
      break;
  }

  console.log(chalk.gray('\n📚 Documentation:'));
  console.log(chalk.gray('   • Check the generated README.md for usage examples'));
  console.log(chalk.gray('   • Visit https://modelcontextprotocol.io for MCP documentation'));
  console.log(chalk.gray('   • Use MCP Inspector for testing and debugging'));
}

/**
 * List existing components in the project
 */
export async function listExistingComponents(
  targetPath: string = process.cwd()
): Promise<void> {
  const projectContext = await detectMcpProject(targetPath);
  
  if (!projectContext.isValidProject) {
    console.log(chalk.red('❌ Not a valid MCP server project'));
    return;
  }

  console.log(chalk.blue(`\n📋 Components in ${chalk.cyan(projectContext.projectName)}:`));
  console.log(chalk.gray('─'.repeat(60)));

  const componentTypes: { type: ComponentType; emoji: string; dir: string }[] = [
    { type: 'tool', emoji: '🛠️', dir: 'tools' },
    { type: 'resource', emoji: '📋', dir: 'resources' },
    { type: 'prompt', emoji: '💡', dir: 'prompts' },
    { type: 'service', emoji: '⚙️', dir: 'services' },
    { type: 'transport', emoji: '🌐', dir: 'transports' },
    { type: 'util', emoji: '🔧', dir: 'utils' },
  ];

  for (const { type, emoji, dir } of componentTypes) {
    const componentDir = path.join(projectContext.srcPath, dir);
    
    if (await fs.pathExists(componentDir)) {
      const files = await fs.readdir(componentDir);
      const componentFiles = files.filter(
        file => file.endsWith('.ts') && file !== 'index.ts'
      );

      if (componentFiles.length > 0) {
        console.log(chalk.cyan(`\n${emoji} ${type}s:`));
        for (const file of componentFiles) {
          const componentName = file.replace(/\.(ts|js)$/, '');
          console.log(chalk.gray(`   • ${componentName}`));
        }
      } else {
        console.log(chalk.cyan(`\n${emoji} ${type}s:`));
        console.log(chalk.gray('   • No custom components found'));
      }
    }
  }

  console.log(chalk.yellow('\n💡 To add a new component:'));
  console.log(chalk.gray('   mcp-server-generator add <type> <name>'));
}
