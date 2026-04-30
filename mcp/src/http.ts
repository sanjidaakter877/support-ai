import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createSupportAiMcpServer } from "./server.js";

type McpRequest = IncomingMessage & {
  body?: unknown;
};

type JsonResponse = ServerResponse & {
  json: (body: unknown) => void;
  status: (code: number) => JsonResponse;
};

const app = createMcpExpressApp();
const port = Number(process.env.PORT ?? 8787);

app.get("/health", (_req: McpRequest, res: JsonResponse) => {
  res.json({
    status: "ok",
    name: "support-ai-care-signal-mcp",
    transport: "streamable-http",
    endpoint: "/mcp"
  });
});

app.post("/mcp", async (req: McpRequest, res: JsonResponse) => {
  const server = createSupportAiMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      });
    }
  }
});

app.get("/mcp", (_req: McpRequest, res: JsonResponse) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed. Use POST /mcp for MCP requests."
    },
    id: null
  });
});

app.delete("/mcp", (_req: McpRequest, res: JsonResponse) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  });
});

app.listen(port, (error?: Error) => {
  if (error) {
    console.error("Failed to start MCP HTTP server:", error);
    process.exit(1);
  }

  console.log(`Support AI Care Signal MCP listening at http://localhost:${port}/mcp`);
});
