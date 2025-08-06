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

export const useIncomeStatementData = () => {
    const incomeStatementData = ref<IncomeStatementSection[]>([
        {
            title: '一、营业总收入',
            items: [
                {
                    name: '营业总收入',
                    field: 'total_revenue',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '其中：主营业务收入',
                    field: 'main_business_revenue',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '其他业务收入',
                    field: 'other_business_revenue',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                }
            ]
        },
        {
            title: '二、营业总成本',
            items: [
                {
                    name: '营业总成本',
                    field: 'total_cost',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '营业成本',
                    field: 'operating_cost',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：主营业务成本',
                    field: 'main_business_cost',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '其他业务成本',
                    field: 'other_business_cost',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '税金及附加',
                    field: 'taxes_and_surcharges',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '销售费用',
                    field: 'selling_expenses',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '管理费用',
                    field: 'management_expenses',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '研发费用',
                    field: 'research_expenses',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：利息费用',
                    field: 'interest_expense',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '利息收入',
                    field: 'interest_income',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '汇兑净损失（净收益以"-"号填列）',
                    field: 'exchange_loss',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其他',
                    field: 'other_financial_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                }
            ]
        },
        {
            title: '加：其他收益',
            items: [
                {
                    name: '其他收益',
                    field: 'other_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '投资收益',
            items: [
                {
                    name: '投资收益（损失以"-"号填列）',
                    field: 'investment_income',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：对联营企业和合营企业的投资收益',
                    field: 'investment_income_associates',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '以摊余成本计量的金融资产终止确认收益',
                    field: 'financial_assets_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '公允价值变动收益',
            items: [
                {
                    name: '公允价值变动收益（损失以"-"号填列）',
                    field: 'fair_value_change_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '信用减值损失',
            items: [
                {
                    name: '信用减值损失（损失以"-"号填列）',
                    field: 'credit_impairment_loss',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '资产减值损失',
            items: [
                {
                    name: '资产减值损失（损失以"-"号填列）',
                    field: 'asset_impairment_loss',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '资产处置收益',
            items: [
                {
                    name: '资产处置收益（损失以"-"号填列）',
                    field: 'asset_disposal_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '三、营业利润',
            items: [
                {
                    name: '营业利润（亏损以"-"号填列）',
                    field: 'operating_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '加：营业外收入',
            items: [
                {
                    name: '营业外收入',
                    field: 'non_operating_income',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：政府补助',
                    field: 'government_grants',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
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
            title: '四、利润总额',
            items: [
                {
                    name: '利润总额（亏损总额以"-"号填列）',
                    field: 'total_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '减：所得税费用',
            items: [
                {
                    name: '所得税费用',
                    field: 'income_tax_expense',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '五、净利润',
            items: [
                {
                    name: '净利润（净亏损以"-"号填列）',
                    field: 'net_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
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