import { ref } from 'vue'
import type { IncomeStatement, IncomeStatementFormData } from './types/incomeStatement'

export interface ChangzhouTuoyuanIncomeStatementItem {
    name: string
    field: string
    currentAmount: number | null
    yearAmount: number | null
    currentAmountActual?: number | null
    yearAmountActual?: number | null
    completionRate?: number | null
    yearBudget?: number | null
    productInventory?: number | null
    isSubItem?: boolean
    isBold?: boolean
}

export interface ChangzhouTuoyuanIncomeStatementSection {
    title: string
    items: ChangzhouTuoyuanIncomeStatementItem[]
}

export const useChangzhouTuoyuanIncomeStatementData = () => {
    const changzhouTuoyuanIncomeStatementData = ref<ChangzhouTuoyuanIncomeStatementSection[]>([
        {
            title: '一、主营业务收入',
            items: [
                {
                    name: '主营业务收入',
                    field: 'main_business_revenue',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                }
            ]
        },
        {
            title: '减：主营业务成本',
            items: [
                {
                    name: '主营业务成本',
                    field: 'main_business_cost',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                },
                {
                    name: '其中：直接材料',
                    field: 'direct_materials',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isSubItem: true
                },
                {
                    name: '直接工资',
                    field: 'direct_labor',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isSubItem: true
                },
                {
                    name: '制造费用',
                    field: 'manufacturing_overhead',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isSubItem: true
                },
                {
                    name: '其中：外贸出口产品销售成本',
                    field: 'export_sales_cost',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isSubItem: true
                }
            ]
        },
        {
            title: '主营业务税金及附加',
            items: [
                {
                    name: '主营业务税金及附加',
                    field: 'main_business_taxes',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '二、主营业务利润（亏损以"-"号填列）',
            items: [
                {
                    name: '主营业务利润（亏损以"-"号填列）',
                    field: 'main_business_profit',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                },
                {
                    name: '加：其他业务利润（亏损以"-"号填列）',
                    field: 'other_business_profit',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '减：营业费用',
                    field: 'operating_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '管理费用',
                    field: 'management_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '三、营业利润（亏损以"-"号填列）',
            items: [
                {
                    name: '营业利润（亏损以"-"号填列）',
                    field: 'operating_profit',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                },
                {
                    name: '加：投资收益（亏损以"-"号填列）',
                    field: 'investment_income',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '补贴收入',
                    field: 'subsidy_income',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '营业外收入',
                    field: 'non_operating_income',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                },
                {
                    name: '减：营业外支出',
                    field: 'non_operating_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '四、利润总额（亏损以"-"号填列）',
            items: [
                {
                    name: '利润总额（亏损以"-"号填列）',
                    field: 'total_profit',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                },
                {
                    name: '减：所得税',
                    field: 'income_tax',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '五、净利润（净亏损以"-"号填列）',
            items: [
                {
                    name: '净利润（净亏损以"-"号填列）',
                    field: 'net_profit',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                }
            ]
        },
        {
            title: '',
            items: [
                {
                    name: '扣除项目',
                    field: 'deduction_items',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null,
                    isBold: true
                }
            ]
        },
        {
            title: '一、大亚顾问室',
            items: [
                {
                    name: '大亚顾问室',
                    field: 'daya_consultant_room',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '二、大亚总经理室',
            items: [
                {
                    name: '大亚总经理室',
                    field: 'daya_general_manager_office',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '三、大亚企管部',
            items: [
                {
                    name: '大亚企管部',
                    field: 'daya_enterprise_management',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '四、MG部门',
            items: [
                {
                    name: 'MG部门',
                    field: 'mg_department',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '五、HS部门',
            items: [
                {
                    name: 'HS部门',
                    field: 'hs_department',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '六、车间一MQ人工',
            items: [
                {
                    name: '车间一MQ人工',
                    field: 'workshop_one_mq_labor',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '七、车间一MQ制造费用',
            items: [
                {
                    name: '车间一MQ制造费用',
                    field: 'workshop_one_mq_manufacturing_cost',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '八、车间二HS人工',
            items: [
                {
                    name: '车间二HS人工',
                    field: 'workshop_two_hs_labor',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '九、车间二HS制造费用',
            items: [
                {
                    name: '车间二HS制造费用',
                    field: 'workshop_two_hs_manufacturing_cost',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        },
        {
            title: '十、总经理室二（费用部分）',
            items: [
                {
                    name: '总经理室二（费用部分）',
                    field: 'general_manager_office_two_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    currentAmountActual: null,
                    yearAmountActual: null,
                    completionRate: null,
                    yearBudget: null,
                    productInventory: null
                }
            ]
        }
    ])

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): IncomeStatement => {
        const formData: IncomeStatementFormData = {}
        
        changzhouTuoyuanIncomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    year_amount: item.yearAmount,
                    current_amount_actual: item.currentAmountActual,
                    year_amount_actual: item.yearAmountActual,
                    completion_rate: item.completionRate,
                    year_budget: item.yearBudget,
                    product_inventory: item.productInventory
                }
            })
        })

        return {
            period,
            data: JSON.stringify(formData)
        }
    }

    // 从存储格式恢复数据
    const restoreFromStorageFormat = (statement: IncomeStatement) => {
        const formData: IncomeStatementFormData = JSON.parse(statement.data)
        
        changzhouTuoyuanIncomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                const data = formData[item.field]
                if (data) {
                    item.currentAmount = data.current_amount
                    item.yearAmount = data.year_amount
                    item.currentAmountActual = data.current_amount_actual
                    item.yearAmountActual = data.year_amount_actual
                    item.completionRate = data.completion_rate
                    item.yearBudget = data.year_budget
                    item.productInventory = data.product_inventory
                }
            })
        })
    }

    return {
        changzhouTuoyuanIncomeStatementData,
        convertToStorageFormat,
        restoreFromStorageFormat
    }
} 