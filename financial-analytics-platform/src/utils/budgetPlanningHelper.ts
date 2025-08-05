// 年度预算计划关联工具函数

export interface BudgetPlanningData {
  selectedTable: string | null;
  modifications: Record<string, any>;
}

/**
 * 表格键值映射到API端点的映射关系
 */
export const TABLE_KEY_MAPPING = {
  'new_orders': 'new-orders',
  'project_tracking': 'project-tracking',
  'business_income_structure': 'business-income',
  'main_business_income_breakdown': 'main-business-income',
  'current_year_order_to_income': 'order-to-income',
  'stock_order_to_income': 'stock-order-to-income',
  'non_main_business': 'non-main-business',
  'inventory_structure_quality': 'inventory-structure',
  'bid_fulfillment_status': 'bid-fulfillment',
  'work_in_progress': 'inventory-in-progress',
  'contract_inventory': 'contract-inventory',
  'main_business_cost_structure': 'main-business-cost',
  'department_cost_center_profit_loss': 'department-cost-center',
  'main_business_contribution_rate_structure': 'business-contribution',
  'cost_estimate_personnel_withdrawals': 'cost-estimation',
  'main_business_gross_profit_rate_structure': 'business-profit-margin',
  'net_profit_structure_quality': 'net-profit-structure',
  'main_business_net_profit_contribution': 'main-business-net-profit',
  'non_main_business_net_profit_contribution': 'non-main-business-net-profit',
  'payment_structure_quality': 'receipt-structure',
  'accounts_receivable_situation': 'accounts-receivable',
  'overdue_accounts_receivable_situation': 'overdue-receivables',
  'bad_debt_provision_situation': 'bad-debt-provision'
} as const;

/**
 * 从年度预算计划获取指定表格的年度计划数据
 * @param tableKey 表格键值
 * @param period 期间（年份）
 * @returns 年度计划数据
 */
export async function getBudgetPlanningData(tableKey: string, period: string) {
  try {
    const response = await fetch(`http://127.0.0.1:3000/budget-planning/${period}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`年度预算计划: ${period}年暂无数据`);
        return null;
      }
      throw new Error('获取年度预算计划失败');
    }
    
    const result = await response.json();
    if (result.success && result.data?.modifications?.[tableKey]) {
      return result.data.modifications[tableKey];
    }
    
    return null;
  } catch (error) {
    console.error('获取年度预算计划失败:', error);
    return null;
  }
}

/**
 * 将年度预算计划数据转换为表格格式（设备/元件/工程结构）
 * @param budgetData 年度预算计划数据
 * @returns 转换后的表格数据
 */
export function convertBudgetDataToTableFormat(budgetData: any) {
  if (!budgetData) return null;
  
  const result: any = {
    equipment: [],
    components: [],
    engineering: []
  };
  
  // 处理设备类数据
  if (budgetData['设备']) {
    result.equipment = budgetData['设备'].map((item: any) => ({
      customer: item.customer,
      yearlyPlan: item.yearlyBudget,
      currentTotal: 0,
      progress: 0
    }));
  }
  
  // 处理元件类数据
  if (budgetData['元件']) {
    result.components = budgetData['元件'].map((item: any) => ({
      customer: item.customer,
      yearlyPlan: item.yearlyBudget,
      currentTotal: 0,
      progress: 0
    }));
  }
  
  // 处理工程类数据
  if (budgetData['工程']) {
    result.engineering = budgetData['工程'].map((item: any) => ({
      customer: item.customer,
      yearlyPlan: item.yearlyBudget,
      currentTotal: 0,
      progress: 0
    }));
  }
  
  return result;
}

/**
 * 将年度预算计划数据转换为简单列表格式（营业收入等）
 * @param budgetData 年度预算计划数据
 * @returns 转换后的列表数据
 */
export function convertBudgetDataToListFormat(budgetData: any) {
  if (!budgetData) return null;
  
  const result: any[] = [];
  let idCounter = 1;
  
  // 遍历所有类别
  Object.keys(budgetData).forEach(categoryName => {
    const categoryItems = budgetData[categoryName];
    categoryItems.forEach((item: any) => {
      result.push({
        id: idCounter++,
        category: item.customer,
        yearlyPlan: item.yearlyBudget,
        currentTotal: 0,
        progress: 0
      });
    });
  });
  
  return result;
}

/**
 * 同步年度计划数据到当前表格
 * @param tableKey 表格键值
 * @param period 期间
 * @param currentData 当前表格数据
 * @param dataFormat 数据格式（'table' | 'list'）
 * @returns 同步后的数据
 */
export async function syncYearlyPlanFromBudget(
  tableKey: string, 
  period: string, 
  currentData: any, 
  dataFormat: 'table' | 'list' = 'table'
) {
  try {
    const budgetData = await getBudgetPlanningData(tableKey, period);
    if (!budgetData) {
      console.log('没有找到对应的年度预算计划数据');
      return currentData;
    }
    
    let budgetTableData;
    if (dataFormat === 'table') {
      budgetTableData = convertBudgetDataToTableFormat(budgetData);
    } else {
      budgetTableData = convertBudgetDataToListFormat(budgetData);
    }
    
    if (!budgetTableData) {
      return currentData;
    }
    
    // 合并数据：保留当期累计和进度，更新年度计划
    if (dataFormat === 'table') {
      return mergeTableData(currentData, budgetTableData);
    } else {
      return mergeListData(currentData, budgetTableData);
    }
  } catch (error) {
    console.error('同步年度计划失败:', error);
    return currentData;
  }
}

/**
 * 合并表格格式数据
 */
function mergeTableData(currentData: any, budgetData: any) {
  const result = JSON.parse(JSON.stringify(currentData));
  
  // 合并设备数据
  if (budgetData.equipment) {
    result.equipment = result.equipment.map((current: any) => {
      const budgetItem = budgetData.equipment.find((budget: any) => budget.customer === current.customer);
      if (budgetItem) {
        return {
          ...current,
          yearlyPlan: budgetItem.yearlyPlan
        };
      }
      return current;
    });
  }
  
  // 合并元件数据
  if (budgetData.components) {
    result.components = result.components.map((current: any) => {
      const budgetItem = budgetData.components.find((budget: any) => budget.customer === current.customer);
      if (budgetItem) {
        return {
          ...current,
          yearlyPlan: budgetItem.yearlyPlan
        };
      }
      return current;
    });
  }
  
  // 合并工程数据
  if (budgetData.engineering) {
    result.engineering = result.engineering.map((current: any) => {
      const budgetItem = budgetData.engineering.find((budget: any) => budget.customer === current.customer);
      if (budgetItem) {
        return {
          ...current,
          yearlyPlan: budgetItem.yearlyPlan
        };
      }
      return current;
    });
  }
  
  return result;
}

/**
 * 合并列表格式数据
 */
function mergeListData(currentData: any[], budgetData: any[]) {
  return currentData.map((current: any) => {
    const budgetItem = budgetData.find((budget: any) => budget.category === current.category);
    if (budgetItem) {
      return {
        ...current,
        yearlyPlan: budgetItem.yearlyPlan
      };
    }
    return current;
  });
}

/**
 * 检查是否有年度预算计划数据
 * @param tableKey 表格键值
 * @param period 期间
 * @returns 是否有数据
 */
export async function hasBudgetPlanningData(tableKey: string, period: string): Promise<boolean> {
  try {
    const budgetData = await getBudgetPlanningData(tableKey, period);
    return budgetData !== null;
  } catch {
    return false;
  }
}