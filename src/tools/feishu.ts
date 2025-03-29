import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { CONFIG } from '../config.js';
import * as lark from '@larksuiteoapi/node-sdk';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';

dotenv.config();


let client :lark.Client|undefined ;


const getClient = (): lark.Client => { 
  const configIndex = process.argv.findIndex(x => x == "--config");
  let configObj;
  if (configIndex >= 0) {
    const configJson = process.argv[configIndex + 1];
    if (!configJson) throw new Error("请使用 --config 参数指定配置文件");
    configObj = JSON.parse(configJson);

  }
  
  const appId = process.env.FEISHU_APPID || configObj?.appId;
  const appSecret = process.env.FEISHU_APPSECRET || configObj?.appSecret;
  if (!appId || !appSecret) {
    throw new Error("appId 和 appSecret 不能为空");
  }
  if (client) {
    return client;
  }

  client = new lark.Client({
    appId: appId,
    appSecret: appSecret
  });
  return client;
}
/**
 * 注册所有飞书相关工具到MCP服务器
 */
export function registerFeishuTools(server: McpServer) {
  
  // 注册创建多维表格记录工具
  server.tool(
    "create_record",
    "创建飞书多维表格记录",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
      fields: z.string().describe(`要增加一行多维表格记录的字段内容，JSON格式。例如：{"多行文本":"内容","单选":"选项1","多选":["选项1","选项2"],"复选框":true,"人员":[{"id":"ou_xxx"}]}`)
    },
    async ({ appToken, tableId, fields }: {
      appToken: string;
      tableId: string;
      fields: string;
    }): Promise<CallToolResult> => {
      try {
        const result = await getClient().bitable.v1.appTableRecord.create({
            data: {
              fields: JSON.parse(fields)
            },
            path: {
              app_token: appToken,
              table_id: tableId
            }
        })
        return { content: [{ type: "text", text: "Success:\n"+JSON.stringify(result.data?.record) }] };

      } catch (error:any) { 

        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
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
      viewId: z.string().optional().describe("视图的唯一标识符")
    },
    async ({
      appToken,
      tableId,
      filter,
      viewId
    }: {
      appToken: string;
      tableId: string;
      filter?: string;
      pageSize?: number;
      pageToken?: string;
      fieldNames?: string[];
      viewId?: string;
      }): Promise<CallToolResult> => {
      try {
        const result = await getClient().bitable.v1.appTableRecord.search({
          data: {
            view_id: viewId,
            filter: filter ? JSON.parse(filter) : undefined,
          },
          path: {
            app_token: appToken,
            table_id: tableId
          }
        })
        return { content: [{ type: "text", text: "Success:\n"+JSON.stringify(result.data) }] };
      }
      catch (error:any) { 
        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
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
    }): Promise<CallToolResult> => {
      try {
        const result = await getClient().bitable.v1.appTableRecord.delete({
          path: {
            app_token: appToken,
            table_id: tableId,
            record_id: recordId
          }
        })
        return { content: [{ type: "text", text: "Success\n" + JSON.stringify(result.data) }] };
      }
      catch (error:any) { 
        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
      }
    }
  );

  // 注册更新多维表格记录工具
  server.tool(
    "update_record",
    "更新飞书多维表格记录",
    {
      appToken: z.string().describe("多维表格的唯一标识符app_token"),
      tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
      recordId: z.string().describe("要更新的记录的ID"),
      fields: z.string().describe(`要增加一行多维表格记录的字段内容，JSON格式。例如：{"多行文本":"内容","单选":"选项1","多选":["选项1","选项2"],"复选框":true,"人员":[{"id":"ou_xxx"}]}`)
    },
    async ({ appToken, tableId, recordId, fields }: {
      appToken: string;
      tableId: string;
      recordId: string;
      fields: string;
    }): Promise<CallToolResult> => {
      
      try {
        const result = await getClient().bitable.v1.appTableRecord.update({
            data: {
              fields: JSON.parse(fields)
            },
            path: {
              app_token: appToken,
              table_id: tableId,
              record_id: recordId
            }
        })
        return { content: [{ type: "text", text: "Error:\n"+JSON.stringify(result.data?.record) }] };
      }
      catch (error:any) { 
        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
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
    }): Promise<CallToolResult> => {
      try {
        const result = await getClient().bitable.v1.app.create({
          data: {
            name: name,
            folder_token: folderToken,
          }
        })
        return { content: [{ type: "text", text: "Success:\n"+JSON.stringify(result.data?.app) }] };
      }
      catch (error:any) { 
        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
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
      fields: z.string().optional().describe("要创建的字段列表，JSON格式。例如：[{\"name\":\"标题\",\"type\":\"text\"},{\"name\":\"状态\",\"type\":\"singleSelect\",\"property\":{\"options\":[{\"name\":\"未开始\"},{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}}]")
    },
    async ({ appToken, name, description, fields }: {
      appToken: string;
      name: string;
      description?: string;
      fields?: string;
    }): Promise<CallToolResult> => {
      try {
        const result = await getClient().bitable.v1.appTable.create({
          data: {
          table: {
              name: name,
              fields: fields ? JSON.parse(fields) : undefined
            }
          },
          path: {
            app_token: appToken
          }
        })
        return { content: [{ type: "text", text: "Success:\n"+JSON.stringify(result.data) }] };
      }
      catch (error:any) { 
        return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
      }
    }
  );

  // 这里可以添加更多飞书相关工具...
} 