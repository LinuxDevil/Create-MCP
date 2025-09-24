export type Example = {
  name: string;
  display_name: string;
  description: string;
};

export const examples: Example[] = [
  {
    name: 'basic',
    display_name: 'Basic MCP Server',
    description: 'A basic MCP server with example tools and resources',
  },
  {
    name: 'database',
    display_name: 'Database MCP Server',
    description: 'MCP server with database integration examples',
  },
  {
    name: 'api-client',
    display_name: 'API Client MCP Server', 
    description: 'MCP server that acts as an API client wrapper',
  },
];

export function getExample(name: string): Example | undefined {
  return examples.find((example) => example.name === name);
}

export function hasExample(name: string): boolean {
  return examples.some((example) => example.name === name);
}