/**
 * Bộ công cụ quản lý Trích đoạn mạng xã hội (Post Socials) cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  DeletePostSocialLinkResult,
  DeletePostSocialResult,
  PostSocialDetail,
  PostSocialItem,
  PostSocialLinkItem,
} from '../types.js';

const postSocialStatusEnum = z.enum(['draft', 'posted']);
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

export function registerPostSocialTools(server: McpServer): void {
  // 1. Danh sách trích đoạn mạng xã hội
  server.tool(
    'post_social_list',
    'Lấy danh sách các bài trích đoạn mạng xã hội (hỗ trợ lọc theo story_id, chapter_id, status, platform, tìm kiếm, phân trang, fields).',
    {
      story_id: z.number().int().positive().optional().describe('Lọc trích đoạn theo ID truyện'),
      chapter_id: z.number().int().positive().optional().describe('Lọc trích đoạn theo ID chương'),
      status: postSocialStatusEnum.optional().describe('Trạng thái bài đăng (draft, posted)'),
      platform: socialPlatformEnum.optional().describe('Lọc theo nền tảng mạng xã hội đã gắn link'),
      search: z.string().max(100).optional().describe('Từ khóa tìm kiếm nội dung trích đoạn'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      per_page: z.number().int().positive().max(100).optional().describe('Số lượng bài trên mỗi trang (mặc định 20, tối đa 100)'),
      content: textModeEnum.optional().describe('Chế độ nạp nội dung trích đoạn (minimal, full, none)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách trường cần lấy (Sparse Fieldsets, e.g. "id,content,status")'),
    },
    async ({ story_id, ...params }) => {
      const endpoint = story_id ? `stories/${story_id}/post-socials` : 'post-socials';
      const res = await apiClient.get<PostSocialItem[]>(endpoint, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Chi tiết bài trích đoạn mạng xã hội
  server.tool(
    'post_social_get',
    'Lấy thông tin chi tiết một bài trích đoạn mạng xã hội kèm các liên kết đa nền tảng (hỗ trợ fields và text mode).',
    {
      id: z.number().int().positive().describe('ID bài trích đoạn cần xem'),
      content: textModeEnum.optional().describe('Chế độ nạp nội dung: full (mặc định), minimal (chỉ stats), none'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<PostSocialDetail>(`post-socials/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Tạo trích đoạn mạng xã hội mới
  server.tool(
    'post_social_create',
    'Tạo bài trích đoạn mạng xã hội mới cho truyện hoặc chương (nội dung 1-20.000 ký tự, hỗ trợ ảnh minh họa và trạng thái draft/posted).',
    {
      story_id: z.number().int().positive().describe('ID của truyện cần tạo trích đoạn'),
      chapter_id: z.number().int().positive().optional().describe('ID của chương trích đoạn (tùy chọn, phải thuộc truyện đã chọn)'),
      content: z.string().trim().min(1).max(20000).describe('Toàn văn nội dung bài đăng mạng xã hội (1-20.000 ký tự)'),
      image: z.string().max(1000).optional().describe('Đường dẫn ảnh minh họa hoặc banner trích đoạn'),
      status: postSocialStatusEnum.optional().describe('Trạng thái bài trích đoạn (draft hoặc posted, mặc định draft)'),
      user_id: z.number().int().positive().optional().describe('ID người tạo bài (chỉ Root/Admin được chỉ định)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi tạo'),
    },
    async ({ story_id, ...payload }) => {
      const res = await apiClient.post<PostSocialDetail>(`stories/${story_id}/post-socials`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Cập nhật bài trích đoạn mạng xã hội
  server.tool(
    'post_social_update',
    'Cập nhật nội dung, ảnh minh họa, trạng thái hoặc chuyển liên kết chương của bài trích đoạn.',
    {
      id: z.number().int().positive().describe('ID bài trích đoạn cần cập nhật'),
      story_id: z.number().int().positive().optional().describe('ID truyện mới nếu muốn chuyển trích đoạn'),
      chapter_id: z.number().int().positive().nullable().optional().describe('ID chương mới trích đoạn (hoặc null nếu gỡ gắn chương)'),
      content: z.string().trim().min(1).max(20000).optional().describe('Nội dung bài đăng trích đoạn mới'),
      image: z.string().max(1000).nullable().optional().describe('Đường dẫn ảnh minh họa mới'),
      status: postSocialStatusEnum.optional().describe('Trạng thái mới (draft, posted)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi cập nhật'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<PostSocialDetail>(`post-socials/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Xóa bài trích đoạn mạng xã hội
  server.tool(
    'post_social_delete',
    'Xóa bài trích đoạn mạng xã hội khỏi hệ thống (đồng thời xóa các liên kết mạng xã hội liên quan).',
    {
      id: z.number().int().positive().describe('ID bài trích đoạn cần xóa'),
    },
    async ({ id }) => {
      const res = await apiClient.delete<DeletePostSocialResult>(`post-socials/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 6. Thêm liên kết mạng xã hội cho bài trích đoạn
  server.tool(
    'post_social_add_link',
    'Gắn liên kết mạng xã hội đã đăng bài (Facebook, TikTok, Threads, Instagram, YouTube, X, Telegram) vào bài trích đoạn.',
    {
      id: z.number().int().positive().describe('ID bài trích đoạn cần gắn link'),
      platform: socialPlatformEnum.describe('Nền tảng mạng xã hội: facebook, tiktok, threads, instagram, youtube, x, telegram'),
      url: z.string().url().max(2000).describe('Đường dẫn URL trực tiếp tới bài đăng trên mạng xã hội'),
      user_id: z.number().int().positive().optional().describe('ID người đăng liên kết (chỉ Root/Admin được chỉ định)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi thêm link'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.post<PostSocialLinkItem>(`post-socials/${id}/links`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 7. Xóa liên kết mạng xã hội của bài trích đoạn
  server.tool(
    'post_social_delete_link',
    'Gỡ bỏ một liên kết mạng xã hội khỏi bài trích đoạn.',
    {
      id: z.number().int().positive().describe('ID bài trích đoạn'),
      link_id: z.number().int().positive().describe('ID liên kết mạng xã hội cần xóa'),
    },
    async ({ id, link_id }) => {
      const res = await apiClient.delete<DeletePostSocialLinkResult>(`post-socials/${id}/links/${link_id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
