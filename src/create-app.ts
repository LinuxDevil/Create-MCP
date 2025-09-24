import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { generateTemplateFiles } from './templates';
import { getPkgManager } from './helpers/get-pkg-manager';
import { install } from './helpers/install';
import { getOnline } from './helpers/is-online';
import { validateNpmName } from './helpers/validate-pkg';

export interface CreateAppOptions {
  transport?: 'stdio' | 'http' | 'both';
  directory?: string;
  skipInstall?: boolean;
}

export async function createApp(projectName: string, options: CreateAppOptions): Promise<void> {
  // Validate project name
  const validation = validateNpmName(projectName);
  if (!validation.valid) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.red(
          `"${projectName}"`
        )} because of npm naming restrictions:\n`
      )
    );
    validation.problems!.forEach((p) => {
      console.error(`    ${chalk.red.bold('*')} ${p}`);
    });
    return;
  }

  const projectDir = path.resolve(options.directory || projectName);
  console.log(`Creating a new MCP server in ${chalk.green(projectDir)}.`);
  console.log();

  const spinner = ora({
    text: 'Creating project files...',
    spinner: 'dots',
  }).start();

  // Create project files
  await createProjectFiles(projectDir, projectName, options);

  spinner.succeed('Created project files');

  if (!options.skipInstall) {
    const packageManager = getPkgManager();
    const isOnline = getOnline();

    console.log('Installing dependencies...');
    console.log();

    await install(projectDir, null, {
      packageManager,
      isOnline,
    });

    console.log();
  }

  console.log(`${chalk.green('Success!')} Created ${projectName} at ${projectDir}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  npm run dev`));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan(`  npm run build`));
  console.log('    Builds the app for production.');
  console.log();
  console.log(chalk.cyan(`  npm start`));
  console.log('    Runs the built app in production mode.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), projectName);
  console.log(`  ${chalk.cyan('npm run dev')}`);
}

async function createProjectFiles(projectDir: string, projectName: string, options: CreateAppOptions): Promise<void> {
  // Ensure project directory exists
  await fs.ensureDir(projectDir);

  // Get transport type, default to 'both'
  const transport = options.transport || 'both';

  // Generate template files
  const templateFiles = generateTemplateFiles({
    name: projectName,
    description: `MCP server for ${projectName}`,
    author: '',
    transportTypes: transport as 'stdio' | 'http' | 'both',
    includeExamples: true,
    packageManager: 'npm',
    skipInstall: false,
    verbose: false
  });

  // Write all files
  for (const [filePath, content] of Object.entries(templateFiles)) {
    const fullPath = path.join(projectDir, filePath);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, content as string, 'utf-8');
  }
}