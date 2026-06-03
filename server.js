import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Store transports by session
const transports = {};

// --- Define MCP server factory ---
function createMcpServer() {
  const server = new McpServer({
    name: "mcp-sse-demo",
    version: "1.0.0",
  });

  // Tool: echo
  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Echo: ${message}` }],
  }));

  // Tool: add
  server.tool(
    "add",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
      content: [{ type: "text", text: `${a} + ${b} = ${a + b}` }],
    })
  );

  // Tool: get_time
  server.tool("get_time", {}, async () => ({
    content: [{ type: "text", text: `Current time: ${new Date().toISOString()}` }],
  }));

  return server;
}

// SSE endpoint — client connects here first
app.get("/sse", async (req, res) => {
  console.log("New SSE connection from", req.ip);

  const transport = new SSEServerTransport("/message", res);
  const server = createMcpServer();

  transports[transport.sessionId] = transport;

  res.on("close", () => {
    console.log("SSE connection closed:", transport.sessionId);
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

// Message endpoint — client posts JSON-RPC messages here
app.post("/message", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];

  if (!transport) {
    console.error("No transport for sessionId:", sessionId);
    return res.status(404).json({ error: "Session not found" });
  }

  await transport.handlePostMessage(req, res, req.body);
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP SSE server running on port ${PORT}`);
  console.log(`SSE endpoint: http://0.0.0.0:${PORT}/sse`);
});
