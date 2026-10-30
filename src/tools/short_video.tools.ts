/**
 * Bộ công cụ quản lý Kịch bản Video ngắn (Short Videos) cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  DeleteShortVideoLinkResult,
  DeleteShortVideoResult,
  ShortVideoDetail,
  ShortVideoItem,
  ShortVideoLinkItem,
} from '../types.js';

const shortVideoStatusEnum = z.enum(['draft', 'posted']);
const socialPlatformEnum = z.enum([
  'facebook',
  'tiktok',
  'threads',
  'instagram',
  'youtube',
  'x',
  'telegram',
]);
const textModeEnum = z.enum(['full', 'minimal', 'none']);

export function registerShortVideoTools(server: McpServer): void {
  // 1. Danh sách kịch bản video ngắn
  server.tool(
    'short_video_list',
    'Lấy danh sách kịch bản video ngắn (hỗ trợ lọc theo story_id, chapter_id, status, platform, tìm kiếm, phân trang, fields).',
    {
      story_id: z.number().int().positive().optional().describe('Lọc kịch bản theo ID truyện'),
      chapter_id: z.number().int().positive().optional().describe('Lọc kịch bản theo ID chương'),
      status: shortVideoStatusEnum.optional().describe('Trạng thái kịch bản (draft, posted)'),
      platform: socialPlatformEnum.optional().describe('Lọc theo nền tảng mạng xã hội đã gắn link'),
      search: z.string().max(100).optional().describe('Từ khóa tìm kiếm nội dung kịch bản video'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng kịch bản mỗi trang (mặc định 20, tối đa 100)'),
      script: textModeEnum.optional().describe('Chế độ nạp văn bản kịch bản (minimal, full, none)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách trường cần lấy (Sparse Fieldsets, e.g. "id,script,status")'),
    },
    async ({ story_id, ...params }) => {
      const endpoint = story_id ? `stories/${story_id}/short-videos` : 'short-videos';
      const res = await apiClient.get<ShortVideoItem[]>(endpoint, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Chi tiết kịch bản video ngắn
  server.tool(
    'short_video_get',
    'Xem chi tiết một kịch bản video ngắn kèm danh sách liên kết các nền tảng (hỗ trợ fields và text mode).',
    {
      id: z.number().int().positive().describe('ID kịch bản video ngắn cần xem'),
      script: textModeEnum.optional().describe('Chế độ nạp văn bản kịch bản: full (mặc định), minimal (chỉ stats), none'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<ShortVideoDetail>(`short-videos/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Tạo kịch bản video ngắn mới
  server.tool(
    'short_video_create',
    'Tạo kịch bản video ngắn mới cho truyện hoặc chương (kịch bản 1-50.000 ký tự, hỗ trợ ảnh thumbnail, video_url và trạng thái).',
    {
      story_id: z.number().int().positive().describe('ID của truyện cần tạo kịch bản video'),
      chapter_id: z.number().int().positive().optional().describe('ID chương minh họa (tùy chọn, phải thuộc truyện đã chọn)'),
      script: z.string().trim().min(1).max(50000).describe('Toàn văn kịch bản video ngắn (1-50.000 ký tự)'),
      image: z.string().max(1000).optional().describe('Đường dẫn ảnh bìa hoặc storyboard của video'),
      video_url: z.string().max(500).optional().describe('Đường dẫn lưu trữ hoặc phát video (nếu đã render xong)'),
      status: shortVideoStatusEnum.optional().describe('Trạng thái kịch bản (draft hoặc posted, mặc định draft)'),
      user_id: z.number().int().positive().optional().describe('ID người tạo kịch bản (chỉ Root/Admin được chỉ định)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi tạo'),
    },
    async ({ story_id, ...payload }) => {
      const res = await apiClient.post<ShortVideoDetail>(`stories/${story_id}/short-videos`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Cập nhật kịch bản video ngắn
  server.tool(
    'short_video_update',
    'Cập nhật nội dung kịch bản, ảnh bìa, link video hoàn thiện hoặc trạng thái video ngắn.',
    {
      id: z.number().int().positive().describe('ID kịch bản video ngắn cần cập nhật'),
      story_id: z.number().int().positive().optional().describe('ID truyện mới nếu muốn chuyển kịch bản sang truyện khác'),
      chapter_id: z.number().int().positive().nullable().optional().describe('ID chương mới minh họa (hoặc null nếu gỡ gắn chương)'),
      script: z.string().trim().min(1).max(50000).optional().describe('Nội dung kịch bản mới'),
      image: z.string().max(1000).nullable().optional().describe('Đường dẫn ảnh bìa mới'),
      video_url: z.string().max(500).nullable().optional().describe('Đường dẫn file video mới'),
      status: shortVideoStatusEnum.optional().describe('Trạng thái mới (draft, posted)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi cập nhật'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<ShortVideoDetail>(`short-videos/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Xóa kịch bản video ngắn
  server.tool(
    'short_video_delete',
    'Xóa kịch bản video ngắn khỏi hệ thống (đồng thời xóa các liên kết mạng xã hội liên quan).',
    {
      id: z.number().int().positive().describe('ID kịch bản video ngắn cần xóa'),
    },
    async ({ id }) => {
      const res = await apiClient.delete<DeleteShortVideoResult>(`short-videos/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Thêm liên kết mạng xã hội cho video ngắn
  server.tool(
    'short_video_add_link',
    'Gắn liên kết video đã xuất bản trên nền tảng mạng xã hội (TikTok, YouTube Shorts, Reels, Facebook, X, Telegram...).',
    {
      id: z.number().int().positive().describe('ID kịch bản video ngắn cần gắn link'),
      platform: socialPlatformEnum.describe('Nền tảng mạng xã hội: facebook, tiktok, threads, instagram, youtube, x, telegram'),
      url: z.string().url().max(2000).describe('Đường dẫn URL trực tiếp tới video đã đăng trên mạng xã hội'),
      user_id: z.number().int().positive().optional().describe('ID người đăng liên kết (chỉ Root/Admin được chỉ định)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi thêm link'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.post<ShortVideoLinkItem>(`short-videos/${id}/links`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Xóa liên kết mạng xã hội của video ngắn
  server.tool(
    'short_video_delete_link',
    'Gỡ bỏ một liên kết video mạng xã hội khỏi kịch bản.',
    {
      id: z.number().int().positive().describe('ID kịch bản video ngắn'),
      link_id: z.number().int().positive().describe('ID liên kết video cần xóa'),
    },
    async ({ id, link_id }) => {
      const res = await apiClient.delete<DeleteShortVideoLinkResult>(`short-videos/${id}/links/${link_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
