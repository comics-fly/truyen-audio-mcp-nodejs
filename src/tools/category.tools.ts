/**
 * Bộ công cụ quản lý Thể loại truyện cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type { CategoryDetail, CategorySummary } from '../types.js';

export function registerCategoryTools(server: McpServer): void {
  // 1. Danh sách thể loại
  server.tool(
    'category_list',
    'Lấy danh sách các thể loại truyện trong hệ thống (hỗ trợ tìm kiếm, phân trang).',
    {
      search: z.string().max(255).optional().describe('Từ khóa tìm kiếm tên thể loại (tối đa 255 ký tự)'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng thể loại trên mỗi trang (mặc định 20, tối đa 100)'),
      page: z.number().int().positive().optional().describe('Số trang'),
    },
    async (params) => {
      const res = await apiClient.get<CategorySummary[]>('categories', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Chi tiết thể loại
  server.tool(
    'category_get',
    'Lấy thông tin chi tiết của một thể loại truyện kèm metadata SEO và số lượng truyện liên kết.',
    {
      id: z.number().int().positive().describe('ID của thể loại'),
    },
    async ({ id }) => {
      const res = await apiClient.get<CategoryDetail>(`categories/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Tạo thể loại mới
  server.tool(
    'category_create',
    'Thêm thể loại truyện mới vào hệ thống (tự sinh slug duy nhất nếu để trống).',
    {
      name: z.string().min(1).max(255).describe('Tên thể loại (bắt buộc, duy nhất, tối đa 255 ký tự)'),
      slug: z.string().max(255).optional().describe('Đường dẫn tĩnh slug (tùy chọn, duy nhất, tự sinh nếu để trống)'),
      seo_keywords: z.string().max(500).optional().describe('Từ khóa SEO (tối đa 500 ký tự)'),
      seo_description: z.string().max(1000).optional().describe('Mô tả SEO (tối đa 1000 ký tự)'),
      note: z.string().max(1000).optional().describe('Ghi chú nội bộ về thể loại (tối đa 1000 ký tự)'),
    },
    async (payload) => {
      const res = await apiClient.post<CategoryDetail>('categories', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Cập nhật thể loại
  server.tool(
    'category_update',
    'Cập nhật thông tin tên, slug, ghi chú hoặc SEO của thể loại truyện.',
    {
      id: z.number().int().positive().describe('ID của thể loại cần sửa'),
      name: z.string().min(1).max(255).optional().describe('Tên thể loại mới (tối đa 255 ký tự)'),
      slug: z.string().max(255).optional().describe('Slug mới (tối đa 255 ký tự)'),
      seo_keywords: z.string().max(500).optional().describe('Từ khóa SEO mới (tối đa 500 ký tự)'),
      seo_description: z.string().max(1000).optional().describe('Mô tả SEO mới (tối đa 1000 ký tự)'),
      note: z.string().max(1000).optional().describe('Ghi chú mới (tối đa 1000 ký tự)'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<CategoryDetail>(`categories/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
