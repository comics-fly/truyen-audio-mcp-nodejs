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
      search: z.string().optional().describe('Từ khóa tìm kiếm tên thể loại'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng thể loại trên mỗi trang'),
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
      name: z.string().min(1).describe('Tên thể loại'),
      slug: z.string().optional().describe('Đường dẫn tĩnh slug (nếu không cung cấp hệ thống sẽ tự sinh)'),
      image: z.string().optional().describe('URL ảnh đại diện thể loại'),
      seo_keywords: z.string().optional().describe('Từ khóa SEO'),
      seo_description: z.string().optional().describe('Mô tả SEO'),
      note: z.string().optional().describe('Ghi chú nội bộ về thể loại'),
    },
    async ({ name, slug, image, seo_keywords, seo_description, note }) => {
      const meta = image || seo_keywords || seo_description || note
        ? { image, seo_keywords, seo_description, note }
        : undefined;

      const payload = { name, slug, meta };
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
      name: z.string().optional().describe('Tên thể loại mới'),
      slug: z.string().optional().describe('Slug mới'),
      image: z.string().optional().describe('URL ảnh đại diện mới'),
      seo_keywords: z.string().optional().describe('Từ khóa SEO mới'),
      seo_description: z.string().optional().describe('Mô tả SEO mới'),
      note: z.string().optional().describe('Ghi chú mới'),
    },
    async ({ id, name, slug, image, seo_keywords, seo_description, note }) => {
      const meta = image !== undefined || seo_keywords !== undefined || seo_description !== undefined || note !== undefined
        ? { image, seo_keywords, seo_description, note }
        : undefined;

      const payload = { name, slug, meta };
      const res = await apiClient.patch<CategoryDetail>(`categories/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
