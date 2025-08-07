import { ref, computed } from 'vue'
import type { IncomeStatement, IncomeStatementFormData } from './types/incomeStatement'

export interface IncomeStatementItem {
    name: string
    field: string
    currentAmount: number | null
    yearAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
    isCalculated?: boolean
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
                    isBold: true,
                    isCalculated: true
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
                    isBold: true,
                    isCalculated: true
                },
                {
                    name: '营业成本',
                    field: 'operating_cost',
                    currentAmount: null,
                    yearAmount: null,
                    isCalculated: true
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
                    isBold: true,
                    isCalculated: true
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
                    isBold: true,
                    isCalculated: true
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
                    isBold: true,
                    isCalculated: true
                },
                {
                    name: '（一）按所有权归属分类：',
                    field: 'ownership_classification',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '归属于母公司所有者的净利润',
                    field: 'parent_company_net_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '少数股东损益',
                    field: 'minority_interest_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '（二）按经营持续性分类：',
                    field: 'continuity_classification',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '持续经营净利润',
                    field: 'continuing_operation_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '终止经营净利润',
                    field: 'discontinued_operation_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                }
            ]
        },
        {
            title: '六、其他综合收益的税后净额',
            items: [
                {
                    name: '其他综合收益的税后净额',
                    field: 'other_comprehensive_income',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '归属于母公司所有者的其他综合收益的税后净额',
                    field: 'parent_other_comprehensive_income',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '（一）不能重分类进损益的其他综合收益',
                    field: 'non_reclassifiable_oci',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '1.重新计量设定受益计划变动额',
                    field: 'remeasure_defined_benefit_plans',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '2.权益法下不能转损益的其他综合收益',
                    field: 'equity_method_non_reclassifiable',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '3.其他权益工具投资公允价值变动',
                    field: 'other_equity_investment_fv_change',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '4.企业自身信用风险公允价值变动',
                    field: 'credit_risk_fv_change',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '5.其他',
                    field: 'other_non_reclassifiable',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '（二）将重分类进损益的其他综合收益',
                    field: 'reclassifiable_oci',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '1.权益法下可转损益的其他综合收益',
                    field: 'equity_method_reclassifiable',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '2.其他债权投资公允价值变动',
                    field: 'debt_investment_fv_change',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '3.可供出售金融资产公允价值变动损益',
                    field: 'available_for_sale_fv_change',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '4.金融资产重分类计入其他综合收益的金额',
                    field: 'financial_assets_reclassified_to_oci',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '5.持有至到期投资重分类为可供出售金融资产损益',
                    field: 'htm_reclassified_to_available_for_sale',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '6.其他债权投资信用减值准备',
                    field: 'other_debt_investment_credit_impairment',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '7.现金流量套期储备',
                    field: 'cash_flow_hedge_reserve',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '8.外币财务报表折算差额',
                    field: 'foreign_currency_translation',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '9.其他',
                    field: 'other_reclassifiable',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '归属于少数股东的其他综合收益的税后净额',
                    field: 'minority_other_comprehensive_income',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '七、综合收益总额',
            items: [
                {
                    name: '综合收益总额',
                    field: 'total_comprehensive_income',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true,
                    isCalculated: true
                }
            ]
        },
        {
            title: '八、每股收益',
            items: [
                {
                    name: '基本每股收益',
                    field: 'basic_earnings_per_share',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '稀释每股收益',
                    field: 'diluted_earnings_per_share',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                }
            ]
        }
    ])

    // 计算合计值的函数 - 只计算当期金额，累计值由后端计算
    const calculateTotals = () => {
        const data = incomeStatementData.value

        // 计算营业总收入
        const totalRevenueItem = data[0].items[0]
        const mainBusinessRevenueItem = data[0].items[1]
        const otherBusinessRevenueItem = data[0].items[2]
        
        totalRevenueItem.currentAmount = (mainBusinessRevenueItem.currentAmount || 0) + (otherBusinessRevenueItem.currentAmount || 0)

        // 计算营业成本
        const operatingCostItem = data[1].items[1]
        const mainBusinessCostItem = data[1].items[2]
        const otherBusinessCostItem = data[1].items[3]
        
        operatingCostItem.currentAmount = (mainBusinessCostItem.currentAmount || 0) + (otherBusinessCostItem.currentAmount || 0)

        // 计算营业总成本
        const totalCostItem = data[1].items[0]
        const costItems = data[1].items.slice(1, -4) // 排除最后4个子项目
        
        totalCostItem.currentAmount = costItems.reduce((sum, item) => sum + (item.currentAmount || 0), 0)

        // 计算营业利润
        const operatingProfitItem = data.find(section => section.title === '三、营业利润')?.items[0]
        if (operatingProfitItem) {
            const totalRevenue = totalRevenueItem.currentAmount || 0
            const totalCost = totalCostItem.currentAmount || 0
            const otherIncome = data.find(section => section.title === '加：其他收益')?.items[0]?.currentAmount || 0
            const investmentIncome = data.find(section => section.title === '投资收益')?.items[0]?.currentAmount || 0
            const fairValueIncome = data.find(section => section.title === '公允价值变动收益')?.items[0]?.currentAmount || 0
            const creditLoss = data.find(section => section.title === '信用减值损失')?.items[0]?.currentAmount || 0
            const assetLoss = data.find(section => section.title === '资产减值损失')?.items[0]?.currentAmount || 0
            const assetDisposalIncome = data.find(section => section.title === '资产处置收益')?.items[0]?.currentAmount || 0

            operatingProfitItem.currentAmount = totalRevenue - totalCost + otherIncome + investmentIncome + fairValueIncome + creditLoss + assetLoss + assetDisposalIncome
        }

        // 计算利润总额
        const totalProfitItem = data.find(section => section.title === '四、利润总额')?.items[0]
        if (totalProfitItem && operatingProfitItem) {
            const nonOperatingIncome = data.find(section => section.title === '加：营业外收入')?.items[0]?.currentAmount || 0
            const nonOperatingExpenses = data.find(section => section.title === '减：营业外支出')?.items[0]?.currentAmount || 0

            totalProfitItem.currentAmount = (operatingProfitItem.currentAmount || 0) + nonOperatingIncome - nonOperatingExpenses
        }

        // 计算净利润
        const netProfitItem = data.find(section => section.title === '五、净利润')?.items[0]
        if (netProfitItem && totalProfitItem) {
            const incomeTaxExpense = data.find(section => section.title === '减：所得税费用')?.items[0]?.currentAmount || 0
            netProfitItem.currentAmount = (totalProfitItem.currentAmount || 0) - incomeTaxExpense
        }

        // 计算综合收益总额
        const totalComprehensiveIncomeItem = data.find(section => section.title === '七、综合收益总额')?.items[0]
        if (totalComprehensiveIncomeItem && netProfitItem) {
            const otherComprehensiveIncome = data.find(section => section.title === '六、其他综合收益的税后净额')?.items[0]?.currentAmount || 0
            totalComprehensiveIncomeItem.currentAmount = (netProfitItem.currentAmount || 0) + otherComprehensiveIncome
        }
    }

    // 将当前数据转换为API格式
    const convertToApiFormat = (period: string) => {
        const formData: any = {}
        
        incomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    cumulative_amount: item.yearAmount
                }
            })
        })

        return {
            period,
            data: JSON.stringify(formData)
        }
    }

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): IncomeStatement => {
        const formData: IncomeStatementFormData = {}
        
        incomeStatementData.value.forEach(section => {
            section.items.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    cumulative_amount: item.yearAmount
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
                    item.yearAmount = data.cumulative_amount
                }
            })
        })
    }

    return {
        incomeStatementData,
        convertToStorageFormat,
        restoreFromStorageFormat,
        calculateTotals,
        convertToApiFormat
    }
} 