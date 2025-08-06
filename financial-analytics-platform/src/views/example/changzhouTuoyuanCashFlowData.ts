import { ref } from 'vue'
import type { CashFlowStatement, CashFlowFormData } from './types/cashFlow'

export interface ChangzhouTuoyuanCashFlowItem {
    name: string
    field: string
    rowNumber: number
    currentAmount: number | null
    yearAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
}

export interface ChangzhouTuoyuanCashFlowSection {
    title: string
    leftItems: ChangzhouTuoyuanCashFlowItem[]
    rightItems?: ChangzhouTuoyuanCashFlowItem[]
    isFullWidth?: boolean
}

export const useChangzhouTuoyuanCashFlowData = () => {
    const cashFlowData = ref<ChangzhouTuoyuanCashFlowSection[]>([
        {
            title: '一、经营活动产生的现金流量：',
            leftItems: [
                {
                    name: '承包工程、销售商品、提供劳务收到的现金',
                    field: 'sales_cash',
                    rowNumber: 1,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到的税费返还',
                    field: 'tax_refund',
                    rowNumber: 2,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与经营活动有关的现金',
                    field: 'other_operating_received',
                    rowNumber: 3,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流入小计',
                    field: 'operating_inflow_total',
                    rowNumber: 5,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购买商品、接受劳务支付的现金',
                    field: 'purchase_payment',
                    rowNumber: 6,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付给职工以及为职工支付的现金',
                    field: 'employee_payment',
                    rowNumber: 7,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付的各项税费',
                    field: 'tax_payment',
                    rowNumber: 8,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与经营活动有关的现金',
                    field: 'other_operating_payment',
                    rowNumber: 9,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流出小计',
                    field: 'operating_outflow_total',
                    rowNumber: 10,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '经营活动产生的现金流量净额',
                    field: 'operating_net_flow',
                    rowNumber: 11,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ],
            rightItems: [
                {
                    name: '补充资料',
                    field: 'supplementary_info_header',
                    rowNumber: 35,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '1.将净利润调节为经营活动现金流量：',
                    field: 'reconciliation_header',
                    rowNumber: 36,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '净利润',
                    field: 'net_profit',
                    rowNumber: 37,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '加：资产减值准备',
                    field: 'asset_impairment',
                    rowNumber: 38,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '固定资产折旧、油气资产折耗、生产性生物资产折旧',
                    field: 'depreciation',
                    rowNumber: 41,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '无形资产摊销',
                    field: 'intangible_amortization',
                    rowNumber: 42,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '长期待摊费用摊销',
                    field: 'deferred_expense_amortization',
                    rowNumber: 43,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '处置固定资产、无形资产和其他长期资产的损失（收益以"-"号填列）',
                    field: 'disposal_loss',
                    rowNumber: 44,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '固定资产报废损失',
                    field: 'fixed_asset_scrap_loss',
                    rowNumber: 45,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '公允价值变动损失（收益以"-"号填列）',
                    field: 'fair_value_change_loss',
                    rowNumber: 46,
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '二、投资活动产生的现金流量：',
            leftItems: [
                {
                    name: '收回投资收到的现金',
                    field: 'investment_recovery',
                    rowNumber: 12,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '取得投资收益收到的现金',
                    field: 'investment_income_received',
                    rowNumber: 13,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '处置固定资产、无形资产和其他长期资产收回的现金净额',
                    field: 'asset_disposal_cash',
                    rowNumber: 15,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与投资活动有关的现金',
                    field: 'other_investment_received',
                    rowNumber: 16,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流入小计',
                    field: 'investment_inflow_total',
                    rowNumber: 17,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购建固定资产、无形资产和其他长期资产所支付的现金',
                    field: 'capex_payment',
                    rowNumber: 18,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资支付的现金',
                    field: 'investment_payment',
                    rowNumber: 19,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与投资活动有关的现金',
                    field: 'other_investment_payment',
                    rowNumber: 20,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流出小计',
                    field: 'investment_outflow_total',
                    rowNumber: 21,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '投资活动产生的现金流量净额',
                    field: 'investment_net_flow',
                    rowNumber: 22,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ],
            rightItems: [
                {
                    name: '固定资产报废损失',
                    field: 'fixed_asset_disposal_loss',
                    rowNumber: 47,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    rowNumber: 48,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资损失（收益以"-"号填列）',
                    field: 'investment_loss',
                    rowNumber: 49,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '递延所得税资产减少（增加以"-"号填列）',
                    field: 'deferred_tax_asset_decrease',
                    rowNumber: 50,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '存货的减少（增加以"-"号填列）',
                    field: 'inventory_decrease',
                    rowNumber: 51,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营性应收项目的减少（增加以"-"号填列）',
                    field: 'operating_receivables_decrease',
                    rowNumber: 52,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营性应付项目的增加（减少以"-"号填列）',
                    field: 'operating_payables_increase',
                    rowNumber: 53,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其他',
                    field: 'other_adjustments',
                    rowNumber: 54,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营活动产生的现金流量净额',
                    field: 'operating_cash_flow_reconciled',
                    rowNumber: 55,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '三、筹资活动产生的现金流量：',
            leftItems: [
                {
                    name: '吸收投资收到的现金',
                    field: 'capital_received',
                    rowNumber: 23,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '借款收到的现金',
                    field: 'borrowing_received',
                    rowNumber: 24,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与筹资活动有关的现金',
                    field: 'other_financing_received',
                    rowNumber: 26,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流入小计',
                    field: 'financing_inflow_total',
                    rowNumber: 27,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '偿还债务支付的现金',
                    field: 'debt_repayment',
                    rowNumber: 28,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '分配股利、利润或偿付利息支付的现金',
                    field: 'dividend_interest_payment',
                    rowNumber: 29,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与筹资活动有关的现金',
                    field: 'other_financing_payment',
                    rowNumber: 30,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金流出小计',
                    field: 'financing_outflow_total',
                    rowNumber: 31,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '筹资活动产生的现金流量净额',
                    field: 'financing_net_flow',
                    rowNumber: 32,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ],
            rightItems: [
                {
                    name: '2.不涉及现金收支的投资和筹资活动：',
                    field: 'non_cash_activities_header',
                    rowNumber: 56,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '债务转为资本',
                    field: 'debt_to_equity',
                    rowNumber: 57,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '一年内到期的可转换公司债券',
                    field: 'convertible_bonds_due',
                    rowNumber: 58,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '融资租入固定资产',
                    field: 'finance_lease_assets',
                    rowNumber: 59,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其他',
                    field: 'other_non_cash',
                    rowNumber: 60,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '3.现金及现金等价物净变动情况：',
                    field: 'cash_change_header',
                    rowNumber: 63,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金的期末余额',
                    field: 'cash_ending_balance',
                    rowNumber: 64,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '减：现金的期初余额',
                    field: 'cash_beginning_balance',
                    rowNumber: 65,
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '现金等价物的期末余额',
                    field: 'cash_equivalent_ending',
                    rowNumber: 66,
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '四、汇率变动对现金及现金等价物的影响',
            leftItems: [
                {
                    name: '汇率变动对现金及现金等价物的影响',
                    field: 'exchange_rate_effect',
                    rowNumber: 33,
                    currentAmount: null,
                    yearAmount: null
                }
            ],
            rightItems: [
                {
                    name: '减：现金等价物的期初余额',
                    field: 'cash_equivalent_beginning',
                    rowNumber: 67,
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '五、现金及现金等价物净增加额',
            leftItems: [
                {
                    name: '现金及现金等价物净增加额',
                    field: 'cash_net_increase',
                    rowNumber: 34,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ],
            rightItems: [
                {
                    name: '现金及现金等价物净增加额',
                    field: 'cash_net_increase_reconciled',
                    rowNumber: 68,
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        }
    ])

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): CashFlowStatement => {
        const formData: CashFlowFormData = {}
        
        cashFlowData.value.forEach(section => {
            section.leftItems.forEach(item => {
                formData[item.field] = {
                    current_amount: item.currentAmount,
                    year_amount: item.yearAmount
                }
            })
            if (section.rightItems) {
                section.rightItems.forEach(item => {
                    formData[item.field] = {
                        current_amount: item.currentAmount,
                        year_amount: item.yearAmount
                    }
                })
            }
        })

        return {
            period,
            data: JSON.stringify(formData)
        }
    }

    // 从存储格式恢复数据
    const restoreFromStorageFormat = (statement: CashFlowStatement) => {
        const formData: CashFlowFormData = JSON.parse(statement.data)
        
        cashFlowData.value.forEach(section => {
            section.leftItems.forEach(item => {
                const data = formData[item.field]
                if (data) {
                    item.currentAmount = data.current_amount
                    item.yearAmount = data.year_amount
                }
            })
            if (section.rightItems) {
                section.rightItems.forEach(item => {
                    const data = formData[item.field]
                    if (data) {
                        item.currentAmount = data.current_amount
                        item.yearAmount = data.year_amount
                    }
                })
            }
        })
    }

    return {
        cashFlowData,
        convertToStorageFormat,
        restoreFromStorageFormat
    }
} 