/**
 * Bộ công cụ quản lý Chapter & Context Window cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  ChapterContentResponse,
  ChapterDetail,
  ChapterItem,
  ChapterSummaryItem,
  ChapterSummaryResponse,
  ContextWindowResult,
} from '../types.js';

export function registerChapterTools(server: McpServer): void {
  // 1. Danh sách chapter theo truyện
  server.tool(
    'chapter_list_by_story',
    'Lấy danh sách các chương của một truyện (hỗ trợ phân trang, lọc trạng thái, sắp xếp thứ tự).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      status: z.enum(['draft', 'published', 'hidden', 'scheduled']).optional().describe('Trạng thái chương'),
      direction: z.enum(['asc', 'desc']).optional().describe('Thứ tự sắp xếp theo số chương (asc/desc)'),
      per_page: z.number().int().positive().max(50).optional().describe('Số lượng chương trên mỗi trang (mặc định 20, tối đa 50)'),
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
      chapter_number: z.number().int().min(0).optional().describe('Số thứ tự chương (tùy chọn, tự động tăng nếu để trống)'),
      title: z.string().max(255).optional().describe('Tiêu đề chương (tối đa 255 ký tự)'),
      slug: z.string().max(255).optional().describe('Slug chương (tùy chọn, duy nhất trong truyện)'),
      status: z.enum(['draft', 'published', 'hidden', 'scheduled']).optional().describe('Trạng thái chương'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn xuất bản (ISO 8601, bắt buộc sau hiện tại nếu status là scheduled)'),
      content: z.string().max(500000).optional().describe('Toàn văn nội dung chương (tối đa 500.000 ký tự)'),
      summary: z.string().max(20000).optional().describe('Tóm tắt nội dung cốt truyện của chương (tối đa 20.000 ký tự)'),
      is_locked: z.boolean().optional().describe('Khóa chương yêu cầu trả phí'),
      unlock_price: z.number().int().min(0).optional().describe('Giá mở khóa chương (xu, không âm)'),
    },
    async ({ story_id, ...payload }) => {
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
      chapter_ids: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách ID chương (tối đa 20)'),
      chapter_numbers: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách số thứ tự chương (tối đa 20)'),
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
    'Lấy chi tiết một chương kèm thống kê chữ (mặc định content/summary là null để tiết kiệm token; dùng include_text để lấy toàn văn).',
    {
      id: z.number().int().positive().describe('ID của chương'),
      include_text: z.boolean().optional().describe('Lấy toàn văn cả tóm tắt và nội dung chương'),
      include_summary: z.boolean().optional().describe('Lấy toàn văn tóm tắt chương'),
      include_content: z.boolean().optional().describe('Lấy toàn văn nội dung chương'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<ChapterDetail>(`chapters/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Cập nhật chapter tổng thể
  server.tool(
    'chapter_update',
    'Cập nhật thông tin tổng thể của chương (số chương, tiêu đề, slug, trạng thái, lịch hẹn, tóm tắt, nội dung, khóa/giá).',
    {
      id: z.number().int().positive().describe('ID của chương'),
      chapter_number: z.number().int().min(0).optional().describe('Số thứ tự chương mới'),
      title: z.string().max(255).optional().describe('Tiêu đề chương mới'),
      slug: z.string().max(255).optional().describe('Slug chương mới'),
      status: z.enum(['draft', 'published', 'hidden', 'scheduled']).optional().describe('Trạng thái mới của chương'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn xuất bản mới (ISO 8601)'),
      summary: z.string().max(20000).optional().describe('Tóm tắt mới của chương (tối đa 20.000 ký tự)'),
      content: z.string().max(500000).optional().describe('Nội dung văn bản mới của chương (tối đa 500.000 ký tự)'),
      is_locked: z.boolean().optional().describe('Trạng thái khóa chương'),
      unlock_price: z.number().int().min(0).optional().describe('Giá mở khóa chương mới (xu)'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Hẹn lịch xuất bản chapter
  server.tool(
    'chapter_schedule',
    'Hẹn giờ hoặc cập nhật thời điểm tự động xuất bản cho chương.',
    {
      id: z.number().int().positive().describe('ID của chương cần hẹn lịch'),
      scheduled_publish_at: z.string().min(1).describe('Thời gian hẹn xuất bản (chuỗi ngày giờ ISO 8601, phải sau thời điểm hiện tại)'),
    },
    async ({ id, scheduled_publish_at }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}/schedule`, { scheduled_publish_at });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Lấy riêng toàn văn tóm tắt chapter kèm thống kê
  server.tool(
    'chapter_get_summary',
    'Lấy riêng toàn văn tóm tắt của chương kèm chỉ số thống kê (từ, ký tự, câu) giúp tiết kiệm token.',
    {
      id: z.number().int().positive().describe('ID của chương'),
    },
    async ({ id }) => {
      const res = await apiClient.get<ChapterSummaryResponse>(`chapters/${id}/summary`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 8. Lấy riêng toàn văn nội dung chapter kèm thống kê
  server.tool(
    'chapter_get_content',
    'Lấy riêng toàn văn nội dung của chương kèm chỉ số thống kê (từ, ký tự, câu).',
    {
      id: z.number().int().positive().describe('ID của chương'),
    },
    async ({ id }) => {
      const res = await apiClient.get<ChapterContentResponse>(`chapters/${id}/content`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 9. Cập nhật nhanh tóm tắt chapter
  server.tool(
    'chapter_update_summary',
    'Cập nhật tóm tắt nội dung ngắn gọn của chương phục vụ phân tích ngữ cảnh LLM.',
    {
      id: z.number().int().positive().describe('ID của chương'),
      summary: z.string().min(1).max(20000).describe('Nội dung tóm tắt mới của chương (tối đa 20.000 ký tự)'),
    },
    async ({ id, summary }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}/summary`, { summary });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 10. Cập nhật nhanh nội dung chapter
  server.tool(
    'chapter_update_content',
    'Cập nhật toàn văn nội dung của chương.',
    {
      id: z.number().int().positive().describe('ID của chương'),
      content: z.string().min(1).max(500000).describe('Toàn văn nội dung chương mới (tối đa 500.000 ký tự)'),
    },
    async ({ id, content }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}/content`, { content });
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 11. Cửa sổ ngữ cảnh tóm tắt (Context Window)
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
