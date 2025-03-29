/**
 * 飞书MCP服务器配置
 */
export const CONFIG = {
  // 服务器配置
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || 'localhost'
  },
  // MCP服务器信息
  mcp: {
    name: "feishu-mcp-server",
    version: "1.0.0",
    description: "提供飞书多维表格API功能的MCP服务器"
  }
}; 