import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function copyDirectory(srcDir: string, destDir: string): Promise<void> {
  try {
    await fs.copy(srcDir, destDir, {
      overwrite: true,
      errorOnExist: false
    });
  } catch (error) {
    throw new Error(`Failed to copy directory from ${srcDir} to ${destDir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getTemplatesDirectory(): string {
  return path.join(__dirname, '..', '..', 'templates');
}

export async function validateTemplatesDirectory(): Promise<void> {
  const templatesDir = getTemplatesDirectory();
  
  if (!(await fs.pathExists(templatesDir))) {
    throw new Error(`Templates directory not found: ${templatesDir}`);
  }
  
  const baseDir = path.join(templatesDir, 'base');
  const srcDir = path.join(templatesDir, 'src');
  
  if (!(await fs.pathExists(baseDir))) {
    throw new Error(`Base templates directory not found: ${baseDir}`);
  }
  
  if (!(await fs.pathExists(srcDir))) {
    throw new Error(`Source templates directory not found: ${srcDir}`);
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isFile()) {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
      } else if (item.isDirectory() && item.name !== 'node_modules' && item.name !== '.git') {
        totalSize += await getDirectorySize(itemPath);
      }
    }
  } catch (error) {
    // Ignore errors for individual files/directories
  }
  
  return totalSize;
}