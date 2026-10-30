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
import { registerCommentTools } from '../src/tools/comment.tools.js';
import { registerPostSocialTools } from '../src/tools/post_social.tools.js';
import { registerShortVideoTools } from '../src/tools/short_video.tools.js';
import { registerStoryTools } from '../src/tools/story.tools.js';

test('Cấu hình mặc định của MCP Server', () => {
  assert.equal(config.serverName, 'truyen-audio-mcp');
  assert.equal(config.serverVersion, '1.0.0');
  assert.ok(config.apiUrl.length > 0);
});

test('McpApiClient xử lý URL, array params và format lỗi kết nối chuẩn xác', async () => {
  const client = new McpApiClient('http://test-server.local:8000/mcp/', 'fake-token');
  const res = await client.get('stories', {
    search: 'Tiên hiệp',
    page: 2,
    fields: ['id', 'title'],
  });

  assert.equal(res.status, 'error');
  assert.equal(res.error_code, 'CLIENT_NETWORK_ERROR');
  assert.match(res.message || '', /Ti%C3%AAn\+hi%E1%BB%87p/);
  assert.match(res.message || '', /fields=id%2Ctitle/);
});

test('Đăng ký đầy đủ toàn bộ 33 domain tools của hệ thống MCP', () => {
  const server = new McpServer({
    name: 'test-server',
    version: '1.5.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerCategoryTools(server);
  registerCommentTools(server);
  registerPostSocialTools(server);
  registerShortVideoTools(server);

  // Đảm bảo không ném ngoại lệ khi đăng ký các công cụ
  assert.ok(server);

  // Kiểm tra 33 công cụ đã được đăng ký
  const registeredToolNames = Object.keys(
    (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools || {}
  );
  const expectedTools = [
    // Story (4 tools)
    'story_list',
    'story_get',
    'story_create',
    'story_update',
    // Chapter (6 tools)
    'chapter_list_by_story',
    'chapter_create',
    'chapter_batch_summaries',
    'chapter_get',
    'chapter_update',
    'chapter_context_summary',
    // Category (4 tools)
    'category_list',
    'category_get',
    'category_create',
    'category_update',
    // Comment (5 tools)
    'comment_list',
    'comment_get',
    'comment_create',
    'comment_update',
    'comment_delete',
    // Post Socials (7 tools)
    'post_social_list',
    'post_social_get',
    'post_social_create',
    'post_social_update',
    'post_social_delete',
    'post_social_add_link',
    'post_social_delete_link',
    // Short Videos (7 tools)
    'short_video_list',
    'short_video_get',
    'short_video_create',
    'short_video_update',
    'short_video_delete',
    'short_video_add_link',
    'short_video_delete_link',
  ];

  for (const name of expectedTools) {
    assert.ok(registeredToolNames.includes(name), `Thiếu tool: ${name}`);
  }
  assert.equal(registeredToolNames.length, 33);
});

test('Validation schema của các tools phản ánh đúng rule của Laravel backend', () => {
  const server = new McpServer({
    name: 'test-server',
    version: '1.5.0',
  });

  registerStoryTools(server);
  registerChapterTools(server);
  registerCategoryTools(server);
  registerCommentTools(server);
  registerPostSocialTools(server);
  registerShortVideoTools(server);

  const tools = (
    server as unknown as {
      _registeredTools: Record<
        string,
        { inputSchema: { safeParse: (val: unknown) => { success: boolean } } }
      >;
    }
  )._registeredTools;

  // 1. story_list & story_get
  const storyListSchema = tools.story_list.inputSchema;
  assert.equal(
    storyListSchema.safeParse({ search: 'truyện hay', per_page: 20, category_id: 1, status: 'ongoing', fields: 'id,title' }).success,
    true
  );
  assert.equal(storyListSchema.safeParse({ per_page: 100 }).success, false, 'per_page max là 50');
  assert.equal(storyListSchema.safeParse({ search: 'a'.repeat(101) }).success, false, 'search max 100');

  const storyGetSchema = tools.story_get.inputSchema;
  assert.equal(
    storyGetSchema.safeParse({ id: 1, summary: 'full', short_description: 'minimal', fields: ['id', 'title'] }).success,
    true
  );
  assert.equal(storyGetSchema.safeParse({ id: 0 }).success, false, 'id phải dương');

  // 2. story_create & story_update
  const storyCreateSchema = tools.story_create.inputSchema;
  assert.equal(
    storyCreateSchema.safeParse({
      title: 'Truyện mới',
      status: 'scheduled',
      scheduled_publish_at: '2026-11-01T08:00:00Z',
      category_ids: [1, 2],
      user_id: 2,
    }).success,
    true
  );
  assert.equal(storyCreateSchema.safeParse({ title: '' }).success, false, 'title không được rỗng');

  const storyUpdateSchema = tools.story_update.inputSchema;
  assert.equal(
    storyUpdateSchema.safeParse({
      id: 1,
      title: 'Tiêu đề cập nhật',
      slug: 'tieu-de-cap-nhat',
      status: 'ongoing',
      scheduled_publish_at: '2026-11-01T08:00:00Z',
      summary: 'Tóm tắt nội dung',
      short_description: 'Mô tả ngắn',
      seo_keywords: 'tien hiep, truyen audio',
      seo_description: 'Mo ta SEO truyen audio',
      category_ids: [1, 2, 3],
      add_category_ids: [4],
      remove_category_ids: [1],
      fields: 'id,title,status',
    }).success,
    true
  );
  assert.equal(storyUpdateSchema.safeParse({ id: 1, title: '' }).success, false, 'title không được rỗng');
  assert.equal(storyUpdateSchema.safeParse({ id: 1, category_ids: Array.from({ length: 51 }, (_, i) => i + 1) }).success, false, 'max 50 category_ids');

  // 3. chapter_list_by_story & chapter_create
  const chapterListSchema = tools.chapter_list_by_story.inputSchema;
  assert.equal(
    chapterListSchema.safeParse({ story_id: 1, status: 'scheduled', direction: 'desc', per_page: 50, fields: ['id', 'title'] }).success,
    true
  );
  assert.equal(chapterListSchema.safeParse({ story_id: 1, per_page: 51 }).success, false, 'per_page max 50');

  const chapterCreateSchema = tools.chapter_create.inputSchema;
  assert.equal(
    chapterCreateSchema.safeParse({
      story_id: 1,
      chapter_number: 10,
      title: 'Chương 10',
      slug: 'chuong-10',
      status: 'scheduled',
      scheduled_publish_at: '2026-10-30T08:00:00Z',
      content: 'Nội dung',
      summary: 'Tóm tắt',
      is_locked: true,
      unlock_price: 50,
      fields: 'id,title',
    }).success,
    true
  );
  assert.equal(chapterCreateSchema.safeParse({ story_id: 1, unlock_price: -5 }).success, false, 'unlock_price >= 0');

  // 4. chapter_batch_summaries
  const chapterBatchSchema = tools.chapter_batch_summaries.inputSchema;
  assert.equal(
    chapterBatchSchema.safeParse({ story_id: 1, chapter_numbers: [1, 2, 3], fields: ['id', 'summary'] }).success,
    true
  );
  assert.equal(
    chapterBatchSchema.safeParse({ chapter_ids: [10, 20] }).success,
    true
  );
  assert.equal(
    chapterBatchSchema.safeParse({ chapter_ids: Array.from({ length: 21 }, (_, i) => i + 1) }).success,
    false,
    'max 20 chapters'
  );

  // 5. chapter_get & chapter_update & chapter_context_summary
  assert.equal(
    tools.chapter_get.inputSchema.safeParse({ id: 5, content: 'full', summary: 'minimal', fields: 'id,content' }).success,
    true
  );
  assert.equal(
    tools.chapter_update.inputSchema.safeParse({ id: 1, chapter_number: 5, status: 'scheduled', unlock_price: 10 }).success,
    true
  );
  assert.equal(
    tools.chapter_context_summary.inputSchema.safeParse({ id: 10, before: 3, after: 3, context: 'full' }).success,
    true
  );

  // 6. category_create & update
  const categoryCreateSchema = tools.category_create.inputSchema;
  assert.equal(
    categoryCreateSchema.safeParse({
      name: 'Tiên Hiệp',
      slug: 'tien-hiep',
      seo_keywords: 'tien hiep',
      seo_description: 'Mo ta',
      note: 'Ghi chu',
    }).success,
    true
  );
  assert.equal(categoryCreateSchema.safeParse({ name: '' }).success, false, 'name không được rỗng');

  // 7. comments (list, get, create, update, delete)
  const commentListSchema = tools.comment_list.inputSchema;
  assert.equal(
    commentListSchema.safeParse({ story_id: 1, parent_id: 0, search: 'truyen hay', per_page: 20, direction: 'desc' }).success,
    true
  );
  assert.equal(commentListSchema.safeParse({ per_page: 51 }).success, false, 'per_page max 50');
  assert.equal(commentListSchema.safeParse({ parent_id: -1 }).success, false, 'parent_id không âm');

  const commentGetSchema = tools.comment_get.inputSchema;
  assert.equal(commentGetSchema.safeParse({ id: 5, fields: ['id', 'content', 'user'] }).success, true);
  assert.equal(commentGetSchema.safeParse({ id: -1 }).success, false);

  const commentCreateSchema = tools.comment_create.inputSchema;
  assert.equal(
    commentCreateSchema.safeParse({ story_id: 1, content: 'Truyện đọc rất cuốn!', parent_id: 10, user_id: 2 }).success,
    true
  );
  assert.equal(
    commentCreateSchema.safeParse({ story_id: 1, content: 'Bình luận cấp 1', parent_id: null }).success,
    true
  );
  assert.equal(commentCreateSchema.safeParse({ story_id: 1, content: 'a' }).success, false, 'content tối thiểu 2 ký tự');
  assert.equal(commentCreateSchema.safeParse({ story_id: 1, content: '   ' }).success, false, 'content toàn khoảng trắng bị từ chối');
  assert.equal(commentCreateSchema.safeParse({ story_id: 1, content: 'a'.repeat(2001) }).success, false, 'content tối đa 2000 ký tự');

  const commentUpdateSchema = tools.comment_update.inputSchema;
  assert.equal(commentUpdateSchema.safeParse({ id: 1, content: 'Cập nhật bình luận' }).success, true);
  assert.equal(commentUpdateSchema.safeParse({ id: 1, content: '' }).success, false);
  assert.equal(commentUpdateSchema.safeParse({ id: 1, content: '   ' }).success, false, 'content không được rỗng sau trim');

  const commentDeleteSchema = tools.comment_delete.inputSchema;
  assert.equal(commentDeleteSchema.safeParse({ id: 1 }).success, true);
  assert.equal(commentDeleteSchema.safeParse({ id: 0 }).success, false);

  // 8. post_socials (list, get, create, update, delete, add_link, delete_link)
  const postSocialListSchema = tools.post_social_list.inputSchema;
  assert.equal(
    postSocialListSchema.safeParse({ story_id: 1, status: 'posted', platform: 'tiktok', per_page: 50, content: 'minimal' }).success,
    true
  );
  assert.equal(postSocialListSchema.safeParse({ per_page: 101 }).success, false, 'per_page max 100');

  const postSocialCreateSchema = tools.post_social_create.inputSchema;
  assert.equal(
    postSocialCreateSchema.safeParse({
      story_id: 1,
      chapter_id: 5,
      content: 'Trích đoạn cực gay cấn',
      image: 'https://example.com/banner.jpg',
      status: 'draft',
      user_id: 1,
    }).success,
    true
  );
  assert.equal(postSocialCreateSchema.safeParse({ story_id: 1, content: '' }).success, false, 'content min 1');

  const postSocialUpdateSchema = tools.post_social_update.inputSchema;
  assert.equal(
    postSocialUpdateSchema.safeParse({ id: 1, content: 'Nội dung trích đoạn mới', status: 'posted', chapter_id: null, image: null }).success,
    true
  );

  const postSocialAddLinkSchema = tools.post_social_add_link.inputSchema;
  assert.equal(
    postSocialAddLinkSchema.safeParse({ id: 1, platform: 'facebook', url: 'https://facebook.com/post/123', user_id: 1 }).success,
    true
  );
  assert.equal(postSocialAddLinkSchema.safeParse({ id: 1, platform: 'facebook', url: 'invalid-url' }).success, false, 'phải đúng định dạng URL');

  assert.equal(tools.post_social_delete.inputSchema.safeParse({ id: 1 }).success, true);
  assert.equal(tools.post_social_delete_link.inputSchema.safeParse({ id: 1, link_id: 2 }).success, true);

  // 9. short_videos (list, get, create, update, delete, add_link, delete_link)
  const shortVideoListSchema = tools.short_video_list.inputSchema;
  assert.equal(
    shortVideoListSchema.safeParse({ story_id: 1, status: 'draft', platform: 'youtube', script: 'full' }).success,
    true
  );

  const shortVideoCreateSchema = tools.short_video_create.inputSchema;
  assert.equal(
    shortVideoCreateSchema.safeParse({
      story_id: 1,
      chapter_id: 3,
      script: 'Kịch bản video ngắn hook 3s đầu...',
      image: 'https://example.com/thumb.jpg',
      video_url: 'https://cdn.example.com/video.mp4',
      status: 'draft',
    }).success,
    true
  );
  assert.equal(shortVideoCreateSchema.safeParse({ story_id: 1, script: '' }).success, false, 'script min 1');

  const shortVideoUpdateSchema = tools.short_video_update.inputSchema;
  assert.equal(
    shortVideoUpdateSchema.safeParse({ id: 1, script: 'Kịch bản mới', video_url: 'https://cdn.com/v.mp4' }).success,
    true
  );
  assert.equal(
    shortVideoUpdateSchema.safeParse({ id: 1, chapter_id: null, image: null, video_url: null }).success,
    true
  );

  const shortVideoAddLinkSchema = tools.short_video_add_link.inputSchema;
  assert.equal(
    shortVideoAddLinkSchema.safeParse({ id: 1, platform: 'tiktok', url: 'https://tiktok.com/@user/video/1' }).success,
    true
  );
  assert.equal(shortVideoAddLinkSchema.safeParse({ id: 1, platform: 'tiktok', url: 'not-url' }).success, false);

  assert.equal(tools.short_video_delete.inputSchema.safeParse({ id: 1 }).success, true);
  assert.equal(tools.short_video_delete_link.inputSchema.safeParse({ id: 1, link_id: 5 }).success, true);
});
