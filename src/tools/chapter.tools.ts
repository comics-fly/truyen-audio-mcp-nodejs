/**
 * Bộ công cụ quản lý Chapter & Context Window cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type { ChapterDetail, ChapterItem, ChapterSummaryItem, ContextWindowResult } from '../types.js';

export function registerChapterTools(server: McpServer): void {
  // 1. Danh sách chapter theo truyện
  server.tool(
    'chapter_list_by_story',
    'Lấy danh sách các chương của một truyện (hỗ trợ phân trang, lọc trạng thái, sắp xếp).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      search: z.string().optional().describe('Từ khóa tìm kiếm tiêu đề chương'),
      status: z.enum(['draft', 'published', 'hidden']).optional().describe('Trạng thái chương'),
      order_by: z.enum(['asc', 'desc']).optional().describe('Thứ tự sắp xếp theo số thứ tự chương (asc/desc)'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng chương trên mỗi trang'),
      page: z.number().int().positive().optional().describe('Số trang'),
    },
    async ({ story_id, ...params }) => {
      const res = await apiClient.get<ChapterItem[]>(`stories/${story_id}/chapters`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Thêm chapter mới cho truyện
  server.tool(
    'chapter_create',
    'Tạo chương mới cho một truyện (tự động tăng số thứ tự chương nếu không chỉ định).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      title: z.string().min(1).describe('Tiêu đề chương'),
      content: z.string().optional().describe('Toàn văn nội dung chương'),
      summary: z.string().optional().describe('Tóm tắt nội dung cốt truyện của chương'),
      is_locked: z.boolean().optional().describe('Khóa chương yêu cầu trả phí'),
      unlock_price: z.number().int().nonnegative().optional().describe('Giá mở khóa chương (xu)'),
    },
    async ({ story_id, title, content, summary, is_locked, unlock_price }) => {
      const payload = {
        title,
        content,
        summary,
        meta: is_locked !== undefined || unlock_price !== undefined ? { is_locked, unlock_price } : undefined,
      };
      const res = await apiClient.post<ChapterDetail>(`stories/${story_id}/chapters`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Lấy tóm tắt hàng loạt chương trong truyện
  server.tool(
    'chapter_batch_summaries',
    'Lấy tóm tắt nội dung của nhiều chương cùng lúc theo danh sách ID hoặc số thứ tự chương (tối đa 20 chương).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      chapter_ids: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách ID chương'),
      chapter_numbers: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách số thứ tự chương'),
    },
    async ({ story_id, chapter_ids, chapter_numbers }) => {
      const payload = { chapter_ids, chapter_numbers };
      const res = await apiClient.post<ChapterSummaryItem[]>(`stories/${story_id}/chapters/batch-summaries`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Chi tiết một chapter
  server.tool(
    'chapter_get',
    'Lấy chi tiết toàn bộ thông tin của chương bao gồm nội dung văn bản, tóm tắt và trạng thái khóa.',
    {
      id: z.number().int().positive().describe('ID của chương'),
    },
    async ({ id }) => {
      const res = await apiClient.get<ChapterDetail>(`chapters/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Cập nhật chapter tổng thể
  server.tool(
    'chapter_update',
    'Cập nhật trạng thái (draft/published/hidden), tóm tắt hoặc nội dung chương.',
    {
      id: z.number().int().positive().describe('ID của chương'),
      status: z.enum(['draft', 'published', 'hidden']).optional().describe('Trạng thái mới của chương'),
      summary: z.string().optional().describe('Tóm tắt mới của chương'),
      content: z.string().optional().describe('Nội dung văn bản mới của chương'),
    },
    async ({ id, status, summary, content }) => {
      const payload = { status, summary, content };
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Cập nhật nhanh tóm tắt chapter
  server.tool(
    'chapter_update_summary',
    'Cập nhật tóm tắt nội dung ngắn gọn của chương phục vụ phân tích ngữ cảnh LLM.',
    {
      id: z.number().int().positive().describe('ID của chương'),
      summary: z.string().describe('Nội dung tóm tắt mới của chương'),
    },
    async ({ id, summary }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}/summary`, { summary });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Cập nhật nhanh nội dung chapter
  server.tool(
    'chapter_update_content',
    'Cập nhật toàn văn nội dung của chương.',
    {
      id: z.number().int().positive().describe('ID của chương'),
      content: z.string().describe('Toàn văn nội dung chương mới'),
    },
    async ({ id, content }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}/content`, { content });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 8. Cửa sổ ngữ cảnh tóm tắt (Context Window)
  server.tool(
    'chapter_context_summary',
    'Lấy cửa sổ ngữ cảnh tóm tắt các chương liền trước và liền sau một chương chỉ định để Agent theo dõi mạch truyện.',
    {
      id: z.number().int().positive().describe('ID của chương trung tâm'),
      before: z.number().int().min(0).max(10).optional().describe('Số lượng chương liền trước cần lấy tóm tắt (mặc định 3, tối đa 10)'),
      after: z.number().int().min(0).max(10).optional().describe('Số lượng chương liền sau cần lấy tóm tắt (mặc định 3, tối đa 10)'),
    },
    async ({ id, before, after }) => {
      const res = await apiClient.get<ContextWindowResult>(`chapters/${id}/context-summary`, { before, after });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
