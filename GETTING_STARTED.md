# 飞书 MCP 服务器 - 快速入门指南

这个指南将帮助您设置并运行飞书MCP服务器，以便AI大模型可以直接访问飞书API。

## 环境要求

- Node.js 16+ (推荐 Node.js 20+)
- npm 或 yarn 包管理器

## 安装步骤

1. 克隆或下载此仓库
2. 安装依赖

```bash
npm install
```

3. 构建项目

```bash
npm run build
```

4. 启动服务器

```bash
npm start
```

## 开发模式

如果您想进行开发或修改，可以使用开发模式：

```bash
npm run dev
```

## 常见问题解决

### 1. 运行 `npm run dev` 时出现 "Unknown file extension '.ts'" 错误

这通常是由于 ts-node 的 ESM 支持问题导致的。请确保：

- package.json 的 dev 脚本已配置为 `"dev": "node --loader ts-node/esm src/index.ts"`
- tsconfig.json 中添加了 ts-node 配置：

```json
"ts-node": {
  "esm": true,
  "experimentalSpecifierResolution": "node"
}
```

### 2. 找不到模块或类型定义错误

如果您遇到有关找不到模块的错误，这可能是由于类型定义问题导致的。我们在 `src/types/modules.d.ts` 提供了基本的类型定义，确保它们被正确引用。

### 3. 飞书API访问问题

要使用飞书API，您需要：

- 获取有效的飞书应用访问凭证（tenant_access_token 或 user_access_token）
- 确保应用拥有正确的权限范围
- 确认多维表格的 appToken 和 tableId 是正确的

## 测试MCP服务器

1. 启动服务器后，访问 http://localhost:3000 查看欢迎页面
2. 可以使用 `examples` 目录中的示例客户端代码进行测试

```bash
node examples/create_record_example.js
```

记得在示例中替换必要的凭证和IDs。

## 下一步

- 阅读 README.md 了解更多详细信息
- 查看 `src/tools/feishu.ts` 了解如何添加更多飞书API工具
- 探索 Model Context Protocol 的更多功能 