import express, { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerFeishuTools } from './tools/feishu.js';
import { CONFIG } from './config.js';

// 解析命令行参数
const args = process.argv.slice(2);
const transportMode = args.includes('--stdio') ? 'stdio' : 'sse';

// 创建MCP服务器
const server = new McpServer({
  name: CONFIG.mcp.name,
  version: CONFIG.mcp.version,
  description: CONFIG.mcp.description
});

// 注册飞书相关工具
registerFeishuTools(server);

// 根据传输模式启动不同的服务
if (transportMode === 'stdio') {
  // 使用标准输入/输出作为传输层
  console.log(`正在以stdio模式启动飞书MCP服务器...`);

  const transport = new StdioServerTransport();
  server.connect(transport).catch(error => {
    console.error('连接到stdio传输层时出错:', error);
    process.exit(1);
  });
} else {
  // 使用SSE作为传输层（默认模式）
  // 创建Express应用
  const app = express();
  const PORT = CONFIG.server.port;

  // 为支持多个同时连接创建transport查找对象
  const transports: { [sessionId: string]: SSEServerTransport } = {};

  // 设置SSE端点
  app.get("/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;

    res.on("close", () => {
      delete transports[transport.sessionId];
      console.log(`会话 ${transport.sessionId} 已关闭`);
    });

    console.log(`新会话已连接: ${transport.sessionId}`);
    await server.connect(transport);
  });

  // 设置消息处理端点
  app.post("/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];

    if (transport) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send('未找到对应的会话');
    }
  });

  // 添加简单的欢迎页面
  app.get('/', (_, res) => {
    res.send(`
      <html>
        <head><title>${CONFIG.mcp.name} MCP服务器</title></head>
        <body>
          <h1>${CONFIG.mcp.name} MCP服务器</h1>
          <p>${CONFIG.mcp.description}</p>
          <p>版本: ${CONFIG.mcp.version}</p>
          <p>状态: 运行中</p>
          <h2>端点:</h2>
          <ul>
            <li>SSE端点: <code>/sse</code></li>
            <li>消息端点: <code>/messages</code></li>
          </ul>
        </body>
      </html>
    `);
  });

  // 启动服务器
  app.listen(PORT, () => {
    console.log(`飞书MCP服务器已启动，监听端口: ${PORT}`);
    console.log(`查看：http://${CONFIG.server.host}:${PORT}`);
  });
} 