/**
 * Điểm khởi chạy chính của Truyen Audio MCP Server
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { apiClient } from './client.js';
import { config } from './config.js';
import { registerCategoryTools } from './tools/category.tools.js';
import { registerChapterTools } from './tools/chapter.tools.js';
import { registerStoryTools } from './tools/story.tools.js';

// Khởi tạo máy chủ MCP
const server = new McpServer({
  name: config.serverName,
  version: config.serverVersion,
});

// Tool kiểm tra trạng thái và thông tin dịch vụ
server.tool(
  'mcp_info',
  'Kiểm tra kết nối và thông tin phiên bản của hệ thống Laravel MCP backend.',
  {},
  async () => {
    const res = await apiClient.get<{ status: string; service: string; version: string }>('info');
    return {
      content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
    };
  }
);

// Đăng ký toàn bộ các nhóm công cụ
registerStoryTools(server);
registerChapterTools(server);
registerCategoryTools(server);

// ponytail: stdio transport là chuẩn kết nối MCP cho AI agent cục bộ, nâng cấp SSE khi cần deploy remote
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${config.serverName}] MCP Server đang chạy qua stdio...`);
}

main().catch((error) => {
  console.error(`[${config.serverName}] Khởi động thất bại:`, error);
  process.exit(1);
});
