import { ref } from 'vue'
import type { IncomeStatement, IncomeStatementFormData } from './types/incomeStatement'

export interface IncomeStatementItem {
    name: string
    field: string
    currentAmount: number | null
    yearAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
}

export interface IncomeStatementSection {
    title: string
    items: IncomeStatementItem[]
}

export const useShanghaiNanhuaLanlingIncomeStatementData = () => {
    const incomeStatementData = ref<IncomeStatementSection[]>([
        {
            title: '一、主营业务收入',
            items: [
                {
                    name: '主营业务收入',
                    field: 'main_business_revenue',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '减：直接成本',
            items: [
                {
                    name: '直接成本',
                    field: 'direct_cost',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '人工成本',
            items: [
                {
                    name: '人工成本',
                    field: 'labor_cost',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '制造费用',
            items: [
                {
                    name: '制造费用',
                    field: 'manufacturing_cost',
                    currentAmount: null,
                    yearAmount: null
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
                    yearAmount: null
                }
            ]
        },
        {
            title: '二、主营业务利润（亏损以"—"号填列）',
            items: [
                {
                    name: '主营业务利润',
                    field: 'main_business_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '加：其他业务利润（亏损以"—"号填列）',
            items: [
                {
                    name: '其他业务利润',
                    field: 'other_business_profit',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '减：营业费用',
            items: [
                {
                    name: '营业费用',
                    field: 'selling_expenses',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '管理费用',
            items: [
                {
                    name: '管理费用',
                    field: 'management_expenses',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '财务费用',
            items: [
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '三、营业利润（亏损以"—"号填列）',
            items: [
                {
                    name: '营业利润',
                    field: 'operating_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '加：投资收益（亏损以"—"号填列）',
            items: [
                {
                    name: '投资收益',
                    field: 'investment_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '补贴收入',
            items: [
                {
                    name: '补贴收入',
                    field: 'subsidy_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '营业外收入',
            items: [
                {
                    name: '营业外收入',
                    field: 'non_operating_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '以前年度损益调整',
            items: [
                {
                    name: '以前年度损益调整',
                    field: 'prior_year_adjustment',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '减：营业外支出',
            items: [
                {
                    name: '营业外支出',
                    field: 'non_operating_expenses',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '四、利润总额（亏损总额以"—"号填列）',
            items: [
                {
                    name: '利润总额',
                    field: 'total_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '减：所得税',
            items: [
                {
                    name: '所得税',
                    field: 'income_tax',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '少数股东损益（合并报表填列）',
            items: [
                {
                    name: '少数股东损益',
                    field: 'minority_interest_profit',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '加：未确认的投资损失（合并报表填列）',
            items: [
                {
                    name: '未确认的投资损失',
                    field: 'unrecognized_investment_loss',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '纳税调整',
            items: [
                {
                    name: '纳税调整',
                    field: 'tax_adjustment',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '五、净利润（亏损以"—"号填列）',
            items: [
                {
                    name: '净利润',
                    field: 'net_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        }
    ])

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): IncomeStatement => {
        const formData: IncomeStatementFormData = {}
        
        incomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    year_amount: item.yearAmount
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
        
        incomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                const data = formData[item.field]
                if (data) {
                    item.currentAmount = data.current_amount
                    item.yearAmount = data.year_amount
                }
            })
        })
    }

    return {
        incomeStatementData,
        convertToStorageFormat,
        restoreFromStorageFormat
    }
} 