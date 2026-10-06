/**
 * Bộ công cụ quản lý Truyện cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type { StoryDetail, StorySummary } from '../types.js';

export function registerStoryTools(server: McpServer): void {
  // 1. Danh sách truyện
  server.tool(
    'story_list',
    'Tìm kiếm, lọc và phân trang danh sách truyện trong hệ thống.',
    {
      search: z.string().optional().describe('Từ khóa tìm kiếm tiêu đề truyện hoặc tác giả'),
      status: z.enum(['draft', 'published', 'archived']).optional().describe('Trạng thái truyện'),
      category: z.string().optional().describe('Slug hoặc tên thể loại cần lọc'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng kết quả trên mỗi trang (mặc định 20)'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
    },
    async (params) => {
      const res = await apiClient.get<StorySummary[]>('stories', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Chi tiết truyện
  server.tool(
    'story_get',
    'Lấy thông tin chi tiết một truyện bao gồm mô tả ngắn, tóm tắt và metadata.',
    {
      id: z.number().int().positive().describe('ID của truyện cần xem'),
    },
    async ({ id }) => {
      const res = await apiClient.get<StoryDetail>(`stories/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Tạo truyện mới
  server.tool(
    'story_create',
    'Tạo truyện mới ở trạng thái nháp (draft), tự sinh slug và liên kết thể loại.',
    {
      title: z.string().min(1).describe('Tiêu đề truyện'),
      categories: z.array(z.number().int()).optional().describe('Danh sách ID thể loại'),
      short_description: z.string().optional().describe('Mô tả ngắn của truyện'),
      summary: z.string().optional().describe('Tóm tắt nội dung cốt truyện'),
      seo_keywords: z.string().optional().describe('Từ khóa SEO'),
      seo_description: z.string().optional().describe('Mô tả SEO'),
    },
    async ({ title, categories, short_description, summary, seo_keywords, seo_description }) => {
      const payload = {
        title,
        categories,
        short_description,
        summary,
        meta: seo_keywords || seo_description ? { seo_keywords, seo_description } : undefined,
      };
      const res = await apiClient.post<StoryDetail>('stories', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Cập nhật truyện
  server.tool(
    'story_update',
    'Cập nhật trạng thái (draft/published/archived), mô tả ngắn hoặc tóm tắt của truyện.',
    {
      id: z.number().int().positive().describe('ID của truyện cần cập nhật'),
      status: z.enum(['draft', 'published', 'archived']).optional().describe('Trạng thái mới'),
      short_description: z.string().optional().describe('Mô tả ngắn mới'),
      summary: z.string().optional().describe('Tóm tắt nội dung mới'),
    },
    async ({ id, status, short_description, summary }) => {
      const payload = { status, short_description, summary };
      const res = await apiClient.patch<StoryDetail>(`stories/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
