/**
 * Cấu hình môi trường cho MCP Server
 */
export interface AppConfig {
  readonly apiUrl: string;
  readonly apiToken: string;
  readonly serverName: string;
  readonly serverVersion: string;
}

// ponytail: fallback mặc định localhost khi không truyền env, nâng cấp qua file cấu hình riêng nếu mở rộng
export const config: AppConfig = {
  apiUrl: process.env.TRUYEN_AUDIO_API_URL || 'http://localhost:8000/mcp',
  apiToken: process.env.TRUYEN_AUDIO_API_TOKEN || '',
  serverName: 'truyen-audio-mcp',
  serverVersion: '1.0.0',
};
