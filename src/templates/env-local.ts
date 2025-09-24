export function generateEnvLocal(): string {
  return `# MCP Server Configuration

# Transport type: 'stdio' or 'http'
MCP_TRANSPORT=stdio

# HTTP server port (only used when MCP_TRANSPORT=http)
PORT=3000

# Add your environment variables here
# Example:
# DATABASE_URL=your_database_url
# API_KEY=your_api_key
`;
}