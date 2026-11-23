/**
 * Bộ công cụ quản lý Luồng Kiểm Tra & Đánh Dấu (Audit & Freshness Feeds) cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type { AuditFeedItem, AuditMarkResult, AuditStats } from '../types.js';

const auditFeedTypeEnum = z.enum([
  'new_stories',
  'stories_with_new_chapters',
  'new_chapters',
  'new_audios',
  'modified',
  'unchecked',
]);

const auditMarkStatusEnum = z.enum(['approved', 'rejected', 'needs_recheck']);

export function registerAuditTools(server: McpServer): void {
  // 1. Luồng feed kiểm tra nội dung mới/chưa kiểm tra
  server.tool(
    'audit_feed',
    'Lấy stream feed các nội dung mới ra hoặc chưa kiểm tra theo loại yêu cầu (new_stories, stories_with_new_chapters, new_chapters, new_audios, modified, unchecked).',
    {
      type: auditFeedTypeEnum.optional().describe('Loại feed: new_stories | stories_with_new_chapters | new_chapters (mặc định) | new_audios | modified | unchecked'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng item mỗi trang (mặc định 20, tối đa 100)'),
      from_date: z.string().optional().describe('Lọc từ thời điểm này (YYYY-MM-DD)'),
      to_date: z.string().optional().describe('Lọc đến thời điểm này (YYYY-MM-DD)'),
      story_id: z.number().int().positive().optional().describe('Lọc feed theo ID truyện'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async ({ ...params }) => {
      const res = await apiClient.get<AuditFeedItem[]>('audit/feed', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Đánh dấu kết quả kiểm tra cho chapter/story
  server.tool(
    'audit_mark',
    'Đánh dấu kết quả kiểm tra (Audit Marking) cho chương hoặc truyện (status: approved, rejected, needs_recheck).',
    {
      target_type: z.enum(['chapter', 'story']).describe('Loại đối tượng cần đánh dấu: chapter hoặc story'),
      target_id: z.number().int().positive().describe('ID của chương hoặc truyện'),
      status: auditMarkStatusEnum.describe('Kết quả kiểm tra: approved | rejected | needs_recheck'),
      notes: z.string().max(1000).optional().describe('Ghi chú đánh dấu (tối đa 1000 ký tự)'),
      issues: z.array(z.unknown()).optional().describe('Danh sách vấn đề phát hiện'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về'),
    },
    async ({ ...payload }) => {
      const res = await apiClient.post<AuditMarkResult>('audit/mark', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Thống kê tổng hợp các chỉ số kiểm định
  server.tool(
    'audit_stats',
    'Thống kê tổng hợp các chỉ số kiểm định trong ngày/khoảng thời gian (new_stories_today, new_chapters_today, new_audios_today, modified_today, unchecked_total, checked_today).',
    {
      from_date: z.string().optional().describe('Thống kê từ thời điểm này (YYYY-MM-DD)'),
      to_date: z.string().optional().describe('Thống kê đến thời điểm này (YYYY-MM-DD)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async ({ ...params }) => {
      const res = await apiClient.get<AuditStats>('audit/stats', params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
