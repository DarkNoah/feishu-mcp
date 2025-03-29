/**
 * 示例：创建飞书多维表格应用
 * 
 * 本示例展示如何使用create_bitable_app工具创建一个新的飞书多维表格应用
 */

// 导入必要的库
const axios = require('axios');

// MCP服务器地址
const MCP_SERVER_URL = 'http://localhost:3000/messages';

/**
 * 创建一个新的飞书多维表格应用
 * @param {string} accessToken - 访问令牌（tenant_access_token或user_access_token）
 * @param {string} name - 新多维表格应用的名称
 * @param {string} [folderToken] - 可选的文件夹标识符，用于指定应用的存储位置
 * @returns {Promise<object>} - 包含新创建的多维表格应用信息的响应对象
 */
async function createBitableApp(accessToken, name, folderToken = null) {
  try {
    // 准备工具调用请求
    const requestData = {
      tool_calls: [
        {
          name: 'create_bitable_app',
          parameters: {
            accessToken: accessToken,
            name: name
          }
        }
      ]
    };

    // 如果提供了folderToken，加入参数
    if (folderToken) {
      requestData.tool_calls[0].parameters.folderToken = folderToken;
    }

    // 发送请求到MCP服务器
    const response = await axios.post(MCP_SERVER_URL, requestData);
    console.log('多维表格应用创建成功：', response.data.tool_results[0]);

    // 返回创建结果，包含新应用的appToken
    return response.data.tool_results[0];
  } catch (error) {
    console.error('创建多维表格应用失败：', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * 使用示例
 * 
 * 在运行此示例前，请确保：
 * 1. MCP服务器已启动并运行在http://localhost:3000
 * 2. 您已获取有效的飞书API访问令牌
 */
async function runExample() {
  // 替换为您的实际访问令牌
  const accessToken = 'YOUR_ACCESS_TOKEN';

  try {
    // 创建一个新的多维表格应用
    const result = await createBitableApp(accessToken, '项目管理应用');

    if (result.success) {
      console.log(`应用创建成功！appToken: ${result.appToken}`);

      // 应用创建成功后，您可以使用返回的appToken进行后续操作
      // 例如创建表格、添加记录等
      console.log('您现在可以使用这个appToken来创建表格和记录');

      // 示例：在特定文件夹中创建应用
      // const folderResult = await createBitableApp(
      //   accessToken,
      //   '客户管理应用',
      //   'fldcniPNxGTrH1pD'  // 替换为实际的文件夹token
      // );
    } else {
      console.error('应用创建失败：', result.error || '未知错误');
    }
  } catch (error) {
    console.error('示例执行失败：', error);
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runExample().catch(console.error);
}

module.exports = {
  createBitableApp
}; 