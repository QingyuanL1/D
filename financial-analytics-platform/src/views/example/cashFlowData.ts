import { ref } from 'vue'
import type { CashFlowRecord, CashFlowBatchInsert, CashFlowStatement, CashFlowFormData } from './types/cashFlow'

export interface CashFlowItem {
    name: string
    field: string
    currentAmount: number | null
    yearAmount: number | null
    isSubItem?: boolean
    isBold?: boolean
}

export interface CashFlowSection {
    title: string
    items: CashFlowItem[]
}

export const useCashFlowData = () => {
    const cashFlowData = ref<CashFlowSection[]>([
        {
            title: '一、经营活动产生的现金流量：',
            items: [
                {
                    name: '销售商品、提供劳务收到的现金',
                    field: 'sales_cash',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到的税费返还',
                    field: 'tax_refund',
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
                    field: 'operating_cash_inflow_total',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购买商品、接受劳务支付的现金',
                    field: 'purchase_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付给职工及为职工支付的现金',
                    field: 'employee_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付的各项税费',
                    field: 'tax_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与经营活动有关的现金',
                    field: 'other_operating_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '经营活动现金流出小计',
                    field: 'operating_cash_outflow_total',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '营活动产生的现金流量净额',
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
                    field: 'investment_recovery',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '取得投资收益收到的现金',
                    field: 'investment_income',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '处置固定资产、无形资产和其他长期资产收回的现金净额',
                    field: 'fixed_assets_disposal',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '处置子公司及其他营业单位收到的现金净额',
                    field: 'subsidiary_disposal',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与投资活动有关的现金',
                    field: 'other_investment_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资活动现金流入小计',
                    field: 'investment_cash_inflow_total',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '购建固定资产、无形资产和其他长期资产支付的现金',
                    field: 'fixed_assets_acquisition',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资支付的现金',
                    field: 'investment_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '取得子公司及其他营业单位支付的现金净额',
                    field: 'subsidiary_acquisition',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '支付其他与投资活动有关的现金',
                    field: 'other_investment_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '投资活动现金流出小计',
                    field: 'investment_cash_outflow_total',
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
                    field: 'investment_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：子公司吸收少数股东投资收到的现金',
                    field: 'subsidiary_investment_received',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '取得借款收到的现金',
                    field: 'loan_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '收到其他与筹资活动有关的现金',
                    field: 'other_financing_received',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '筹资活动现金流入小计',
                    field: 'financing_cash_inflow_total',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '偿还债务支付的现金',
                    field: 'debt_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '分配股利、利润或偿付利息支付的现金',
                    field: 'dividend_interest_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '其中：子公司支付给少数股东的股利、利润',
                    field: 'subsidiary_dividend_payment',
                    currentAmount: null,
                    yearAmount: null,
                    isSubItem: true
                },
                {
                    name: '支付其他与筹资活动有关的现金',
                    field: 'other_financing_payment',
                    currentAmount: null,
                    yearAmount: null
                },
                {
                    name: '筹资活动现金流出小计',
                    field: 'financing_cash_outflow_total',
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
                    yearAmount: null,
                    isBold: true
                }
            ]
        },
        {
            title: '五、现金及现金等价物净增加额',
            items: [
                {
                    name: '现金及现金等价物净增加额',
                    field: 'cash_net_increase',
                    currentAmount: null,
                    yearAmount: null,
                    isBold: true
                },
                {
                    name: '加：期初现金及现金等价物余额',
                    field: 'beginning_cash_balance',
                    currentAmount: null,
                    yearAmount: null
                }
            ]
        },
        {
            title: '六、期末现金及现金等价物余额',
            items: [
                {
                    name: '期末现金及现金等价物余额',
                    field: 'ending_cash_balance',
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
        const formData: CashFlowFormData = JSON.parse(statement.data)
        
        cashFlowData.value.forEach(section => {
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
        convertToStorageFormat,
        restoreFromStorageFormat
    }
} 