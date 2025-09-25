# MCP Server Generator

A modern CLI tool for generating production-ready Model Context Protocol (MCP) servers with comprehensive **Data Analysis Assistant** capabilities. Built with clean architecture and advanced MCP features, this tool creates servers that demonstrate all MCP capabilities through one cohesive example instead of scattered demos.

[![npm version](https://badge.fury.io/js/mcp-server-generator.svg)](https://www.npmjs.com/package/mcp-server-generator)
[![Downloads](https://img.shields.io/npm/dm/mcp-server-generator.svg)](https://www.npmjs.com/package/mcp-server-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **📦 Available on npm**: [`mcp-server-generator`](https://www.npmjs.com/package/mcp-server-generator) - 442kB of production-ready MCP server templates

## ✨ **Modern Architecture**

- 🎯 **Unified Example**: One comprehensive Data Analysis Assistant showcasing ALL MCP features
- 🏗️ **Clean Architecture**: Modular design with proper separation of concerns
- 🔧 **Advanced MCP Features**: Elicitation, sampling, multiple analysis methodologies
- 🔍 **MCP Inspector Integration**: Built-in testing with visual and CLI modes
- 📚 **Production Ready**: Comprehensive error handling, validation, and documentation
- 🚀 **Educational**: Learn MCP best practices through real-world implementation

## Usage

```bash
# Create a comprehensive MCP server with Data Analysis Assistant
npx mcp-server-generator my-analysis-server

# Alternative command (backwards compatibility)
npx create-mcp my-analysis-server

# Or specify custom options
npx mcp-server-generator my-analysis-server --transport both --skip-install
```

## 📦 Quick Installation

```bash
# One-time usage (recommended)
npx mcp-server-generator my-project

# Global installation
npm install -g mcp-server-generator
```

## CLI Options

- `<project-name>`: Name of the MCP server project (required)
- `-t, --transport <type>`: Transport type (`stdio`, `http`, `both`) - default: `both`
- `-d, --directory <path>`: Directory to create the project in
- `--skip-install`: Skip installing dependencies

## 🚀 **What You Get**

Every generated project includes a **comprehensive Data Analysis Assistant** that demonstrates:

### 🔧 **Comprehensive Tools** (8 powerful tools)

- **`data-analysis`**: Complete analysis with 5 methodologies, 6 sampling strategies, elicitation integration
- **`server-status`**: Health monitoring and performance tracking
- **`start-elicitation`**: Begin interactive elicitation sessions for guided information gathering
- **`continue-elicitation`**: Continue active elicitation sessions with responses
- **`get-elicitation-status`**: Get status and summary of elicitation sessions
- **`generate-sample`**: Generate samples using 6 different sampling strategies
- **`analyze-sample`**: Analyze sample quality and representativeness
- **`generate-synthetic-data`**: Generate synthetic data based on source patterns

### 📋 **Rich Resources** (9 comprehensive resources)

- **`data-analysis`**: Comprehensive guide to data analysis approaches and techniques
- **`sampling-guide`**: Complete guide to data sampling techniques and strategies
- **`elicitation-workflows`**: Interactive elicitation workflows for guided analysis
- **`analysis-best-practices`**: Industry best practices for effective data analysis
- **`server-info`**: Comprehensive server information and capabilities
- **`server-config`**: Current server configuration and runtime settings
- **`api-docs`**: Complete API documentation for the MCP server
- **`sampling-strategies`**: Documentation of available sampling strategies
- **`sampling-best-practices`**: Guidelines for effective data sampling

### 💡 **Flexible Prompts** (3 intelligent prompts)

- **`research-analysis`**: 8 research methodologies with flexible contexts and output formats
- **`interactive-exploration`**: Generate interactive exploration questions for topics
- **`guided-discovery`**: Create guided discovery sessions for knowledge elicitation

### ✨ **Advanced Features**

- 🧠 **Interactive Elicitation**: Guided analysis with smart question generation
- 📊 **AI-Enhanced Sampling**: 6 sampling strategies including AI-powered techniques
- 🏗️ **Modular Architecture**: Clean separation of concerns with dependency injection
- 🔍 **MCP Inspector Integration**: Visual and CLI testing built-in

## Generated Project Structure

```text
my-analysis-server/
├── src/
│   ├── server.ts                      # Simplified main entry point (106 lines)
│   ├── core/                          # Core server logic
│   │   ├── config.ts                  # Configuration management
│   │   ├── mcp-server.ts              # Core MCP server implementation  
│   │   └── server-factory.ts          # Server instantiation
│   ├── transports/                    # Transport layer
│   │   ├── stdio-transport.ts         # Stdio communication
│   │   ├── http-transport.ts          # HTTP communication
│   │   └── transport-manager.ts       # Transport coordination
│   ├── tools/                         # Modular tool implementations
│   │   ├── index.ts                   # Tool registry
│   │   ├── data-analysis-tool.ts      # Comprehensive analysis tool
│   │   └── server-status-tool.ts      # Monitoring tool
│   ├── resources/                     # Resource providers
│   │   ├── index.ts                   # Resource registry
│   │   ├── data-analysis-resource.ts  # Analysis documentation
│   │   └── server-info-resource.ts    # Server information
│   ├── prompts/                       # Prompt templates
│   │   ├── index.ts                   # Prompt registry
│   │   └── research-analysis-prompt.ts # Multi-methodology prompts
│   ├── services/                      # Business logic
│   │   ├── elicitation.ts             # Interactive guidance
│   │   ├── sampling.ts                # Data sampling
│   │   └── example.ts                 # Example service
│   └── utils/                         # Utilities
│       ├── logger.ts                  # Logging system
│       └── health.ts                  # Health monitoring
├── mcp-inspector.config.json          # MCP Inspector configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
└── README.md                          # Comprehensive documentation
```

### 🚀 **Transport Support**

- **Stdio Transport**: Standard input/output for Claude Desktop and CLI tools
- **HTTP Transport**: RESTful API with Server-Sent Events for web integration
- **Streamable HTTP**: Modern protocol 2025-03-26 with session management

### 📝 **Development Scripts**

```bash
# 🚀 Quick Start & Testing
npm run quick:test         # Show ALL tools, resources & prompts at once
npm run help               # Show all available commands

# 🔧 Development
npm run dev:stdio          # Start with stdio transport (for Claude Desktop)
npm run dev:http           # Start with HTTP transport
npm run dev:http:stateless # Start HTTP in stateless mode (best for inspector)
npm run dev:http:oauth     # Start with OAuth enabled

# 🌐 MCP Inspector Integration (2 terminals)
# Terminal 1: npm run dev:http:stateless
# Terminal 2: npm run inspector:config -- --server your-project-http

# 📋 Individual Testing  
npm run test:tools         # List available tools
npm run test:resources     # List available resources
npm run test:prompts       # List available prompts

# 🔍 Inspector Options
npm run inspector          # Launch visual inspector (UI mode)
npm run inspector:cli      # Command line testing
npm run inspector:config   # Use configuration-based testing

# 🚀 Production
npm run build              # Build TypeScript
npm run start:stdio        # Production stdio
npm run start:http         # Production HTTP
npm run start:http:stateless # Production HTTP stateless
```

## 🎯 **Example Usage**

After creating a project, you get a comprehensive Data Analysis Assistant:

### 🚀 **Quick Start (Recommended)**

```bash
# Create and enter project
npx mcp-server-generator my-analysis-server
cd my-analysis-server

# 1️⃣ See everything at once
npm run quick:test         # Shows all 8 tools, 9 resources, 3 prompts

# 2️⃣ Get help with all commands
npm run help               # Complete command reference

# 3️⃣ Test with MCP Inspector (2 terminals)
# Terminal 1:
npm run dev:http:stateless

# Terminal 2:
npm run inspector:config -- --server my-analysis-server-http
```

### 🔍 **Advanced Testing**

```bash
# Test individual components
npm run test:tools         # List data-analysis and server-status tools
npm run test:resources     # Browse methodology guides and documentation  
npm run test:prompts       # Test research-analysis prompt

# Start different modes
npm run dev:stdio          # For Claude Desktop integration
npm run dev:http           # For API/web integration
npm run dev:http:oauth     # With authentication

# Visual inspector (UI mode)
npm run inspector

# CLI-based testing
npm run inspector:cli
```

### 🧪 **Testing the Data Analysis Tool**

```bash
# Quick test (shows tool schema)
npm run test:tools

# Advanced test with actual data
npx @modelcontextprotocol/inspector --cli tsx src/server.ts \
  --method tools/call \
  --tool-name data-analysis \
  --tool-arg 'data=[{"age":25,"score":85},{"age":30,"score":92}]' \
  --tool-arg analysis_type=exploratory \
  --tool-arg sampling_strategy=ai-representative \
  --tool-arg enable_elicitation=true

# Test server status monitoring
npx @modelcontextprotocol/inspector --cli tsx src/server.ts \
  --method tools/call \
  --tool-name server-status \
  --tool-arg 'include_details=true' \
  --tool-arg 'format=json'
```

## 🎉 **Enhanced Developer Experience**

This generator has been thoroughly tested and improved with:

### ✅ **Production-Ready Quality**
- **Zero TypeScript Errors**: All 26+ compilation issues resolved
- **Working Scripts**: Every npm script tested and functional
- **Clean Architecture**: Proper separation of concerns with dependency injection
- **Error Handling**: Comprehensive validation and graceful error recovery

### 🚀 **Instant Productivity**
- **One-Command Testing**: `npm run quick:test` shows everything at once
- **Built-in Help**: `npm run help` provides complete command reference
- **Smart Defaults**: Optimized configurations for immediate use
- **Inspector Integration**: Seamless MCP Inspector setup with clear instructions

### 🔧 **Advanced Features**
- **8 Comprehensive Tools**: Including interactive elicitation and AI sampling
- **9 Rich Resources**: Complete documentation and methodology guides
- **3 Flexible Prompts**: Multi-methodology research analysis
- **Multiple Transports**: Stdio, HTTP, and Streamable HTTP support

### 🌟 **What Makes This Different**

Unlike other MCP generators that create scattered demo examples, this tool provides:

- 🎯 **One Unified Example**: Data Analysis Assistant showcasing ALL MCP features
- 🏗️ **Clean Architecture**: Maintainable, extensible, production-ready code
- 📚 **Educational Value**: Learn MCP best practices through real implementation
- 🧪 **Integrated Testing**: MCP Inspector ready-to-use with pre-configured scripts
- 🚀 **Developer Experience**: Convenient scripts, help system, instant feedback

Perfect for learning MCP development, building production servers, or as a foundation for custom implementations.

## Development

### Building the CLI

```bash
# Install dependencies
npm install

# Build the CLI tool
npm run build

# Test locally
npm link
mcp-server-generator test-analysis-server
```

### Generated Project Dependencies

Every generated project includes carefully selected dependencies:

**Core MCP:**

- `@modelcontextprotocol/sdk`: Official MCP TypeScript SDK
- `@modelcontextprotocol/inspector`: Visual testing tool (dev dependency)
- `zod`: Runtime type validation and schema definition

**HTTP Transport:**

- `express`: Web server framework
- `cors`: Cross-origin resource sharing

**Development & Quality:**

- `typescript`: TypeScript compiler  
- `tsx`: TypeScript execution engine
- `eslint`: Code linting with TypeScript rules
- `jest`: Testing framework
- `rimraf`: Clean builds

## Architecture

### CLI Structure

```text
create-mcp/
├── bin/
│   ├── create-mcp.js       # CLI entry point
│   └── index.js            # Alternative entry
├── src/
│   ├── cli/               # CLI implementation
│   │   ├── index.ts       # Main CLI logic
│   │   ├── generator.ts   # Project generation
│   │   ├── prompts.ts     # User interaction
│   │   └── validator.ts   # Input validation
│   ├── helpers/           # Helper utilities
│   │   ├── examples.ts    # Example data
│   │   ├── install.ts     # Dependency installation
│   │   └── validate-pkg.ts # Package validation
│   ├── types/             # TypeScript types
│   ├── utils/             # Core utilities
│   │   ├── file-operations.ts # File system operations
│   │   ├── template-processor.ts # Template processing
│   │   └── package-manager.ts # Package management
│   └── templates/         # Template generation system
│       ├── base/          # Base project files
│       │   ├── package.json.template
│       │   ├── README.md.template
│       │   └── tsconfig.json.template
│       └── src/           # Source code templates
│           ├── core/      # Core server modules
│           ├── tools/     # Tool implementations
│           ├── resources/ # Resource providers
│           ├── prompts/   # Prompt templates
│           ├── services/  # Business logic
│           ├── transports/ # Transport handlers
│           └── utils/     # Utility modules
├── lib/                   # Built JavaScript (generated)
└── package.json          # CLI dependencies
```

### Advanced Template System

Our template system generates **production-ready MCP servers** with:

#### 🏗️ **Clean Architecture**

- **Modular Design**: Each component has single responsibility
- **Dependency Injection**: Clean separation of concerns
- **Registry Pattern**: Easy extension and testing
- **Factory Pattern**: Centralized server creation

#### 🎯 **Unified Examples**

- **One Comprehensive Example**: Data Analysis Assistant showcasing ALL features
- **No Scattered Demos**: Everything integrated and cohesive
- **Real-World Applicable**: Practical use case developers can adapt
- **Educational Value**: Learn MCP best practices through implementation

#### 🔧 **Advanced MCP Features**

- **5 Analysis Methodologies**: exploratory, descriptive, diagnostic, predictive, prescriptive
- **6 Sampling Strategies**: Including AI-enhanced techniques
- **Interactive Elicitation**: Smart question generation and guided workflows
- **Multi-Methodology Prompts**: 8 research approaches with flexible contexts

#### 🔍 **Integrated Testing**

- **MCP Inspector**: Visual and CLI testing built-in
- **Comprehensive Scripts**: Ready-to-use testing commands
- **Configuration Files**: Pre-configured inspector settings
- **Development Workflow**: Immediate testing capability

#### 🚀 **Production Features**

- **Multiple Transports**: Stdio, HTTP, Streamable HTTP
- **Session Management**: Stateful and stateless modes
- **Security**: OAuth, CORS, DNS protection
- **Monitoring**: Health checks, status reporting, comprehensive logging

## ✨ **Why This Approach?**

Traditional MCP generators create confusing scattered examples (calculator, echo, etc.). Our approach provides:

- 🎯 **One comprehensive example** instead of confusing scattered demos
- 🏗️ **Clean separation of concerns** for maintainable code
- 📚 **Educational value** showing how all MCP features work together
- 🔧 **Real-world applicability** with practical data analysis use case
- 🧪 **Built-in testing** with MCP Inspector integration
- 📈 **Scalable foundation** for building complex MCP servers

Perfect for learning MCP development, building production servers, or as a foundation for custom implementations.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Build and test: `npm run build && npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow the unified architecture approach (no scattered examples)
- Maintain clean separation of concerns
- Add comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages

## License

MIT License - see LICENSE file for details.

## Acknowledgments

This project is inspired by and builds upon:

- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification and community
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - The official TypeScript SDK
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Visual testing tool for MCP servers
- [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) - CLI design patterns
- [Neon's MCP Server](https://github.com/neondatabase/mcp-server-neon) - MCP server implementation patterns

---

**MCP Server Generator** - Generate production-ready Model Context Protocol servers with comprehensive Data Analysis Assistant and integrated testing.

## 📦 Installation & Usage

### Global Installation
```bash
npm install -g mcp-server-generator
mcp-server-generator my-project
```

### One-time Usage (Recommended)
```bash
npx mcp-server-generator my-project
```

### Package Information
- **npm Package**: [mcp-server-generator](https://www.npmjs.com/package/mcp-server-generator)
- **GitHub**: [LinuxDevil/Create-MCP](https://github.com/LinuxDevil/Create-MCP)
- **Size**: 442 kB (155 files)
- **Commands**: `mcp-server-generator` or `create-mcp`