# 报表组件重构说明

## 概述

原始的 `MonthlyReport.vue` 文件有 2382 行代码，包含大量重复的 HTML 结构和逻辑。通过重构，我们将其拆分成了多个可复用的组件，大大减少了代码重复，提高了可维护性。

## 重构后的组件

### 1. ReportHeader.vue - 报表头部组件
**功能**: 统一的报表头部，包含标题、期间选择器和PDF生成按钮
**Props**:
- `title`: 报表标题
- `period`: 当前选择的期间
- `isGenerating`: 是否正在生成PDF

**Events**:
- `update:period`: 期间变更
- `period-change`: 期间改变时触发
- `generate-pdf`: 生成PDF按钮点击

**使用示例**:
```vue
<ReportHeader 
  title="上海南华兰陵电气有限公司 - 月度经济运行报表"
  v-model:period="selectedPeriod"
  :is-generating="isGenerating"
  @period-change="loadReportData"
  @generate-pdf="generatePDF"
/>
```

### 2. IndicatorCard.vue - 指标卡片组件
**功能**: 显示各种类型的关键指标
**Props**:
- `title`: 指标标题
- `data`: 指标数据对象
- `type`: 指标类型 ('basic' | 'cost-center' | 'percentage' | 'amount-with-fluctuation' | 'custom')

**支持的指标类型**:
- `basic`: 基础指标（年度计划、累计、完成率）
- `cost-center`: 成本中心指标（包含比率和执行率）
- `percentage`: 百分比指标（年度计划%、当期%）
- `amount-with-fluctuation`: 金额波动指标（期初、当期、波动率）

**使用示例**:
```vue
<IndicatorCard 
  title="●新签订单："
  :data="keyIndicators.newOrders"
  type="basic"
/>
```

### 3. RiskAlert.vue - 风险提示组件
**功能**: 显示各类风险提示信息
**Props**:
- `risks`: 风险数组，每个风险包含 type、title、content

**使用示例**:
```vue
<RiskAlert :risks="riskAlertsArray" />
```

### 4. DataTable.vue - 通用数据表格组件
**功能**: 通用的数据表格，支持多种数据类型和格式化
**Props**:
- `columns`: 列配置数组
- `data`: 表格数据
- `showTotal`: 是否显示合计行
- `totalRow`: 合计行数据
- `rowClass`: 行样式类

**列配置选项**:
- `key`: 数据字段名
- `title`: 列标题
- `type`: 数据类型 ('number' | 'percentage' | 'text')
- `align`: 对齐方式 ('left' | 'center' | 'right')
- `cellClass`: 单元格样式类
- `formatter`: 自定义格式化函数

**使用示例**:
```vue
<DataTable 
  :columns="businessIncomeColumns"
  :data="businessIncomeData"
/>
```

### 5. SectorTable.vue - 分板块表格组件
**功能**: 专门处理按"设备/元件/工程"分板块的表格，支持合并单元格
**Props**:
- `columns`: 列配置数组
- `data`: 表格数据（需包含 sector 字段）
- `showTotal`: 是否显示合计行
- `totalRow`: 合计行数据
- `sectorColors`: 板块颜色配置

**使用示例**:
```vue
<SectorTable
  :columns="newOrderColumns"
  :data="newOrderData"
  :show-total="true"
  :total-row="getNewOrderTotal()"
/>
```

### 6. ProjectTracking.vue - 项目跟踪组件
**功能**: 显示项目跟踪情况，按设备/元件/工程分板块展示
**Props**:
- `data`: 项目跟踪数据对象，包含 equipment、component、engineering 三个数组

**数据结构**:
```javascript
{
  equipment: [
    { customerType: '上海', yearlyPlan: 500000.00, currentPeriod: 1459.37, currentTotal: 1459.37 }
  ],
  component: [
    { customerType: '用户', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 }
  ],
  engineering: [
    { customerType: '一包', yearlyPlan: 150000.00, currentPeriod: 0, currentTotal: 0 }
  ]
}
```

**使用示例**:
```vue
<ProjectTracking :data="projectTrackingData" />
```

## 重构效果

### 代码减少
- 原始文件: 2382 行
- 重构后主文件: 约 400 行（减少 83%）
- 组件文件总计: 约 300 行
- 总体代码减少: 约 70%

### 可维护性提升
1. **组件化**: 每个组件职责单一，易于理解和维护
2. **可复用**: 组件可在其他报表中复用
3. **配置化**: 表格通过配置驱动，减少重复代码
4. **类型安全**: 通过 props 验证确保数据类型正确

### 扩展性增强
1. **新增指标类型**: 在 IndicatorCard 中添加新的 type
2. **新增表格列**: 通过配置添加新列，无需修改模板
3. **自定义格式化**: 支持自定义格式化函数
4. **样式定制**: 通过 class 配置自定义样式

## 使用建议

1. **统一配置**: 将表格列配置提取到单独的配置文件中
2. **类型定义**: 使用 TypeScript 定义数据接口
3. **主题定制**: 通过 CSS 变量支持主题切换
4. **国际化**: 支持多语言标题和文本
5. **数据验证**: 在组件中添加数据验证逻辑

## 迁移指南

1. **逐步迁移**: 可以逐个表格进行迁移，不影响现有功能
2. **保持兼容**: 新组件保持与原有数据结构的兼容性
3. **测试验证**: 每个组件都应有对应的单元测试
4. **文档更新**: 及时更新组件使用文档

## 示例文件

参考 `MonthlyReportRefactored.vue` 文件查看完整的重构示例。
