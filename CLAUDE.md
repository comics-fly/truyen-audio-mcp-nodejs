# CLAUDE.md — Truyen Audio MCP

> File hướng dẫn dành cho Claude / agent khi làm việc trong repo này.
> Ưu tiên: đọc file này trước khi code, commit, hoặc tạo PR.

## Ràng Buộc Chế Độ (Mode Enforcement)
- **Không tự ý Plan Mode**: Cấm gọi `EnterPlanMode` khi chưa yêu cầu rõ ràng.
- **Luôn dùng `bypassPermissions`**: Thực thi công cụ liền mạch, không hỏi xin quyền.
- **Luôn dùng `ultracode`**: Tự động điều phối workflow / multi-agent với suy luận tối đa cho mọi tác vụ.
- **Cấm chạy background**: Không chạy Workflow/Agent ngầm. Bắt buộc đặt `run_in_background: false`, chạy foreground hiển thị trực tiếp tiến trình.

## Thông tin dự án
- **Tên dự án**: Truyen Audio MCP Server
- **Mục tiêu**: Cung cấp MCP server (Model Context Protocol) bằng Node.js phục vụ hệ sinh thái Truyện Audio.
- **Backend liên kết**: [truyen-audio](../truyen-audio/)
- **Tech stack**: Node.js, `@modelcontextprotocol/sdk`

## MCP 
- `gitnexus`: Đọc và phân tích API/codebase qua repo `/home/dev/Project/truyen-audio`
- `gitnexus analyze -f --skip-skills --skip-agents-md`: Phân tích codebase và xuất ra file JSON chứa thông tin API/codebase.
