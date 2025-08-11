import { RouteRecordRaw } from 'vue-router';
import BasicLayout from '@/layouts/BasicLayout/index.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

// 主框架内显示的路由
export const frameIn: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/shanghai-nanhua-lanling-electric',
    component: BasicLayout,
    children: [
      // ==================== 核心页面 ====================
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/analytics/index.vue'),
        meta: {
          title: '首页',
        },
      },
      // ==================== 公司页面 ====================
      {
        path: 'shanghai-nanhua-lanling-electric',
        name: 'ShanghaiNanhuaLanlingElectric',
        component: () => import('@/views/companies/ShanghaiNanhuaLanlingElectric.vue'),
        meta: {
          title: '上海南华兰陵电气有限公司',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-industry',
        name: 'ShanghaiNanhuaLanlingIndustry',
        component: () => import('@/views/companies/ShanghaiNanhuaLanlingIndustry.vue'),
        meta: {
          title: '上海南华兰陵实业有限公司',
        },
      },
      {
        path: 'changzhou-tuoyuan-electric',
        name: 'ChangzhouTuoyuanElectric',
        component: () => import('@/views/companies/ChangzhouTuoyuanElectric.vue'),
        meta: {
          title: '常州拓源电气有限公司',
        },
      },
      {
        path: 'view',
        name: 'ViewForms',
        component: () => import('@/views/view/index.vue'),
        meta: {
          title: '查看表单',
        },
      },
      {
        path: 'submit',
        name: 'SubmitForms',
        component: () => import('@/views/submit/index.vue'),
        meta: {
          title: '提交表单',
        },
      },
      {
        path: 'part2/view',
        name: 'Part2View',
        component: () => import('@/views/Part2/View.vue'),
        meta: {
          title: '查看财务报表',
        },
      },
      {
        path: 'part2/submit',
        name: 'Part2Submit',
        component: () => import('@/views/Part2/Submit.vue'),
        meta: {
          title: '提交财务报表',
        },
      },

      // ==================== 用户管理 ====================
      {
        path: 'admin/users',
        name: 'UserManagement',
        component: () => import('@/views/admin/users/index.vue'),
        meta: {
          title: '用户管理',
          requiresAdmin: true,
        },
      },
      {
        path: 'admin/permissions',
        name: 'PermissionManagement',
        component: () => import('@/views/admin/permissions/index.vue'),
        meta: {
          title: '权限管理',
          requiresAdmin: true,
        },
      },
      {
        path: 'admin/notifications',
        name: 'NotificationManagement',
        component: () => import('@/views/notifications/index.vue'),
        meta: {
          title: '通知管理',
          requiresAdmin: true,
        },
      },

      // ==================== 基础财务报表 ====================
      {
        path: 'example',
        name: 'Example',
        component: () => import('@/views/example/index.vue'),
        meta: {
          title: '资产负债表',
        },
      },
      {
        path: 'cashflow',
        name: 'CashFlow',
        component: () => import('@/views/example/CashFlowStatement.vue'),
        meta: {
          title: '现金流量表',
        },
      },
      {
        path: 'incomestatement',
        name: 'IncomeStatement',
        component: () => import('@/views/example/IncomeStatement.vue'),
        meta: {
          title: '利润表',
        },
      },

      {
        path: 'changzhou-tuoyuan-balance-sheet-2025',
        name: 'ChangzhouTuoyuanBalanceSheet2025',
        component: () => import('@/views/companies/financial-reports/ChangzhouTuoyuanElectricBalanceSheet.vue'),
        meta: {
          title: '常州拓源资产负债表2025',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-balance-sheet',
        name: 'ShanghaiNanhuaLanlingBalanceSheet',
        component: () => import('@/views/example/ShanghaiNanhuaLanlingBalanceSheet.vue'),
                  meta: {
                    title: '上海南华兰陵实业有限公司资产负债表',
                  },
                },
          
      {
        path: 'changzhou-tuoyuan-incomestatement',
        name: 'ChangzhouTuoyuanIncomeStatement',
        component: () => import('@/views/example/ChangzhouTuoyuanIncomeStatement.vue'),
        meta: {
          title: '常州拓源利润表',
        },
      },
      {
        path: 'changzhou-tuoyuan-cashflow',
        name: 'ChangzhouTuoyuanCashFlow',
        component: () =>
          import('@/views/example/ChangzhouTuoyuanCashFlowStatement.vue'),
        meta: {
          title: '常州拓源现金流量表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-incomestatement',
        name: 'ShanghaiNanhuaLanlingIncomeStatement',
        component: () =>
          import('@/views/example/ShanghaiNanhuaLanlingIncomeStatement.vue'),
        meta: {
          title: '上海南华兰陵实业有限公司利润表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-cashflow',
        name: 'ShanghaiNanhuaLanlingCashFlow',
        component: () =>
          import('@/views/example/ShanghaiNanhuaLanlingCashFlowStatement.vue'),
        meta: {
          title: '上海南华兰陵实业有限公司现金流量表',
        },
      },
      {
        path: 'cost-center-structure',
        name: 'CostCenterStructure',
        component: () => import('@/views/newTable/CostCenterStructure.vue'),
        meta: {
          title: '成本中心结构与质量',
        },
      },
      {
        path: 'cost-center-structure-simple',
        name: 'CostCenterStructureSimple',
        component: () => import('@/views/example/CostCenterStructure.vue'),
        meta: {
          title: '成本中心结构（简版）',
        },
      },
      {
        path: 'cost-center-structure-quality',
        name: 'CostCenterStructureQuality',
        component: () => import('@/views/newTable/CostCenterStructure.vue'),
        meta: {
          title: '成本中心结构与质量',
        },
      },
      {
        path: 'productionvalue',
        name: 'ProductionValue',
        component: () => import('@/views/example/ProductionValue.vue'),
        meta: {
          title: '产值情况',
        },
      },
      {
        path: 'projecttracking',
        name: 'ProjectTracking',
        component: () => import('@/views/example/ProjectTracking.vue'),
        meta: {
          title: '项目跟踪',
        },
      },

      // ==================== 财务分区 - newTable ====================
      {
        path: 'business-income-structure',
        name: 'BusinessIncomeStructure',
        component: () => import('@/views/newTable/BusinessIncomeStructure.vue'),
        meta: {
          title: '营业收入结构与质量',
        },
      },
      {
        path: 'main-business-income',
        name: 'MainBusinessIncome',
        component: () => import('@/views/newTable/MainBusinessIncome.vue'),
        meta: {
          title: '主营业务收入分解情况',
        },
      },
      {
        path: 'order-to-income',
        name: 'OrderToIncome',
        component: () => import('@/views/newTable/OrderToIncome.vue'),
        meta: {
          title: '主营业务当年订单转收入',
        },
      },
      {
        path: 'stock-order-to-income',
        name: 'StockOrderToIncome',
        component: () => import('@/views/newTable/StockOrderToIncome.vue'),
        meta: {
          title: '主营业务存量订单转收入',
        },
      },
      {
        path: 'non-main-business',
        name: 'NonMainBusiness',
        component: () => import('@/views/newTable/NonMainBusiness.vue'),
        meta: {
          title: '非主营业务情况',
        },
      },
      {
        path: 'business-contribution',
        name: 'BusinessContribution',
        component: () => import('@/views/newTable/BusinessContribution.vue'),
        meta: {
          title: '主营业务边际贡献率结构与质量',
        },
      },
      {
        path: 'business-profit-margin',
        name: 'BusinessProfitMargin',
        component: () => import('@/views/newTable/BusinessProfitMargin.vue'),
        meta: {
          title: '主营业务毛利率结构与质量',
        },
      },
      {
        path: 'net-profit-structure',
        name: 'NetProfitStructure',
        component: () => import('@/views/newTable/NetProfitStructure.vue'),
        meta: {
          title: '净利润结构与质量',
        },
      },
      {
        path: 'main-business-net-profit',
        name: 'MainBusinessNetProfit',
        component: () => import('@/views/newTable/MainBusinessNetProfit.vue'),
        meta: {
          title: '主营业务净利润贡献情况',
        },
      },
      {
        path: 'non-main-business-net-profit',
        name: 'NonMainBusinessNetProfit',
        component: () => import('@/views/newTable/NonMainBusinessNetProfit.vue'),
        meta: {
          title: '非主营业务净利润贡献情况',
        },
      },
      {
        path: 'receipt-structure',
        name: 'ReceiptStructure',
        component: () => import('@/views/newTable/ReceiptStructure.vue'),
        meta: {
          title: '收款结构与质量',
        },
      },
      {
        path: 'accounts-receivable',
        name: 'AccountsReceivable',
        component: () => import('@/views/newTable/AccountsReceivable.vue'),
        meta: {
          title: '应收账款情况',
        },
      },
      {
        path: 'overdue-receivables',
        name: 'OverdueReceivables',
        component: () => import('@/views/newTable/OverdueReceivables.vue'),
        meta: {
          title: '逾期应收账款情况',
        },
      },
      {
        path: 'bad-debt-provision',
        name: 'BadDebtProvision',
        component: () => import('@/views/newTable/BadDebtProvision.vue'),
        meta: {
          title: '坏账准备情况',
        },
      },
      {
        path: 'main-business-cost',
        name: 'MainBusinessCost',
        component: () => import('@/views/newTable/MainBusinessCost.vue'),
        meta: {
          title: '主营业务成本结构与质量',
        },
      },
      {
        path: 'cost-estimation',
        name: 'CostEstimation',
        component: () => import('@/views/newTable/CostEstimation.vue'),
        meta: {
          title: '成本暂估入库和计提情况',
        },
      },

      // ==================== 营销分区 - newTable ====================
      {
        path: 'new-orders',
        name: 'NewOrder',
        component: () => import('@/views/newTable/newOrder.vue'),
        meta: {
          title: '新签订单结构与质量',
        },
      },
      {
        path: 'new-order',
        name: 'NewOrderSingle',
        component: () => import('@/views/newTable/newOrder.vue'),
        meta: {
          title: '新签订单结构与质量',
        },
      },
      {
        path: 'bidding-status',
        name: 'BiddingStatus',
        component: () => import('@/views/newTable/BiddingStatus.vue'),
        meta: {
          title: '招投标情况',
        },
      },
      {
        path: 'bid-fulfillment',
        name: 'BidFulfillment',
        component: () => import('@/views/newTable/BidFulfillment.vue'),
        meta: {
          title: '中标未履约情况',
        },
      },
      {
        path: 'inventory-structure',
        name: 'InventoryStructure',
        component: () => import('@/views/newTable/InventoryStructure.vue'),
        meta: {
          title: '存量结构与质量',
        },
      },
      {
        path: 'inventory-in-progress',
        name: 'InventoryInProgress',
        component: () => import('@/views/newTable/InventoryInProgress.vue'),
        meta: {
          title: '新签订单已排产未入库项目（在产）（不包含预投）（单位：万元）',
        },
      },
      {
        path: 'contract-inventory',
        name: 'ContractInventory',
        component: () => import('@/views/newTable/ContractInventory.vue'),
        meta: {
          title: '库存情况(合同存量)',
        },
      },
      // {
      //   path: 'inventory-data',
      //   name: 'InventoryData',
      //   component: () => import('@/views/newTable/InventoryData.vue'),
      //   meta: {
      //     title: '存货数据',
      //   },
      // },

      // ==================== 生产分区 - newTable ====================
      {
        path: 'production-value',
        name: 'ProductionValue',
        component: () => import('@/views/example/ProductionValue.vue'),
        meta: {
          title: '产值结构',
        },
      },
      {
        path: 'production-value-analysis',
        name: 'ProductionValueAnalysis',
        component: () => import('@/views/newTable/ProductionValueAnalysis.vue'),
        meta: {
          title: '主营业务产值-自制/自行施工情况分析',
        },
      },
      {
        path: 'production-plan-execution',
        name: 'ProductionPlanExecution',
        component: () => import('@/views/newTable/ProductionValueAnalysis.vue'),
        meta: {
          title: '生产/施工计划执行情况',
        },
      },
      {
        path: 'production-execution-analysis',
        name: 'ProductionExecutionAnalysis',
        component: () => import('@/views/newTable/ProductionExecutionAnalysis.vue'),
        meta: {
          title: '生产/施工订单生产施工执行情况',
        },
      },

      // ==================== 研发分区 ====================

      // ==================== 企管分区 - newTable ====================
      {
        path: 'department-cost-center',
        name: 'DepartmentCostCenter',
        component: () => import('@/views/newTable/DepartmentCostCenter.vue'),
        meta: {
          title: '部门成本中心实际发生情况',
        },
      },
      {
        path: 'department-cost-input',
        name: 'DepartmentCostInput',
        component: () => import('@/views/newTable/DepartmentCostInput.vue'),
        meta: {
          title: '部门成本中心计入损益情况',
        },
      },
      {
        path: 'major-investment-analysis',
        name: 'MajorInvestmentAnalysis',
        component: () => import('@/views/newTable/MajorInvestmentAnalysis.vue'),
        meta: {
          title: '年度重大投资情况',
        },
      },
      {
        path: 'budget-execution',
        name: 'BudgetExecutionNew',
        component: () => import('@/views/newTable/BudgetExecution.vue'),
        meta: {
          title: '预算执行情况',
        },
      },
      {
        path: 'budget-planning',
        name: 'BudgetPlanning',
        component: () => import('@/views/budget/BudgetPlanning.vue'),
        meta: {
          title: '年度预算计划',
        },
      },
      {
        path: 'reports/monthly',
        name: 'MonthlyReport',
        component: () => import('@/views/reports/MonthlyReport.vue'),
        meta: {
          title: '月度经济运行报表',
        },
      },
      {
        path: 'test/datatable',
        name: 'DataTableTest',
        component: () => import('@/views/test/DataTableTest.vue'),
        meta: {
          title: 'DataTable 组件测试',
        },
      },

      // ==================== 上海南华实业公司 ====================
      {
        path: 'nanhua/new-order-structure',
        name: 'NanhuaNewOrderStructure',
        component: () => import('@/views/nanhua/NewOrderStructure.vue'),
        meta: {
          title: '上海南华实业公司-新签订单结构与质量',
        },
      },
      {
        path: 'nanhua-new-orders',
        name: 'NanhuaNewOrdersAlias',
        component: () => import('@/views/nanhua/NewOrderStructure.vue'),
        meta: {
          title: '上海南华实业公司-新签订单结构与质量',
        },
      },
      {
        path: 'nanhua/project-tracking',
        name: 'NanhuaProjectTracking',
        component: () => import('@/views/nanhua/ProjectTracking.vue'),
        meta: {
          title: '上海南华实业公司-项目跟踪情况',
        },
      },
      {
        path: 'nanhua/bidding-status',
        name: 'NanhuaBiddingStatus',
        component: () => import('@/views/nanhua/BiddingStatus.vue'),
        meta: {
          title: '上海南华实业公司-招投标情况',
        },
      },
      {
        path: 'nanhua/business-income',
        name: 'NanhuaBusinessIncome',
        component: () => import('@/views/nanhua/BusinessIncome.vue'),
        meta: {
          title: '上海南华实业公司-营业收入结构与质量',
        },
      },
      {
        path: 'nanhua/order-to-income',
        name: 'NanhuaOrderToIncome',
        component: () => import('@/views/nanhua/OrderToIncome.vue'),
        meta: {
          title: '上海南华实业公司-当年订单转收入',
        },
      },
      {
        path: 'nanhua/stock-order-to-income',
        name: 'NanhuaStockOrderToIncome',
        component: () => import('@/views/nanhua/StockOrderToIncome.vue'),
        meta: {
          title: '上海南华实业公司-存量订单转收入',
        },
      },
      {
        path: 'nanhua/main-business-cost',
        name: 'NanhuaMainBusinessCost',
        component: () => import('@/views/nanhua/MainBusinessCost.vue'),
        meta: {
          title: '上海南华实业公司-主营业务成本结构与质量',
        },
      },
      {
        path: 'nanhua/cost-provision',
        name: 'NanhuaCostProvision',
        component: () => import('@/views/nanhua/CostProvision.vue'),
        meta: {
          title: '上海南华实业公司-成本计提情况',
        },
      },
      {
        path: 'nanhua/cost-center-structure',
        name: 'NanhuaCostCenterStructure',
        component: () => import('@/views/nanhua/CostCenterStructure.vue'),
        meta: {
          title: '上海南华实业公司-成本中心结构与质量（按年度计划口径分解）',
        },
      },
      {
        path: 'nanhua/department-cost-center-actual',
        name: 'NanhuaDepartmentCostCenterActual',
        component: () => import('@/views/nanhua/DepartmentCostCenterActual.vue'),
        meta: {
          title: '上海南华实业公司-部门成本中心实际发生情况',
        },
      },
      {
        path: 'nanhua/department-cost-input',
        name: 'NanhuaDepartmentCostInput',
        component: () => import('@/views/nanhua/DepartmentCostInput.vue'),
        meta: {
          title: '上海南华实业公司-部门成本中心计入损益情况',
        },
      },
      {
        path: 'nanhua/contract-inventory',
        name: 'NanhuaContractInventory',
        component: () => import('@/views/nanhua/ContractInventory.vue'),
        meta: {
          title: '上海南华实业公司-在建工程情况（合同存量）',
        },
      },
      {
        path: 'nanhua/non-main-business',
        name: 'NanhuaNonMainBusiness',
        component: () => import('@/views/nanhua/NonMainBusiness.vue'),
        meta: {
          title: '上海南华实业公司-非主营业务情况',
        },
      },
      {
        path: 'nanhua/inventory-structure',
        name: 'NanhuaInventoryStructure',
        component: () => import('@/views/nanhua/InventoryStructure.vue'),
        meta: {
          title: '上海南华实业公司-存量结构与质量',
        },
      },
      {
        path: 'nanhua/bid-fulfillment',
        name: 'NanhuaBidFulfillment',
        component: () => import('@/views/nanhua/BidFulfillment.vue'),
        meta: {
          title: '上海南华实业公司-中标未履约情况',
        },
      },
      {
        path: 'nanhua/business-contribution-with-self-built',
        name: 'NanhuaBusinessContributionWithSelfBuilt',
        component: () => import('@/views/nanhua/BusinessIncomeWithSelfBuilt.vue'),
        meta: {
          title: '上海南华实业公司-主营业务边际贡献率结构与质量（含自接项目）',
        },
      },
      {
        path: 'nanhua/business-profit-margin-with-self-built',
        name: 'NanhuaBusinessProfitMarginWithSelfBuilt',
        component: () => import('@/views/nanhua/BusinessProfitMarginWithSelfBuilt.vue'),
        meta: {
          title: '上海南华实业公司-主营业务毛利率结构与质量（含自接项目）',
        },
      },
      {
        path: 'nanhua/main-business-net-profit-contribution',
        name: 'NanhuaMainBusinessNetProfitContribution',
        component: () => import('@/views/nanhua/MainBusinessNetProfitContribution.vue'),
        meta: {
          title: '上海南华实业公司-主营业务净利润贡献情况',
        },
      },
      {
        path: 'nanhua/non-main-business-net-profit-contribution',
        name: 'NanhuaNonMainBusinessNetProfitContribution',
        component: () =>
          import('@/views/nanhua/NonMainBusinessNetProfitContribution.vue'),
        meta: {
          title: '上海南华实业公司-非主营业务净利润贡献情况',
        },
      },
      {
        path: 'nanhua/net-profit-structure',
        name: 'NanhuaNetProfitStructure',
        component: () => import('@/views/nanhua/NetProfitStructure.vue'),
        meta: {
          title: '上海南华实业公司-净利润结构',
        },
      },
      {
        path: 'nanhua/receipt-structure',
        name: 'NanhuaReceiptStructure',
        component: () => import('@/views/nanhua/ReceiptStructure.vue'),
        meta: {
          title: '上海南华实业公司-收款结构与质量',
        },
      },
      {
        path: 'nanhua/contract-inventory-evaluation',
        name: 'NanhuaContractInventoryEvaluation',
        component: () => import('@/views/nanhua/ContractInventoryEvaluation.vue'),
        meta: {
          title: '上海南华实业公司-在建工程（合同存量）',
        },
      },
      {
        path: 'nanhua/analysis-appendix',
        name: 'NanhuaAnalysisAppendix',
        component: () => import('@/views/nanhua/AnalysisAppendix.vue'),
        meta: {
          title: '上海南华实业公司-依据分析附表',
        },
      },
      {
        path: 'nanhua/overdue-receivables',
        name: 'NanhuaOverdueReceivables',
        component: () => import('@/views/nanhua/OverdueReceivables.vue'),
        meta: {
          title: '上海南华实业公司-逾期应收账款情况',
        },
      },
      {
        path: 'nanhua/bad-debt-provision',
        name: 'NanhuaBadDebtProvision',
        component: () => import('@/views/nanhua/BadDebtProvision.vue'),
        meta: {
          title: '上海南华实业公司-坏账准备情况',
        },
      },
      {
        path: 'nanhua/self-construction-analysis',
        name: 'NanhuaSelfConstructionAnalysis',
        component: () => import('@/views/nanhua/SelfConstructionAnalysis.vue'),
        meta: {
          title: '上海南华实业公司-主营业务产值自行施工情况分析',
        },
      },
      {
        path: 'nanhua/construction-plan-execution',
        name: 'NanhuaConstructionPlanExecution',
        component: () => import('@/views/nanhua/ConstructionPlanExecution.vue'),
        meta: {
          title: '上海南华实业公司-施工计划执行情况',
        },
      },
      {
        path: 'nanhua/construction-execution-status',
        name: 'NanhuaConstructionExecutionStatus',
        component: () => import('@/views/nanhua/ConstructionExecutionStatus.vue'),
        meta: {
          title: '上海南华实业公司-施工执行情况',
        },
      },
      {
        path: 'nanhua/major-investment',
        name: 'NanhuaMajorInvestment',
        component: () => import('@/views/nanhua/MajorInvestment.vue'),
        meta: {
          title: '上海南华实业公司-年度重大投资情况',
        },
      },

      // ==================== 拓源公司 ====================
      {
        path: 'tuoyuan/new-order-structure',
        name: 'TuoyuanNewOrderStructure',
        component: () => import('@/views/tuoyuan/NewOrderStructure.vue'),
        meta: {
          title: '拓源公司-新签订单结构与质量',
        },
      },
      {
        path: 'tuoyuan/project-tracking',
        name: 'TuoyuanProjectTracking',
        component: () => import('@/views/tuoyuan/ProjectTracking.vue'),
        meta: {
          title: '拓源公司-项目跟踪情况',
        },
      },
      {
        path: 'tuoyuan/bidding-status',
        name: 'TuoyuanBiddingStatus',
        component: () => import('@/views/tuoyuan/BiddingStatus.vue'),
        meta: {
          title: '拓源公司-招投标情况',
        },
      },
      // {
      //   path: 'tuoyuan/business-income',
      //   name: 'TuoyuanBusinessIncome',
      //   component: () => import('@/views/tuoyuan/BusinessIncome.vue'),
      //   meta: {
      //     title: '拓源公司-营业收入结构与质量',
      //   },
      // },
      {
        path: 'tuoyuan/order-to-income',
        name: 'TuoyuanOrderToIncome',
        component: () => import('@/views/tuoyuan/OrderToIncome.vue'),
        meta: {
          title: '拓源公司-当年订单转收入',
        },
      },
      {
        path: 'tuoyuan/stock-order-to-income',
        name: 'TuoyuanStockOrderToIncome',
        component: () => import('@/views/tuoyuan/StockOrderToIncome.vue'),
        meta: {
          title: '拓源公司-存量订单转收入',
        },
      },
      {
        path: 'tuoyuan/non-main-business',
        name: 'TuoyuanNonMainBusiness',
        component: () => import('@/views/tuoyuan/NonMainBusiness.vue'),
        meta: {
          title: '拓源公司-非主营业务情况',
        },
      },
      {
        path: 'tuoyuan/inventory-structure',
        name: 'TuoyuanInventoryStructure',
        component: () => import('@/views/tuoyuan/InventoryStructure.vue'),
        meta: {
          title: '拓源公司-存量结构与质量',
        },
      },
      {
        path: 'tuoyuan/inventory-in-progress',
        name: 'TuoyuanInventoryInProgress',
        component: () => import('@/views/tuoyuan/InventoryInProgress.vue'),
        meta: {
          title: '拓源公司-在产情况',
        },
      },
      {
        path: 'tuoyuan/inventory-status',
        name: 'TuoyuanInventoryStatus',
        component: () => import('@/views/tuoyuan/InventoryStatus.vue'),
        meta: {
          title: '拓源公司-库存情况',
        },
      },
      {
        path: 'tuoyuan/bid-fulfillment',
        name: 'TuoyuanBidFulfillment',
        component: () => import('@/views/tuoyuan/BidFulfillment.vue'),
        meta: {
          title: '拓源公司-中标未履约情况',
        },
      },
      {
        path: 'tuoyuan/accounts-receivable',
        name: 'TuoyuanAccountsReceivable',
        component: () => import('@/views/tuoyuan/AccountsReceivable.vue'),
        meta: {
          title: '拓源公司-应收账款情况',
        },
      },
      {
        path: 'tuoyuan/overdue-receivables',
        name: 'TuoyuanOverdueReceivables',
        component: () => import('@/views/tuoyuan/OverdueReceivables.vue'),
        meta: {
          title: '拓源公司-逾期应收账款情况',
        },
      },
      {
        path: 'tuoyuan/bad-debt-provision',
        name: 'TuoyuanBadDebtProvision',
        component: () => import('@/views/tuoyuan/BadDebtProvision.vue'),
        meta: {
          title: '拓源公司-坏账准备情况',
        },
      },
      {
        path: 'tuoyuan/major-investment',
        name: 'TuoyuanMajorInvestment',
        component: () => import('@/views/tuoyuan/MajorInvestment.vue'),
        meta: {
          title: '拓源公司-年度重大投资情况',
        },
      },
      {
        path: 'tuoyuan/main-business-income-breakdown',
        name: 'TuoyuanMainBusinessIncomeBreakdown',
        component: () => import('@/views/tuoyuan/MainBusinessIncomeBreakdown.vue'),
        meta: {
          title: '拓源公司-主营业务收入分解情况',
        },
      },
      {
        path: 'tuoyuan/main-business-cost-structure-quality',
        name: 'TuoyuanMainBusinessCostStructureQuality',
        component: () => import('@/views/tuoyuan/MainBusinessCostStructureQuality.vue'),
        meta: {
          title: '拓源公司-主营业务成本结构与质量（按年度口径分解）',
        },
      },
      {
        path: 'tuoyuan/cost-estimation',
        name: 'TuoyuanCostEstimation',
        component: () => import('@/views/tuoyuan/CostEstimation.vue'),
        meta: {
          title: '拓源公司-成本暂估入库和计提情况',
        },
      },
      {
        path: 'tuoyuan/cost-center-profit-loss',
        name: 'TuoyuanCostCenterProfitLoss',
        component: () => import('@/views/tuoyuan/CostCenterProfitLoss.vue'),
        meta: {
          title: '拓源公司-成本中心计入损益情况',
        },
      },
      {
        path: 'tuoyuan/main-business-contribution-rate',
        name: 'TuoyuanMainBusinessContributionRate',
        component: () => import('@/views/tuoyuan/MainBusinessContributionRate.vue'),
        meta: {
          title: '拓源公司-主营业务边际贡献率结构与质量',
        },
      },
      {
        path: 'tuoyuan/main-business-profit-margin',
        name: 'TuoyuanMainBusinessProfitMargin',
        component: () => import('@/views/tuoyuan/MainBusinessProfitMargin.vue'),
        meta: {
          title: '拓源公司-主营业务毛利率结构与质量',
        },
      },
      {
        path: 'tuoyuan/main-business-net-profit-contribution',
        name: 'TuoyuanMainBusinessNetProfitContribution',
        component: () =>
          import('@/views/tuoyuan/MainBusinessNetProfitContribution.vue'),
        meta: {
          title: '拓源公司-主营业务净利润贡献情况',
        },
      },
      {
        path: 'tuoyuan/stock-order-to-income',
        name: 'TuoyuanStockOrderToIncome',
        component: () => import('@/views/tuoyuan/StockOrderToIncome.vue'),
        meta: {
          title: '拓源公司-存量订单转收入',
        },
      },
      {
        path: 'tuoyuan/non-main-business',
        name: 'TuoyuanNonMainBusiness',
        component: () => import('@/views/tuoyuan/NonMainBusiness.vue'),
        meta: {
          title: '拓源公司-非主营业务情况',
        },
      },
      {
        path: 'tuoyuan/payment-structure-quality',
        name: 'TuoyuanPaymentStructureQuality',
        component: () => import('@/views/tuoyuan/PaymentStructureQuality.vue'),
        meta: {
          title: '拓源公司-收款结构与质量',
        },
      },
      {
        path: 'tuoyuan/construction-plan-execution',
        name: 'TuoyuanConstructionPlanExecution',
        component: () => import('@/views/tuoyuan/ConstructionPlanExecution.vue'),
        meta: {
          title: '拓源公司-施工计划执行情况',
        },
      },
      {
        path: 'tuoyuan/accounts-receivable',
        name: 'TuoyuanAccountsReceivable',
        component: () => import('@/views/tuoyuan/AccountsReceivable.vue'),
        meta: {
          title: '拓源公司-应收账款情况',
        },
      },
      {
        path: 'tuoyuan/bad-debt-provision',
        name: 'TuoyuanBadDebtProvision',
        component: () => import('@/views/tuoyuan/BadDebtProvision.vue'),
        meta: {
          title: '拓源公司-坏账准备情况',
        },
      },
      {
        path: 'tuoyuan/main-business-production-value-self-construction',
        name: 'TuoyuanMainBusinessProductionValueSelfConstruction',
        component: () =>
          import('@/views/tuoyuan/MainBusinessProductionValueSelfConstruction.vue'),
        meta: {
          title: '拓源公司-主营业务产值--自行施工情况分析',
        },
      },
      {
        path: 'tuoyuan/construction-execution-status',
        name: 'TuoyuanConstructionExecutionStatus',
        component: () => import('@/views/tuoyuan/ConstructionExecutionStatus.vue'),
        meta: {
          title: '拓源公司-施工执行情况',
        },
      },

      // ==================== 可视化图表 ====================
      {
        path: 'charts/visualization',
        name: 'ChartVisualization',
        component: () => import('@/views/charts/ChartVisualization.vue'),
        meta: {
          title: '财务数据可视化',
        },
      },
      {
        path: 'analytics/new-orders-chart',
        name: 'NewOrdersChart',
        component: () => import('@/views/analytics/NewOrdersChart.vue'),
        meta: {
          title: '新签订单数据分析',
        },
      },
      {
        path: 'analytics/cost-center-chart',
        name: 'CostCenterChart',
        component: () => import('@/views/analytics/CostCenterChart.vue'),
        meta: {
          title: '成本中心结构分析',
        },
      },
      {
        path: 'analytics/business-income-chart',
        name: 'BusinessIncomeChart',
        component: () => import('@/views/analytics/BusinessIncomeChart.vue'),
        meta: {
          title: '营业收入数据分析',
        },
      },
      {
        path: 'analytics/net-profit-chart',
        name: 'NetProfitChart',
        component: () => import('@/views/analytics/NetProfitChart.vue'),
        meta: {
          title: '净利润数据分析',
        },
      },
      {
        path: 'analytics/roe-chart',
        name: 'ROEChart',
        component: () => import('@/views/analytics/ROEChart.vue'),
        meta: {
          title: '净资产收益率分析',
        },
      },
      {
        path: 'analytics/contribution-rate-chart',
        name: 'ContributionRateChart',
        component: () => import('@/views/analytics/ContributionRateChart.vue'),
        meta: {
          title: '边际贡献率分析',
        },
      },
      {
        path: 'analytics/profit-margin-chart',
        name: 'ProfitMarginChart',
        component: () => import('@/views/analytics/ProfitMarginChart.vue'),
        meta: {
          title: '毛利率分析',
        },
      },
      {
        path: 'analytics/nanhua-profit-margin-chart',
        name: 'NanhuaProfitMarginChart',
        component: () => import('@/views/analytics/NanhuaProfitMarginChart.vue'),
        meta: {
          title: '南华毛利率分析',
        },
      },
      {
        path: 'analytics/nanhua-business-income-chart',
        name: 'NanhuaBusinessIncomeChart',
        component: () => import('@/views/analytics/NanhuaBusinessIncomeChart.vue'),
        meta: {
          title: '南华营业收入分析',
        },
      },
      {
        path: 'analytics/nanhua-contribution-rate-chart',
        name: 'NanhuaContributionRateChart',
        component: () => import('@/views/analytics/NanhuaContributionRateChart.vue'),
        meta: {
          title: '南华边际贡献率分析',
        },
      },
      {
        path: 'analytics/nanhua-new-orders-chart',
        name: 'NanhuaNewOrdersChart',
        component: () => import('@/views/analytics/NanhuaNewOrdersChart.vue'),
        meta: {
          title: '南华新签订单分析',
        },
      },
      {
        path: 'analytics/nanhua-cost-center-chart',
        name: 'NanhuaCostCenterChart',
        component: () => import('@/views/analytics/NanhuaCostCenterChart.vue'),
        meta: {
          title: '南华成本中心结构分析',
        },
      },
      {
        path: 'analytics/net-profit-margin-chart',
        name: 'NetProfitMarginChart',
        component: () => import('@/views/analytics/NetProfitMarginChart.vue'),
        meta: {
          title: '净利率分析',
        },
      },
      {
        path: 'analytics/asset-liability-ratio-chart',
        name: 'AssetLiabilityRatioChart',
        component: () => import('@/views/analytics/AssetLiabilityRatioChart.vue'),
        meta: {
          title: '资产负债率分析',
        },
      },
      {
        path: 'analytics/inventory-metrics-chart',
        name: 'InventoryMetricsChart',
        component: () => import('@/views/analytics/InventoryMetricsChart.vue'),
        meta: {
          title: '存量指标分析',
        },
      },
      {
        path: 'analytics/tuoyuan-profit-margin-chart',
        name: 'TuoyuanProfitMarginChart',
        component: () => import('@/views/analytics/TuoyuanProfitMarginChart.vue'),
        meta: {
          title: '拓源毛利率分析',
        },
      },
      {
        path: 'analytics/tuoyuan-contribution-rate-chart',
        name: 'TuoyuanContributionRateChart',
        component: () => import('@/views/analytics/TuoyuanContributionRateChart.vue'),
        meta: {
          title: '拓源公司边际贡献率趋势分析',
        },
      },
      {
        path: 'analytics/tuoyuan-business-structure',
        name: 'TuoyuanBusinessStructureAnalysis',
        component: () => import('@/views/analytics/TuoyuanBusinessStructureAnalysis.vue'),
        meta: {
          title: '拓源营业结构分析',
        },
      },
      {
        path: 'analytics/tuoyuan-new-order-chart',
        name: 'TuoyuanNewOrderChart',
        component: () => import('@/views/analytics/TuoyuanNewOrderChart.vue'),
        meta: {
          title: '拓源新签订单趋势',
        },
      },
      // ==================== 上海南华兰陵实业有限公司财务报表 ====================
      {
        path: 'shanghai-nanhua-lanling-industry/balance-sheet',
        name: 'ShanghaiNanhuaLanlingIndustryBalanceSheet',
        component: () =>
          import(
            '@/views/companies/financial-reports/ShanghaiNanhuaLanlingIndustryBalanceSheet.vue'
          ),
        meta: {
          title: '上海南华兰陵实业有限公司-资产负债表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-industry/cash-flow',
        name: 'ShanghaiNanhuaLanlingIndustryCashFlow',
        component: () =>
          import(
            '@/views/companies/financial-reports/ShanghaiNanhuaLanlingIndustryCashFlow.vue'
          ),
        meta: {
          title: '上海南华兰陵实业有限公司-现金流量表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-industry/income-statement',
        name: 'ShanghaiNanhuaLanlingIndustryIncomeStatement',
        component: () =>
          import(
            '@/views/companies/financial-reports/ShanghaiNanhuaLanlingIndustryIncomeStatement.vue'
          ),
        meta: {
          title: '上海南华兰陵实业有限公司-利润表',
        },
      },

      // ==================== 常州拓源电气有限公司财务报表 ====================
      {
        path: 'changzhou-tuoyuan-electric/balance-sheet',
        name: 'ChangzhouTuoyuanElectricBalanceSheet',
        component: () =>
          import(
            '@/views/companies/financial-reports/ChangzhouTuoyuanElectricBalanceSheet.vue'
          ),
        meta: {
          title: '常州拓源电气有限公司-资产负债表',
        },
      },
      {
        path: 'changzhou-tuoyuan-electric/cash-flow',
        name: 'ChangzhouTuoyuanElectricCashFlow',
        component: () =>
          import(
            '@/views/companies/financial-reports/ChangzhouTuoyuanElectricCashFlow.vue'
          ),
        meta: {
          title: '常州拓源电气有限公司-现金流量表',
        },
      },
      {
        path: 'changzhou-tuoyuan-electric/income-statement',
        name: 'ChangzhouTuoyuanElectricIncomeStatement',
        component: () =>
          import(
            '@/views/companies/financial-reports/ChangzhouTuoyuanElectricIncomeStatement.vue'
          ),
        meta: {
          title: '常州拓源电气有限公司-利润表',
        },
      },

      // ==================== 上海南华兰陵电气有限公司财务报表 ====================
      {
        path: 'shanghai-nanhua-lanling-electric/balance-sheet',
        name: 'ShanghaiNanhuaLanlingElectricBalanceSheet',
        component: () => import('@/views/example/index.vue'),
        meta: {
          title: '上海南华兰陵电气有限公司-资产负债表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-electric/cash-flow',
        name: 'ShanghaiNanhuaLanlingElectricCashFlow',
        component: () => import('@/views/example/CashFlowStatement.vue'),
        meta: {
          title: '上海南华兰陵电气有限公司-现金流量表',
        },
      },
      {
        path: 'shanghai-nanhua-lanling-electric/income-statement',
        name: 'ShanghaiNanhuaLanlingElectricIncomeStatement',
        component: () => import('@/views/example/IncomeStatement.vue'),
        meta: {
          title: '上海南华兰陵电气有限公司-利润表',
        },
      },
    ],
  },
];

// 主框架外显示的路由
const frameOut = [
  {
    path: '/user/login',
    name: 'Login',
    component: () => import('@/views/sys/login/index.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/user/register',
    name: 'Register',
    component: () => import('@/views/sys/register/index.vue'),
    meta: {
      title: '注册',
    },
  },
];

const errorPage = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/sys/error/404.vue'),
  },
];

export default [...frameIn, ...frameOut, ...errorPage];
