# Truyen Audio MCP Server

Model Context Protocol (MCP) server xây dựng bằng **Node.js** & **TypeScript** cung cấp bộ công cụ (tools) cho AI Agent tương tác, quản lý và phân tích ngữ cảnh hệ thống **Truyện Audio** (kết nối backend [truyen-audio-laravel](../truyen-audio-laravel/)).

---

## Tính Năng & Danh Sách Tools

### 1. Quản lý Truyện (Stories)
- `story_list`: Tìm kiếm, lọc theo trạng thái/thể loại và phân trang danh sách truyện.
- `story_get`: Lấy chi tiết truyện kèm mô tả ngắn, tóm tắt và metadata.
- `story_create`: Tạo truyện mới ở trạng thái nháp (`draft`).
- `story_update`: Cập nhật trạng thái (`draft`/`published`/`archived`), mô tả ngắn hoặc tóm tắt truyện.

### 2. Quản lý Chương & Context Window (Chapters)
- `chapter_list_by_story`: Lấy danh sách chương theo truyện (hỗ trợ phân trang, sắp xếp).
- `chapter_get`: Lấy chi tiết chương kèm toàn văn nội dung (`content`), tóm tắt (`summary`) và thông tin khóa/xu.
- `chapter_create`: Thêm chương mới cho truyện.
- `chapter_update`: Cập nhật trạng thái, tóm tắt hoặc toàn văn nội dung chương.
- `chapter_update_summary`: Cập nhật nhanh nội dung tóm tắt chương.
- `chapter_update_content`: Cập nhật nhanh nội dung văn bản toàn chương.
- `chapter_batch_summaries`: Lấy tóm tắt hàng loạt nhiều chương (tối đa 20 chương/lần).
- `chapter_context_summary`: Lấy cửa sổ ngữ cảnh (Context Window) gồm các chương liền trước và liền sau phục vụ Agent suy luận cốt truyện.

### 3. Quản lý Thể Loại (Categories)
- `category_list`: Danh sách thể loại truyện.
- `category_get`: Chi tiết thể loại kèm số lượng truyện và SEO metadata.
- `category_create`: Tạo thể loại mới (tự sinh slug).
- `category_update`: Chỉnh sửa thông tin thể loại.

### 4. Hệ Thống & Kiểm Tra
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

### 2. Cấu hình Claude Desktop (`claude_desktop_config.json`)
Thêm cấu hình sau vào file cấu hình của Claude Desktop:

```json
{
  "mcpServers": {
    "truyen-audio": {
      "command": "node",
      "args": [
        "/home/Dev/truyen-audio/truyen-audio-mcp-nodejs/dist/index.js"
      ],
      "env": {
        "TRUYEN_AUDIO_API_URL": "http://localhost:8000/mcp",
        "TRUYEN_AUDIO_API_TOKEN": "your_mcp_bearer_token_here"
      }
    }
  }
}
```

### 3. Cấu hình Claude Code / MCP Config (`.mcp.json`)
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
│       └── category.tools.ts # Các công cụ quản lý Thể loại
├── test/
│   └── self-check.test.ts    # Unit test tự động
├── dist/                     # Thư mục mã nguồn sau khi build
├── .env.example              # Mẫu biến môi trường
├── package.json
└── tsconfig.json
```
