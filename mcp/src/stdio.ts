import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSupportAiMcpServer } from "./server.js";

async function main() {
  const server = createSupportAiMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Support AI Care Signal MCP running on stdio.");
}

main().catch((error) => {
  console.error("MCP stdio server failed:", error);
  process.exit(1);
});
