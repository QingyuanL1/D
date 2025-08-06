import { reactive } from 'vue'

// 常州拓源电气集团资产负债表数据结构
export interface ChangzhouBalanceSheetData {
  // 流动资产
  monetary_funds_beginning: number | null
  monetary_funds_ending: number | null
  short_term_investments_beginning: number | null
  short_term_investments_ending: number | null
  notes_receivable_beginning: number | null
  notes_receivable_ending: number | null
  accounts_receivable_beginning: number | null
  accounts_receivable_ending: number | null
  bad_debt_provision_beginning: number | null
  bad_debt_provision_ending: number | null
  accounts_receivable_net_beginning: number | null
  accounts_receivable_net_ending: number | null
  prepaid_accounts_beginning: number | null
  prepaid_accounts_ending: number | null
  subsidy_receivable_beginning: number | null
  subsidy_receivable_ending: number | null
  other_receivables_beginning: number | null
  other_receivables_ending: number | null
  inventory_beginning: number | null
  inventory_ending: number | null
  raw_materials_beginning: number | null
  raw_materials_ending: number | null
  finished_goods_beginning: number | null
  finished_goods_ending: number | null
  work_in_progress_beginning: number | null
  work_in_progress_ending: number | null
  prepaid_expenses_beginning: number | null
  prepaid_expenses_ending: number | null
  pending_asset_losses_beginning: number | null
  pending_asset_losses_ending: number | null
  long_term_bonds_due_within_year_beginning: number | null
  long_term_bonds_due_within_year_ending: number | null

  // 流动负债
  short_term_loans_beginning: number | null
  short_term_loans_ending: number | null
  notes_payable_beginning: number | null
  notes_payable_ending: number | null
  accounts_payable_beginning: number | null
  accounts_payable_ending: number | null
  advances_received_beginning: number | null
  advances_received_ending: number | null
  other_payables_beginning: number | null
  other_payables_ending: number | null
  payroll_payable_beginning: number | null
  payroll_payable_ending: number | null
  welfare_payable_beginning: number | null
  welfare_payable_ending: number | null
  taxes_payable_beginning: number | null
  taxes_payable_ending: number | null
  unpaid_profits_beginning: number | null
  unpaid_profits_ending: number | null
  other_unpaid_beginning: number | null
  other_unpaid_ending: number | null
  accrued_expenses_beginning: number | null
  accrued_expenses_ending: number | null
  long_term_debt_due_within_year_beginning: number | null
  long_term_debt_due_within_year_ending: number | null
  other_current_liabilities_beginning: number | null
  other_current_liabilities_ending: number | null

  // 合计字段
  current_assets_total_beginning: number | null
  current_assets_total_ending: number | null
  assets_total_beginning: number | null
  assets_total_ending: number | null
  current_liabilities_total_beginning: number | null
  current_liabilities_total_ending: number | null
  liabilities_total_beginning: number | null
  liabilities_total_ending: number | null
  
  // 所有者权益
  paid_in_capital_beginning: number | null
  paid_in_capital_ending: number | null
  capital_reserve_beginning: number | null
  capital_reserve_ending: number | null
  surplus_reserve_beginning: number | null
  surplus_reserve_ending: number | null
  public_welfare_fund_beginning: number | null
  public_welfare_fund_ending: number | null
  retained_earnings_beginning: number | null
  retained_earnings_ending: number | null
  owners_equity_total_beginning: number | null
  owners_equity_total_ending: number | null
  liabilities_and_equity_total_beginning: number | null
  liabilities_and_equity_total_ending: number | null

  // 长期资产
  long_term_investments_beginning: number | null
  long_term_investments_ending: number | null
  fixed_assets_original_cost_beginning: number | null
  fixed_assets_original_cost_ending: number | null
  accumulated_depreciation_beginning: number | null
  accumulated_depreciation_ending: number | null
  fixed_assets_net_beginning: number | null
  fixed_assets_net_ending: number | null
  fixed_assets_total_beginning: number | null
  fixed_assets_total_ending: number | null
  intangible_assets_beginning: number | null
  intangible_assets_ending: number | null
  deferred_assets_beginning: number | null
  deferred_assets_ending: number | null
  intangible_deferred_total_beginning: number | null
  intangible_deferred_total_ending: number | null
}

// 创建初始数据（基于提供的图片数据）
export const useChangzhouBalanceSheetData = () => {
  const balanceSheetData = reactive<ChangzhouBalanceSheetData>({
    // 流动资产 - 清空所有预设数据
    monetary_funds_beginning: null,
    monetary_funds_ending: null,
    short_term_investments_beginning: null,
    short_term_investments_ending: null,
    notes_receivable_beginning: null,
    notes_receivable_ending: null,
    accounts_receivable_beginning: null,
    accounts_receivable_ending: null,
    bad_debt_provision_beginning: null,
    bad_debt_provision_ending: null,
    accounts_receivable_net_beginning: null,
    accounts_receivable_net_ending: null,
    prepaid_accounts_beginning: null,
    prepaid_accounts_ending: null,
    subsidy_receivable_beginning: null,
    subsidy_receivable_ending: null,
    other_receivables_beginning: null,
    other_receivables_ending: null,
    inventory_beginning: null,
    inventory_ending: null,
    raw_materials_beginning: null,
    raw_materials_ending: null,
    finished_goods_beginning: null,
    finished_goods_ending: null,
    work_in_progress_beginning: null,
    work_in_progress_ending: null,
    prepaid_expenses_beginning: null,
    prepaid_expenses_ending: null,
    pending_asset_losses_beginning: null,
    pending_asset_losses_ending: null,
    long_term_bonds_due_within_year_beginning: null,
    long_term_bonds_due_within_year_ending: null,

    // 流动负债 - 清空所有预设数据
    short_term_loans_beginning: null,
    short_term_loans_ending: null,
    notes_payable_beginning: null,
    notes_payable_ending: null,
    accounts_payable_beginning: null,
    accounts_payable_ending: null,
    advances_received_beginning: null,
    advances_received_ending: null,
    other_payables_beginning: null,
    other_payables_ending: null,
    payroll_payable_beginning: null,
    payroll_payable_ending: null,
    welfare_payable_beginning: null,
    welfare_payable_ending: null,
    taxes_payable_beginning: null,
    taxes_payable_ending: null,
    unpaid_profits_beginning: null,
    unpaid_profits_ending: null,
    other_unpaid_beginning: null,
    other_unpaid_ending: null,
    accrued_expenses_beginning: null,
    accrued_expenses_ending: null,
    long_term_debt_due_within_year_beginning: null,
    long_term_debt_due_within_year_ending: null,
    other_current_liabilities_beginning: null,
    other_current_liabilities_ending: null,

    // 合计字段 - 清空所有预设数据
    current_assets_total_beginning: null,
    current_assets_total_ending: null,
    assets_total_beginning: null,
    assets_total_ending: null,
    current_liabilities_total_beginning: null,
    current_liabilities_total_ending: null,
    liabilities_total_beginning: null,
    liabilities_total_ending: null,
    
    // 所有者权益 - 清空所有预设数据
    paid_in_capital_beginning: null,
    paid_in_capital_ending: null,
    capital_reserve_beginning: null,
    capital_reserve_ending: null,
    surplus_reserve_beginning: null,
    surplus_reserve_ending: null,
    public_welfare_fund_beginning: null,
    public_welfare_fund_ending: null,
    retained_earnings_beginning: null,
    retained_earnings_ending: null,
    owners_equity_total_beginning: null,
    owners_equity_total_ending: null,
    liabilities_and_equity_total_beginning: null,
    liabilities_and_equity_total_ending: null,

    // 长期资产 - 清空所有预设数据
    long_term_investments_beginning: null,
    long_term_investments_ending: null,
    fixed_assets_original_cost_beginning: null,
    fixed_assets_original_cost_ending: null,
    accumulated_depreciation_beginning: null,
    accumulated_depreciation_ending: null,
    fixed_assets_net_beginning: null,
    fixed_assets_net_ending: null,
    fixed_assets_total_beginning: null,
    fixed_assets_total_ending: null,
    intangible_assets_beginning: null,
    intangible_assets_ending: null,
    deferred_assets_beginning: null,
    deferred_assets_ending: null,
    intangible_deferred_total_beginning: null,
    intangible_deferred_total_ending: null
  })

  // 转换为存储格式
  const convertToStorageFormat = (period: string) => {
    return {
      period,
      company: 'changzhou_tuoyuan',
      data: JSON.stringify(balanceSheetData)
    }
  }

  // 从存储格式恢复数据
  const restoreFromStorageFormat = (data: any) => {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    
    Object.keys(data).forEach(key => {
      if (key in balanceSheetData) {
        balanceSheetData[key as keyof ChangzhouBalanceSheetData] = data[key]
      }
    })
  }

  // 计算合计值
  const calculateTotals = () => {
    // 流动资产合计
    const currentAssets = 
      (balanceSheetData.monetary_funds_ending || 0) +
      (balanceSheetData.short_term_investments_ending || 0) +
      (balanceSheetData.accounts_receivable_net_ending || 0) +
      (balanceSheetData.prepaid_accounts_ending || 0) +
      (balanceSheetData.other_receivables_ending || 0) +
      (balanceSheetData.inventory_ending || 0) +
      (balanceSheetData.prepaid_expenses_ending || 0)

    // 流动负债合计
    const currentLiabilities = 
      (balanceSheetData.short_term_loans_ending || 0) +
      (balanceSheetData.accounts_payable_ending || 0) +
      (balanceSheetData.other_payables_ending || 0) +
      (balanceSheetData.payroll_payable_ending || 0) +
      (balanceSheetData.taxes_payable_ending || 0)

    return {
      currentAssets,
      currentLiabilities
    }
  }

  return {
    balanceSheetData,
    convertToStorageFormat,
    restoreFromStorageFormat,
    calculateTotals
  }
} 