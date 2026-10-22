/**
 * Bộ công cụ quản lý Truyện cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  StoryCategoriesResponse,
  StoryDetail,
  StoryShortDescriptionResponse,
  StorySummary,
  StorySummaryResponse,
} from '../types.js';

export function registerStoryTools(server: McpServer): void {
  // 1. Danh sách truyện
  server.tool(
    'story_list',
    'Tìm kiếm, lọc và phân trang danh sách truyện trong hệ thống.',
    {
      search: z.string().max(100).optional().describe('Từ khóa tìm kiếm tiêu đề truyện (tối đa 100 ký tự)'),
      status: z.enum(['draft', 'published', 'archived']).optional().describe('Trạng thái truyện'),
      category_id: z.number().int().positive().optional().describe('ID thể loại cần lọc'),
      per_page: z.number().int().positive().max(50).optional().describe('Số lượng kết quả trên mỗi trang (mặc định 20, tối đa 50)'),
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
    'Lấy thông tin chi tiết một truyện kèm chỉ số thống kê chữ (mặc định tóm tắt/mô tả là null để tiết kiệm token; dùng include_text để lấy toàn văn).',
    {
      id: z.number().int().positive().describe('ID của truyện cần xem'),
      include_text: z.boolean().optional().describe('Lấy toàn văn cả tóm tắt và mô tả ngắn'),
      include_summary: z.boolean().optional().describe('Lấy toàn văn tóm tắt nội dung'),
      include_short_description: z.boolean().optional().describe('Lấy toàn văn mô tả ngắn'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<StoryDetail>(`stories/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Lấy toàn văn tóm tắt truyện kèm thống kê
  server.tool(
    'story_get_summary',
    'Lấy riêng toàn văn tóm tắt nội dung của truyện kèm thống kê số từ, ký tự và câu.',
    {
      id: z.number().int().positive().describe('ID của truyện cần lấy tóm tắt'),
    },
    async ({ id }) => {
      const res = await apiClient.get<StorySummaryResponse>(`stories/${id}/summary`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Lấy toàn văn mô tả ngắn truyện kèm thống kê
  server.tool(
    'story_get_short_description',
    'Lấy riêng toàn văn phần mô tả ngắn của truyện kèm thống kê số từ, ký tự và câu.',
    {
      id: z.number().int().positive().describe('ID của truyện cần lấy mô tả ngắn'),
    },
    async ({ id }) => {
      const res = await apiClient.get<StoryShortDescriptionResponse>(`stories/${id}/short-description`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Tạo truyện mới
  server.tool(
    'story_create',
    'Tạo truyện mới ở trạng thái nháp (draft), tự sinh slug.',
    {
      title: z.string().min(1).max(255).describe('Tiêu đề truyện (tối đa 255 ký tự)'),
      user_id: z.number().int().positive().optional().describe('ID tài khoản người tạo/sở hữu truyện (tùy chọn)'),
    },
    async ({ title, user_id }) => {
      const payload = { title, user_id };
      const res = await apiClient.post<StoryDetail>('stories', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Cập nhật truyện tổng thể
  server.tool(
    'story_update',
    'Cập nhật thông tin tổng thể của truyện (tiêu đề, slug, trạng thái draft/published/archived, mô tả ngắn, tóm tắt, SEO metadata, danh sách ID thể loại).',
    {
      id: z.number().int().positive().describe('ID của truyện cần cập nhật'),
      title: z.string().min(1).max(255).optional().describe('Tiêu đề mới của truyện (1-255 ký tự)'),
      slug: z.string().min(1).max(255).optional().describe('Đường dẫn thân thiện (slug) của truyện (1-255 ký tự, tự động chuẩn hóa)'),
      status: z.enum(['draft', 'published', 'archived']).optional().describe('Trạng thái mới của truyện'),
      short_description: z.string().optional().describe('Mô tả ngắn mới của truyện'),
      summary: z.string().optional().describe('Tóm tắt nội dung mới của truyện'),
      seo_keywords: z.string().max(500).optional().describe('Từ khóa SEO của truyện (tối đa 500 ký tự)'),
      seo_description: z.string().max(1000).optional().describe('Mô tả SEO của truyện (tối đa 1000 ký tự)'),
      category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Danh sách ID thể loại gắn cho truyện (tối đa 50 thể loại)'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<StoryDetail>(`stories/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Cập nhật riêng tóm tắt truyện
  server.tool(
    'story_update_summary',
    'Cập nhật riêng phần tóm tắt nội dung của truyện.',
    {
      id: z.number().int().positive().describe('ID của truyện cần cập nhật tóm tắt'),
      summary: z.string().min(1).describe('Nội dung tóm tắt cốt truyện mới'),
    },
    async ({ id, summary }) => {
      const res = await apiClient.patch<StoryDetail>(`stories/${id}/summary`, { summary });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 8. Cập nhật riêng mô tả ngắn truyện
  server.tool(
    'story_update_short_description',
    'Cập nhật riêng phần mô tả ngắn gọn của truyện.',
    {
      id: z.number().int().positive().describe('ID của truyện cần cập nhật mô tả ngắn'),
      short_description: z.string().min(1).describe('Nội dung mô tả ngắn mới'),
    },
    async ({ id, short_description }) => {
      const res = await apiClient.patch<StoryDetail>(`stories/${id}/short-description`, { short_description });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 9. Lấy danh sách thể loại của truyện
  server.tool(
    'story_get_categories',
    'Lấy danh sách các thể loại đang được liên kết với truyện.',
    {
      id: z.number().int().positive().describe('ID của truyện cần xem thể loại'),
    },
    async ({ id }) => {
      const res = await apiClient.get<StoryCategoriesResponse>(`stories/${id}/categories`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 10. Gán thêm thể loại vào truyện
  server.tool(
    'story_attach_categories',
    'Gán thêm một hoặc nhiều thể loại vào truyện (không làm mất thể loại hiện có). Cần cung cấp category_ids hoặc category_id.',
    {
      id: z.number().int().positive().describe('ID của truyện cần gán thể loại'),
      category_ids: z.array(z.number().int().positive()).max(50).optional().describe('Danh sách ID thể loại cần gán thêm (tối đa 50 thể loại)'),
      category_id: z.number().int().positive().optional().describe('ID thể loại đơn lẻ cần gán thêm'),
    },
    async ({ id, category_ids, category_id }) => {
      const payload = { category_ids, category_id };
      const res = await apiClient.post<StoryCategoriesResponse>(`stories/${id}/categories`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 11. Đồng bộ thể loại của truyện
  server.tool(
    'story_sync_categories',
    'Đồng bộ toàn bộ danh sách thể loại của truyện (thay thế toàn bộ thể loại hiện có bằng danh sách mới; truyền mảng rỗng để gỡ hết thể loại).',
    {
      id: z.number().int().positive().describe('ID của truyện cần đồng bộ thể loại'),
      category_ids: z.array(z.number().int().positive()).max(50).describe('Danh sách ID thể loại mới của truyện (tối đa 50 thể loại)'),
    },
    async ({ id, category_ids }) => {
      const res = await apiClient.put<StoryCategoriesResponse>(`stories/${id}/categories`, { category_ids });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 12. Gỡ bỏ một thể loại khỏi truyện
  server.tool(
    'story_detach_category',
    'Gỡ bỏ một thể loại cụ thể ra khỏi truyện.',
    {
      id: z.number().int().positive().describe('ID của truyện'),
      category_id: z.number().int().positive().describe('ID thể loại cần gỡ bỏ khỏi truyện'),
    },
    async ({ id, category_id }) => {
      const res = await apiClient.delete<StoryCategoriesResponse>(`stories/${id}/categories/${category_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
