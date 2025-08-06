import { ref } from 'vue'
import type { CashFlowStatement, CashFlowFormData } from './types/cashFlow'

export interface ShanghaiNanhuaLanlingCashFlowItem {
    name: string
    field: string
    currentAmount: number | null
    yearAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
    isTitle?: boolean
    isCalculated?: boolean // 标记累计值是否由系统自动计算
}

export interface ShanghaiNanhuaLanlingCashFlowSection {
    title: string
    items: ShanghaiNanhuaLanlingCashFlowItem[]
}

export const useShanghaiNanhuaLanlingCashFlowData = () => {
    const cashFlowData = ref<ShanghaiNanhuaLanlingCashFlowSection[]>([
        {
            title: '一、经营活动产生的现金流量：',
            items: [
                {
                    name: '承包工程、销售商品、提供劳务收到的现金',
                    field: 'contract_sales_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到的税费返还',
                    field: 'tax_refund_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与经营活动有关的现金',
                    field: 'other_operating_cash_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营活动现金流入小计',
                    field: 'operating_cash_inflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购买商品、接受劳务支付的现金',
                    field: 'goods_services_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付给职工以及为职工支付的现金',
                    field: 'employee_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付的各项税费',
                    field: 'taxes_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与经营活动有关的现金',
                    field: 'other_operating_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营活动现金流出小计',
                    field: 'operating_cash_outflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '经营活动产生的现金流量净额',
                    field: 'operating_cash_flow_net',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '二、投资活动产生的现金流量：',
            items: [
                {
                    name: '收回投资收到的现金',
                    field: 'investment_recovery_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '取得投资收益收到的现金',
                    field: 'investment_income_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '处置固定资产、无形资产和其他长期资产收回的现金净额',
                    field: 'asset_disposal_cash_net',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与投资活动有关的现金',
                    field: 'other_investment_cash_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资活动现金流入小计',
                    field: 'investment_cash_inflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购建固定资产、无形资产和其他长期资产支付的现金',
                    field: 'capex_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资支付的现金',
                    field: 'investment_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与投资活动有关的现金',
                    field: 'other_investment_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资活动现金流出小计',
                    field: 'investment_cash_outflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '投资活动产生的现金流量净额',
                    field: 'investment_cash_flow_net',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '三、筹资活动产生的现金流量：',
            items: [
                {
                    name: '吸收投资收到的现金',
                    field: 'equity_investment_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '取得借款收到的现金',
                    field: 'borrowing_cash_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与筹资活动有关的现金',
                    field: 'other_financing_cash_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '筹资活动现金流入小计',
                    field: 'financing_cash_inflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '偿还债务支付的现金',
                    field: 'debt_repayment_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '分配股利、利润或偿付利息支付的现金',
                    field: 'dividend_interest_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与筹资活动有关的现金',
                    field: 'other_financing_cash_paid',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '筹资活动现金流出小计',
                    field: 'financing_cash_outflow_subtotal',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '筹资活动产生的现金流量净额',
                    field: 'financing_cash_flow_net',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '四、汇率变动对现金及现金等价物的影响',
            items: [
                {
                    name: '汇率变动对现金及现金等价物的影响',
                    field: 'exchange_rate_effect',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '五、现金及现金等价物净增加额',
            items: [
                {
                    name: '现金及现金等价物净增加额',
                    field: 'net_cash_increase',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        }
     
    ])

    // 补充资料数据
    const supplementaryData = ref<ShanghaiNanhuaLanlingCashFlowSection[]>([
        {
            title: '补充资料',
            items: [
                {
                    name: '1、将净利润调节为经营活动的现金流量：',
                    field: 'supplementary_info_title_1',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '净利润',
                    field: 'net_profit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '加：少数股东权益',
                    field: 'minority_interests',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '加：未确认的投资损失',
                    field: 'unrecognized_investment_loss',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '加：计提的资产减值准备',
                    field: 'asset_impairment_provision',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '固定资产折旧和摊销设备摊销',
                    field: 'depreciation_amortization',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true,

                },
                {
                    name: '无形资产摊销',
                    field: 'intangible_assets_amortization',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '长期待摊费用摊销',
                    field: 'long_term_prepaid_amortization',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '待摊费用的减少（减增加）',
                    field: 'prepaid_expenses_decrease',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '预提费用的增加（减减少）',
                    field: 'accrued_expenses_increase',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '处置固定资产、无形资产和其他长期资产的损失',
                    field: 'disposal_loss_long_term_assets',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '固定资产报废损失',
                    field: 'fixed_assets_disposal_loss',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '财务费用',
                    field: 'financial_expenses',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '投资损失（减：收益）',
                    field: 'investment_loss',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '递延税款贷项（减：借项）',
                    field: 'deferred_tax_credit',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '存货的减少（减：增加）',
                    field: 'inventory_decrease',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '经营性应收项目的减少（减：增加）',
                    field: 'operating_receivables_decrease',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '经营性应付项目的增加（减：减少）',
                    field: 'operating_payables_increase',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '其他',
                    field: 'other_adjustments',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '经营活动产生的现金流量净额',
                    field: 'operating_cash_flow_net_supplementary',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true,
                    isSubItem: true
                }
            ]
        },
        {
            title: '2、不涉及现金收支的投资和筹资活动：',
            items: [
                {
                    name: '债务转为资本',
                    field: 'debt_to_equity_non_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '一年内到期的转换公司债券',
                    field: 'convertible_bonds_due_non_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '融资租入固定资产',
                    field: 'finance_lease_assets_non_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其他',
                    field: 'other_non_cash_activities',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '3、现金及现金等价物净增加情况：',
            items: [
                {
                    name: '现金的期末余额',
                    field: 'cash_ending_balance_final',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '减：现金的期初余额',
                    field: 'cash_beginning_balance_final',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '加：现金等价物的期末余额',
                    field: 'cash_equivalents_ending_balance_final',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '减：现金等价物的期初余额',
                    field: 'cash_equivalents_beginning_balance_final',
                    currentAmount: null,
                    yearAmount: null
                },
               
            ]
        },
        {
            title: '五、现金及现金等价物净增加额',
            items: [
                {
                    name: '现金及现金等价物净增加额',
                    field: 'cash_and_equivalents_net_increase',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                }
            ]
        },

    ])

    // 将当前数据转换为可存储格式
    const convertToStorageFormat = (period: string): CashFlowStatement => {
        const formData: CashFlowFormData = {}
        
        // 合并主要数据和补充数据
        const allData = [...cashFlowData.value, ...supplementaryData.value]
        allData.forEach(section => {
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
    const restoreFromStorageFormat = (statement: CashFlowStatement) => {
        const formData: CashFlowFormData = typeof statement.data === 'string' ? JSON.parse(statement.data) : statement.data
        
        // 恢复主要数据和补充数据
        const allData = [...cashFlowData.value, ...supplementaryData.value]
        allData.forEach(section => {
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
        cashFlowData,
        supplementaryData,
        convertToStorageFormat,
        restoreFromStorageFormat
    }
} 