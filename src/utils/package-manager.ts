import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import semver from 'semver';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export async function detectPackageManager(): Promise<PackageManager> {
  const cwd = process.cwd();
  
  if (await fs.pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  
  if (await fs.pathExists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  
  return 'npm';
}

function getPackageManagerCommand(packageManager: string): string {
  if (process.platform === 'win32') {
    return `${packageManager}.cmd`;
  }
  return packageManager;
}

export async function isPackageManagerAvailable(pm: PackageManager): Promise<boolean> {
  return new Promise((resolve) => {
    const command = getPackageManagerCommand(pm);
    const child = spawn(command, ['--version'], { stdio: 'ignore', shell: true });
    child.on('close', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

export async function installDependencies(
  projectPath: string,
  packageManager: PackageManager
): Promise<void> {
  const spinner = ora(`Installing dependencies with ${packageManager}...`).start();
  
  try {
    await executeCommand(packageManager, ['install'], { cwd: projectPath });
    spinner.succeed(chalk.green('Dependencies installed successfully'));
  } catch (error) {
    spinner.fail(chalk.red('Failed to install dependencies'));
    throw error;
  }
}

export async function checkForUpdates(): Promise<void> {
  try {
    const packageJson = await fs.readJson(path.join(__dirname, '../../package.json'));
    const currentVersion = packageJson.version;
    
    const latestVersion = await getLatestVersion('create-mcp');
    
    if (latestVersion && latestVersion !== currentVersion) {
      console.log(chalk.yellow(`\n📦 New version available: ${latestVersion} (current: ${currentVersion})`));
      console.log(chalk.gray('Run: npm install -g create-mcp@latest\n'));
    }
  } catch {
    // Silently fail - don't block CLI execution
  }
}

async function executeCommand(
  command: string,
  args: string[],
  options: { cwd: string }
): Promise<void> {
  return new Promise((resolve, reject) => {
    const actualCommand = getPackageManagerCommand(command);
    const child = spawn(actualCommand, args, {
      stdio: 'pipe',
      shell: true, // Use shell to handle .cmd files on Windows
      ...options
    });
    
    let errorOutput = '';
    
    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${errorOutput}`));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to spawn command: ${error.message}`));
    });
  });
}

async function getLatestVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    const command = getPackageManagerCommand('npm');
    const child = spawn(command, ['view', packageName, 'version'], { 
      stdio: 'pipe',
      shell: true 
    });
    let output = '';
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', () => {
      resolve(output.trim() || null);
    });
    
    child.on('error', () => resolve(null));
  });
}