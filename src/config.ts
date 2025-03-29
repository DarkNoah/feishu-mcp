/**
 * 飞书MCP服务器配置
 */
export const CONFIG = {
  // 服务器配置
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.HOST || 'localhost'
  },

  // 飞书API配置
  feishu: {
    baseUrl: 'https://open.feishu.cn/open-apis',
    bitableApiVersion: 'v1',
    // accessToken: process.env.FEISHU_ACCESS_TOKEN,
    getAccessToken: () => {
      const configIndex = process.argv.findIndex(x => x == "--config");
      if (configIndex == -1) return null;
      const configJson = process.argv[configIndex + 1];
      if (!configJson) return null;
      const configObj = JSON.parse(configJson);
      return configObj.accessToken;
    }

  },

  // MCP服务器信息
  mcp: {
    name: "feishu-mcp-server",
    version: "1.0.0",
    description: "提供飞书多维表格API功能的MCP服务器"
  }
}; 