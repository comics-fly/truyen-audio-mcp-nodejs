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
- **Repository**: `comics-fly/truyen-audio-mcp-nodejs`
- **Tech stack**: Node.js 20+, `@modelcontextprotocol/sdk`, TypeScript, esbuild

## Quy định Git (Git Workflow)
- **Quy tắc Commit**:
  - **Tiêu đề commit**: Tuân thủ Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, `perf:`, `ci:`), nội dung tiêu đề **bắt buộc viết bằng tiếng Việt có dấu**, súc tích, mô tả chính xác mục tiêu thay đổi.
  - **Mô tả commit (body)**: **Bắt buộc viết đầy đủ bằng tiếng Việt có dấu**, giải thích chi tiết lý do thay đổi, danh sách các chỉnh sửa cụ thể và phạm vi ảnh hưởng.
  - **Định dạng mẫu**:
    ```
    <loại>(<phạm vi>): <tiêu đề ngắn gọn bằng tiếng Việt có dấu>

    <mô tả tổng quan lý do và mục tiêu thay đổi bằng tiếng Việt có dấu>

    Chi tiết các thay đổi:
    - <thay đổi cụ thể 1>
    - <thay đổi cụ thể 2>
    ```
  - **Phạm vi commit**: Chỉ commit ở local, **tuyệt đối không tự ý push** lên remote repository khi chưa có yêu cầu trực tiếp từ người dùng.
  - **Không thêm attribution**: Tuyệt đối không thêm dòng `Co-Authored-By` vào cuối commit message.

- **Quy tắc Git Tag & Release**:
  - **Tên tag**: Tuân thủ chuẩn SemVer có tiền tố `v` (ví dụ `v1.1.0`, `v1.0.1`).
  - **Mô tả tag**: Phải sử dụng annotated tag (`git tag -a <tag> -m "..."`), thông điệp tag **bắt buộc viết đầy đủ tiêu đề và nội dung mô tả bằng tiếng Việt có dấu**, tóm tắt toàn bộ tính năng mới, bản sửa lỗi và cải tiến trong bản phát hành.
  - **Định dạng mẫu tạo tag**:
    ```bash
    git tag -a vX.Y.Z -m "Phát hành phiên bản vX.Y.Z: <tiêu đề tóm tắt bằng tiếng Việt có dấu>

    Mô tả chi tiết các thay đổi:
    - <tính năng mới / cải tiến 1>
    - <tính năng mới / cải tiến 2>
    - <sửa lỗi nếu có>"
    ```
  - **Không tự ý push tag**: Tuyệt đối không tự ý push tag lên remote nếu người dùng chưa chỉ định.

## Hướng dẫn làm việc với MCP GitHub
MCP GitHub (`@modelcontextprotocol/server-github`) được cấu hình trong [.mcp.json](.mcp.json) cho phép agent tương tác trực tiếp với GitHub repository:
- **Thông tin Repository**:
  - `owner`: `comics-fly`
  - `repo`: `truyen-audio-mcp-nodejs`
- **Các tác vụ chính**:
  - **Quản lý Pull Requests**:
    - `get_pull_request`: Lấy thông tin chi tiết PR, branch, head SHA.
    - `get_pull_request_files`: Xem danh sách và diff các file thay đổi trong PR.
    - `get_pull_request_status`: Kiểm tra trạng thái CI/CD checks của PR.
    - `create_pull_request`: Tạo PR mới (yêu cầu mô tả bằng tiếng Việt, test plan).
    - `create_pull_request_review`: Review PR (Approve / Request Changes / Comment).
    - `merge_pull_request`: Merge PR khi các automated checks đều pass.
  - **Quản lý Issues**:
    - `list_issues` / `get_issue`: Tra cứu issue, task và bug reports.
    - `create_issue` / `update_issue`: Mở issue mới hoặc cập nhật trạng thái/nhãn.
    - `add_issue_comment`: Thêm comment trao đổi hoặc cập nhật tiến độ công việc.
  - **Quản lý Branch & Commits**:
    - `list_commits`: Kiểm tra lịch sử commit trên các branch.
    - `create_branch`: Tạo branch mới cho feature hoặc bugfix.
- **Nguyên tắc khi thao tác qua MCP GitHub**:
  - Tuân thủ quy chuẩn Conventional Commits (`feat`, `fix`, `chore`, `docs`, ...).
  - Không tự ý push thẳng lên remote repository hay merge PR nếu chưa có chỉ định trực tiếp từ người dùng.
  - Luôn kiểm tra status check của CI trước khi hoàn tất công việc trên PR.

## Quy trình GitHub Actions: Build & Publish NPM Package
Dự án được cấu hình quy trình CI/CD tự động đóng gói và xuất bản package lên NPM Registry thông qua workflow [.github/workflows/publish.yml](.github/workflows/publish.yml).

### 1. Kiến trúc Build Bundle
- **Công cụ đóng gói**: `esbuild` đóng gói toàn bộ mã nguồn TypeScript từ [src/index.ts](src/index.ts) thành một file bundle duy nhất tại [dist/index.js](dist/index.js).
- **Cấu hình bundle**:
  - Format: ESM (`--format=esm`)
  - Target: Node.js 20 (`--platform=node --target=node20`)
  - Banner: Bổ sung shebang `#!/usr/bin/env node` để hỗ trợ chạy trực tiếp như CLI binary (`npx truyen-audio-mcp`).
  - Minify: Bật cờ `--minify` giúp giảm kích thước package và tăng tốc độ khởi động.
- **Các npm scripts liên quan trong [package.json](package.json)**:
  - `npm run build`: Thực thi lệnh esbuild đóng gói ra [dist/index.js](dist/index.js).
  - `npm run prepublishOnly`: Hook tự động chạy `npm run build` trước khi package được publish.
  - `npm run typecheck`: Kiểm tra kiểu dữ liệu TypeScript (`tsc --noEmit`).
  - `npm test`: Chạy unit test suite với Node native test runner (`node --import tsx --test`).

### 2. Chi tiết Workflow GitHub Actions ([publish.yml](.github/workflows/publish.yml))
- **Điều kiện kích hoạt (Triggers)**:
  - `release: types: [published]`: Tự động kích hoạt khi tạo và publish một GitHub Release mới.
  - `workflow_dispatch`: Hỗ trợ chạy thủ công trực tiếp từ giao diện GitHub Actions.
- **Các quyền (Permissions)**:
  - `contents: read`: Quyền đọc repository.
  - `id-token: write`: Cần thiết để tạo OIDC token xác thực tính xác thực nguồn gốc (Provenance) khi publish lên NPM.
- **Các bước pipeline (Steps)**:
  1. `actions/checkout@v4`: Lấy mã nguồn mới nhất từ repo.
  2. `actions/setup-node@v4`: Thiết lập Node.js 20 và registry `https://registry.npmjs.org`.
  3. `npm install`: Cài đặt dependencies phục vụ quá trình test và build.
  4. `npm test`: Chạy automated test suite để đảm bảo mã nguồn hoạt động chính xác.
  5. `npm run build`: Đóng gói ra bundle [dist/index.js](dist/index.js).
  6. `npm publish --access public --provenance`: Phát hành public package kèm Provenance với secret `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.

### 3. Quy trình phát hành phiên bản mới (Release Process)
1. **Kiểm tra local**:
   - Chạy typecheck và test:
     ```bash
     npm run typecheck && npm test
     ```
   - Chạy thử lệnh build:
     ```bash
     npm run build
     ```
2. **Nâng version package**:
   - Cập nhật trường `version` trong [package.json](package.json) theo chuẩn SemVer (`patch`, `minor`, `major`).
3. **Commit & Push**:
   - Tạo commit với tiêu đề và mô tả chi tiết bằng tiếng Việt có dấu:
     ```bash
     git commit -m "chore(release): phát hành phiên bản vX.Y.Z

     Mô tả các thay đổi trong bản phát hành:
     - <nội dung thay đổi 1>
     - <nội dung thay đổi 2>"
     ```
   - Chỉ push commit lên nhánh `main` khi có yêu cầu trực tiếp từ người dùng.
4. **Tạo GitHub Release & Tag**:
   - Tạo annotated tag với tiêu đề và mô tả đầy đủ bằng tiếng Việt có dấu:
     ```bash
     git tag -a vX.Y.Z -m "Phát hành phiên bản vX.Y.Z: <tiêu đề tóm tắt>

     Chi tiết tính năng và bản vá:
     - <tính năng 1>
     - <tính năng 2>"
     ```
   - Tạo Release trên GitHub gắn với tag vừa tạo (thông qua GitHub Web UI, `gh release create`, hoặc MCP GitHub) với release notes bằng tiếng Việt có dấu.
   - Khi Release được Publish, workflow `Publish to NPM` sẽ tự động chạy và đẩy phiên bản mới lên npmjs.com.
5. **Xác nhận**:
   - Kiểm tra log chạy của Action trên GitHub.
   - Xác nhận phiên bản mới đã sẵn sàng trên NPM bằng lệnh:
     ```bash
     npm view truyen-audio-mcp version
     ```

## MCP Tools Khác
- `gitnexus`: Đọc và phân tích API/codebase qua repo `/home/dev/Project/truyen-audio`
- `gitnexus analyze -f --skip-skills --skip-agents-md`: Phân tích codebase và xuất ra file JSON chứa thông tin API/codebase.


