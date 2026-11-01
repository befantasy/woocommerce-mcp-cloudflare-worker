# WooCommerce MCP Server (Cloudflare Workers Edition) 🚀

全面移植自 `@amitgurbani/mcp-server-woocommerce` 的全功能 WooCommerce Model Context Protocol (MCP) 服务端，专为 **Cloudflare Workers** 边缘无服务器环境深度优化。

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Protocol-blue?logo=anthropic)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 为什么要在 Cloudflare Workers 上运行？

* **零服务器成本 & 零资源占用**：代码完全托管在 Cloudflare 全球 300+ 边缘数据中心，不消耗你的 VPS 一丁点内存和 CPU。
* **免费额度极其充足**：Cloudflare 每天免费提供 **100,000 次请求**，个人与中小团队运营绰绰有余。
* **全功能无损保留（100+ 核心工具）**：100% 涵盖多规格变体、复杂规则优惠券、订单退款、商品管理、客户数据与多维度销售报表。
* **原生支持网页版 AI**：提供标准公开的 HTTPS `/mcp` 端点（Streamable HTTP / SSE 协议），让网页版 Gemini、ChatGPT、Claude.ai、Dify、Coze 均可直接接入。

---

## 📦 包含的 21 个全套工具模块（100+ Tools）

| 模块名称 | 包含的核心工具 | 说明 |
| :--- | :--- | :--- |
| **Products** | `list_products`, `create_product`, `update_product`, `delete_product` | 包含简单商品、可变商品全字段管理 |
| **Variations** | `list_product_variations`, `create_product_variation`, `update_product_variation`, `delete_product_variation` | 多规格变体商品的价格、SKU、库存控制 |
| **Attributes** | `list_attributes`, `create_attribute`, `manage_attribute_terms` | 全局属性（颜色、尺码、剂量）增删改查 |
| **Coupons** | `list_coupons`, `create_coupon`, `update_coupon`, `delete_coupon` | 深度规则优惠券（满减/折扣/排除特价/限制邮箱） |
| **Orders** | `list_orders`, `get_order`, `update_order`, `delete_order` | 订单检索、状态变更、多条件筛选 |
| **Refunds** | `list_order_refunds`, `create_order_refund`, `delete_order_refund` | 订单部分与全额退款 |
| **Order Notes** | `list_order_notes`, `create_order_note`, `delete_order_note` | 内部备注与客户发货通知 |
| **Customers** | `list_customers`, `get_customer`, `create_customer`, `update_customer` | 客户画像、消费频次、地址管理 |
| **Reports** | `get_sales_report`, `get_top_sellers`, `get_order_totals` | 销售流水、热销榜单、运营数据洞察 |
| **Shipping** | `list_shipping_zones`, `manage_shipping_methods`, `shipping_classes` | 物流区域、运费规则与配送方式 |
| **Taxes** | `list_tax_rates`, `create_tax_rate`, `update_tax_rate` | 税率等级与税务核算规则 |
| **Media** | `list_media`, `delete_media`, `cleanup_orphaned_media` | WordPress 媒体库关联与清理 |
| **其他模块** | Categories, Tags, Brands, Payment Gateways, Reviews, System Status, Webhooks, Settings, Data | 全网店生态一网打尽 |

---

## 🚀 极速部署指南

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

修改 `wrangler.jsonc` 中的 `vars`，或者在 Cloudflare 仪表盘中添加加密变量（Secrets）：

```bash
# 推荐使用 Wrangler 命令行安全添加敏感密钥：
npx wrangler secret put WOOCOMMERCE_CONSUMER_KEY
npx wrangler secret put WOOCOMMERCE_CONSUMER_SECRET
npx wrangler secret put MCP_AUTH_TOKEN
```

变量清单：
* `WORDPRESS_SITE_URL`: 你的 WordPress 网站地址（如 `https://your-store.com`）
* `WOOCOMMERCE_CONSUMER_KEY`: WooCommerce 生成的 `ck_...` 密钥
* `WOOCOMMERCE_CONSUMER_SECRET`: WooCommerce 生成的 `cs_...` 密钥
* `WORDPRESS_USERNAME`: （可选）WordPress 用户名（用于媒体库管理）
* `WORDPRESS_APP_PASSWORD`: （可选）WordPress 应用程序密码
* `MCP_AUTH_TOKEN`: （推荐）你为该 MCP 接口设置的自定义 Bearer Token 访问口令

### 3. 本地调试

```bash
npm run dev
```
启动后可在本地访问 `http://localhost:8787/health` 检查运行状态。

### 4. 一键部署到 Cloudflare Workers

```bash
npx wrangler deploy
```

部署成功后，你将获得一个全球公网的 MCP URL，例如：
`https://woocommerce-mcp-server.<你的用户名>.workers.dev/mcp`

---

## 🤖 客户端接入配置

### 1. 在 Claude Desktop / Cursor 中接入

在客户端配置文件（如 `claude_desktop_config.json` 或 `.cursor/mcp.json`）中添加远程 HTTP 配置：

```json
{
  "mcpServers": {
    "woocommerce-worker": {
      "url": "https://woocommerce-mcp-server.<你的用户名>.workers.dev/mcp",
      "headers": {
        "Authorization": "Bearer 你的自定义MCP_AUTH_TOKEN"
      }
    }
  }
}
```

### 2. 在网页版 AI（ChatGPT / Gemini / Dify / Coze）中接入

* **Server URL**: `https://woocommerce-mcp-server.<你的用户名>.workers.dev/mcp`
* **Authorization Header**: `Bearer 你的自定义MCP_AUTH_TOKEN`

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
特别致谢原项目作者 [@AmitGurbani](https://github.com/AmitGurbani/mcp-server-woocommerce)。
