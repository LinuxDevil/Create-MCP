import { generatePackageJson } from './package-json';
import { generateServerTs } from './server-ts';
import { generateTsConfig } from './tsconfig';
import { generateReadme } from './readme';
import { generateEnvLocal } from './env-local';
import { generateServiceExample } from './service-example';
import { generateUtilsIndex } from './utils-index';
import { generateLogger } from './logger';
import { generateHealthChecker } from './health-checker';
import { ProjectConfig } from '../prompts.js';

export function generateTemplateFiles(config: ProjectConfig): Record<string, string> {
  const files: Record<string, string> = {
    'package.json': generatePackageJson(config),
    'tsconfig.json': generateTsConfig(),
    'src/server.ts': generateServerTs(config),
    '.env.local': generateEnvLocal(),
    'README.md': generateReadme(config),
    '.gitignore': generateGitignore(),
    'src/utils/logger.ts': generateLogger(),
    'src/utils/health.ts': generateHealthChecker(),
    'src/utils/index.ts': generateUtilsIndex(),
  };

  // Add service files if examples are included
  if (config.includeExamples) {
    files['src/services/example.ts'] = generateServiceExample(config);
  }

  return {
    ...files
  };
}

function generateGitignore(): string {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
lib/
build/

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# TypeScript cache
*.tsbuildinfo
`;
}