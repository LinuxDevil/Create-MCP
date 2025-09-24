import { ProjectConfig } from '../prompts.js';

export function generateReadme(config: ProjectConfig): string {
  const httpInstructions = `
## HTTP Transport

For HTTP transport, the server runs on port 3000 by default. You can change this by setting the \`PORT\` environment variable.

### Starting the HTTP server:

\`\`\`bash
npm run dev:http
# or
MCP_TRANSPORT=http npm start
\`\`\`

### Endpoints:

- \`GET /health\` - Health check endpoint
- \`POST /mcp\` - MCP client communication
- \`GET /mcp\` - Server-sent events (notifications)
- \`GET /info\` - Server information

### Client Connection:

Connect to the server using the HTTP transport:

\`\`\`json
{
  "mcpServers": {
    "${config.name}": {
      "command": "node", 
      "args": ["path/to/${config.name}/dist/server.js"],
      "env": {
        "MCP_TRANSPORT": "http"
      }
    }
  }
}
\`\`\``;

  const stdioInstructions = `
## Stdio Transport

For stdio transport, the server communicates via standard input/output.

### Starting the stdio server:

\`\`\`bash
npm run dev:stdio
# or
npm start
\`\`\`

### Client Connection:

Add to your MCP client configuration:

\`\`\`json
{
  "mcpServers": {
    "${config.name}": {
      "command": "node",
      "args": ["path/to/${config.name}/dist/server.js"]
    }
  }
}
\`\`\``;

  return `# ${config.name}

${config.description}

A production-ready Model Context Protocol (MCP) server built with TypeScript.

## Features

- 🔧 **Tools**: ${config.includeExamples ? 'Interactive tools with comprehensive examples' : 'Ready-to-implement tool framework'}
- 📚 **Resources**: ${config.includeExamples ? 'Dynamic resources with server information and configuration' : 'Resource management system'}
- 💬 **Prompts**: ${config.includeExamples ? 'AI-ready prompt templates for data analysis' : 'Prompt template system'}
- 🚀 **TypeScript**: Full type safety and modern development experience
- 📊 **Health Monitoring**: Built-in health checks and system monitoring
- 🔍 **Structured Logging**: Comprehensive logging with multiple levels
${config.transportTypes === 'both' || config.transportTypes === 'http' ? '- 🌐 **HTTP Transport**: RESTful API with Server-Sent Events and session management' : ''}
${config.transportTypes === 'both' || config.transportTypes === 'stdio' ? '- 📡 **Stdio Transport**: Standard input/output communication for CLI integration' : ''}

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
# Build the project
npm run build

# Run in development mode with auto-reload
npm run dev

# Run specific transport in development
npm run dev:stdio  # Stdio transport
npm run dev:http   # HTTP transport

# Start the server
npm start
\`\`\`
${config.transportTypes === 'both' ? httpInstructions + stdioInstructions : 
  config.transportTypes === 'http' ? httpInstructions : stdioInstructions}

${config.includeExamples ? `## Available Tools

### \`echo\`
Echo back messages with optional formatting options.

**Parameters:**
- \`message\` (required): Message to echo back
- \`uppercase\` (optional): Convert to uppercase

### \`calculate\`
Perform basic mathematical operations safely.

**Parameters:**
- \`operation\` (required): Mathematical operation (add, subtract, multiply, divide)
- \`a\` (required): First number
- \`b\` (required): Second number

### \`server-status\`
Get comprehensive server status and health information.

**Parameters:**
- \`detailed\` (optional): Include detailed system information

## Available Resources

### \`info://server\`
Comprehensive server information including capabilities and runtime details.

### \`config://current\`
Current server configuration and environment variables.

## Available Prompts

### \`analyze-data\`
Analyze provided data and generate insights with customizable focus areas.

**Parameters:**
- \`data\` (required): Data to analyze
- \`format\` (required): Data format (json, csv, text)
- \`focus\` (optional): Specific areas to focus on during analysis` : `## Getting Started

This MCP server provides a foundation for building your own tools, resources, and prompts. 

### Adding Tools

Tools are interactive functions that can be called by MCP clients. Add them in \`src/server.ts\`:

\`\`\`typescript
this.server.registerTool(
  "my-tool",
  {
    title: "My Tool",
    description: "Description of what this tool does",
    inputSchema: {
      param: z.string().describe("Parameter description")
    }
  },
  async ({ param }) => {
    // Tool implementation
    return {
      content: [{
        type: "text",
        text: \`Result: \${param}\`
      }]
    };
  }
);
\`\`\`

### Adding Resources

Resources provide access to data and information. Add them in \`src/server.ts\`:

\`\`\`typescript
this.server.registerResource(
  "my-resource",
  "my://resource/uri",
  {
    title: "My Resource",
    description: "Description of this resource",
    mimeType: "application/json"
  },
  async () => ({
    contents: [{
      uri: "my://resource/uri",
      text: JSON.stringify({ data: "example" }, null, 2),
      mimeType: "application/json"
    }]
  })
);
\`\`\`

### Adding Prompts

Prompts provide templates for AI interactions. Add them in \`src/server.ts\`:

\`\`\`typescript
this.server.registerPrompt(
  "my-prompt",
  {
    title: "My Prompt",
    description: "Description of this prompt template",
    argsSchema: {
      input: z.string().describe("Input parameter")
    }
  },
  ({ input }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: \`Please process: \${input}\`
      }
    }]
  })
);
\`\`\``}

## Project Structure

\`\`\`
${config.name}/
├── src/
│   ├── server.ts             # Main server implementation
${config.includeExamples ? '│   ├── services/             # Business logic services\n│   │   └── example.ts        # Example service with data processing' : ''}
│   └── utils/                # Utility functions
│       ├── logger.ts         # Structured logging system
│       ├── health.ts         # Health monitoring system
│       └── index.ts          # Utility exports
├── dist/                     # Built JavaScript files
├── .env.local               # Local environment variables
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
\`\`\`

## Environment Variables

Configure the server using environment variables in \`.env.local\`:

\`\`\`env
# Transport type: 'stdio' or 'http'
MCP_TRANSPORT=stdio

# HTTP server port (only used when MCP_TRANSPORT=http)
PORT=3000

# Logging level: 'debug', 'info', 'warn', 'error'
LOG_LEVEL=info

# Node environment
NODE_ENV=development
\`\`\`

## Health Monitoring

The server includes built-in health monitoring:

- **Memory usage tracking** - Monitors heap usage and warns when high
- **Uptime monitoring** - Tracks server uptime
- **Custom health checks** - Add your own health checks easily

Access health information:
- Via HTTP: \`GET /health\` endpoint
- Via tool: Use the \`server-status\` tool
- Programmatically: Use the \`HealthChecker\` class

## Logging

Structured logging with multiple levels:

\`\`\`typescript
import { logger } from './utils/logger.js';

logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message', error);
\`\`\`

## Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## Deployment

### Docker

Create a \`Dockerfile\`:

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env.local ./

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### Environment-specific Configuration

- **Development**: Use \`npm run dev\` for auto-reload
- **Production**: Build with \`npm run build\` and run with \`npm start\`
- **Docker**: Use multi-stage builds for smaller images

## Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/my-new-feature\`
3. Make your changes and add tests
4. Ensure all tests pass: \`npm test\`
5. Lint your code: \`npm run lint\`
6. Commit your changes: \`git commit -am 'Add some feature'\`
7. Push to the branch: \`git push origin feature/my-new-feature\`
8. Submit a pull request

## Troubleshooting

### Common Issues

**Server won't start:**
- Check that the port is not already in use
- Verify environment variables are set correctly
- Check the logs for specific error messages

**Memory issues:**
- Monitor memory usage via health checks
- Consider increasing Node.js memory limit: \`node --max-old-space-size=4096 dist/server.js\`

**Transport issues:**
- Ensure MCP_TRANSPORT environment variable is set correctly
- For HTTP transport, verify the port is accessible
- For stdio transport, ensure proper stdin/stdout handling

### Debug Mode

Enable verbose logging:

\`\`\`bash
LOG_LEVEL=debug npm run dev
\`\`\`

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io)

## License

MIT License - see LICENSE file for details.

---

**Author:** ${config.author}  
**Created with:** [create-mcp](https://github.com/modelcontextprotocol/create-mcp)
`;
}