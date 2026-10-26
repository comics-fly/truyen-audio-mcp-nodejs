/**
 * Bộ công cụ quản lý Chapter & Context Window cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  ChapterDetail,
  ChapterItem,
  ChapterSummaryItem,
  ContextWindowResult,
} from '../types.js';

const chapterStatusEnum = z.enum(['draft', 'published', 'hidden', 'scheduled']);
const textModeEnum = z.enum(['full', 'minimal', 'none']);

export function registerChapterTools(server: McpServer): void {
  // 1. Danh sách chapter theo truyện
  server.tool(
    'chapter_list_by_story',
    'Lấy danh sách các chương của một truyện (hỗ trợ phân trang, lọc trạng thái, sắp xếp thứ tự, lọc cột fields).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      status: chapterStatusEnum.optional().describe('Trạng thái chương (draft, published, hidden, scheduled)'),
      direction: z.enum(['asc', 'desc']).optional().describe('Thứ tự sắp xếp theo số chương (asc/desc)'),
      per_page: z.number().int().positive().max(50).optional().describe('Số lượng chương trên mỗi trang (mặc định 20, tối đa 50)'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách trường cần lấy (Sparse Fieldsets, e.g. "id,chapter_number,title")'),
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
    'Tạo chương mới cho một truyện (tự động tăng số thứ tự chương nếu không chỉ định, hỗ trợ hẹn giờ đăng, tóm tắt, nội dung, khóa/giá).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      chapter_number: z.number().int().min(0).optional().describe('Số thứ tự chương (tùy chọn, tự động tăng nếu để trống)'),
      title: z.string().max(255).optional().describe('Tiêu đề chương (tối đa 255 ký tự)'),
      slug: z.string().max(255).optional().describe('Slug chương (tùy chọn, duy nhất trong truyện)'),
      status: chapterStatusEnum.optional().describe('Trạng thái chương (mặc định draft)'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn xuất bản (ISO 8601, bắt buộc sau hiện tại nếu status là scheduled)'),
      content: z.string().max(500000).optional().describe('Toàn văn nội dung chương (tối đa 500.000 ký tự)'),
      summary: z.string().max(20000).optional().describe('Tóm tắt nội dung cốt truyện của chương (tối đa 20.000 ký tự)'),
      is_locked: z.boolean().optional().describe('Khóa chương yêu cầu trả phí'),
      unlock_price: z.number().int().min(0).optional().describe('Giá mở khóa chương (xu, không âm)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi tạo'),
    },
    async ({ story_id, ...payload }) => {
      const res = await apiClient.post<ChapterDetail>(`stories/${story_id}/chapters`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Lấy tóm tắt hàng loạt chương (Batch summaries)
  server.tool(
    'chapter_batch_summaries',
    'Lấy tóm tắt nội dung của nhiều chương cùng lúc theo danh sách ID hoặc số thứ tự chương (tối đa 20 chương).',
    {
      story_id: z.number().int().positive().optional().describe('ID của truyện (bắt buộc nếu truy vấn theo chapter_numbers)'),
      chapter_ids: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách ID chương (tối đa 20)'),
      chapter_numbers: z.array(z.number().int().positive()).max(20).optional().describe('Danh sách số thứ tự chương (tối đa 20, yêu cầu story_id)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async (payload) => {
      const res = await apiClient.post<ChapterSummaryItem[]>('chapters/batch-summaries', payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Chi tiết một chapter
  server.tool(
    'chapter_get',
    'Lấy chi tiết một chương (mặc định content/summary là null kèm stats để tiết kiệm token; dùng content=full hoặc summary=full để lấy toàn văn).',
    {
      id: z.number().int().positive().describe('ID của chương'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách trường cần lấy (Sparse Fieldsets, e.g. "id,title,content")'),
      content: textModeEnum.optional().describe('Chế độ nạp nội dung: full (toàn văn), minimal (chỉ stats, mặc định), none (bỏ qua)'),
      summary: textModeEnum.optional().describe('Chế độ nạp tóm tắt: full (toàn văn), minimal (chỉ stats, mặc định), none (bỏ qua)'),
      include_text: z.boolean().optional().describe('Lấy toàn văn cả tóm tắt và nội dung chương (tương đương content=full&summary=full)'),
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
    'Cập nhật thông tin tổng thể của chương (số chương, tiêu đề, slug, trạng thái, hẹn giờ xuất bản, tóm tắt, nội dung, khóa/giá).',
    {
      id: z.number().int().positive().describe('ID của chương'),
      chapter_number: z.number().int().min(0).optional().describe('Số thứ tự chương mới'),
      title: z.string().max(255).optional().describe('Tiêu đề chương mới'),
      slug: z.string().max(255).optional().describe('Slug chương mới'),
      status: chapterStatusEnum.optional().describe('Trạng thái mới của chương (draft, published, hidden, scheduled)'),
      scheduled_publish_at: z.string().optional().describe('Thời gian hẹn xuất bản mới (ISO 8601, bắt buộc sau hiện tại nếu status là scheduled)'),
      summary: z.string().max(20000).optional().describe('Tóm tắt mới của chương (tối đa 20.000 ký tự)'),
      content: z.string().max(500000).optional().describe('Nội dung văn bản mới của chương (tối đa 500.000 ký tự)'),
      is_locked: z.boolean().optional().describe('Trạng thái khóa chương yêu cầu trả phí'),
      unlock_price: z.number().int().min(0).optional().describe('Giá mở khóa chương mới (xu)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi cập nhật'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<ChapterDetail>(`chapters/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Cửa sổ ngữ cảnh tóm tắt (Context Window)
  server.tool(
    'chapter_context_summary',
    'Lấy cửa sổ ngữ cảnh tóm tắt các chương liền trước và liền sau một chương chỉ định để Agent theo dõi mạch truyện.',
    {
      id: z.number().int().positive().describe('ID của chương trung tâm'),
      before: z.number().int().min(0).max(10).optional().describe('Số lượng chương liền trước cần lấy tóm tắt (mặc định 3, tối đa 10)'),
      after: z.number().int().min(0).max(10).optional().describe('Số lượng chương liền sau cần lấy tóm tắt (mặc định 3, tối đa 10)'),
      context: z.enum(['full', 'minimal']).optional().describe('Chế độ nạp văn bản tóm tắt (full hoặc minimal)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<ContextWindowResult>(`chapters/${id}/context-summary`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
