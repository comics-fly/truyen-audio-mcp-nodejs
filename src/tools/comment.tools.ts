/**
 * Bộ công cụ quản lý Bình luận (Comments) cho MCP Server
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { apiClient } from '../client.js';
import type {
  CommentDetail,
  CommentItem,
  DeleteCommentResult,
} from '../types.js';

export function registerCommentTools(server: McpServer): void {
  // 1. Danh sách bình luận
  server.tool(
    'comment_list',
    'Lấy danh sách bình luận (hỗ trợ lọc theo story_id, user_id, parent_id, tìm kiếm từ khóa, phân trang, lọc cột fields).',
    {
      story_id: z.number().int().positive().optional().describe('Lọc bình luận theo ID truyện'),
      user_id: z.number().int().positive().optional().describe('Lọc bình luận theo ID người dùng'),
      parent_id: z.number().int().min(0).optional().describe('Lọc bình luận theo ID cha (truyền 0 để lấy các bình luận gốc cấp 1)'),
      search: z.string().max(255).optional().describe('Từ khóa tìm kiếm nội dung bình luận'),
      direction: z.enum(['asc', 'desc']).optional().describe('Thứ tự sắp xếp (mặc định desc)'),
      page: z.number().int().positive().optional().describe('Số trang cần lấy'),
      per_page: z.number().int().positive().max(50).optional().describe('Số bình luận mỗi trang (mặc định 20, tối đa 50)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Danh sách trường cần lấy (Sparse Fieldsets, e.g. "id,content,user_name")'),
    },
    async ({ story_id, ...params }) => {
      const endpoint = story_id ? `stories/${story_id}/comments` : 'comments';
      const res = await apiClient.get<CommentItem[]>(endpoint, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 2. Chi tiết bình luận
  server.tool(
    'comment_get',
    'Xem chi tiết một bình luận kèm thông tin người đăng và các câu trả lời (hỗ trợ fields).',
    {
      id: z.number().int().positive().describe('ID của bình luận cần xem'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về (Sparse Fieldsets)'),
    },
    async ({ id, ...params }) => {
      const res = await apiClient.get<CommentDetail>(`comments/${id}`, params);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 3. Đăng bình luận mới
  server.tool(
    'comment_create',
    'Đăng bình luận mới cho truyện hoặc trả lời một bình luận khác (độ sâu tối đa 4 cấp, độ dài 2-2000 ký tự sau khi cắt khoảng trắng thừa).',
    {
      story_id: z.number().int().positive().describe('ID truyện cần bình luận'),
      content: z.string().trim().min(2).max(2000).describe('Nội dung bình luận (2-2000 ký tự)'),
      parent_id: z.number().int().positive().optional().describe('ID bình luận cha nếu là câu trả lời (tối đa độ sâu 4 cấp)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi tạo'),
    },
    async ({ story_id, ...payload }) => {
      const res = await apiClient.post<CommentDetail>(`stories/${story_id}/comments`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 4. Chỉnh sửa bình luận
  server.tool(
    'comment_update',
    'Chỉnh sửa nội dung bình luận (chỉ tác giả bình luận có quyền sửa).',
    {
      id: z.number().int().positive().describe('ID của bình luận cần sửa'),
      content: z.string().trim().min(2).max(2000).describe('Nội dung bình luận mới (2-2000 ký tự)'),
      fields: z.union([z.string(), z.array(z.string())]).optional().describe('Lọc các trường trả về sau khi sửa'),
    },
    async ({ id, ...payload }) => {
      const res = await apiClient.patch<CommentDetail>(`comments/${id}`, payload);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );

  // 5. Xóa bình luận
  server.tool(
    'comment_delete',
    'Xóa bình luận khỏi hệ thống (kiểm duyệt: chỉ tác giả hoặc quản trị viên có quyền xóa).',
    {
      id: z.number().int().positive().describe('ID của bình luận cần xóa'),
    },
    async ({ id }) => {
      const res = await apiClient.delete<DeleteCommentResult>(`comments/${id}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(res, null, 2) }],
      };
    }
  );
}
