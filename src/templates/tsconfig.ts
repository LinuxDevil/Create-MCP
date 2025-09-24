export function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Node',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      removeComments: false,
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.test.ts'],
  }, null, 2);
}