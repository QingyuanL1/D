# 数据分析中心

## 概述

数据分析中心是财务分析平台的核心模块，提供了全面的财务数据可视化和分析功能。该模块整合了多个分析组件，为用户提供一站式的数据分析体验。

## 功能特性

### 1. 概览仪表板
- **营业收入**: 实时显示当前营业收入数据
- **净利润**: 展示净利润指标及趋势
- **资产负债率**: 监控财务风险指标
- **ROE**: 净资产收益率分析

### 2. 分析模块卡片

数据分析中心主页直接展示了8个核心分析模块的实时数据卡片：

#### 收入与盈利分析
- **营业收入分析卡片**
  - 显示完成度百分比
  - 实时进度条展示
  - 一键跳转到详细分析页面

- **净利润分析卡片**
  - 显示完成度百分比
  - 实时进度条展示
  - 一键跳转到详细分析页面

#### 盈利能力指标
- **ROE分析卡片**
  - 显示当前ROE数值
  - 实时进度条展示
  - 一键跳转到详细分析页面

- **边际贡献率卡片** (组件)
  - 显示计划值和完成度
  - 实时数据更新
  - 一键跳转到详细分析页面

- **毛利率卡片** (组件)
  - 显示当前毛利率
  - 实时数据更新
  - 一键跳转到详细分析页面

- **净利率分析卡片**
  - 显示当前净利率数值
  - 实时进度条展示
  - 一键跳转到详细分析页面

#### 财务结构与运营
- **资产负债率分析卡片**
  - 显示当前资产负债率
  - 实时进度条展示
  - 一键跳转到详细分析页面

- **存量指标分析卡片**
  - 显示存量总计数值
  - 实时进度条展示
  - 一键跳转到详细分析页面

### 3. 月度分析图表

#### 营业收入月度趋势
- **实时数据展示**: 从API获取当年营业收入月度数据
- **双线对比**: 主营业务和非主营业务分别显示
- **数据来源**: `GET /analytics/business-income/{year}`
- **图表特性**:
  - 面积图展示，支持平滑曲线
  - 主营业务使用蓝色主题 (#3B82F6)
  - 非主营业务使用绿色主题 (#10B981)
  - 支持鼠标悬停查看详细数值
  - 无数据时显示"暂无数据"提示
- **交互功能**: 点击"查看详情"跳转到完整分析页面

#### 净利润月度趋势
- **数据来源**: `GET /analytics/net-profit/{year}`
- **图表特性**: 单线面积图，蓝色主题
- **显示内容**: 净利润月度变化趋势
- **交互功能**: 悬停显示详细数值，一键跳转详情页

#### ROE月度趋势
- **数据来源**: `GET /analytics/roe/{year}`
- **图表特性**: 双线对比图（实际ROE + 目标线）
- **显示内容**: 实际ROE vs 20%目标线
- **特殊处理**: ROE数据除以1000进行单位转换

#### 边际贡献率月度趋势
- **数据来源**: `GET /analytics/contribution-rate/{year}`
- **图表特性**: 双线对比图（实际贡献率 + 计划目标线）
- **显示内容**: 实际贡献率 vs 21.98%计划值
- **目标线**: 红色虚线显示计划目标

#### 毛利率月度趋势
- **数据来源**: `GET /analytics/profit-margin/{year}`
- **图表特性**: 双线对比图（实际毛利率 + 目标毛利率）
- **显示内容**: 实际毛利率 vs 21.99%目标值
- **面积填充**: 蓝色渐变面积图

#### 净利率月度趋势
- **数据来源**: `GET /analytics/net-profit-margin/{year}`
- **图表特性**: 双线对比图（实际净利率 + 目标线）
- **显示内容**: 实际净利率 vs 8.0%目标值
- **动态目标**: 目标值可从API动态获取

#### 资产负债率月度趋势
- **数据来源**: `GET /analytics/asset-liability-ratio/{year}`
- **图表特性**: 双线对比图（实际负债率 + 目标线）
- **显示内容**: 实际负债率 vs 74.0%目标值
- **风险监控**: 用于财务风险控制监控

#### 存量指标月度趋势
- **数据来源**: `GET /analytics/inventory-metrics/{year}`
- **图表特性**: 单线面积图，蓝色主题
- **显示内容**: 存量总计月度变化
- **单位**: 万元，包含预中标+在产+库存综合情况

## 技术实现

### 前端技术栈
- **Vue 3**: 使用 Composition API
- **TypeScript**: 类型安全
- **ECharts**: 数据可视化
- **Tailwind CSS**: 样式框架
- **Vue Router**: 路由管理

### 组件结构
```
src/views/analytics/
├── index.vue                          # 数据分析中心主页
├── BusinessIncomeChart.vue            # 营业收入分析
├── NetProfitChart.vue                 # 净利润分析
├── ContributionRateChart.vue          # 边际贡献率分析
├── AssetLiabilityRatioChart.vue       # 资产负债率分析
├── ROEChart.vue                       # ROE分析
├── InventoryMetricsChart.vue          # 存量指标分析
├── NewOrdersChart.vue                 # 新签订单分析
├── CostCenterChart.vue                # 成本中心分析
├── ProfitMarginChart.vue              # 毛利率分析
├── NetProfitMarginChart.vue           # 净利率分析
└── README.md                          # 文档说明
```

## 路由配置

数据分析中心的路由已添加到 `src/router/routes.ts` 中：

```typescript
{
  path: 'analytics',
  name: 'AnalyticsCenter',
  component: () => import('@/views/analytics/index.vue'),
  meta: {
    title: '数据分析中心',
  },
}
```

## 导航菜单

侧边栏菜单已更新，添加了"数据分析中心"入口，位于 `src/layouts/BasicLayout/components/Sidebar.vue`。

## 使用方法

1. 启动开发服务器：`npm run dev`
2. 在浏览器中访问：`http://localhost:8080`
3. 登录系统后，点击侧边栏的"数据分析中心"
4. 在主页面查看概览数据和快速图表
5. 点击分析模块卡片进入详细分析页面

## 数据格式

### API数据源
数据分析中心从以下API端点获取实时数据：

- **ROE数据**: `GET /analytics/roe/{year}`
- **净利率数据**: `GET /analytics/net-profit-margin/{year}`
- **资产负债率数据**: `GET /analytics/asset-liability-ratio/{year}`
- **存量指标数据**: `GET /analytics/inventory-metrics/{year}`
- **营业收入数据**: `GET /analytics/business-income/{year}`
- **净利润数据**: `GET /analytics/net-profit/{year}`

### 数据结构
各API返回的数据格式：
```json
{
  "success": true,
  "data": {
    "currentRate": 12.5,        // 当前数值
    "completion_rate": 85,      // 完成率
    "total": 85000             // 总计数值
  }
}
```

### 卡片数据
- 完成度百分比显示
- 实时进度条更新
- 数值格式化显示
- 错误处理和默认值

## 扩展说明

如需添加新的分析模块：
1. 在 `src/views/analytics/` 目录下创建新的 Vue 组件
2. 在 `src/router/routes.ts` 中添加对应路由
3. 在 `index.vue` 的 `analysisModules` 数组中添加模块配置
4. 更新本文档说明
