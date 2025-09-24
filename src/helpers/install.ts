import { execSync } from 'child_process';
import { PackageManager } from './get-pkg-manager';

export function install(
  root: string,
  dependencies: string[] | null,
  { packageManager, isOnline }: { packageManager: PackageManager; isOnline: boolean }
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command: string;
    let args: string[];

    if (dependencies && dependencies.length) {
      switch (packageManager) {
        case 'yarn':
          command = 'yarn';
          args = ['add', '--exact', ...dependencies];
          break;
        case 'pnpm':
          command = 'pnpm';
          args = ['add', '--save-exact', ...dependencies];
          break;
        case 'bun':
          command = 'bun';
          args = ['add', '--exact', ...dependencies];
          break;
        default:
          command = 'npm';
          args = ['install', '--save-exact', ...dependencies];
          break;
      }
    } else {
      switch (packageManager) {
        case 'yarn':
          command = 'yarn';
          args = ['install'];
          break;
        case 'pnpm':
          command = 'pnpm';
          args = ['install'];
          break;
        case 'bun':
          command = 'bun';
          args = ['install'];
          break;
        default:
          command = 'npm';
          args = ['install'];
          break;
      }
    }

    try {
      execSync(`${command} ${args.join(' ')}`, {
        cwd: root,
        stdio: 'inherit',
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}