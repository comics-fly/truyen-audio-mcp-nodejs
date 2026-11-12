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
    'Tìm kiếm và lọc danh sách truyện theo thể loại, trạng thái, tác giả, media, tương tác và thời gian.',
    {
      search: z.string().max(100).optional().describe('Từ khóa tìm kiếm truyện (tối đa 100 ký tự)'),
      category_id: z.number().int().positive().optional().describe('Lọc theo một ID thể loại'),
      category_ids: z.union([z.string(), z.array(z.number().int().positive())]).optional().describe('Danh sách ID thể loại; hỗ trợ CSV "1,2,3" hoặc mảng số'),
      category_slug: z.string().max(100).optional().describe('Slug thể loại đơn lẻ'),
      category_slugs: z.union([z.string(), z.array(z.string().max(100))]).optional().describe('Danh sách slug thể loại; hỗ trợ CSV hoặc mảng'),
      category_mode: z.enum(['any', 'all']).optional().describe('Khớp bất kỳ thể loại nào (any) hoặc phải có tất cả (all)'),
      status: storyStatusEnum.optional().describe('Lọc theo một trạng thái truyện'),
      statuses: z.union([z.string(), z.array(storyStatusEnum)]).optional().describe('Danh sách trạng thái; hỗ trợ CSV hoặc mảng'),
      approval: z.enum(['approved', 'pending', 'rejected', 'all']).optional().describe('Trạng thái kiểm duyệt'),
      is_featured: z.boolean().optional().describe('Lọc truyện nổi bật'),
      user_id: z.number().int().positive().optional().describe('Lọc theo ID tác giả'),
      author_name: z.string().max(100).optional().describe('Lọc theo một phần tên tác giả'),
      only_mine: z.boolean().optional().describe('Chỉ lấy truyện do tài khoản MCP hiện tại sở hữu'),
      has_audio: z.boolean().optional().describe('Lọc truyện có/không có audio'),
      has_video: z.boolean().optional().describe('Lọc truyện có/không có video YouTube'),
      is_paid: z.boolean().optional().describe('Lọc truyện có/không có giá trả phí'),
      min_chapters: z.number().int().min(0).optional().describe('Số chương tối thiểu'),
      max_chapters: z.number().int().min(0).optional().describe('Số chương tối đa'),
      views: z.number().int().min(0).optional().describe('Lượt xem chính xác'),
      min_views: z.number().int().min(0).optional().describe('Lượt xem tối thiểu'),
      max_views: z.number().int().min(0).optional().describe('Lượt xem tối đa'),
      views_from: z.number().int().min(0).optional().describe('Alias lượt xem tối thiểu'),
      views_to: z.number().int().min(0).optional().describe('Alias lượt xem tối đa'),
      from_views: z.number().int().min(0).optional().describe('Alias lượt xem tối thiểu'),
      to_views: z.number().int().min(0).optional().describe('Alias lượt xem tối đa'),
      views_range: z.string().optional().describe('Khoảng lượt xem dạng "min,max" hoặc "min-max"'),
      views_between: z.string().optional().describe('Alias khoảng lượt xem dạng "min,max" hoặc "min-max"'),
      likes: z.number().int().min(0).optional().describe('Lượt thích chính xác'),
      min_likes: z.number().int().min(0).optional().describe('Lượt thích tối thiểu'),
      max_likes: z.number().int().min(0).optional().describe('Lượt thích tối đa'),
      likes_from: z.number().int().min(0).optional().describe('Alias lượt thích tối thiểu'),
      likes_to: z.number().int().min(0).optional().describe('Alias lượt thích tối đa'),
      from_likes: z.number().int().min(0).optional().describe('Alias lượt thích tối thiểu'),
      to_likes: z.number().int().min(0).optional().describe('Alias lượt thích tối đa'),
      likes_range: z.string().optional().describe('Khoảng lượt thích dạng "min,max" hoặc "min-max"'),
      likes_between: z.string().optional().describe('Alias khoảng lượt thích dạng "min,max" hoặc "min-max"'),
      updated_from: z.string().optional().describe('Thời điểm cập nhật bắt đầu (ngày/giờ)'),
      updated_to: z.string().optional().describe('Thời điểm cập nhật kết thúc (ngày/giờ)'),
      sort_by: z.enum(['updated_at', 'created_at', 'views', 'likes', 'chapters_count', 'title', 'id']).optional().describe('Trường sắp xếp'),
      sort_dir: z.enum(['asc', 'desc']).optional().describe('Chiều sắp xếp'),
      per_page: z.number().int().positive().max(100).optional().describe('Số kết quả mỗi trang (mặc định 20, tối đa 100)'),
      page: z.number().int().positive().optional().describe('Số trang'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Các trường trả về (Sparse Fieldsets, ví dụ "id,title,status")'),
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
