import { ProjectConfig } from '../prompts.js';

export function generatePackageJson(config: ProjectConfig): string {
  const basePackage: any = {
    name: config.name,
    version: '1.0.0',
    description: config.description,
    main: 'dist/server.js',
    type: 'module',
    scripts: {
      build: 'tsc',
      dev: 'tsx watch src/server.ts',
      'dev:stdio': 'tsx watch src/server.ts stdio',
      'dev:http': 'MCP_TRANSPORT=http tsx watch src/server.ts',
      start: 'node dist/server.js',
      'start:stdio': 'node dist/server.js',
      'start:http': 'MCP_TRANSPORT=http node dist/server.js',
      lint: 'eslint src --ext .ts',
      'lint:fix': 'eslint src --ext .ts --fix',
      test: 'jest',
      clean: 'rimraf dist',
      prepare: 'npm run build',
    },
    keywords: ['mcp', 'model-context-protocol', 'server'],
    author: config.author,
    license: 'MIT',
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
      dotenv: '^16.3.1',
      zod: '^3.22.4',
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      '@typescript-eslint/eslint-plugin': '^6.13.0',
      '@typescript-eslint/parser': '^6.13.0',
      eslint: '^8.54.0',
      jest: '^29.7.0',
      '@types/jest': '^29.5.8',
      rimraf: '^5.0.5',
      tsx: '^4.6.0',
      typescript: '^5.3.0',
    },
  };

  // Add HTTP-specific dependencies if needed
  if (config.transportTypes === 'http' || config.transportTypes === 'both') {
    Object.assign(basePackage.dependencies, {
      cors: '^2.8.5',
      express: '^4.18.2',
    });
    Object.assign(basePackage.devDependencies, {
      '@types/cors': '^2.8.17',
      '@types/express': '^4.17.21',
    });
  }

  return JSON.stringify(basePackage, null, 2);
}