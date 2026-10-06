/**
 * Kiểm tra tự động (Self-check) sử dụng node:test và node:assert
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpApiClient } from '../src/client.js';
import { config } from '../src/config.js';
import { registerCategoryTools } from '../src/tools/category.tools.js';
import { registerChapterTools } from '../src/tools/chapter.tools.js';
import { registerStoryTools } from '../src/tools/story.tools.js';

test('Cấu hình mặc định của MCP Server', () => {
  assert.equal(config.serverName, 'truyen-audio-mcp');
  assert.equal(config.serverVersion, '1.0.0');
  assert.ok(config.apiUrl.length > 0);
});

test('McpApiClient xử lý URL và format lỗi kết nối chuẩn xác', async () => {
  const client = new McpApiClient('http://test-server.local:8000/mcp/', 'fake-token');
  const res = await client.get('stories', { search: 'Tiên hiệp', page: 2 });

  assert.equal(res.status, 'error');
  assert.equal(res.error_code, 'CLIENT_NETWORK_ERROR');
  assert.match(res.message || '', /Ti%C3%AAn\+hi%E1%BB%87p/);
});

test('Đăng ký đầy đủ toàn bộ các MCP Tools cần thiết', () => {
  const server = new McpServer({
    name: 'test-server',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerCategoryTools(server);

  // Đảm bảo không ném ngoại lệ khi đăng ký các công cụ
  assert.ok(server);
});
