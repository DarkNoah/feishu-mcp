# 飞书 MCP 服务器

这是一个为飞书（Feishu/Lark）应用提供Model Context Protocol (MCP) 服务的实现，允许AI大模型通过工具调用与飞书API进行交互，目前主要支持多维表格操作。

## 功能特性

- 基于[Model Context Protocol (MCP) TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- 提供飞书多维表格操作工具
- 支持HTTP+SSE通信

## 已实现工具

### create_record

在飞书多维表格中创建一条新记录。

**参数：**

- `accessToken`: 字符串，必填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `appToken`: 字符串，必填，多维表格的唯一标识符app_token
- `tableId`: 字符串，必填，多维表格数据表的唯一标识符 table_id
- `fields`: 字符串，必填，要增加一行多维表格记录的字段内容，JSON格式

**字段格式示例:**

```json
{
  "多行文本": "多行文本内容",
  "单选": "选项1",
  "多选": ["选项1", "选项2"],
  "复选框": true,
  "人员": [{"id": "ou_2910013f1e6456f16a0ce75ede950a0a"}],
  "群组": [{"id": "oc_cd07f55f14d6f4a4f1b51504e7e97f48"}],
  "电话号码": "13026162666"
}
```

### create_table

创建飞书多维表格中的一个新数据表。

**参数：**

- `accessToken`: 字符串，选填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `appToken`: 字符串，必填，多维表格的唯一标识符app_token
- `name`: 字符串，必填，要创建的数据表名称
- `description`: 字符串，选填，数据表的描述信息
- `fields`: 字符串，选填，要创建的字段列表，JSON格式

**字段列表格式示例:**

```json
[
  {
    "name": "标题",
    "type": "text"
  },
  {
    "name": "状态",
    "type": "singleSelect",
    "property": {
      "options": [
        {"name": "未开始"},
        {"name": "进行中"},
        {"name": "已完成"}
      ]
    }
  },
  {
    "name": "负责人",
    "type": "user"
  },
  {
    "name": "截止日期",
    "type": "datetime"
  }
]
```

### get_record

根据记录ID检索多维表格中的一条记录。

**参数：**

- `accessToken`: 字符串，必填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `appToken`: 字符串，必填，多维表格的唯一标识符app_token
- `tableId`: 字符串，必填，多维表格数据表的唯一标识符 table_id
- `recordId`: 字符串，必填，要检索的单条记录的ID

### search_records

在多维表格中搜索符合条件的记录。

**参数：**

- `accessToken`: 字符串，必填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `appToken`: 字符串，必填，多维表格的唯一标识符app_token
- `tableId`: 字符串，必填，多维表格数据表的唯一标识符 table_id
- `filter`: 字符串，必填，过滤条件，用于筛选记录的JSON字符串
- `pageSize`: 数字，可选，分页大小，默认为20
- `pageToken`: 字符串，可选，分页标记，第一次请求不填
- `fieldNames`: 字符串数组，可选，要返回的字段名列表
- `viewId`: 字符串，可选，视图的唯一标识符

**过滤条件示例:**

```json
{
  "and": [
    {
      "field_name": "姓名",
      "operator": "contains",
      "value": "张"
    },
    {
      "field_name": "年龄",
      "operator": ">=",
      "value": 18
    }
  ]
}
```

### delete_record

删除多维表格中的一条记录。

**参数：**

- `accessToken`: 字符串，必填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `appToken`: 字符串，必填，多维表格的唯一标识符app_token
- `tableId`: 字符串，必填，多维表格数据表的唯一标识符 table_id
- `recordId`: 字符串，必填，要删除的单条记录的ID

### create_bitable_app

创建一个新的飞书多维表格应用。

**参数：**

- `accessToken`: 字符串，必填，API的访问凭证参数，tenant_access_token 或 user_access_token
- `name`: 字符串，必填，多维表格应用的名称
- `folderToken`: 字符串，可选，文件夹的唯一标识符，用于指定新创建的多维表格所在的位置

## 安装与使用

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 启动服务器

```bash
npm start
```

默认情况下，服务器将在 http://localhost:3000 端口运行。

### 运行模式

服务器支持两种运行模式：

#### SSE模式（默认，HTTP服务器）

```bash
npm start        # 或 npm run start:sse
npm run dev      # 或 npm run dev:sse
```

#### stdio模式（命令行工具模式）

```bash
npm run start:stdio
npm run dev:stdio
```

## 开发

```bash
npm run dev
```

## 与MCP客户端集成

MCP服务器启动后，可以通过以下URL连接：

- SSE端点: `http://localhost:3000/sse`
- 消息端点: `http://localhost:3000/messages`

## 飞书API参考

- [飞书多维表格API文档](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/bitable-structure)
- [创建记录API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app-table-record/create)
- [获取记录API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app-table-record/get)
- [搜索记录API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app-table-record/search)
- [删除记录API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app-table-record/delete)
- [创建多维表格应用API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app/create)
- [创建数据表API](https://open.larkoffice.com/document/server-docs/docs/bitable-v1/app-table/create)

## 许可证

MIT 