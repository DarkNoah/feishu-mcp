# 飞书 MCP 服务器

这是一个为飞书（Feishu/Lark）应用提供Model Context Protocol (MCP) 服务的实现，允许AI大模型通过工具调用与飞书API进行交互，目前主要支持多维表格操作。

## 功能特性

- 基于[Model Context Protocol (MCP) TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- 提供飞书多维表格操作工具
- 支持HTTP+SSE通信

## 已实现工具

### create_record

在飞书多维表格中创建一条新记录

### update_record

在飞书多维表格中更新一条记录

### search_records

在多维表格中搜索符合条件的记录

### delete_record

删除多维表格中的一条记录


### create_bitable_app

创建一个新的飞书多维表格应用

### create_table

创建飞书多维表格中的一个新数据表


## Development
```sh
# Install dependencies
npm install

# Build
npm run build

# Dev
npm run dev

```









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