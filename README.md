# Create MCP CLI

A comprehensive CLI tool for generating Model Context Protocol (MCP) servers using TypeScript. This tool is modeled after Next.js's create-next-app and provides a complete development experience for building MCP servers.

## Features

- 🚀 **Quick Setup**: Generate a complete MCP server project with one command
- 📦 **TypeScript First**: Full TypeScript support with proper configurations
- 🔄 **Dual Transport**: Support for both Stdio and HTTP transports
- 🛠️ **Ready-to-Use**: Includes working examples and proper project structure
- 📚 **Well Documented**: Comprehensive documentation and examples
- 🎯 **Production Ready**: Best practices and proper error handling

## Usage

```bash
# Create a new MCP server project
npx create-mcp my-mcp-server

# Or with specific transport
npx create-mcp my-mcp-server --transport stdio
npx create-mcp my-mcp-server --transport http
npx create-mcp my-mcp-server --transport both
```

## CLI Options

- `<project-name>`: Name of the MCP server project (required)
- `-t, --transport <type>`: Transport type (`stdio`, `http`, `both`) - default: `both`
- `-d, --directory <path>`: Directory to create the project in
- `--skip-install`: Skip installing dependencies

## Generated Project Structure

```
my-mcp-server/
├── src/
│   ├── services/
│   │   └── example.ts      # Example service with tools and resources
│   ├── utils/
│   │   └── index.ts        # Utility functions
│   └── server.ts           # Main server with transport implementations
├── dist/                   # Built JavaScript files (after build)
├── .env.local             # Environment configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Features of Generated Projects

### 🔧 Tools
- `get_time`: Get current time in various formats
- `calculate`: Perform basic mathematical calculations

### 📚 Resources  
- `example://config`: Server configuration and status
- `example://stats`: Runtime statistics and metrics

### 🚀 Transport Support
- **Stdio Transport**: Standard input/output communication for MCP clients
- **HTTP Transport**: RESTful API with Server-Sent Events for web integration

### 📝 Scripts
- `npm run dev`: Development mode with auto-reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start the server (stdio transport)
- `npm run start:http`: Start with HTTP transport
- `npm run lint`: ESLint code checking
- `npm test`: Run tests

## Development

### Building the CLI

```bash
# Install dependencies
npm install

# Build the CLI tool
npm run build

# Test locally
npm link
create-mcp test-project
```

### Project Dependencies

The generated projects include:

**Core Dependencies:**
- `@modelcontextprotocol/sdk`: Official MCP TypeScript SDK
- `dotenv`: Environment configuration
- `zod`: Runtime type validation

**HTTP Transport (when selected):**
- `express`: Web server framework
- `cors`: Cross-origin resource sharing

**Development:**
- `typescript`: TypeScript compiler
- `tsx`: TypeScript execution engine
- `eslint`: Code linting
- `jest`: Testing framework

## Architecture

The CLI follows the create-next-app pattern:

### CLI Structure
```
create-mcp/
├── bin/
│   └── create-mcp.js       # CLI entry point
├── src/
│   ├── index.ts           # Main CLI logic
│   ├── create-mcp.ts      # Project creation logic
│   ├── templates/         # Template generation
│   │   ├── index.ts       # Template orchestration
│   │   ├── package-json.ts # Package.json generation
│   │   ├── server-ts.ts   # Server template
│   │   └── ...            # Other templates
│   └── utils/             # Utility functions
├── lib/                   # Built JavaScript (generated)
└── package.json          # CLI dependencies
```

### Template System

The template system generates complete, working MCP servers with:

1. **Modular Architecture**: Separate services and utilities
2. **Transport Flexibility**: Support for stdio and HTTP
3. **Type Safety**: Full TypeScript integration
4. **Best Practices**: Error handling, validation, and documentation
5. **Development Experience**: Hot reload, linting, and testing

## Example Usage

After creating a project:

```bash
# Create and enter project
npx create-mcp my-awesome-mcp
cd my-awesome-mcp

# Start development
npm run dev

# In another terminal, test the MCP server
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/server.js
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Build and test: `npm run build && npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Inspiration

This project is inspired by:
- [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Neon's MCP Server](https://github.com/neondatabase/mcp-server-neon)