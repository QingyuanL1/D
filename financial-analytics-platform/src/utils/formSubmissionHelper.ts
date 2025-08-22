// 表单提交记录工具
import { useUserStore } from '@/stores/user'
import { safeFetch, handleApiError } from '@/utils/errorHandler'

export interface FormSubmissionData {
  userId: number
  moduleId: number
  period: string
  formData: any
  remarks?: string
  suggestions?: string
}

/**
 * 记录表单提交状态
 * @param moduleId 模块ID
 * @param period 期间 (YYYY-MM格式)
 * @param formData 表单数据
 * @param remarks 备注信息
 * @param suggestions 建议信息
 * @returns Promise<boolean> 是否成功
 */
export async function recordFormSubmission(
  moduleId: number, 
  period: string, 
  formData: any,
  remarks?: string,
  suggestions?: string
): Promise<boolean> {
  try {
    console.log('=== recordFormSubmission 开始执行 ===')
    const userStore = useUserStore()
    const userId = userStore.userInfo?.id
    
    console.log('用户信息:', userStore.userInfo)
    console.log('用户ID:', userId)
    
    if (!userId) {
      console.warn('用户信息不存在，跳过提交记录')
      return false
    }

    const requestBody = {
      userId: userId,
      moduleId: moduleId,
      period: period,
      formData: formData,
      remarks: remarks,
      suggestions: suggestions
    }
    
    console.log('发送到 /forms/submit 的数据:', requestBody)

    const response = await fetch('http://47.111.95.19:3000/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('API 响应状态:', response.status)
    console.log('API 响应状态文本:', response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('提交记录保存失败，响应内容:', errorText)
      return false
    }
    
    const result = await response.json()
    console.log('提交记录保存成功，响应数据:', result)
    console.log('=== recordFormSubmission 执行完成 ===')
    return true
    
  } catch (error) {
    console.error('=== recordFormSubmission 执行异常 ===', error)
    return false
  }
}

/**
 * 获取表单提交状态 (系统级别)
 * @param moduleId 模块ID  
 * @param period 期间
 * @returns Promise<boolean> 是否已提交
 */
export async function getFormSubmissionStatus(
  moduleId: number,
  period: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `http://47.111.95.19:3000/forms/submission/${moduleId}/${period}`
    )

    if (response.status === 404) {
      return false // 未找到提交记录
    }

    if (!response.ok) {
      console.error('获取提交状态失败')
      return false
    }

    return true
    
  } catch (error) {
    console.error('获取提交状态失败:', error)
    return false
  }
}

/**
 * 获取某期间的所有提交状态 (系统级别)
 * @param period 期间
 * @returns Promise<any> 提交状态数据
 */
export async function getUserSubmissionStatus(period: string): Promise<any> {
  try {
    const userStore = useUserStore()
    const userId = userStore.userInfo?.id
    
    // 系统级别API，但传递userId用于权限过滤
    const response = await fetch(
      `http://47.111.95.19:3000/forms/status/${period}?userId=${userId}`
    )

    if (!response.ok) {
      console.error('获取提交状态失败')
      return null
    }

    const result = await response.json()
    return result.data
    
  } catch (error) {
    console.error('获取提交状态失败:', error)
    return null
  }
}

// 模块ID映射表 (根据数据库中的实际ID)
export const MODULE_IDS = {
  // 财务模块
  BALANCE_SHEET: 1,                           // 资产负债表
  CASH_FLOW: 2,                              // 现金流量表  
  INCOME_STATEMENT: 3,                       // 利润表
  BUSINESS_INCOME_STRUCTURE: 4,              // 营业收入结构与质量
  MAIN_BUSINESS_INCOME: 5,                   // 主营业务收入分解
  ORDER_TO_INCOME: 6,                        // 主营业务当年订单转收入
  STOCK_ORDER_TO_INCOME: 7,                  // 主营业务存量订单转收入
  NON_MAIN_BUSINESS: 8,                      // 非主营业务情况
  COST_CENTER_STRUCTURE: 9,                  // 成本中心结构与质量
  BUSINESS_CONTRIBUTION: 10,                 // 主营业务边际贡献率
  BUSINESS_PROFIT_MARGIN: 11,                // 主营业务毛利率
  NET_PROFIT_STRUCTURE: 12,                  // 净利润结构
  MAIN_BUSINESS_NET_PROFIT: 13,              // 主营净利润贡献情况
  NON_MAIN_BUSINESS_NET_PROFIT: 14,          // 非主营净利润贡献情况
  RECEIPT_STRUCTURE: 15,                     // 收款结构
  ACCOUNTS_RECEIVABLE: 16,                   // 应收账款
  OVERDUE_RECEIVABLES: 17,                   // 逾期应收款
  BAD_DEBT_PROVISION: 18,                    // 坏账准备情况
  MAIN_BUSINESS_COST: 26,                    // 主营业务成本
  COST_ESTIMATION: 27,                       // 成本暂估入库和计提
  
  // 营销模块
  NEW_ORDERS: 19,                            // 新签订单
  PROJECT_TRACKING: 20,                      // 项目跟踪
  BIDDING_STATUS: 21,                        // 招投标情况
  BID_FULFILLMENT: 22,                       // 中标未履约
  INVENTORY_STRUCTURE: 23,                   // 存量结构
  INVENTORY_IN_PROGRESS: 24,                 // 在产情况
  CONTRACT_INVENTORY: 25,                    // 库存情况(合同存量)
  INVENTORY_STOCK: 36,                       // 库存情况
  
  // 生产模块
  PRODUCTION_VALUE: 28,                      // 产值结构与质量
  PRODUCTION_PLAN_EXECUTION: 29,             // 生产计划执行情况
  PRODUCTION_EXECUTION_ANALYSIS: 30,         // 生产执行分析
  
  // 企管模块
  DEPARTMENT_COST_CENTER: 31,                // 部门成本中心实际发生
  DEPARTMENT_COST_INPUT: 32,                 // 部门成本中心计入损益
  MAJOR_INVESTMENT_ANALYSIS: 33,             // 年度重大投资情况
  BUDGET_EXECUTION: 34,                      // 预算执行
  BUDGET_PLANNING: 35,                       // 年度预算计划
  
  // Example 主要业务表单 (预留ID段)
  EXAMPLE_CASH_FLOW: 201,                    // 现金流量表(主表)
  EXAMPLE_COST_CENTER: 202,                  // 成本中心结构(主表)  
  EXAMPLE_INCOME_STATEMENT: 203,             // 利润表(主表)
  EXAMPLE_PRODUCTION_VALUE: 204,             // 产值数据(主表)
  EXAMPLE_PROJECT_TRACKING: 205,             // 项目跟踪(主表)
  EXAMPLE_BALANCE_SHEET: 206,                // 资产负债表(主表)
  
  // 南华公司专用模块 (预留ID段: 300-399)
  NANHUA_NEW_ORDERS: 300,                    // 南华新签订单结构与质量
  NANHUA_PROJECT_TRACKING: 301,             // 南华项目跟踪情况
  NANHUA_BIDDING_STATUS: 302,               // 南华招投标情况
  NANHUA_BUSINESS_INCOME: 303,              // 南华营业收入结构与质量
  NANHUA_ORDER_TO_INCOME: 304,              // 南华当年订单转收入
  NANHUA_NON_MAIN_BUSINESS: 305,            // 南华非主营业务情况
  NANHUA_STOCK_ORDER_TO_INCOME: 306,        // 南华存量订单转收入
  NANHUA_INVENTORY_STRUCTURE: 307,          // 南华存量结构与质量
  NANHUA_BID_FULFILLMENT: 308,              // 南华中标未履约情况
  NANHUA_MAIN_BUSINESS_COST: 309,           // 南华主营业务成本结构与质量
  NANHUA_CONTRACT_INVENTORY: 310,           // 南华在建工程情况（合同存量）
  NANHUA_COST_PROVISION: 311,              // 南华成本计提情况
  NANHUA_COST_CENTER_STRUCTURE: 312,       // 南华成本中心结构与质量（按年度计划口径分解）
  DEPARTMENT_COST_CENTER_ACTUAL: 313,      // 部门成本中心实际发生情况
  NANHUA_DEPARTMENT_COST_INPUT: 314,       // 南华部门成本中心计入损益情况
  NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT: 315,  // 南华主营业务边际贡献率结构与质量（含自接项目）
  NANHUA_BUSINESS_PROFIT_MARGIN_WITH_SELF_BUILT: 316,  // 南华主营业务毛利率结构与质量（含自接项目）
  NANHUA_RECEIPT_STRUCTURE: 317,          // 南华收款结构与质量
  NANHUA_CONTRACT_INVENTORY_EVALUATION: 318, // 南华在建工程（合同存量）
  NANHUA_MAIN_BUSINESS_NET_PROFIT: 319,    // 南华主营业务净利润贡献情况
  NANHUA_NON_MAIN_BUSINESS_NET_PROFIT: 320, // 南华非主营业务净利润贡献情况
  NANHUA_NET_PROFIT_STRUCTURE: 604,        // 南华净利润结构
  NANHUA_ANALYSIS_APPENDIX: 322,          // 南华依据分析附表
  NANHUA_OVERDUE_RECEIVABLES: 323,        // 南华逾期应收账款情况
  NANHUA_SELF_CONSTRUCTION_ANALYSIS: 324, // 南华主营业务产值自行施工情况分析
  NANHUA_BAD_DEBT_PROVISION: 325,         // 南华坏账准备情况
  NANHUA_CONSTRUCTION_PLAN_EXECUTION: 326,// 南华施工计划执行情况
  NANHUA_CONSTRUCTION_EXECUTION_STATUS: 327, // 南华施工执行情况
  NANHUA_MAJOR_INVESTMENT: 328,           // 南华年度重大投资情况

  // 南华公司财务报表
  NANHUA_BALANCE_SHEET: 501,              // 南华资产负债表
  NANHUA_CASH_FLOW: 502,                  // 南华现金流量表
  NANHUA_INCOME_STATEMENT: 503,           // 南华利润表

  // 拓源公司专用模块 (预留ID段: 400-499)
  TUOYUAN_NEW_ORDER_STRUCTURE: 401,       // 拓源新签订单结构与质量
  TUOYUAN_PROJECT_TRACKING: 402,          // 拓源项目跟踪情况
  TUOYUAN_BIDDING_STATUS: 403,            // 拓源招投标情况
  MAIN_BUSINESS_INCOME_BREAKDOWN: 404,    // 主营业务收入分解情况
  TUOYUAN_ORDER_TO_INCOME: 405,           // 拓源当年订单转收入
  TUOYUAN_STOCK_ORDER_TO_INCOME: 406,            // 拓源存量订单转收入
  TUOYUAN_NON_MAIN_BUSINESS: 407,        // 拓源非主营业务情况
  TUOYUAN_INVENTORY_STRUCTURE: 408,      // 拓源存量结构与质量
  TUOYUAN_BID_FULFILLMENT: 409,          // 拓源中标未履约情况
  TUOYUAN_INVENTORY_IN_PROGRESS: 410,     // 拓源在产情况
  TUOYUAN_INVENTORY_STATUS: 411,         // 拓源库存情况
  TUOYUAN_MAIN_BUSINESS_COST_STRUCTURE_QUALITY: 412,  // 拓源主营业务成本结构与质量（按年度口径分解）
  TUOYUAN_COST_ESTIMATION: 413,         // 拓源成本暂估入库和计提情况
  TUOYUAN_COST_CENTER_PROFIT_LOSS: 414, // 拓源成本中心计入损益情况
  TUOYUAN_COST_CENTER_STRUCTURE: 605,   // 拓源成本中心结构与质量（按年度计划口径分解）
  TUOYUAN_MAIN_BUSINESS_CONTRIBUTION_RATE: 415,  // 拓源主营业务边际贡献率结构与质量
  TUOYUAN_MAIN_BUSINESS_PROFIT_MARGIN: 416, // 拓源主营业务毛利率结构与质量
  TUOYUAN_MAIN_BUSINESS_NET_PROFIT_CONTRIBUTION: 417,  // 拓源主营业务净利润贡献情况
  TUOYUAN_NET_PROFIT_STRUCTURE: 606,  // 拓源净利润结构与质量
  PAYMENT_STRUCTURE_QUALITY: 418,  // 收款结构与质量
  TUOYUAN_ACCOUNTS_RECEIVABLE: 419,  // 拓源应收账款情况
  TUOYUAN_OVERDUE_RECEIVABLES: 420,   // 拓源逾期应收账款情况
  TUOYUAN_BAD_DEBT_PROVISION: 421,    // 拓源坏账准备情况
  TUOYUAN_CONSTRUCTION_PLAN_EXECUTION: 422,  // 拓源施工计划执行情况
  TUOYUAN_MAJOR_INVESTMENT: 423,         // 拓源年度重大投资情况
  TUOYUAN_MAIN_BUSINESS_PRODUCTION_VALUE_SELF_CONSTRUCTION: 424,  // 拓源主营业务产值--自行施工情况分析
  TUOYUAN_CONSTRUCTION_EXECUTION_STATUS: 425, // 拓源施工执行情况

  // 拓源公司财务报表
  TUOYUAN_BALANCE_SHEET: 601,             // 拓源资产负债表
  TUOYUAN_CASH_FLOW: 602,                 // 拓源现金流量表
  TUOYUAN_INCOME_STATEMENT: 603           // 拓源利润表
}

// 模块ID到表单标题的映射
export const MODULE_TITLES = {
  // 财务模块
  [MODULE_IDS.BALANCE_SHEET]: '资产负债表',
  [MODULE_IDS.CASH_FLOW]: '现金流量表',
  [MODULE_IDS.INCOME_STATEMENT]: '利润表',
  [MODULE_IDS.BUSINESS_INCOME_STRUCTURE]: '营业收入结构与质量',
  [MODULE_IDS.MAIN_BUSINESS_INCOME]: '主营业务收入分解',
  [MODULE_IDS.ORDER_TO_INCOME]: '主营业务当年订单转收入',
  [MODULE_IDS.STOCK_ORDER_TO_INCOME]: '主营业务存量订单转收入',
  [MODULE_IDS.NON_MAIN_BUSINESS]: '非主营业务情况',
  [MODULE_IDS.COST_CENTER_STRUCTURE]: '成本中心结构与质量',
  [MODULE_IDS.BUSINESS_CONTRIBUTION]: '主营业务边际贡献率',
  [MODULE_IDS.BUSINESS_PROFIT_MARGIN]: '主营业务毛利率',
  [MODULE_IDS.NET_PROFIT_STRUCTURE]: '净利润结构',
  [MODULE_IDS.MAIN_BUSINESS_NET_PROFIT]: '主营净利润贡献情况',
  [MODULE_IDS.NON_MAIN_BUSINESS_NET_PROFIT]: '非主营净利润贡献情况',
  [MODULE_IDS.RECEIPT_STRUCTURE]: '收款结构',
  [MODULE_IDS.ACCOUNTS_RECEIVABLE]: '应收账款',
  [MODULE_IDS.OVERDUE_RECEIVABLES]: '逾期应收款',
  [MODULE_IDS.BAD_DEBT_PROVISION]: '坏账准备情况',
  [MODULE_IDS.MAIN_BUSINESS_COST]: '主营业务成本',
  [MODULE_IDS.COST_ESTIMATION]: '成本暂估入库和计提',
  [MODULE_IDS.DEPARTMENT_COST_CENTER]: '部门成本中心实际发生',
  [MODULE_IDS.DEPARTMENT_COST_INPUT]: '部门成本中心计入损益',
  [MODULE_IDS.MAJOR_INVESTMENT_ANALYSIS]: '年度重大投资情况',
  [MODULE_IDS.BUDGET_EXECUTION]: '预算执行',
  [MODULE_IDS.BUDGET_PLANNING]: '年度预算计划',

  // 营销模块
  [MODULE_IDS.NEW_ORDERS]: '新签订单',
  [MODULE_IDS.PROJECT_TRACKING]: '项目跟踪',
  [MODULE_IDS.BIDDING_STATUS]: '招投标情况',
  [MODULE_IDS.BID_FULFILLMENT]: '中标未履约',
  [MODULE_IDS.INVENTORY_STRUCTURE]: '存量结构',
  [MODULE_IDS.INVENTORY_IN_PROGRESS]: '在产情况',
  [MODULE_IDS.CONTRACT_INVENTORY]: '库存情况(合同存量)',
  [MODULE_IDS.INVENTORY_STOCK]: '库存情况',

  // 生产模块
  [MODULE_IDS.PRODUCTION_VALUE]: '产值结构与质量',
  [MODULE_IDS.PRODUCTION_PLAN_EXECUTION]: '生产计划执行情况',
  [MODULE_IDS.PRODUCTION_EXECUTION_ANALYSIS]: '生产执行分析',

  // Example 主要业务表单
  [MODULE_IDS.EXAMPLE_CASH_FLOW]: '现金流量表(主表)',
  [MODULE_IDS.EXAMPLE_COST_CENTER]: '成本中心结构(主表)',
  [MODULE_IDS.EXAMPLE_INCOME_STATEMENT]: '利润表(主表)',
  [MODULE_IDS.EXAMPLE_PRODUCTION_VALUE]: '产值数据(主表)',
  [MODULE_IDS.EXAMPLE_PROJECT_TRACKING]: '项目跟踪(主表)',
  [MODULE_IDS.EXAMPLE_BALANCE_SHEET]: '资产负债表(主表)',

  // 南华公司专用模块
  [MODULE_IDS.NANHUA_NEW_ORDERS]: '南华新签订单结构与质量',
  [MODULE_IDS.NANHUA_PROJECT_TRACKING]: '南华项目跟踪情况',
  [MODULE_IDS.NANHUA_BIDDING_STATUS]: '南华招投标情况',
  [MODULE_IDS.NANHUA_BUSINESS_INCOME]: '南华营业收入结构与质量',
  [MODULE_IDS.NANHUA_ORDER_TO_INCOME]: '南华当年订单转收入',
  [MODULE_IDS.NANHUA_NON_MAIN_BUSINESS]: '南华非主营业务情况',
  [MODULE_IDS.NANHUA_STOCK_ORDER_TO_INCOME]: '南华存量订单转收入',
  [MODULE_IDS.NANHUA_INVENTORY_STRUCTURE]: '南华存量结构与质量',
  [MODULE_IDS.NANHUA_BID_FULFILLMENT]: '南华中标未履约情况',
  [MODULE_IDS.NANHUA_MAIN_BUSINESS_COST]: '南华主营业务成本结构与质量',
  [MODULE_IDS.NANHUA_CONTRACT_INVENTORY]: '南华在建工程情况（合同存量）',
  [MODULE_IDS.NANHUA_COST_PROVISION]: '南华成本计提情况',
  [MODULE_IDS.NANHUA_COST_CENTER_STRUCTURE]: '南华成本中心结构与质量（按年度计划口径分解）',
  [MODULE_IDS.NANHUA_ANALYSIS_APPENDIX]: '南华分析附录',
  [MODULE_IDS.DEPARTMENT_COST_CENTER_ACTUAL]: '部门成本中心实际发生情况',
  [MODULE_IDS.NANHUA_DEPARTMENT_COST_INPUT]: '南华部门成本中心计入损益情况',
  [MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT]: '南华主营业务边际贡献率结构与质量（含自接项目）',
  [MODULE_IDS.NANHUA_BUSINESS_PROFIT_MARGIN_WITH_SELF_BUILT]: '南华主营业务毛利率结构与质量（含自接项目）',
  [MODULE_IDS.NANHUA_RECEIPT_STRUCTURE]: '南华收款结构与质量',
  [MODULE_IDS.NANHUA_CONTRACT_INVENTORY_EVALUATION]: '南华在建工程（合同存量）',
  [MODULE_IDS.NANHUA_MAIN_BUSINESS_NET_PROFIT]: '南华主营业务净利润贡献情况',
  [MODULE_IDS.NANHUA_NON_MAIN_BUSINESS_NET_PROFIT]: '南华非主营业务净利润贡献情况',
  [MODULE_IDS.NANHUA_NET_PROFIT_STRUCTURE]: '南华净利润结构',
  [MODULE_IDS.NANHUA_OVERDUE_RECEIVABLES]: '南华逾期应收账款情况',
  [MODULE_IDS.NANHUA_SELF_CONSTRUCTION_ANALYSIS]: '南华主营业务产值自行施工情况分析',
  [MODULE_IDS.NANHUA_BAD_DEBT_PROVISION]: '南华坏账准备情况',
  [MODULE_IDS.NANHUA_CONSTRUCTION_PLAN_EXECUTION]: '南华施工计划执行情况',
  [MODULE_IDS.NANHUA_CONSTRUCTION_EXECUTION_STATUS]: '南华施工执行情况',
  [MODULE_IDS.NANHUA_MAJOR_INVESTMENT]: '南华年度重大投资情况',

  // 南华公司财务报表
  [MODULE_IDS.NANHUA_BALANCE_SHEET]: '南华资产负债表',
  [MODULE_IDS.NANHUA_CASH_FLOW]: '南华现金流量表',
  [MODULE_IDS.NANHUA_INCOME_STATEMENT]: '南华利润表',

  // 拓源公司专用模块
  [MODULE_IDS.TUOYUAN_NEW_ORDER_STRUCTURE]: '拓源新签订单结构与质量',
  [MODULE_IDS.TUOYUAN_PROJECT_TRACKING]: '拓源项目跟踪情况',
  [MODULE_IDS.TUOYUAN_BIDDING_STATUS]: '拓源招投标情况',
  [MODULE_IDS.MAIN_BUSINESS_INCOME_BREAKDOWN]: '主营业务收入分解情况',
  [MODULE_IDS.TUOYUAN_ORDER_TO_INCOME]: '拓源当年订单转收入',
  [MODULE_IDS.TUOYUAN_STOCK_ORDER_TO_INCOME]: '拓源存量订单转收入',
  [MODULE_IDS.TUOYUAN_NON_MAIN_BUSINESS]: '拓源非主营业务情况',
  [MODULE_IDS.TUOYUAN_INVENTORY_STRUCTURE]: '拓源存量结构与质量',
  [MODULE_IDS.TUOYUAN_BID_FULFILLMENT]: '拓源中标未履约情况',
  [MODULE_IDS.TUOYUAN_INVENTORY_IN_PROGRESS]: '拓源在产情况',
  [MODULE_IDS.TUOYUAN_INVENTORY_STATUS]: '拓源库存情况',
  [MODULE_IDS.TUOYUAN_MAIN_BUSINESS_COST_STRUCTURE_QUALITY]: '拓源主营业务成本结构与质量（按年度口径分解）',
  [MODULE_IDS.TUOYUAN_COST_ESTIMATION]: '拓源成本暂估入库和计提情况',
  [MODULE_IDS.TUOYUAN_COST_CENTER_PROFIT_LOSS]: '拓源成本中心计入损益情况',
  [MODULE_IDS.TUOYUAN_COST_CENTER_STRUCTURE]: '拓源成本中心结构与质量（按年度计划口径分解）',
  [MODULE_IDS.TUOYUAN_MAIN_BUSINESS_CONTRIBUTION_RATE]: '拓源主营业务边际贡献率结构与质量',
  [MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PROFIT_MARGIN]: '拓源主营业务毛利率结构与质量',
  [MODULE_IDS.TUOYUAN_MAIN_BUSINESS_NET_PROFIT_CONTRIBUTION]: '拓源主营业务净利润贡献情况',
  [MODULE_IDS.TUOYUAN_NET_PROFIT_STRUCTURE]: '拓源净利润结构与质量',
  [MODULE_IDS.PAYMENT_STRUCTURE_QUALITY]: '收款结构与质量',
  [MODULE_IDS.TUOYUAN_ACCOUNTS_RECEIVABLE]: '拓源应收账款情况',
  [MODULE_IDS.TUOYUAN_OVERDUE_RECEIVABLES]: '拓源逾期应收账款情况',
  [MODULE_IDS.TUOYUAN_BAD_DEBT_PROVISION]: '拓源坏账准备情况',
  [MODULE_IDS.TUOYUAN_CONSTRUCTION_PLAN_EXECUTION]: '拓源施工计划执行情况',
  [MODULE_IDS.TUOYUAN_MAJOR_INVESTMENT]: '拓源年度重大投资情况',
  [MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PRODUCTION_VALUE_SELF_CONSTRUCTION]: '拓源主营业务产值--自行施工情况分析',
  [MODULE_IDS.TUOYUAN_CONSTRUCTION_EXECUTION_STATUS]: '拓源施工执行情况',

  // 拓源公司财务报表
  [MODULE_IDS.TUOYUAN_BALANCE_SHEET]: '拓源资产负债表',
  [MODULE_IDS.TUOYUAN_CASH_FLOW]: '拓源现金流量表',
  [MODULE_IDS.TUOYUAN_INCOME_STATEMENT]: '拓源利润表'
} as const

/**
 * 根据模块ID获取表单标题
 * @param moduleId 模块ID
 * @returns 表单标题
 */
export function getModuleTitle(moduleId: number): string {
  return MODULE_TITLES[moduleId] || `模块${moduleId}`
}

/**
 * 通用保存函数，保存业务数据后记录提交状态
 * @param saveBusinessData 保存业务数据的函数
 * @param moduleId 模块ID
 * @param period 期间
 * @param formData 表单数据
 * @param remarks 备注信息
 * @param suggestions 建议信息
 * @returns Promise<boolean> 是否成功
 */
export async function saveFormWithSubmissionRecord(
  saveBusinessData: () => Promise<void>,
  moduleId: number,
  period: string,
  formData: any,
  remarks?: string,
  suggestions?: string
): Promise<boolean> {
  try {
    // 先保存业务数据
    await saveBusinessData()
    
    // 再记录提交状态
    const recordSuccess = await recordFormSubmission(moduleId, period, formData, remarks, suggestions)
    
    if (!recordSuccess) {
      console.warn('提交记录保存失败，但业务数据已保存')
    }
    
    return true
    
  } catch (error) {
    console.error('保存失败:', error)
    throw error
  }
}

/**
 * 上传文件
 * @param file 文件对象
 * @param moduleId 模块ID
 * @param period 期间
 * @param description 文件描述
 * @returns Promise<any> 上传结果
 */
export async function uploadFile(
  file: File,
  moduleId: number,
  period: string,
  description?: string
): Promise<any> {
  try {
    const userStore = useUserStore()
    const userId = userStore.userInfo?.id

    if (!userId) {
      throw new Error('用户信息不存在')
    }

    // 验证必要参数
    if (!file) {
      throw new Error('文件不能为空')
    }

    if (!moduleId || moduleId === undefined) {
      throw new Error('模块ID不能为空')
    }

    if (!period || period === undefined) {
      throw new Error('期间不能为空')
    }

    console.log('上传文件信息:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      moduleId,
      period,
      userId,
      description
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('moduleId', moduleId.toString())
    formData.append('period', period.toString())
    formData.append('userId', userId.toString())
    if (description) {
      formData.append('description', description.toString())
    }

    // 使用自定义fetch，但不设置Content-Type（让浏览器自动设置multipart/form-data）
    const response = await fetch('http://47.111.95.19:3000/files/upload', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(30000) // 30秒超时，文件上传需要更长时间
    })

    console.log('上传响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('上传失败响应:', errorText)
      const error = new Error(`文件上传失败: ${response.status} ${response.statusText}`)
      ;(error as any).status = response.status
      throw error
    }

    const result = await response.json()
    console.log('上传成功响应:', result)

    if (!result.success) {
      throw new Error(result.error || '文件上传失败')
    }

    return result.data

  } catch (error) {
    const apiError = handleApiError(error, '文件上传')
    console.error('文件上传失败:', apiError.message)
    throw new Error(apiError.message)
  }
}

/**
 * 获取表单附件列表
 * @param moduleId 模块ID
 * @param period 期间
 * @returns Promise<any[]> 附件列表
 */
export async function getFormAttachments(
  moduleId: number,
  period: string
): Promise<any[]> {
  try {
    const response = await fetch(`http://47.111.95.19:3000/files/attachments/${moduleId}/${period}`)
    
    if (!response.ok) {
      throw new Error('获取附件列表失败')
    }
    
    const result = await response.json()
    return result.data || []
    
  } catch (error) {
    console.error('获取附件列表失败:', error)
    return []
  }
}

/**
 * 删除文件
 * @param fileId 文件ID
 * @returns Promise<boolean> 是否成功
 */
export async function deleteFile(fileId: number): Promise<boolean> {
  try {
    const userStore = useUserStore()
    const userId = userStore.userInfo?.id
    
    if (!userId) {
      throw new Error('用户信息不存在')
    }

    const response = await fetch(`http://47.111.95.19:3000/files/delete/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      throw new Error('文件删除失败')
    }
    
    return true
    
  } catch (error) {
    console.error('文件删除失败:', error)
    return false
  }
}

/**
 * 获取表单备注信息
 * @param moduleId 模块ID
 * @param period 期间
 * @returns Promise<{remarks: string, suggestions: string}> 备注信息
 */
export async function getFormRemarks(
  moduleId: number,
  period: string
): Promise<{ remarks: string; suggestions: string }> {
  try {
    // 验证参数
    if (!moduleId || moduleId === undefined) {
      console.warn('模块ID无效:', moduleId)
      return { remarks: '', suggestions: '' }
    }

    if (!period || period === undefined || period === 'undefined') {
      console.warn('期间无效:', period)
      return { remarks: '', suggestions: '' }
    }

    // 确保期间格式正确
    const formattedPeriod = period.toString().slice(0, 7)
    if (!/^\d{4}-\d{2}$/.test(formattedPeriod)) {
      console.warn('期间格式无效:', formattedPeriod)
      return { remarks: '', suggestions: '' }
    }

    const response = await fetch(
      `http://47.111.95.19:3000/forms/submission/${moduleId}/${formattedPeriod}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000) // 8秒超时
      }
    )

    if (response.status === 404) {
      return { remarks: '', suggestions: '' }
    }

    if (!response.ok) {
      throw new Error(`获取备注信息失败: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return {
      remarks: result.data?.remarks || '',
      suggestions: result.data?.suggestions || ''
    }

  } catch (error) {
    console.error('获取备注信息失败:', error)
    return { remarks: '', suggestions: '' }
  }
}

/**
 * 加载表单备注和建议信息 (alias for getFormRemarks)
 * @param moduleId 模块ID
 * @param period 期间
 * @returns Promise<{remarks: string, suggestions: string}> 备注信息
 */
export async function loadRemarksAndSuggestions(
  moduleId: number,
  period: string
): Promise<{ remarks: string; suggestions: string }> {
  return await getFormRemarks(moduleId, period)
}