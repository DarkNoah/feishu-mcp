import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { CONFIG } from '../config.js';
import * as lark from '@larksuiteoapi/node-sdk';
import { CallToolRequestSchema, CallToolResult, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { zodToJsonSchema } from 'zod-to-json-schema';

dotenv.config();


let client :lark.Client|undefined ;
let tenantToken :string |  undefined ;
let userToken: string | undefined;

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
  tenantToken = process.env.FEISHU_TENANTTOKEN || configObj?.tenantToken;
  userToken = process.env.FEISHU_USERTOKEN || configObj?.userToken;
  if (!appId || !appSecret) {
    throw new Error("appId 和 appSecret 不能为空");
  }
  if (client) {
    return client;
  }

  client = new lark.Client({
    appId: appId,
    appSecret: appSecret,
    disableTokenCache: true
  });
  return client;
}
/**
 * 注册所有飞书相关工具到MCP服务器
 */
export function registerFeishuTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "create_record",
          description: "创建飞书多维表格记录",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
            fields: z.string().describe(`要增加一行多维表格记录的字段内容，JSON格式。例如：{"多行文本":"内容","单选":"选项1","多选":["选项1","选项2"],"复选框":true,"日期":1674206443000,"超链接": {"text": "飞书多维表格官网", "link": "https://www.feishu.cn/product/base" }]}`)
          })),
        },
        {
          name: "search_records",
          description: "搜索飞书多维表格记录",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
            filter: z.string().describe('过滤条件，用于筛选记录的JSON字符串。例如：{"and":[{"field_name":"姓名","operator":"contains","value":"张"}]}').optional(),
            viewId: z.string().optional().describe("视图的唯一标识符")
          })),
        },
        {
          name: "delete_record",
          description: "删除飞书多维表格记录",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
            recordId: z.string().describe("要删除的单条记录的ID")
          })),
        },
        {
          name: "update_record",
          description: "更新飞书多维表格记录",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
            recordId: z.string().describe("要更新的记录的ID"),
            fields: z.string().describe(`要增加一行多维表格记录的字段内容，JSON格式。例如：{"多行文本":"内容","单选":"选项1","多选":["选项1","选项2"],"复选框":true,"日期":1674206443000,"超链接": {"text": "飞书多维表格官网", "link": "https://www.feishu.cn/product/base" }]}`)
          })),
        },
        {
          name: "list_fields",
          description: "获取多维表格数据表中的的所有字段",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            tableId: z.string().describe("多维表格数据表的唯一标识符 table_id"),
          })),
        },
        {
          name: "create_bitable_app",
          description: "创建飞书多维表格应用",
          inputSchema: zodToJsonSchema(z.object({
            name: z.string().describe("多维表格应用的名称"),
            folderToken: z.string().optional().describe("文件夹的唯一标识符(非必须)，用于指定新创建的多维表格所在的位置")
          })),
        },
        {
          name: "create_table",
          description: "创建飞书多维表格数据表",
          inputSchema: zodToJsonSchema(z.object({
            appToken: z.string().describe("多维表格的唯一标识符app_token"),
            name: z.string().describe("要创建的数据表名称"),
            fields: z.string().optional().describe(["要创建的字段列表，JSON格式。例如：[",
              "{\"name\":\"表头名称(多行文本)\",\"type\":\"text\"},",
              "{\"name\":\"表头名称(数值)\",\"type\":\"number\"},",
              "{\"name\":\"表头名称(单选)\",\"type\":\"singleSelect\",\"property\":{\"options\":[{\"name\":\"未开始\"},{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}},",
              "{\"name\":\"表头名称(多选)\",\"type\":\"multipleSelect\",\"property\":{\"options\":[{\"name\":\"未开始\"},{\"name\":\"进行中\"},{\"name\":\"已完成\"}]}},",
              "{\"name\":\"表头名称(复选框)\",\"type\":\"checkbox\"},",
              "{\"name\":\"表头名称(日期)\",\"type\":\"date\"}",
              "{\"name\":\"表头名称(超链接)\",\"type\":\"link\"}",
              
              "]",
            "只能创建以上类型的字段"].join('\n'))
          })),
        },
      ],
    };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      if (!request.params.arguments) {
        throw new Error("Arguments are required");
      }
      switch (request.params.name) {
        case "create_record": { 
          const { appToken, tableId, fields } = request.params.arguments;
          const result = await getClient().bitable.v1.appTableRecord.create({
            data: {
              fields: JSON.parse(fields as string)
            },
            path: {
              app_token: appToken as string,
              table_id: tableId as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data?.record) }] };
        }
        case "search_records": { 
          const { appToken, tableId, filter, viewId } = request.params.arguments;
          const result = await getClient().bitable.v1.appTableRecord.search({
            data: {
              view_id: viewId as string,
              filter: filter ? JSON.parse(filter as string) : undefined
            },
            path: {
              app_token: appToken as string,
              table_id: tableId as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data) }] };
        }
        case "delete_record": { 
          const { appToken, tableId, recordId } = request.params.arguments;
          const result = await getClient().bitable.v1.appTableRecord.delete({
            path: {
              app_token: appToken as string,
              table_id: tableId as string,
              record_id: recordId as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data) }] };
        }
        case "update_record": { 
          const { appToken, tableId, recordId, fields } = request.params.arguments;
          const result = await getClient().bitable.v1.appTableRecord.update({
            data: {
              fields: JSON.parse(fields as string)
            },
            path: {
              app_token: appToken as string,
              table_id: tableId as string,
              record_id: recordId as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data?.record) }] };
        }
        case "list_fields": {
          const { appToken, tableId } = request.params.arguments;
          const result = await getClient().bitable.v1.appTableField.list({
            path: {
              app_token: appToken as string,
              table_id: tableId as string,
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data?.items) }] };
        }
        case "create_bitable_app": { 
          const { name, folderToken } = request.params.arguments;
          const result = await getClient().bitable.v1.app.create({
            data: {
              name: name as string,
              folder_token: folderToken as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data?.app) }] };
        }
        case "create_table": {
          const { appToken, name, fields } = request.params.arguments;


          const fieldsInput = [] as any[];
          (JSON.parse(fields as string) as any[]).forEach((field: any) => {
            if (field.type == "text") {
              fieldsInput.push({
                field_name: field.name,
                type: 1
              })
            }
            else if (field.type == "number") {
              fieldsInput.push({
                field_name: field.name,
                type: 2
              })
            }
            else if (field.type == "singleSelect") {
              fieldsInput.push({
                field_name: field.name,
                type: 3,
                property: field.property
              })
            }
            else if (field.type == "multipleSelect") {
              fieldsInput.push({
                field_name: field.name,
                type: 4,
                property: field.property
              })
            }
            else if (field.type == "date") {
              fieldsInput.push({
                field_name: field.name,
                type: 5
              })
            }
            else if (field.type == "link") {
              fieldsInput.push({
                field_name: field.name,
                type: 15
              })
            }
            else if (field.type == "checkbox") {
              fieldsInput.push({
                field_name: field.name,
                type: 7
              })
            }
          });


          const result = await getClient().bitable.v1.appTable.create({
            data: {
              table: {
                name: name as string,
                fields: fieldsInput
              }
            },
            path: {
              app_token: appToken as string
            }
          }, userToken ? lark.withUserAccessToken(userToken) :  undefined)
          if (result.msg !='success') {
            throw new Error((result as any)?.error?.message);
          }
          return { content: [{ type: "text", text: "Success:\n" + JSON.stringify(result.data) }] };
        }
        default: {
          return { content: [{ type: "text", text: "Error: 不支持的工具名称" }] };  
        }
      }
    } catch (error:any) { 
      return { content: [{ type: "text", text: "Error:\n"+(error?.response?.data?.msg || error?.message) }] };
    }
  });
  // 这里可以添加更多飞书相关工具...
} 