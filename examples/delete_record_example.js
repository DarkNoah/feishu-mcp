/**
 * 飞书MCP客户端示例 - 删除多维表格记录
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

// 创建并删除记录示例
const createAndDeleteRecord = async (client) => {
  try {
    // 步骤1: 创建一条新记录
    console.log("步骤1: 创建记录");

    const createResult = await client.callTool({
      name: "create_record",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        fields: JSON.stringify({
          "文本": "这是一条测试记录，将被删除",
          "数字": 999,
          "创建时间": new Date().toISOString()
        })
      }
    });

    console.log("创建记录结果:", createResult);

    // 从创建结果中提取记录ID
    const recordId = createResult.content[0].text.match(/记录ID: ([^\\n]+)/)?.[1];

    if (!recordId) {
      throw new Error("无法获取创建的记录ID");
    }

    console.log(`已创建记录，ID: ${recordId}`);

    // 步骤2: 获取创建的记录详情
    console.log("\n步骤2: 获取记录详情");

    const getResult = await client.callTool({
      name: "get_record",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        recordId
      }
    });

    console.log("获取记录结果:", getResult);

    // 步骤3: 删除记录
    console.log("\n步骤3: 删除记录");

    const deleteResult = await client.callTool({
      name: "delete_record",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        recordId
      }
    });

    console.log("删除记录结果:", deleteResult);

    // 步骤4: 验证记录已被删除
    console.log("\n步骤4: 验证记录已被删除");

    try {
      const verifyResult = await client.callTool({
        name: "get_record",
        arguments: {
          accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
          appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
          tableId: "tblxxxxxx",       // 替换为实际的表格ID
          recordId
        }
      });

      console.log("验证结果 (预期失败):", verifyResult);
    } catch (error) {
      console.log("记录已成功删除，无法再获取");
    }

    return { success: true };
  } catch (error) {
    console.error("操作失败:", error);
    return { success: false, error };
  }
};

// 直接删除指定记录
const deleteSpecificRecord = async (client, recordId) => {
  try {
    console.log(`删除指定记录: ${recordId}`);

    const deleteResult = await client.callTool({
      name: "delete_record",
      arguments: {
        accessToken: "t-g10xxxxx",  // 替换为实际的访问凭证
        appToken: "bascnxxxxxx",    // 替换为实际的多维表格ID
        tableId: "tblxxxxxx",       // 替换为实际的表格ID
        recordId
      }
    });

    console.log("删除记录结果:", deleteResult);
    return deleteResult;
  } catch (error) {
    console.error("删除指定记录失败:", error);
    throw error;
  }
};

// 运行示例
const runExample = async () => {
  try {
    const client = await connectToMcpServer();

    // 示例1: 创建并删除记录的完整流程
    console.log("\n=== 示例1: 创建并删除记录 ===");
    await createAndDeleteRecord(client);

    // 示例2: 直接删除指定记录 (替换为实际存在的记录ID)
    // console.log("\n=== 示例2: 删除指定记录 ===");
    // await deleteSpecificRecord(client, "recXXXXXXXX");

  } catch (error) {
    console.error("示例运行失败:", error);
  }
};

// 执行示例
runExample(); 