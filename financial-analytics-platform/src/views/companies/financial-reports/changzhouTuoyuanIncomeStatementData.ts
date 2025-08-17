import { ref } from 'vue'
import type { IncomeStatement, IncomeStatementFormData } from '../../example/types/incomeStatement'

export interface ChangzhouTuoyuanIncomeStatementItem {
    name: string
    field: string
    currentAmount: number | null
    cumulativeAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
    isCalculated?: boolean // 标记累计值是否由系统自动计算
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
                    cumulativeAmount: null,
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
                    cumulativeAmount: null,
                    isBold: true
                },
                {
                    name: '其中：直接材料',
                    field: 'direct_materials',
                    currentAmount: null,
                    cumulativeAmount: null,
                    isSubItem: true
                },
                {
                    name: '直接工资',
                    field: 'direct_labor',
                    currentAmount: null,
                    cumulativeAmount: null,
                    isSubItem: true
                },
                {
                    name: '制造费用',
                    field: 'manufacturing_overhead',
                    currentAmount: null,
                    cumulativeAmount: null,
                    isSubItem: true
                },
                {
                    name: '其中：外贸出口产品销售成本',
                    field: 'export_sales_cost',
                    currentAmount: null,
                    cumulativeAmount: null,
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
                    cumulativeAmount: null
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
                    cumulativeAmount: null,
                    isBold: true
                },
                {
                    name: '加：其他业务利润（亏损以"-"号填列）',
                    field: 'other_business_profit',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '减：营业费用',
                    field: 'operating_expenses',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '管理费用',
                    field: 'management_expenses',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    currentAmount: null,
                    cumulativeAmount: null
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
                    cumulativeAmount: null,
                    isBold: true
                },
                {
                    name: '加：投资收益（亏损以"-"号填列）',
                    field: 'investment_income',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '补贴收入',
                    field: 'subsidy_income',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '营业外收入',
                    field: 'non_operating_income',
                    currentAmount: null,
                    cumulativeAmount: null
                },
                {
                    name: '减：营业外支出',
                    field: 'non_operating_expenses',
                    currentAmount: null,
                    cumulativeAmount: null
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
                    cumulativeAmount: null,
                    isBold: true
                },
                {
                    name: '减：所得税',
                    field: 'income_tax',
                    currentAmount: null,
                    cumulativeAmount: null
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
                    cumulativeAmount: null,
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
                    cumulativeAmount: null,
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
                    cumulativeAmount: null
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
                    cumulativeAmount: null
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
                    cumulativeAmount: null
                }
            ]
        },

    ])

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): IncomeStatement => {
        const formData: IncomeStatementFormData = {}
        
        changzhouTuoyuanIncomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    cumulative_amount: item.cumulativeAmount
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
                    item.cumulativeAmount = data.cumulative_amount
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