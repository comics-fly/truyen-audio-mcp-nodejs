/**
 * Bộ công cụ quản lý Truyện cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type { StoryDetail, StorySummary } from '../types.js';

const storyStatusEnum = z.enum(['draft', 'ongoing', 'completed', 'paused', 'scheduled']);
const textModeEnum = z.enum(['full', 'minimal', 'none']);

export function registerStoryTools(server: McpServer): void {
  // 1. Danh sách truyện
  server.tool(
    'story_list',
    'Tìm kiếm, lọc và phân trang danh sách truyện trong hệ thống (hỗ trợ lọc cột fields để tiết kiệm token).',
    {
      search: z.string().max(100).optional().describe('Từ khóa tìm kiếm tiêu đề truyện (tối đa 100 ký tự)'),
      status: storyStatusEnum.optional().describe('Trạng thái truyện (draft, ongoing, completed, paused, scheduled)'),
      category_id: z.number().int().positive().optional().describe('ID thể loại cần lọc'),
      per_page: z.number().int().positive().max(50).optional().describe('Số lượng kết quả trên mỗi trang (mặc định 20, tối đa 50)'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách các trường cần lấy (Sparse Fieldsets, e.g. "id,title,status")'),
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
    'Lấy thông tin chi tiết một truyện (mặc định summary/short_description ở dạng minimal để tiết kiệm token; dùng summary=full hoặc short_description=full để lấy toàn văn).',
    {
      id: z.number().int().positive().describe('ID của truyện cần xem'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách các trường cần lấy (Sparse Fieldsets, e.g. "id,title,categories")'),
      summary: textModeEnum.optional().describe('Chế độ nạp tóm tắt: full (toàn văn), minimal (chỉ stats, mặc định), none (bỏ qua)'),
      short_description: textModeEnum.optional().describe('Chế độ nạp mô tả ngắn: full (toàn văn), minimal (chỉ stats, mặc định), none (bỏ qua)'),
      include_text: z.boolean().optional().describe('Lấy toàn văn cả tóm tắt và mô tả ngắn (tương đương summary=full&short_description=full)'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<StoryDetail>(`stories/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Tạo truyện mới
  server.tool(
    'story_create',
    'Tạo truyện mới (mặc định trạng thái draft, tự sinh slug, hỗ trợ hẹn giờ đăng và gán thể loại).',
    {
      title: z.string().min(1).max(255).describe('Tiêu đề truyện (1-255 ký tự)'),
      slug: z.string().min(1).max(255).optional().describe('Slug đường dẫn tĩnh (tùy chọn, tự sinh duy nhất nếu để trống)'),
      status: storyStatusEnum.optional().describe('Trạng thái truyện (mặc định draft)'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn xuất bản truyện (ISO 8601, bắt buộc sau hiện tại nếu status là scheduled)'),
      summary: z.string().optional().describe('Toàn văn tóm tắt cốt truyện'),
      short_description: z.string().optional().describe('Mô tả ngắn gọn giới thiệu truyện'),
      seo_keywords: z.string().max(500).optional().describe('Từ khóa SEO (tối đa 500 ký tự)'),
      seo_description: z.string().max(1000).optional().describe('Mô tả SEO (tối đa 1000 ký tự)'),
      category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Danh sách ID thể loại gắn cho truyện (tối đa 50 thể loại)'),
      category_id: z.number().int().positive().optional().describe('ID thể loại đơn lẻ (nếu chỉ gắn 1 thể loại)'),
      user_id: z.number().int().positive().optional().describe('ID tài khoản người tạo/sở hữu truyện (chỉ tài khoản Root được chỉ định)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi tạo'),
    },
    async (payload) => {
      const res = await apiClient.post<StoryDetail>('stories', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Cập nhật truyện tổng thể
  server.tool(
    'story_update',
    'Cập nhật thông tin truyện (tiêu đề, slug, trạng thái, hẹn giờ đăng, tóm tắt, mô tả ngắn, SEO, đồng bộ/thêm/gỡ thể loại).',
    {
      id: z.number().int().positive().describe('ID của truyện cần cập nhật'),
      title: z.string().min(1).max(255).optional().describe('Tiêu đề mới của truyện (1-255 ký tự)'),
      slug: z.string().min(1).max(255).optional().describe('Đường dẫn thân thiện (slug) mới của truyện (1-255 ký tự)'),
      status: storyStatusEnum.optional().describe('Trạng thái mới của truyện (draft, ongoing, completed, paused, scheduled)'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn giờ đăng truyện (ISO 8601, bắt buộc sau hiện tại nếu status là scheduled)'),
      summary: z.string().optional().describe('Tóm tắt cốt truyện mới'),
      short_description: z.string().optional().describe('Mô tả ngắn gọn mới của truyện'),
      seo_keywords: z.string().max(500).optional().describe('Từ khóa SEO của truyện (tối đa 500 ký tự)'),
      seo_description: z.string().max(1000).optional().describe('Mô tả SEO của truyện (tối đa 1000 ký tự)'),
      category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Đồng bộ toàn bộ danh sách thể loại (thay thế hết, truyền mảng rỗng để gỡ toàn bộ thể loại)'),
      category_id: z.number().int().positive().optional().describe('ID thể loại thay thế (khi chỉ có 1 thể loại)'),
      add_category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Gán thêm một hoặc nhiều thể loại vào truyện'),
      add_category_id: z.number().int().positive().optional().describe('ID một thể loại đơn lẻ cần gán thêm'),
      remove_category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Gỡ bỏ một hoặc nhiều thể loại khỏi truyện'),
      remove_category_id: z.number().int().positive().optional().describe('ID một thể loại đơn lẻ cần gỡ bỏ khỏi truyện'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi cập nhật'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<StoryDetail>(`stories/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
