#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { validateProjectName } from './utils/validator.js';
import { runPrompts } from './prompts.js';
import { generateProject } from './generator.js';
import { checkForUpdates, detectPackageManager } from './utils/package-manager.js';

const program = new Command();

interface CreateMcpOptions {
  name: string;
  description?: string;
  author?: string;
  transportTypes?: 'stdio' | 'http' | 'both';
  includeExamples?: boolean;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  skipInstall?: boolean;
  verbose?: boolean;
}

async function printWelcome(): Promise<void> {
  console.log(
    chalk.cyan(
      figlet.textSync('create-mcp', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    )
  );
  console.log(chalk.gray('Generate Model Context Protocol (MCP) server projects\n'));
}

export async function run(): Promise<void> {
  program
    .name('create-mcp')
    .description('Generate a new Model Context Protocol (MCP) server project')
    .version('1.0.0', '-v, --version', 'display version number')
    .argument('<project-name>', 'name of the MCP server project')
    .option('-d, --description <desc>', 'project description')
    .option('-a, --author <author>', 'project author')
    .option('-t, --transport <type>', 'transport type (stdio|http|both)', 'both')
    .option('--no-examples', 'skip example implementations')
    .option('--package-manager <pm>', 'package manager to use (npm|yarn|pnpm|bun)')
    .option('--skip-install', 'skip dependency installation')
    .option('--verbose', 'enable verbose logging')
    .action(async (projectName: string, options: Partial<CreateMcpOptions>) => {
      try {
        // Print welcome message
        await printWelcome();

        // Set verbose logging if requested
        if (options.verbose) {
          process.env.VERBOSE = 'true';
        }

        console.log(chalk.blue.bold('🚀 Creating MCP Server Project\n'));

        // Check for CLI updates (non-blocking)
        await checkForUpdates();

        // Validate project name
        const validationResult = validateProjectName(projectName);
        if (!validationResult.isValid) {
          console.error(chalk.red(`❌ Error: ${validationResult.error}`));
          process.exit(1);
        }

        // Detect package manager if not specified
        if (!options.packageManager) {
          options.packageManager = await detectPackageManager();
          console.log(chalk.gray(`📦 Detected package manager: ${options.packageManager}`));
        }

        // Run interactive prompts for missing options
        const projectConfig = await runPrompts(projectName, options);

        // Generate the project
        console.log(chalk.blue('🏗️  Generating project...\n'));
        await generateProject(projectConfig);

        // Success message
        console.log(chalk.green.bold('\n✅ Project created successfully!'));
        console.log(chalk.cyan(`\n📁 Project created at: ./${projectName}`));
        
        // Next steps
        console.log(chalk.yellow('\n🚀 Next steps:'));
        console.log(chalk.gray(`  cd ${projectName}`));
        
        if (projectConfig.skipInstall) {
          console.log(chalk.gray(`  ${projectConfig.packageManager} install`));
        }
        
        console.log(chalk.gray(`  ${projectConfig.packageManager} run dev`));
        console.log('');
        
        // Transport-specific instructions
        if (projectConfig.transportTypes === 'both' || projectConfig.transportTypes === 'stdio') {
          console.log(chalk.blue('📡 Stdio Transport:'));
          console.log(chalk.gray(`  ${projectConfig.packageManager} run dev:stdio`));
        }
        
        if (projectConfig.transportTypes === 'both' || projectConfig.transportTypes === 'http') {
          console.log(chalk.blue('🌐 HTTP Transport:'));
          console.log(chalk.gray(`  ${projectConfig.packageManager} run dev:http`));
          console.log(chalk.gray('  Server will be available at http://localhost:3000'));
        }
        
        console.log('');
        console.log(chalk.cyan('📚 Documentation:'));
        console.log(chalk.gray(`  Open ${projectName}/README.md for detailed instructions`));
        console.log('');
        console.log(chalk.magenta('💡 Tips:'));
        console.log(chalk.gray('  • Use the example tools and resources as starting points'));
        console.log(chalk.gray('  • Check the logs for debugging information'));
        console.log(chalk.gray('  • Visit https://modelcontextprotocol.io for more information'));

      } catch (error) {
        console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        
        if (options.verbose && error instanceof Error) {
          console.error(chalk.red('\nStack trace:'));
          console.error(chalk.gray(error.stack || 'No stack trace available'));
        }
        
        process.exit(1);
      }
    });

  // Add help examples
  program.addHelpText('after', `
Examples:
  $ npx create-mcp my-mcp-server
  $ npx create-mcp my-server --description "My awesome MCP server"
  $ npx create-mcp my-server --transport stdio --no-examples
  $ npx create-mcp my-server --package-manager yarn --skip-install

Transport Types:
  stdio  - Standard input/output (for CLI tools and direct integrations)
  http   - HTTP server (for web services and remote integrations)  
  both   - Include both transport examples (recommended)

For more information, visit: https://modelcontextprotocol.io
`);

  // Handle unknown commands
  program.on('command:*', function (operands) {
    console.error(chalk.red(`❌ Unknown command: ${operands[0]}`));
    console.log(chalk.gray('Run "create-mcp --help" for available commands.'));
    process.exit(1);
  });

  // Enhanced error handling
  process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught exception:'), error.message);
    if (process.env.VERBOSE) {
      console.error(chalk.gray(error.stack || 'No stack trace available'));
    }
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error(chalk.red('❌ Unhandled rejection:'), reason);
    process.exit(1);
  });

  // Parse command line arguments
  await program.parseAsync();
}

export { CreateMcpOptions };