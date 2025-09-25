/**
 * Registry Update Utilities
 * Handles automatic updates to registry files when adding new components
 */

import fs from 'fs-extra';
import path from 'path';
import { ProjectContext, ComponentType, RegistryUpdate } from '../types/index.js';
import { getComponentDirectory } from './project-detector.js';

/**
 * Update the index.ts file in a component directory (only for components that have index files)
 */
export async function updateComponentIndex(
  projectContext: ProjectContext,
  componentType: ComponentType,
  indexUpdateContent: string
): Promise<void> {
  const componentsWithIndex = ['tool', 'resource', 'prompt'];
  
  if (!componentsWithIndex.includes(componentType)) {
    console.log(`Skipping index update for ${componentType} (no index file needed)`);
    return;
  }

  const componentDir = getComponentDirectory(componentType);
  const indexPath = path.join(projectContext.srcPath, componentDir, 'index.ts');

  if (!await fs.pathExists(indexPath)) {
    throw new Error(`Index file not found: ${indexPath}`);
  }

  const currentContent = await fs.readFile(indexPath, 'utf-8');

  const exportName = indexUpdateContent.match(/export\s*{\s*([^}]+)\s*}/)?.[1]?.trim();
  if (exportName && currentContent.includes(exportName)) {
    console.warn(`Export for ${exportName} already exists in ${indexPath}`);
    return;
  }

  const updatedContent = currentContent.trim() + '\n' + indexUpdateContent + '\n';

  await fs.writeFile(indexPath, updatedContent, 'utf-8');
  console.log(`Updated index file: ${indexPath}`);
}

/**
 * Update tool registry to include new tool
 */
export async function updateToolRegistry(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'tools', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Tool registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    } else {
      const firstLineAfterImports = content.search(/\n\nexport|class|interface/);
      if (firstLineAfterImports !== -1) {
        content = content.slice(0, firstLineAfterImports) + '\n' + registryUpdate.addImport + content.slice(firstLineAfterImports);
      }
    }
  }

  const initMethodRegex = /private\s+initializeTools\(\):\s*void\s*{([^}]*?)}/;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    const lastToolRegistration = initMethodContent.lastIndexOf('this.tools.set(');
    
    if (lastToolRegistration !== -1) {
      const lineEnd = initMethodContent.indexOf('\n', lastToolRegistration);
      const insertPosition = lineEnd !== -1 ? lineEnd : initMethodContent.length;
      
      const newInitMethodContent = 
        initMethodContent.slice(0, insertPosition) + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization +
        initMethodContent.slice(insertPosition);
      
      content = content.replace(initMethodRegex, `private initializeTools(): void {${newInitMethodContent}}`);
    } else {
      const newInitMethodContent = 
        initMethodContent.trimEnd() + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization + '\n    ';
      
      content = content.replace(initMethodRegex, `private initializeTools(): void {${newInitMethodContent}}`);
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated tool registry: ${registryPath}`);
}

/**
 * Update resource registry to include new resource
 */
export async function updateResourceRegistry(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'resources', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Resource registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    }
  }

  const initMethodRegex = /private\s+initializeResources\(\):\s*void\s*{([^}]*?)}/;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    const lastResourceRegistration = initMethodContent.lastIndexOf('this.resources.set(');
    
    if (lastResourceRegistration !== -1) {
      const lineEnd = initMethodContent.indexOf('\n', lastResourceRegistration);
      const insertPosition = lineEnd !== -1 ? lineEnd : initMethodContent.length;
      
      const newInitMethodContent = 
        initMethodContent.slice(0, insertPosition) + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization +
        initMethodContent.slice(insertPosition);
      
      content = content.replace(initMethodRegex, `private initializeResources(): void {${newInitMethodContent}}`);
    } else {
      const newInitMethodContent = 
        initMethodContent.trimEnd() + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization + '\n    ';
      
      content = content.replace(initMethodRegex, `private initializeResources(): void {${newInitMethodContent}}`);
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated resource registry: ${registryPath}`);
}

/**
 * Update prompt registry to include new prompt
 */
export async function updatePromptRegistry(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'prompts', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Prompt registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    }
  }

  const initMethodRegex = /private\s+initializePrompts\(\):\s*void\s*{([^}]*?)}/;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    const lastPromptRegistration = initMethodContent.lastIndexOf('this.prompts.set(');
    
    if (lastPromptRegistration !== -1) {
      const lineEnd = initMethodContent.indexOf('\n', lastPromptRegistration);
      const insertPosition = lineEnd !== -1 ? lineEnd : initMethodContent.length;
      
      const newInitMethodContent = 
        initMethodContent.slice(0, insertPosition) + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization +
        initMethodContent.slice(insertPosition);
      
      content = content.replace(initMethodRegex, `private initializePrompts(): void {${newInitMethodContent}}`);
    } else {
      const newInitMethodContent = 
        initMethodContent.trimEnd() + 
        '\n    ' + registryUpdate.addRegistration +
        '\n    ' + registryUpdate.addInitialization + '\n    ';
      
      content = content.replace(initMethodRegex, `private initializePrompts(): void {${newInitMethodContent}}`);
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated prompt registry: ${registryPath}`);
}

/**
 * Apply all registry updates for a component
 */
export async function applyRegistryUpdates(
  projectContext: ProjectContext,
  registryUpdates: RegistryUpdate[]
): Promise<void> {
  for (const update of registryUpdates) {
    try {
      switch (update.registryType) {
        case 'tool':
          await updateToolRegistryWithAutoDiscovery(projectContext, update);
          break;
        case 'resource':
          await updateResourceRegistryWithAutoDiscovery(projectContext, update);
          break;
        case 'prompt':
          await updatePromptRegistryWithAutoDiscovery(projectContext, update);
          break;
        default:
          console.warn(`Unknown registry type: ${update.registryType}`);
      }
    } catch (error) {
      console.error(`Failed to update ${update.registryType} registry:`, error);
      throw error;
    }
  }
}

/**
 * Update tool registry with auto-discovery pattern
 */
async function updateToolRegistryWithAutoDiscovery(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'tools', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Tool registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    }
  }

  const initMethodRegex = /private\s+initializeTools\(\):\s*void\s*{([^}]*?)}/s;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    
    if (!initMethodContent.includes(registryUpdate.addRegistration)) {
      const lastRegistration = initMethodContent.lastIndexOf('this.tools.set(');
      
      if (lastRegistration !== -1) {
        const lineEnd = initMethodContent.indexOf(';', lastRegistration) + 1;
        const insertPosition = lineEnd;
        
        const newInitMethodContent = 
          initMethodContent.slice(0, insertPosition) + 
          '\n    ' + registryUpdate.addRegistration +
          initMethodContent.slice(insertPosition);
        
        content = content.replace(initMethodRegex, `private initializeTools(): void {${newInitMethodContent}}`);
      } else {
        const newInitMethodContent = 
          initMethodContent.trimEnd() + 
          '\n    ' + registryUpdate.addRegistration + '\n    ';
        
        content = content.replace(initMethodRegex, `private initializeTools(): void {${newInitMethodContent}}`);
      }
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated tool registry: ${registryPath}`);
}

/**
 * Update resource registry with auto-discovery pattern
 */
async function updateResourceRegistryWithAutoDiscovery(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'resources', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Resource registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    }
  }

  const initMethodRegex = /private\s+initializeResources\(\):\s*void\s*{([^}]*?)}/s;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    
    if (!initMethodContent.includes(registryUpdate.addRegistration)) {
      const lastRegistration = initMethodContent.lastIndexOf('this.resources.set(');
      
      if (lastRegistration !== -1) {
        const lineEnd = initMethodContent.indexOf(';', lastRegistration) + 1;
        const insertPosition = lineEnd;
        
        const newInitMethodContent = 
          initMethodContent.slice(0, insertPosition) + 
          '\n    ' + registryUpdate.addRegistration +
          initMethodContent.slice(insertPosition);
        
        content = content.replace(initMethodRegex, `private initializeResources(): void {${newInitMethodContent}}`);
      } else {
        const newInitMethodContent = 
          initMethodContent.trimEnd() + 
          '\n    ' + registryUpdate.addRegistration + '\n    ';
        
        content = content.replace(initMethodRegex, `private initializeResources(): void {${newInitMethodContent}}`);
      }
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated resource registry: ${registryPath}`);
}

/**
 * Update prompt registry with auto-discovery pattern
 */
async function updatePromptRegistryWithAutoDiscovery(
  projectContext: ProjectContext,
  registryUpdate: RegistryUpdate
): Promise<void> {
  const registryPath = path.join(projectContext.srcPath, 'prompts', 'index.ts');

  if (!await fs.pathExists(registryPath)) {
    throw new Error(`Prompt registry not found: ${registryPath}`);
  }

  let content = await fs.readFile(registryPath, 'utf-8');

  if (!content.includes(registryUpdate.addImport)) {
    const importRegex = /import.*from.*['""];/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertPosition = lastImportIndex + lastImport.length;
      
      content = content.slice(0, insertPosition) + '\n' + registryUpdate.addImport + content.slice(insertPosition);
    }
  }

  const initMethodRegex = /private\s+initializePrompts\(\):\s*void\s*{([^}]*?)}/s;
  const initMatch = content.match(initMethodRegex);

  if (initMatch) {
    const initMethodContent = initMatch[1];
    
    if (!initMethodContent.includes(registryUpdate.addRegistration)) {
      const lastRegistration = initMethodContent.lastIndexOf('this.prompts.set(');
      
      if (lastRegistration !== -1) {
        const lineEnd = initMethodContent.indexOf(';', lastRegistration) + 1;
        const insertPosition = lineEnd;
        
        const newInitMethodContent = 
          initMethodContent.slice(0, insertPosition) + 
          '\n    ' + registryUpdate.addRegistration +
          initMethodContent.slice(insertPosition);
        
        content = content.replace(initMethodRegex, `private initializePrompts(): void {${newInitMethodContent}}`);
      } else {
        const newInitMethodContent = 
          initMethodContent.trimEnd() + 
          '\n    ' + registryUpdate.addRegistration + '\n    ';
        
        content = content.replace(initMethodRegex, `private initializePrompts(): void {${newInitMethodContent}}`);
      }
    }
  }

  await fs.writeFile(registryPath, content, 'utf-8');
  console.log(`Updated prompt registry: ${registryPath}`);
}

/**
 * Create a backup of registry files before modification
 */
export async function backupRegistryFiles(projectContext: ProjectContext): Promise<string[]> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(projectContext.projectPath, '.mcp-backups', timestamp);
  
  await fs.ensureDir(backupDir);
  
  const registryFiles = [
    path.join(projectContext.srcPath, 'tools', 'index.ts'),
    path.join(projectContext.srcPath, 'resources', 'index.ts'),
    path.join(projectContext.srcPath, 'prompts', 'index.ts'),
  ];

  const backupPaths: string[] = [];

  for (const filePath of registryFiles) {
    if (await fs.pathExists(filePath)) {
      const relativePath = path.relative(projectContext.srcPath, filePath);
      const backupPath = path.join(backupDir, relativePath);
      
      await fs.ensureDir(path.dirname(backupPath));
      await fs.copy(filePath, backupPath);
      backupPaths.push(backupPath);
    }
  }

  console.log(`Created backup at: ${backupDir}`);
  return backupPaths;
}

/**
 * Restore registry files from backup
 */
export async function restoreRegistryFiles(
  projectContext: ProjectContext,
  backupPaths: string[]
): Promise<void> {
  for (const backupPath of backupPaths) {
    const relativePath = path.relative(
      path.join(projectContext.projectPath, '.mcp-backups'),
      backupPath
    ).split(path.sep).slice(1).join(path.sep); // Remove timestamp directory
    
    const originalPath = path.join(projectContext.srcPath, relativePath);
    
    await fs.copy(backupPath, originalPath);
    console.log(`Restored: ${originalPath}`);
  }
}
