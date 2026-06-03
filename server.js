import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 8080;
const BEARER_TOKEN = process.env.BEARER_TOKEN || "my-secret-token-123";

app.use(express.json());

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  if (token !== BEARER_TOKEN) {
    return res.status(403).json({ error: "Invalid bearer token" });
  }
  next();
}

const transports = {};

function createMcpServer() {
  const server = new McpServer({ name: "mcp-bearer-demo", version: "1.0.0" });

  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Echo: ${message}` }],
  }));

  server.tool("add", { a: z.number(), b: z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: `${a} + ${b} = ${a + b}` }],
  }));

  server.tool("get_time", {}, async () => ({
    content: [{ type: "text", text: `Current time: ${new Date().toISOString()}` }],
  }));

  return server;
}

app.get("/sse", authMiddleware, async (req, res) => {
  console.log("New authenticated SSE connection from", req.ip);
  const transport = new SSEServerTransport("/message", res);
  const server = createMcpServer();
  transports[transport.sessionId] = transport;
  res.on("close", () => delete transports[transport.sessionId]);
  await server.connect(transport);
});

app.post("/message", authMiddleware, async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];
  if (!transport) return res.status(404).json({ error: "Session not found" });
  await transport.handlePostMessage(req, res, req.body);
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP Bearer server running on port ${PORT}`);
  console.log(`Bearer token: ${BEARER_TOKEN}`);
});
