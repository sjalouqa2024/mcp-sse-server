FROM node:20-slim

# Install supergateway and the MCP everything server globally
RUN npm install -g supergateway @modelcontextprotocol/server-everything

EXPOSE 8080

# supergateway wraps the stdio MCP server and exposes it over SSE
CMD ["supergateway", "--port", "8080", "--stdio", "npx -y @modelcontextprotocol/server-everything"]
