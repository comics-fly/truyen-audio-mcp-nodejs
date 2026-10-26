# Truyen Audio MCP Server

Model Context Protocol (MCP) server xây dựng bằng **Node.js** & **TypeScript** cung cấp bộ công cụ (tools) cho AI Agent tương tác, quản lý và phân tích ngữ cảnh hệ thống **Truyện Audio** (kết nối backend [truyen-audio-laravel](../truyen-audio-laravel/)).

---

## Tính Năng & Danh Sách Tools

Hệ thống cung cấp **20 MCP tools** chuẩn hóa, hỗ trợ tối ưu token cho AI Agent thông qua **Sparse Fieldsets (`fields`)** và các chế độ nạp text (`full`/`minimal`/`none`):

### 1. Quản lý Truyện (Stories)
- `story_list`: Tìm kiếm, lọc theo trạng thái (`draft`/`ongoing`/`completed`/`paused`/`scheduled`), thể loại và phân trang danh sách truyện (hỗ trợ `fields`).
- `story_get`: Lấy chi tiết truyện kèm thể loại, metadata (hỗ trợ `fields`, `summary: full|minimal|none`, `short_description: full|minimal|none`).
- `story_create`: Tạo truyện mới (mặc định `draft`, tự sinh slug, hỗ trợ hẹn giờ đăng `scheduled_publish_at` và gán thể loại).
- `story_update`: Cập nhật toàn diện truyện (tiêu đề, slug, trạng thái, hẹn giờ đăng, tóm tắt, mô tả ngắn, SEO, đồng bộ/thêm/gỡ thể loại).

### 2. Quản lý Chương & Context Window (Chapters)
- `chapter_list_by_story`: Lấy danh sách chương theo truyện (hỗ trợ phân trang, lọc trạng thái, sắp xếp thứ tự, `fields`).
- `chapter_create`: Thêm chương mới cho truyện (tự động tăng số thứ tự chương, hỗ trợ hẹn giờ đăng, tóm tắt, nội dung, khóa/giá).
- `chapter_batch_summaries`: Lấy tóm tắt hàng loạt nhiều chương qua danh sách ID hoặc số thứ tự chương (tối đa 20 chương/lần).
- `chapter_get`: Chi tiết chương (hỗ trợ `fields`, chế độ `content: full|minimal|none` và `summary: full|minimal|none` tiết kiệm token).
- `chapter_update`: Cập nhật tổng thể chương (số chương, tiêu đề, slug, trạng thái, hẹn giờ đăng, tóm tắt, nội dung, khóa/giá).
- `chapter_context_summary`: Cửa sổ ngữ cảnh (Context Window) gồm các chương liền trước và liền sau phục vụ Agent theo dõi mạch truyện.

### 3. Quản lý Thể Loại (Categories)
- `category_list`: Danh sách thể loại truyện trong hệ thống (hỗ trợ tìm kiếm, phân trang, `fields`).
- `category_get`: Chi tiết thể loại kèm metadata SEO và số lượng truyện liên kết.
- `category_create`: Tạo thể loại mới (chỉ Root, tự sinh slug duy nhất).
- `category_update`: Chỉnh sửa tên, slug, SEO hoặc ghi chú thể loại (chỉ Root).

### 4. Quản lý Bình Luận (Comments)
- `comment_list`: Danh sách bình luận theo truyện hoặc toàn hệ thống (hỗ trợ lọc `story_id`, `user_id`, `parent_id`, tìm kiếm, phân trang, `fields`).
- `comment_get`: Chi tiết bình luận kèm thông tin người đăng và danh sách câu trả lời.
- `comment_create`: Đăng bình luận cho truyện hoặc trả lời bình luận khác (độ sâu tối đa 4 cấp, độ dài 2-2000 ký tự).
- `comment_update`: Chỉnh sửa nội dung bình luận (chỉ tác giả có quyền).
- `comment_delete`: Xóa bình luận khỏi hệ thống (kiểm duyệt).

### 5. Hệ Thống & Kiểm Tra
- `mcp_info`: Kiểm tra trạng thái kết nối và phiên bản API backend Laravel.

---

## Cài Đặt & Build

### Yêu Cầu Môi Trường
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Cài Đặt Dependencies
```bash
npm install
```

### Chạy Kiểm Thử (Tests)
```bash
npm test
```

### Build Ra 1 File Duy Nhất (Single Bundle)
Đóng gói toàn bộ mã nguồn và dependencies thành 1 file độc lập với `esbuild`:
```bash
npm run build
```

Kết quả tạo ra đúng **1 file duy nhất** tại [dist/index.js](dist/index.js) (dung lượng ~350KB, đã nhúng shebang `#!/usr/bin/env node` và sẵn sàng thực thi trực tiếp).

---

## Cấu Hình Kết Nối MCP

### 1. Biến Môi Trường (.env)
Tạo file `.env` từ [.env.example](.env.example):
```env
TRUYEN_AUDIO_API_URL=http://localhost:8000/mcp
TRUYEN_AUDIO_API_TOKEN=your_mcp_bearer_token_here
```

### 2. Cách 1: Sử dụng trực tiếp qua NPM với `npx` (Khuyên dùng - Không cần path file)
Package đã được xuất bản chính thức trên NPM Registry với tên [`truyen-audio-mcp`](https://www.npmjs.com/package/truyen-audio-mcp). Bạn có thể cấu hình client chạy trực tiếp mà **không cần clone mã nguồn hay khai báo đường dẫn file**:

#### Cấu hình Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "truyen-audio": {
      "command": "npx",
      "args": [
        "-y",
        "truyen-audio-mcp@latest"
      ],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

#### Cấu hình Claude Code (`.mcp.json`)
```json
{
  "mcpServers": {
    "truyen-audio": {
      "command": "npx",
      "args": ["-y", "truyen-audio-mcp@latest"],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

### 3. Cách 2: Chạy từ mã nguồn Local (Dành cho nhà phát triển)
Nếu bạn đang phát triển hoặc muốn chạy trực tiếp file bundle sau khi `npm run build`:

```json
{
  "mcpServers": {
    "truyen-audio": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

---

## Cấu Trúc Mã Nguồn

```
├── src/
│   ├── index.ts              # Điểm khởi chạy MCP Server & đăng ký công cụ
│   ├── config.ts             # Quản lý biến môi trường và cấu hình
│   ├── types.ts              # Định nghĩa Types & DTOs
│   ├── client.ts             # HTTP Client gọi API Laravel (/mcp)
│   └── tools/
│       ├── story.tools.ts    # Các công cụ quản lý Truyện
│       ├── chapter.tools.ts  # Các công cụ quản lý Chapter & Context Window
│       ├── category.tools.ts # Các công cụ quản lý Thể loại
│       └── comment.tools.ts  # Các công cụ quản lý Bình luận
├── test/
│   └── self-check.test.ts    # Unit test tự động
├── dist/                     # Thư mục mã nguồn sau khi build
├── .env.example              # Mẫu biến môi trường
├── package.json
└── tsconfig.json
```
