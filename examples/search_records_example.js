/**
 * 飞书MCP客户端示例 - 搜索多维表格记录
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

// 调用搜索记录工具
const searchBitableRecords = async (client) => {
  try {
    // 构建过滤条件 - 示例：搜索姓名包含"张"的记录
    const filter = {
      and: [
        {
          field_name: "姓名",
          operator: "contains",
          value: "张"
        }
      ]
    };

    // 替换为实际的访问凭证和多维表格信息
    const result = await client.callTool({
      name: "search_records",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        filter: JSON.stringify(filter),
        pageSize: 10,
        fieldNames: ["姓名", "电话", "部门"]  // 只返回这些字段
      }
    });

    console.log("搜索记录结果:", result);
    return result;
  } catch (error) {
    console.error("搜索记录失败:", error);
    throw error;
  }
};

// 运行复杂搜索示例
const runComplexSearchExample = async (client) => {
  try {
    // 构建复杂过滤条件
    const complexFilter = {
      and: [
        {
          field_name: "部门",
          operator: "=",
          value: "技术部"
        },
        {
          or: [
            {
              field_name: "年龄",
              operator: ">=",
              value: 30
            },
            {
              field_name: "职位",
              operator: "contains",
              value: "经理"
            }
          ]
        }
      ]
    };

    // 替换为实际的访问凭证和多维表格信息
    const result = await client.callTool({
      name: "search_records",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        filter: JSON.stringify(complexFilter),
        pageSize: 100
      }
    });

    console.log("复杂搜索结果:", result);
    return result;
  } catch (error) {
    console.error("复杂搜索失败:", error);
    throw error;
  }
};

// 运行示例
const runExamples = async () => {
  try {
    const client = await connectToMcpServer();

    console.log("\n=== 基本搜索示例 ===");
    await searchBitableRecords(client);

    console.log("\n=== 复杂搜索示例 ===");
    await runComplexSearchExample(client);
  } catch (error) {
    console.error("示例运行失败:", error);
  }
};

// 执行示例
runExamples(); 