import { ProjectConfig } from '../prompts.js';

export function generateServerTs(config: ProjectConfig): string {
  const className = toPascalCase(config.name);
  
  return `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
${config.transportTypes === 'http' || config.transportTypes === 'both' ? `import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { randomUUID } from 'node:crypto';` : ''}
import { z } from 'zod';
import { logger } from './utils/logger.js';
${config.includeExamples ? `import { ExampleService } from './services/example.js';` : ''}
import { HealthChecker } from './utils/health.js';

/**
 * ${config.name} - Model Context Protocol Server
 * ${config.description}
 * 
 * This server implements the Model Context Protocol with ${getTransportDescription(config.transportTypes)}.
 * ${config.includeExamples ? 'It includes example tools and resources to demonstrate MCP capabilities.' : 'It provides a clean foundation for building MCP tools and resources.'}
 */

export class ${className}Server {
  private server: McpServer;
  ${config.includeExamples ? 'private exampleService: ExampleService;' : ''}
  private healthChecker: HealthChecker;

  constructor() {
    this.server = new McpServer({
      name: "${config.name}",
      version: "1.0.0"
    });

    ${config.includeExamples ? 'this.exampleService = new ExampleService();' : ''}
    this.healthChecker = new HealthChecker();
    
    this.setupHealthChecks();
    this.setupServer();
  }

  private setupHealthChecks(): void {
    // Register health checks
    this.healthChecker.registerCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      return {
        name: 'memory',
        status: heapUsedMB > 500 ? 'warn' : 'pass', // Warn if > 500MB
        message: \`Heap: \${heapUsedMB}MB / \${heapTotalMB}MB\`
      };
    });

    this.healthChecker.registerCheck('uptime', async () => {
      const uptimeSeconds = process.uptime();
      return {
        name: 'uptime',
        status: 'pass',
        message: \`\${Math.round(uptimeSeconds)}s\`
      };
    });
  }

  private setupServer(): void {
    logger.info("Setting up MCP server...");

    // Register all server capabilities
    this.registerTools();
    this.registerResources();
    this.registerPrompts();

    logger.info("MCP server setup complete");
  }

  private registerTools(): void {
    logger.debug("Registering tools...");

    ${config.includeExamples ? generateExampleTools() : generateBasicTools()}

    logger.debug("Tools registered successfully");
  }

  private registerResources(): void {
    logger.debug("Registering resources...");

    ${config.includeExamples ? generateExampleResources(config) : generateBasicResources(config)}

    logger.debug("Resources registered successfully");
  }

  private registerPrompts(): void {
    logger.debug("Registering prompts...");

    ${config.includeExamples ? generateExamplePrompts() : generateBasicPrompts()}

    logger.debug("Prompts registered successfully");
  }

  ${config.transportTypes === 'stdio' || config.transportTypes === 'both' ? generateStdioTransport() : ''}

  ${config.transportTypes === 'http' || config.transportTypes === 'both' ? generateHttpTransport(config) : ''}

  /**
   * Gracefully shutdown the server
   */
  async shutdown(): Promise<void> {
    logger.info("Shutting down MCP server...");
    
    try {
      ${config.includeExamples ? 'this.exampleService.dispose();' : ''}
      // Additional cleanup can be added here
      logger.info("Server shutdown complete");
    } catch (error) {
      logger.error("Error during shutdown:", error);
    }
  }
}

${generateMainFunction(config)}

${generateErrorHandling()}

// Start the server if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Startup error:', error);
    process.exit(1);
  });
}

export { ${className}Server };
`;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function getTransportDescription(transport: string): string {
  switch (transport) {
    case 'stdio': return 'Stdio transport';
    case 'http': return 'HTTP transport';
    case 'both': return 'both Stdio and HTTP transports';
    default: return 'multiple transports';
  }
}

function generateExampleTools(): string {
  return `// Basic echo tool
    this.server.registerTool(
      "echo",
      {
        title: "Echo Tool",
        description: "Echoes back the provided message with optional formatting",
        inputSchema: { 
          message: z.string().describe("Message to echo back"),
          uppercase: z.boolean().optional().describe("Convert to uppercase")
        }
      },
      async ({ message, uppercase }) => {
        logger.info(\`Echo tool called: "\${message}"\`);
        const result = uppercase ? message.toUpperCase() : message;
        
        return {
          content: [{
            type: "text",
            text: \`Echo: \${result}\`
          }]
        };
      }
    );

    // Mathematical operations
    this.server.registerTool(
      "calculate",
      {
        title: "Calculator Tool",
        description: "Perform mathematical operations",
        inputSchema: { 
          operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("Mathematical operation"),
          a: z.number().describe("First number"),
          b: z.number().describe("Second number")
        }
      },
      async ({ operation, a, b }) => {
        logger.info(\`Calculate: \${a} \${operation} \${b}\`);
        
        let result: number;
        let symbol: string;

        switch (operation) {
          case "add":
            result = a + b;
            symbol = "+";
            break;
          case "subtract":
            result = a - b;
            symbol = "-";
            break;
          case "multiply":
            result = a * b;
            symbol = "×";
            break;
          case "divide":
            if (b === 0) {
              return {
                content: [{
                  type: "text",
                  text: "Error: Division by zero is not allowed"
                }],
                isError: true
              };
            }
            result = a / b;
            symbol = "÷";
            break;
        }

        return {
          content: [{
            type: "text",
            text: \`\${a} \${symbol} \${b} = \${result}\`
          }]
        };
      }
    );

    // Server status tool using service
    this.server.registerTool(
      "server-status",
      {
        title: "Server Status",
        description: "Get comprehensive server status and health information",
        inputSchema: {
          detailed: z.boolean().optional().describe("Include detailed system information")
        }
      },
      async ({ detailed = false }) => {
        logger.info("Server status requested");
        
        const [status, health] = await Promise.all([
          this.exampleService.getStatus(),
          this.healthChecker.getStatus()
        ]);

        const content = [{
          type: "text" as const,
          text: detailed 
            ? JSON.stringify({ status, health }, null, 2)
            : JSON.stringify(status, null, 2)
        }];

        return { content };
      }
    );`;
}

function generateBasicTools(): string {
  return `// Basic echo tool
    this.server.registerTool(
      "echo",
      {
        title: "Echo Tool",
        description: "Echoes back the provided message",
        inputSchema: { 
          message: z.string().describe("Message to echo back")
        }
      },
      async ({ message }) => {
        logger.info(\`Echo tool called: "\${message}"\`);
        
        return {
          content: [{
            type: "text",
            text: \`Echo: \${message}\`
          }]
        };
      }
    );

    // Server status tool
    this.server.registerTool(
      "server-status",
      {
        title: "Server Status",
        description: "Get server status and health information",
        inputSchema: {}
      },
      async () => {
        logger.info("Server status requested");
        
        const health = await this.healthChecker.getStatus();

        return {
          content: [{
            type: "text",
            text: JSON.stringify(health, null, 2)
          }]
        };
      }
    );`;
}

function generateExampleResources(config: ProjectConfig): string {
  return `// Static server information resource
    this.server.registerResource(
      "server-info",
      "info://server",
      {
        title: "Server Information",
        description: "Comprehensive information about this MCP server",
        mimeType: "application/json"
      },
      async () => {
        const status = await this.exampleService.getStatus();
        
        return {
          contents: [{
            uri: "info://server",
            text: JSON.stringify({
              name: "${config.name}",
              version: "1.0.0",
              description: "${config.description}",
              author: "${config.author}",
              capabilities: {
                tools: status.tools,
                resources: status.resources,
                prompts: status.prompts
              },
              runtime: {
                node: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: status.uptime,
                memory: status.memory
              },
              timestamp: status.timestamp
            }, null, 2),
            mimeType: "application/json"
          }]
        };
      }
    );

    // Configuration resource
    this.server.registerResource(
      "config",
      "config://current",
      {
        title: "Current Configuration",
        description: "Current server configuration and environment",
        mimeType: "application/json"
      },
      async () => ({
        contents: [{
          uri: "config://current",
          text: JSON.stringify({
            transport: process.env.MCP_TRANSPORT || 'stdio',
            port: process.env.PORT || '3000',
            logLevel: process.env.LOG_LEVEL || 'INFO',
            nodeEnv: process.env.NODE_ENV || 'development',
            processId: process.pid,
            workingDirectory: process.cwd()
          }, null, 2),
          mimeType: "application/json"
        }]
      })
    );`;
}

function generateBasicResources(config: ProjectConfig): string {
  return `// Server information resource
    this.server.registerResource(
      "server-info",
      "info://server",
      {
        title: "Server Information",
        description: "Information about this MCP server",
        mimeType: "application/json"
      },
      async () => {
        return {
          contents: [{
            uri: "info://server",
            text: JSON.stringify({
              name: "${config.name}",
              version: "1.0.0",
              description: "${config.description}",
              author: "${config.author}",
              runtime: {
                node: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime()
              },
              timestamp: new Date().toISOString()
            }, null, 2),
            mimeType: "application/json"
          }]
        };
      }
    );`;
}

function generateExamplePrompts(): string {
  return `// Data analysis prompt
    this.server.registerPrompt(
      "analyze-data",
      {
        title: "Data Analysis Prompt",
        description: "Analyze provided data and generate insights",
        argsSchema: {
          data: z.string().describe("Data to analyze"),
          format: z.enum(["json", "csv", "text"]).describe("Data format"),
          focus: z.array(z.string()).optional().describe("Specific areas to focus on")
        }
      },
      ({ data, format, focus = [] }) => {
        const focusText = focus.length > 0 
          ? \`\\n\\nPlease pay special attention to: \${focus.join(", ")}\`
          : "";

        return {
          messages: [{
            role: "user",
            content: {
              type: "text",
              text: \`Please analyze the following \${format} data and provide comprehensive insights:

\${data}\${focusText}

Please include:
1. Data summary and structure
2. Key patterns or trends
3. Potential issues or anomalies
4. Recommendations for further analysis\`
            }
          }]
        };
      }
    );`;
}

function generateBasicPrompts(): string {
  return `// Basic analysis prompt
    this.server.registerPrompt(
      "analyze",
      {
        title: "Analysis Prompt",
        description: "Analyze provided content",
        argsSchema: {
          content: z.string().describe("Content to analyze")
        }
      },
      ({ content }) => {
        return {
          messages: [{
            role: "user",
            content: {
              type: "text",
              text: \`Please analyze the following content and provide insights:\\n\\n\${content}\`
            }
          }]
        };
      }
    );`;
}

function generateStdioTransport(): string {
  return `/**
   * Start the server with Stdio transport
   * Ideal for command-line tools and direct integrations
   */
  async startStdio(): Promise<void> {
    logger.info("Starting MCP server with Stdio transport...");
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    logger.info("MCP server is now running on Stdio transport");
    logger.info("Ready to receive MCP messages via stdin");
  }`;
}

function generateHttpTransport(config: ProjectConfig): string {
  return `/**
   * Start the server with HTTP transport
   * Perfect for web services and remote integrations
   */
  async startHttp(port: number = 3000): Promise<void> {
    logger.info(\`Starting MCP server with HTTP transport on port \${port}...\`);
    
    const app = express();
    app.use(express.json({ limit: '10mb' }));

    // Store transports for session management
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

    // CORS middleware for browser clients
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, mcp-session-id');
      res.header('Access-Control-Expose-Headers', 'Mcp-Session-Id');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }
      next();
    });

    // Handle POST requests for client-to-server communication
    app.post('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      try {
        if (sessionId && transports[sessionId]) {
          // Reuse existing transport
          transport = transports[sessionId];
          logger.debug(\`Reusing session: \${sessionId}\`);
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request
          logger.info("Creating new session for initialize request");
          
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              transports[newSessionId] = transport;
              logger.info(\`New session initialized: \${newSessionId}\`);
            }
          });

          // Clean up transport when closed
          transport.onclose = () => {
            if (transport.sessionId) {
              delete transports[transport.sessionId];
              logger.info(\`Session closed: \${transport.sessionId}\`);
            }
          };

          await this.server.connect(transport);
        } else {
          // Invalid request
          logger.warn(\`Invalid request: sessionId=\${sessionId}, isInitialize=\${isInitializeRequest(req.body)}\`);
          return res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided or not an initialize request',
            },
            id: null,
          });
        }

        // Handle the request
        await transport.handleRequest(req, res, req.body);
        
      } catch (error) {
        logger.error('Error handling MCP request:', error);
        
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: null,
          });
        }
      }
    });

    // Handle GET requests for server-to-client notifications via SSE
    app.get('/mcp', async (req, res) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      
      if (!sessionId || !transports[sessionId]) {
        logger.warn(\`Invalid SSE request: sessionId=\${sessionId}\`);
        return res.status(400).send('Invalid or missing session ID');
      }
      
      logger.debug(\`SSE connection for session: \${sessionId}\`);
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        const health = await this.healthChecker.getStatus();
        const statusCode = health.status === 'healthy' ? 200 : 
                          health.status === 'degraded' ? 200 : 503;
        
        res.status(statusCode).json(health);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'unhealthy',
          checks: [],
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    });

    // Server info endpoint
    app.get('/info', async (req, res) => {
      try {
        ${config.includeExamples ? 'const status = await this.exampleService.getStatus();' : ''}
        res.json({
          server: "${config.name}",
          version: "1.0.0",
          description: "${config.description}",
          transport: "http",
          endpoints: {
            mcp: "/mcp",
            health: "/health",
            info: "/info"
          },
          ${config.includeExamples ? `capabilities: {
            tools: status.tools.length,
            resources: status.resources.length,
            prompts: status.prompts.length
          },` : ''}
          sessions: Object.keys(transports).length
        });
      } catch (error) {
        logger.error('Info endpoint failed:', error);
        res.status(500).json({ error: 'Failed to get server info' });
      }
    });

    // Start the HTTP server
    app.listen(port, () => {
      logger.info(\`MCP server is now listening on http://localhost:\${port}\`);
      logger.info('Available endpoints:');
      logger.info('  POST /mcp    - MCP client communication');
      logger.info('  GET /mcp     - Server-sent events (notifications)');
      logger.info('  GET /health  - Health check');
      logger.info('  GET /info    - Server information');
    });
  }`;
}

function generateMainFunction(config: ProjectConfig): string {
  const className = toPascalCase(config.name);
  
  return `// Main execution logic
async function main(): Promise<void> {
  const server = new ${className}Server();
  
  // Determine transport mode from environment or command line
  const transportMode = process.env.MCP_TRANSPORT || process.argv[2] || '${config.transportTypes === 'both' ? 'stdio' : config.transportTypes}';
  const port = parseInt(process.env.PORT || '3000', 10);

  ${config.transportTypes === 'http' || config.transportTypes === 'both' ? `// Validate port number for HTTP mode
  if (transportMode === 'http' && (isNaN(port) || port < 1 || port > 65535)) {
    logger.error(\`Invalid port number: \${port}. Must be between 1 and 65535.\`);
    process.exit(1);
  }` : ''}

  try {
    switch (transportMode.toLowerCase()) {
      ${config.transportTypes === 'stdio' || config.transportTypes === 'both' ? `case 'stdio':
        await server.startStdio();
        break;` : ''}
        
      ${config.transportTypes === 'http' || config.transportTypes === 'both' ? `case 'http':
        await server.startHttp(port);
        break;` : ''}
        
      default:
        logger.error(\`Unknown transport mode: \${transportMode}\`);
        logger.info('Available transport modes:');
        ${config.transportTypes === 'stdio' || config.transportTypes === 'both' ? `logger.info('  stdio - Standard input/output (for CLI integration)');` : ''}
        ${config.transportTypes === 'http' || config.transportTypes === 'both' ? `logger.info('  http  - HTTP server (for web integration)');` : ''}
        logger.info('');
        logger.info('Usage examples:');
        ${config.transportTypes === 'stdio' || config.transportTypes === 'both' ? `logger.info('  npm run dev:stdio');` : ''}
        ${config.transportTypes === 'http' || config.transportTypes === 'both' ? `logger.info('  npm run dev:http');
        logger.info('  MCP_TRANSPORT=http PORT=3001 npm start');` : ''}
        process.exit(1);
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}`;
}

function generateErrorHandling(): string {
  return `// Handle graceful shutdown
const handleShutdown = (signal: string) => {
  logger.info(\`Received \${signal}, initiating graceful shutdown...\`);
  // Note: In a real implementation, you'd want to store the server instance
  // and call server.shutdown() here
  process.exit(0);
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});`;
}