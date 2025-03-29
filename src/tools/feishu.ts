import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { CONFIG } from '../config.js';
import * as lark from '@larksuiteoapi/node-sdk';
// 飞书多维表格API基础URL
const FEISHU_BASE_URL = `${CONFIG.feishu.baseUrl}/bitable/${CONFIG.feishu.bitableApiVersion}`;

// 创建记录结果类型
interface BitableRecordResult {
  success: boolean;
  data?: any;
  recordId?: string | null;
  error?: any;
  status?: number;
}

// 检索记录结果类型
interface BitableGetRecordResult {
  success: boolean;
  data?: any;
  record?: any;
  error?: any;
  status?: number;
}

// 搜索记录结果类型
interface BitableSearchRecordsResult {
  success: boolean;
  data?: any;
  records?: any[];
  total?: number;
  error?: any;
  status?: number;
}

// 删除记录结果类型
interface BitableDeleteRecordResult {
  success: boolean;
  data?: any;
  error?: any;
  status?: number;
}

// 创建多维表格应用结果类型
interface CreateBitableAppResult {
  success: boolean;
  data?: any;
  appToken?: string | null;
  error?: any;
  status?: number;
}

// 创建数据表结果类型
interface CreateBitableTableResult {
  success: boolean;
  data?: any;
  tableId?: string | null;
  error?: any;
  status?: number;
}

/**
 * 在飞书多维表格中创建记录
 */
async function createBitableRecord(params: {
  accessToken: string;
  appToken: string;
  tableId: string;
  fields: string;
}): Promise<BitableRecordResult> {
  const { accessToken, appToken, tableId, fields } = params;

  try {
    // 解析字段内容JSON
    const fieldsObj = JSON.parse(fields);

    // 构建API请求
    const response = await axios.post(
      `${FEISHU_BASE_URL}/apps/${appToken}/tables/${tableId}/records`,
      { fields: fieldsObj },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      recordId: response.data?.data?.record?.id || null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 根据记录ID检索飞书多维表格记录
 */
async function getBitableRecord(params: {
  accessToken: string;
  appToken: string;
  tableId: string;
  recordId: string;
}): Promise<BitableGetRecordResult> {
  const { accessToken, appToken, tableId, recordId } = params;

  try {
    // 构建API请求
    const response = await axios.get(
      `${FEISHU_BASE_URL}/apps/${appToken}/tables/${tableId}/records/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      record: response.data?.data?.record || null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 搜索飞书多维表格记录
 */
async function searchBitableRecords(params: {
  accessToken: string;
  appToken: string;
  tableId: string;
  filter?: string;
  pageSize?: number;
  pageToken?: string;
  fieldNames?: string[];
  sort?: { field_name: string; desc: boolean }[];
  viewId?: string;
  textFieldAsArray?: boolean;
}): Promise<BitableSearchRecordsResult> {
  const {
    accessToken,
    appToken,
    tableId,
    filter,
    pageSize,
    pageToken,
    fieldNames,
    sort,
    viewId,
    textFieldAsArray
  } = params;

  try {
    // 解析过滤条件
    const filterObj = filter ? JSON.parse(filter) : undefined;
    const sortObj = sort || undefined;

    // 构建请求数据
    const requestData: any = {};
    if (filterObj) requestData.filter = filterObj;
    if (pageSize) requestData.page_size = pageSize;
    if (pageToken) requestData.page_token = pageToken;
    if (fieldNames && fieldNames.length > 0) requestData.field_names = fieldNames;
    if (sortObj) requestData.sort = sortObj;
    if (viewId) requestData.view_id = viewId;
    if (textFieldAsArray !== undefined) requestData.text_field_as_array = textFieldAsArray;

    // 构建API请求
    const response = await axios.post(
      `${FEISHU_BASE_URL}/apps/${appToken}/tables/${tableId}/records/search`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      records: response.data?.data?.items || [],
      total: response.data?.data?.total || 0,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 删除飞书多维表格记录
 */
async function deleteBitableRecord(params: {
  accessToken: string;
  appToken: string;
  tableId: string;
  recordId: string;
}): Promise<BitableDeleteRecordResult> {
  const { accessToken, appToken, tableId, recordId } = params;

  try {
    // 构建API请求
    const response = await axios.delete(
      `${FEISHU_BASE_URL}/apps/${appToken}/tables/${tableId}/records/${recordId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 创建飞书多维表格应用
 */
async function createBitableApp(params: {
  accessToken: string;
  name: string;
  folderToken?: string;
}): Promise<CreateBitableAppResult> {
  const { accessToken, name, folderToken } = params;

  try {
    // 构建请求数据
    const requestData: any = {
      name
    };

    if (folderToken) {
      requestData.folder_token = folderToken;
    }

    // 构建API请求
    const response = await axios.post(
      `${FEISHU_BASE_URL}/apps`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      appToken: response.data?.data?.app?.app_token || null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 创建飞书多维表格数据表
 */
async function createBitableTable(params: {
  accessToken: string;
  appToken: string;
  name: string;
  fields?: { name: string; type: string; property?: any }[];
  description?: string;
}): Promise<CreateBitableTableResult> {
  const { accessToken, appToken, name, fields, description } = params;

  try {
    // 构建请求数据
    const requestData: any = {
      table: {
        name
      }
    };

    if (description) {
      requestData.table.description = description;
    }

    if (fields && fields.length > 0) {
      requestData.table.fields = fields;
    }

    // 构建API请求
    const response = await axios.post(
      `${FEISHU_BASE_URL}/apps/${appToken}/tables`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      tableId: response.data?.data?.table?.table_id || null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status,
      };
    }

    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * 注册所有飞书相关工具到MCP服务器
 */
export function registerFeishuTools(server: McpServer) {
  const client = new lark.Client({
    appId: 'app id',
    appSecret: 'app secret'
  });
  // 注册创建多维表格记录工具
  server.tool(
    "create_record",
    "创建飞书多维表格记录",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
      fields: z.string().describe(`要增加一行多维表格记录的字段内容，JSON格式。例如：{"多行文本":"内容","单选":"选项1","多选":["选项1","选项2"],"复选框":true,"人员":[{"id":"ou_xxx"}]}`)
    },
    async ({ accessToken, appToken, tableId, fields }: {
      accessToken?: string;
      appToken: string;
      tableId: string;
      fields: string;
    }) => {
      try {

        const result = await createBitableRecord({
          accessToken: accessToken || CONFIG.feishu.getAccessToken(),
          appToken,
          tableId,
          fields
        });

        if (result.success) {
          return {
            content: [{
              type: "text",
              text: `成功创建记录，记录ID: ${result.recordId}\n完整响应: ${JSON.stringify(result.data, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `创建记录失败: ${JSON.stringify(result.error, null, 2)}`
            }],
            isError: true
          };
        }
      } catch (error: unknown) {
        return {
          content: [{
            type: "text",
            text: `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );
  // 注册搜索多维表格记录工具
  server.tool(
    "search_records",
    "搜索飞书多维表格记录",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
      filter: z.string().describe('过滤条件，用于筛选记录的JSON字符串。例如：{"and":[{"field_name":"姓名","operator":"contains","value":"张"}]}').optional(),
      pageSize: z.number().optional().describe("分页大小，默认为 20"),
      pageToken: z.string().optional().describe("分页标记，第一次请求不填"),
      fieldNames: z.array(z.string()).optional().describe("要返回的字段名列表"),
      viewId: z.string().optional().describe("视图的唯一标识符")
    },
    async ({
      appToken,
      tableId,
      filter,
      pageSize,
      pageToken,
      fieldNames,
      viewId
    }: {
      appToken: string;
      tableId: string;
      filter?: string;
      pageSize?: number;
      pageToken?: string;
      fieldNames?: string[];
      viewId?: string;
    }) => {
      try {
        const result = await searchBitableRecords({
          accessToken: CONFIG.feishu.getAccessToken(),
          appToken,
          tableId,
          filter,
          pageSize,
          pageToken,
          fieldNames,
          viewId,
          textFieldAsArray: false
        });

        if (result.success) {
          return {
            content: [{
              type: "text",
              text: `成功搜索记录，共找到 ${result.total || 0} 条结果:\n${JSON.stringify(result.records, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `搜索记录失败: ${JSON.stringify(result.error, null, 2)}`
            }],
            isError: true
          };
        }
      } catch (error: unknown) {
        return {
          content: [{
            type: "text",
            text: `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // 注册删除多维表格记录工具
  server.tool(
    "delete_record",
    "删除飞书多维表格记录",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
      recordId: z.string().describe("要删除的单条记录的ID")
    },
    async ({ appToken, tableId, recordId }: {
      appToken: string;
      tableId: string;
      recordId: string;
    }) => {
      try {
        // 先获取记录信息，用于记录日志和返回确认信息
        const getResult = await getBitableRecord({
          accessToken: CONFIG.feishu.getAccessToken(),
          appToken,
          tableId,
          recordId
        });

        // 只有在记录存在时才执行删除操作
        if (getResult.success && getResult.record) {
          const result = await deleteBitableRecord({
            accessToken: CONFIG.feishu.getAccessToken(),
            appToken,
            tableId,
            recordId
          });

          if (result.success) {
            return {
              content: [{
                type: "text",
                text: `成功删除记录，记录ID: ${recordId}\n被删除的记录数据:\n${JSON.stringify(getResult.record, null, 2)}`
              }]
            };
          } else {
            return {
              content: [{
                type: "text",
                text: `删除记录失败: ${JSON.stringify(result.error, null, 2)}`
              }],
              isError: true
            };
          }
        } else {
          return {
            content: [{
              type: "text",
              text: `要删除的记录不存在或无法获取记录信息: ${JSON.stringify(getResult.error, null, 2)}`
            }],
            isError: true
          };
        }
      } catch (error: unknown) {
        return {
          content: [{
            type: "text",
            text: `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // 注册创建多维表格应用工具
  server.tool(
    "create_bitable_app",
    "创建飞书多维表格应用",
    {
      name: z.string().describe("多维表格应用的名称"),
      folderToken: z.string().optional().describe("文件夹的唯一标识符，用于指定新创建的多维表格所在的位置")
    },
    async ({ name, folderToken }: {
      name: string;
      folderToken?: string;
    }) => {
      try {
        const result = await createBitableApp({
          accessToken: CONFIG.feishu.getAccessToken(),
          name,
          folderToken
        });

        if (result.success) {
          return {
            content: [{
              type: "text",
              text: `成功创建多维表格应用，应用Token: ${result.appToken}\n完整响应: ${JSON.stringify(result.data, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `创建多维表格应用失败: ${JSON.stringify(result.error, null, 2)}`
            }],
            isError: true
          };
        }
      } catch (error: unknown) {
        return {
          content: [{
            type: "text",
            text: `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // 注册创建数据表工具
  server.tool(
    "create_table",
    "创建飞书多维表格数据表",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      name: z.string().describe("要创建的数据表名称"),
      description: z.string().optional().describe("数据表的描述信息（可选）"),
      fields: z.string().optional().describe("要创建的字段列表，JSON格式。例如：[{\"name\":\"标题\",\"type\":\"text\"},{\"name\":\"状态\",\"type\":\"singleSelect\",\"property\":{\"options\":[{\"name\":\"未开始\"},{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}}]")
    },
    async ({ appToken, name, description, fields }: {
      appToken: string;
      name: string;
      description?: string;
      fields?: string;
    }) => {
      try {
        // 解析字段内容JSON（如果提供）
        const fieldsObj = fields ? JSON.parse(fields) : undefined;

        const result = await createBitableTable({
          accessToken: CONFIG.feishu.getAccessToken(),
          appToken,
          name,
          description,
          fields: fieldsObj
        });

        if (result.success) {
          return {
            content: [{
              type: "text",
              text: `成功创建数据表，数据表ID: ${result.tableId}\n完整响应: ${JSON.stringify(result.data, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{
              type: "text",
              text: `创建数据表失败: ${JSON.stringify(result.error, null, 2)}`
            }],
            isError: true
          };
        }
      } catch (error: unknown) {
        return {
          content: [{
            type: "text",
            text: `执行过程中发生错误: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    }
  );

  // 这里可以添加更多飞书相关工具...
} 