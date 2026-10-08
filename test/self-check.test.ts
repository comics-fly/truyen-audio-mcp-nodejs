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

  // Kiểm tra 23 công cụ đã được đăng ký
  const registeredToolNames = Object.keys(
    (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools || {}
  );
  const expectedTools = [
    'story_list',
    'story_get',
    'story_get_summary',
    'story_get_short_description',
    'story_create',
    'story_update',
    'story_update_summary',
    'story_update_short_description',
    'chapter_list_by_story',
    'chapter_create',
    'chapter_batch_summaries',
    'chapter_get',
    'chapter_update',
    'chapter_schedule',
    'chapter_get_summary',
    'chapter_get_content',
    'chapter_update_summary',
    'chapter_update_content',
    'chapter_context_summary',
    'category_list',
    'category_get',
    'category_create',
    'category_update',
  ];

  for (const name of expectedTools) {
    assert.ok(registeredToolNames.includes(name), `Thiếu tool: ${name}`);
  }
  assert.equal(registeredToolNames.length, 23);
});

test('Validation schema của các tools phản ánh đúng rule của Laravel backend', () => {
  const server = new McpServer({
    name: 'test-server',
    version: '1.0.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerCategoryTools(server);

  const tools = (server as unknown as { _registeredTools: Record<string, { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }> })._registeredTools;

  // 1. story_list & story_get
  const storyListSchema = tools.story_list.inputSchema;
  assert.equal(storyListSchema.safeParse({ search: 'truyện hay', per_page: 20, category_id: 1 }).success, true);
  assert.equal(storyListSchema.safeParse({ per_page: 100 }).success, false, 'per_page max là 50');
  assert.equal(storyListSchema.safeParse({ search: 'a'.repeat(101) }).success, false, 'search max 100');

  const storyGetSchema = tools.story_get.inputSchema;
  assert.equal(storyGetSchema.safeParse({ id: 1, include_text: true, include_summary: true }).success, true);

  // 2. story_get_summary & story_get_short_description
  assert.equal(tools.story_get_summary.inputSchema.safeParse({ id: 1 }).success, true);
  assert.equal(tools.story_get_summary.inputSchema.safeParse({ id: 0 }).success, false);
  assert.equal(tools.story_get_short_description.inputSchema.safeParse({ id: 2 }).success, true);

  // 3. story_create & update
  const storyCreateSchema = tools.story_create.inputSchema;
  assert.equal(storyCreateSchema.safeParse({ title: 'Truyện mới', user_id: 2 }).success, true);
  assert.equal(storyCreateSchema.safeParse({ title: '' }).success, false, 'title không được rỗng');

  const storySummarySchema = tools.story_update_summary.inputSchema;
  assert.equal(storySummarySchema.safeParse({ id: 1, summary: 'Tóm tắt mới' }).success, true);
  assert.equal(storySummarySchema.safeParse({ id: 1, summary: '' }).success, false);

  const storyShortDescSchema = tools.story_update_short_description.inputSchema;
  assert.equal(storyShortDescSchema.safeParse({ id: 1, short_description: 'Mô tả ngắn' }).success, true);
  assert.equal(storyShortDescSchema.safeParse({ id: 1, short_description: '' }).success, false);

  // 4. chapter_list_by_story
  const chapterListSchema = tools.chapter_list_by_story.inputSchema;
  assert.equal(chapterListSchema.safeParse({ story_id: 1, status: 'scheduled', direction: 'desc', per_page: 50 }).success, true);
  assert.equal(chapterListSchema.safeParse({ story_id: 1, per_page: 51 }).success, false, 'per_page max 50');

  // 5. chapter_create & update
  const chapterCreateSchema = tools.chapter_create.inputSchema;
  assert.equal(chapterCreateSchema.safeParse({
    story_id: 1,
    chapter_number: 10,
    title: 'Chương 10',
    slug: 'chuong-10',
    status: 'scheduled',
    scheduled_publish_at: '2026-10-10T08:00:00Z',
    content: 'Nội dung',
    summary: 'Tóm tắt',
    is_locked: true,
    unlock_price: 50,
  }).success, true);
  assert.equal(chapterCreateSchema.safeParse({ story_id: 1, unlock_price: -5 }).success, false, 'unlock_price >= 0');

  // 6. chapter_schedule
  const chapterScheduleSchema = tools.chapter_schedule.inputSchema;
  assert.equal(chapterScheduleSchema.safeParse({ id: 1, scheduled_publish_at: '2026-10-15T00:00:00Z' }).success, true);
  assert.equal(chapterScheduleSchema.safeParse({ id: 1, scheduled_publish_at: '' }).success, false);

  // 7. chapter_get_summary & chapter_get_content
  assert.equal(tools.chapter_get_summary.inputSchema.safeParse({ id: 5 }).success, true);
  assert.equal(tools.chapter_get_content.inputSchema.safeParse({ id: 5 }).success, true);

  // 8. chapter_update
  const chapterUpdateSchema = tools.chapter_update.inputSchema;
  assert.equal(chapterUpdateSchema.safeParse({ id: 1, chapter_number: 5, status: 'scheduled', unlock_price: 10 }).success, true);

  // 9. category_create & update
  const categoryCreateSchema = tools.category_create.inputSchema;
  assert.equal(categoryCreateSchema.safeParse({
    name: 'Tiên Hiệp',
    slug: 'tien-hiep',
    seo_keywords: 'tien hiep',
    seo_description: 'Mo ta',
    note: 'Ghi chu',
  }).success, true);
  assert.equal(categoryCreateSchema.safeParse({ name: '' }).success, false, 'name không được rỗng');
});
