/**
 * 飞书MCP客户端示例 - 检索多维表格记录
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { HttpClientTransport } from '@modelcontextprotocol/sdk/client/http.js';

// 连接到MCP服务器
const connectToMcpServer = async () => {
  // 创建HTTP客户端传输
  const transport = new HttpClientTransport({
    serverUrl: "http://localhost:3000",
    sseEndpoint: "/sse",
    messageEndpoint: "/messages"
  });

  // 创建MCP客户端
  const client = new Client(
    {
      name: "飞书MCP测试客户端",
      version: "1.0.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 连接到服务器
  await client.connect(transport);
  console.log("已连接到飞书MCP服务器");

  return client;
};

// 调用获取记录工具
const getBitableRecord = async (client) => {
  try {
    // 替换为实际的访问凭证和多维表格信息
    const result = await client.callTool({
      name: "get_record",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        recordId: "recxxxxx"        // 替换为实际的记录ID
      }
    });

    console.log("获取记录结果:", result);
    return result;
  } catch (error) {
    console.error("获取记录失败:", error);
    throw error;
  }
};

// 运行示例
const runExample = async () => {
  try {
    const client = await connectToMcpServer();
    await getBitableRecord(client);
  } catch (error) {
    console.error("示例运行失败:", error);
  }
};

// 执行示例
runExample(); 