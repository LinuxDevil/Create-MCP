import { execSync } from 'child_process';

export function getOnline(): boolean {
  try {
    execSync('ping -c 1 registry.npmjs.org', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}