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
    'Lấy danh sách chương của truyện với bộ lọc số chương, trạng thái, media, nội dung, giá, tương tác, thời gian và sắp xếp (hỗ trợ fields).',
    {
      story_id: z.number().int().positive().describe('ID của truyện'),
      search: z.string().max(100).optional().describe('Tìm theo tiêu đề, slug hoặc số chương'),
      chapter_number: z.number().int().min(1).optional().describe('Lọc theo số chương chính xác'),
      chapter_numbers: z.union([z.string(), z.array(z.number().int().min(1))]).optional().describe('Danh sách số chương; hỗ trợ CSV "1,2,3" hoặc mảng số'),
      from_chapter: z.number().int().min(1).optional().describe('Số chương tối thiểu'),
      to_chapter: z.number().int().min(1).optional().describe('Số chương tối đa'),
      min_chapter: z.number().int().min(1).optional().describe('Alias của from_chapter'),
      max_chapter: z.number().int().min(1).optional().describe('Alias của to_chapter'),
      status: chapterStatusEnum.optional().describe('Lọc theo một trạng thái chương'),
      statuses: z.union([z.string(), z.array(chapterStatusEnum)]).optional().describe('Danh sách trạng thái; hỗ trợ CSV hoặc mảng'),
      has_audio: z.boolean().optional().describe('Lọc chương có/không có audio'),
      has_video: z.boolean().optional().describe('Lọc chương có/không có video'),
      has_youtube: z.boolean().optional().describe('Alias của has_video'),
      has_summary: z.boolean().optional().describe('Lọc chương có/không có tóm tắt'),
      has_content: z.boolean().optional().describe('Lọc chương có/không có nội dung'),
      is_free: z.boolean().optional().describe('Lọc chương miễn phí hoặc trả phí'),
      is_locked: z.boolean().optional().describe('Lọc chương khóa hoặc không khóa'),
      price: z.number().int().min(0).optional().describe('Giá chính xác'),
      min_price: z.number().int().min(0).optional().describe('Giá tối thiểu'),
      max_price: z.number().int().min(0).optional().describe('Giá tối đa'),
      from_price: z.number().int().min(0).optional().describe('Alias giá tối thiểu'),
      to_price: z.number().int().min(0).optional().describe('Alias giá tối đa'),
      price_from: z.number().int().min(0).optional().describe('Alias giá tối thiểu'),
      price_to: z.number().int().min(0).optional().describe('Alias giá tối đa'),
      price_range: z.string().optional().describe('Khoảng giá dạng "min,max" hoặc "min-max"'),
      price_between: z.string().optional().describe('Alias khoảng giá dạng "min,max" hoặc "min-max"'),
      views: z.number().int().min(0).optional().describe('Lượt xem chính xác'),
      min_views: z.number().int().min(0).optional().describe('Lượt xem tối thiểu'),
      max_views: z.number().int().min(0).optional().describe('Lượt xem tối đa'),
      from_views: z.number().int().min(0).optional().describe('Alias lượt xem tối thiểu'),
      to_views: z.number().int().min(0).optional().describe('Alias lượt xem tối đa'),
      views_from: z.number().int().min(0).optional().describe('Alias lượt xem tối thiểu'),
      views_to: z.number().int().min(0).optional().describe('Alias lượt xem tối đa'),
      views_range: z.string().optional().describe('Khoảng lượt xem dạng "min,max" hoặc "min-max"'),
      views_between: z.string().optional().describe('Alias khoảng lượt xem dạng "min,max" hoặc "min-max"'),
      likes: z.number().int().min(0).optional().describe('Lượt thích chính xác'),
      min_likes: z.number().int().min(0).optional().describe('Lượt thích tối thiểu'),
      max_likes: z.number().int().min(0).optional().describe('Lượt thích tối đa'),
      from_likes: z.number().int().min(0).optional().describe('Alias lượt thích tối thiểu'),
      to_likes: z.number().int().min(0).optional().describe('Alias lượt thích tối đa'),
      likes_from: z.number().int().min(0).optional().describe('Alias lượt thích tối thiểu'),
      likes_to: z.number().int().min(0).optional().describe('Alias lượt thích tối đa'),
      likes_range: z.string().optional().describe('Khoảng lượt thích dạng "min,max" hoặc "min-max"'),
      likes_between: z.string().optional().describe('Alias khoảng lượt thích dạng "min,max" hoặc "min-max"'),
      updated_from: z.string().optional().describe('Chỉ lấy chương cập nhật từ thời điểm này'),
      updated_to: z.string().optional().describe('Chỉ lấy chương cập nhật đến thời điểm này'),
      scheduled_from: z.string().optional().describe('Lọc lịch xuất bản từ thời điểm này'),
      scheduled_to: z.string().optional().describe('Lọc lịch xuất bản đến thời điểm này'),
      sort_by: z.enum(['chapter_number', 'id', 'created_at', 'updated_at', 'title', 'views', 'likes', 'price']).optional().describe('Trường sắp xếp'),
      sort_dir: z.enum(['asc', 'desc']).optional().describe('Chiều sắp xếp'),
      direction: z.enum(['asc', 'desc']).optional().describe('Alias của sort_dir'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng chương mỗi trang (mặc định 20, tối đa 100)'),
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
