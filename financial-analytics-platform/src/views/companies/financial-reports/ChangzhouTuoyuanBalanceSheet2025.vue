<template>
    <div class="max-w-[1400px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-center w-full">资产负债表</h1>
            <div class="text-right text-sm">会企01表</div>
        </div>
        
        <div class="text-center mb-4">
            <div class="text-lg font-medium">编制单位：常州拓源电气集团有限公司</div>
            <div class="flex justify-between items-center mt-2">
                <div class="text-lg font-medium">2025/2/28</div>
                <div class="text-lg font-medium">单位：元</div>
            </div>
        </div>

        <!-- 添加期间输入 -->
        <div class="mb-4">
            <label class="block text-gray-700">期间：</label>
            <input type="month" v-model="period" class="w-full px-2 py-1 border rounded" />
        </div>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr>
                        <th class="border border-black px-2 py-1 text-center w-48">资产</th>
                        <th class="border border-black px-2 py-1 text-center w-32">当期</th>
                        <th class="border border-black px-2 py-1 text-center w-32">累计</th>
                        <th class="border border-black px-2 py-1 text-center w-48">负债及所有者权益</th>
                        <th class="border border-black px-2 py-1 text-center w-32">当期</th>
                        <th class="border border-black px-2 py-1 text-center w-32">累计</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 流动资产 -->
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">流动资产</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 font-bold">流动负债：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">货币资金</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.monetary_funds_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('monetary_funds_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">短期借款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.short_term_loans_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('short_term_loans_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">短期投资</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.short_term_investments_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('short_term_investments_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付票据</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.notes_payable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('notes_payable_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收票据</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.notes_receivable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('notes_receivable_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付账款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.accounts_payable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('accounts_payable_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收账款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.accounts_receivable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('accounts_receivable_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">预收账款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.advance_receipts_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('advance_receipts_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">减：坏账准备</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.bad_debt_provision_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('bad_debt_provision_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">其他应付款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.other_payables_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('other_payables_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收账款净额</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.accounts_receivable_net_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.accounts_receivable_net_ending" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付工资</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.payroll_payable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('payroll_payable_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">预付账款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.prepaid_accounts_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('prepaid_accounts_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">应付福利费</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.welfare_payable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('welfare_payable_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">应收补贴款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.subsidy_receivable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('subsidy_receivable_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">未交税金</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.taxes_payable_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('taxes_payable_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">其他应收款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.other_receivables_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('other_receivables_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">未付利润</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">存货</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.inventory_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('inventory_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">其他未交款</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-6">其中：原材料</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.raw_materials_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('raw_materials_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-6">库存商品</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.finished_goods_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('finished_goods_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-6">在产品</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.work_in_process_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('work_in_process_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">待摊费用</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">预提费用</td>
                        <td class="border border-black px-2 py-1 text-center">-</td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">待处理流动资产净损失</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">一年内到期的长期负债</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">一年内到期的长期债券投资</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">其他流动负债</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">其他流动资产</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 font-bold">流动负债合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.current_liabilities_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('current_liabilities_total_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">流动资产合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.current_assets_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('current_assets_total_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 font-bold">长期负债：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">长期投资</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.long_term_investments_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('long_term_investments_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">长期借款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.long_term_loans_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('long_term_loans_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">固定资产：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">长期应付款</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.long_term_payables_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('long_term_payables_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">固定资产原价</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.fixed_assets_original_cost_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('fixed_assets_original_cost_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">其他长期负债</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">减：累计折旧</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.accumulated_depreciation_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('accumulated_depreciation_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-6">其中：住房周转金</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">固定资产净值</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.fixed_assets_net_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('fixed_assets_net_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">固定资产清理</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 font-bold">长期负债合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.long_term_liabilities_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('long_term_liabilities_total_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">在建工程</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.construction_in_progress_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('construction_in_progress_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">递延税项：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">待处理固定资产净损失</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.pending_fixed_asset_losses_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('pending_fixed_asset_losses_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">递延税款贷项</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">固定资产合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.fixed_assets_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('fixed_assets_total_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">无形资产及递延资产：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 font-bold">负债合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.liabilities_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('liabilities_total_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">无形资产</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.intangible_assets_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('intangible_assets_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 font-bold">所有者权益</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">递延资产</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.deferred_assets_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('deferred_assets_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">实收资本</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.paid_in_capital_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('paid_in_capital_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">资本公积</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.capital_reserve_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('capital_reserve_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">无形及递延资产合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.intangible_deferred_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('intangible_deferred_total_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 pl-4">盈余公积</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.surplus_reserve_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('surplus_reserve_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">其他长期资产</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-6">其中：公益金</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.public_welfare_fund_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('public_welfare_fund_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">递延税项：</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">未分配利润</td>
                        <td class="border border-black px-2 py-1 text-right">
                            <input v-model="balanceSheetData.retained_earnings_beginning" type="number" class="w-full text-right border-0 p-0" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right bg-gray-50">
                            {{ getCumulativeValue('retained_earnings_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">递延税项借项</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 font-bold">所有者权益合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.owners_equity_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('owners_equity_total_ending').toLocaleString() }}
                        </td>
                    </tr>
                    

                    
                    <tr>
                        <td class="border border-black px-2 py-1 font-bold">资产总计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.assets_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('assets_total_ending').toLocaleString() }}
                        </td>
                        <td class="border border-black px-2 py-1 font-bold">负债和所有者权益合计</td>
                        <td class="border border-black px-2 py-1 text-right font-bold">
                            <input v-model="balanceSheetData.liabilities_and_equity_total_beginning" type="number" class="w-full text-right border-0 p-0 font-bold" step="0.01" />
                        </td>
                        <td class="border border-black px-2 py-1 text-right font-bold bg-gray-50">
                            {{ getCumulativeValue('liabilities_and_equity_total_ending').toLocaleString() }}
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">商品进销差价余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">长期投资减值准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">坏账准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">固定资产减值准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">存货跌价准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">无形资产减值准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                    
                    <tr>
                        <td class="border border-black px-2 py-1 pl-4">短期投资减值准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1 pl-4">在建工程减值准备余额</td>
                        <td class="border border-black px-2 py-1"></td>
                        <td class="border border-black px-2 py-1"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
            <button @click="handleSave" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
          
        </div>

        <!-- 附件和备注组件 -->
        <FormAttachmentAndRemarks
          :module-id="moduleId"
          :period="period"
          v-model:remarks="remarks"
          v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.TUOYUAN_BALANCE_SHEET
const remarks = ref('')
const suggestions = ref('')

// 资产负债表数据 - 初始化为空值
const balanceSheetData = reactive({
  // 流动资产
  monetary_funds_beginning: null,
  monetary_funds_ending: null,
  accounts_receivable_beginning: null,
  accounts_receivable_ending: null,
  accounts_receivable_net_beginning: null,
  accounts_receivable_net_ending: null,
  prepaid_accounts_beginning: null,
  prepaid_accounts_ending: null,
  other_receivables_beginning: null,
  other_receivables_ending: null,
  inventory_beginning: null,
  inventory_ending: null,
  raw_materials_beginning: null,
  raw_materials_ending: null,
  finished_goods_beginning: null,
  finished_goods_ending: null,
  current_assets_total_beginning: null,
  current_assets_total_ending: null,

  // 其他流动资产项目
  short_term_investments_beginning: null,
  short_term_investments_ending: null,
  notes_receivable_beginning: null,
  notes_receivable_ending: null,
  bad_debt_provision_beginning: null,
  bad_debt_provision_ending: null,
  subsidy_receivable_beginning: null,
  subsidy_receivable_ending: null,
  work_in_process_beginning: null,
  work_in_process_ending: null,
  prepaid_expenses_beginning: null,
  prepaid_expenses_ending: null,
  pending_current_asset_losses_beginning: null,
  pending_current_asset_losses_ending: null,
  long_term_bond_investments_due_within_year_beginning: null,
  long_term_bond_investments_due_within_year_ending: null,
  other_current_assets_beginning: null,
  other_current_assets_ending: null,

  // 资产总计
  assets_total_beginning: null,
  assets_total_ending: null,

  // 流动负债
  short_term_loans_beginning: null,
  short_term_loans_ending: null,
  notes_payable_beginning: null,
  notes_payable_ending: null,
  accounts_payable_beginning: null,
  accounts_payable_ending: null,
  advance_receipts_beginning: null,
  advance_receipts_ending: null,
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
  other_unpaid_amounts_beginning: null,
  other_unpaid_amounts_ending: null,
  accrued_expenses_beginning: null,
  accrued_expenses_ending: null,
  long_term_liabilities_due_within_year_beginning: null,
  long_term_liabilities_due_within_year_ending: null,
  other_current_liabilities_beginning: null,
  other_current_liabilities_ending: null,
  current_liabilities_total_beginning: null,
  current_liabilities_total_ending: null,

  // 负债合计
  liabilities_total_beginning: null,
  liabilities_total_ending: null,

  // 所有者权益
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

  // 负债和所有者权益合计
  liabilities_and_equity_total_beginning: null,
  liabilities_and_equity_total_ending: null,

  // 长期投资
  long_term_investments_beginning: null,
  long_term_investments_ending: null,

  // 固定资产
  fixed_assets_original_cost_beginning: null,
  fixed_assets_original_cost_ending: null,
  accumulated_depreciation_beginning: null,
  accumulated_depreciation_ending: null,
  fixed_assets_net_beginning: null,
  fixed_assets_net_ending: null,
  fixed_assets_total_beginning: null,
  fixed_assets_total_ending: null,

  // 无形资产及递延资产
  intangible_assets_beginning: null,
  intangible_assets_ending: null,
  deferred_assets_beginning: null,
  deferred_assets_ending: null,
  intangible_deferred_total_beginning: null,
  intangible_deferred_total_ending: null,

  // 长期负债
  long_term_loans_beginning: null,
  long_term_loans_ending: null,
  long_term_payables_beginning: null,
  long_term_payables_ending: null,
  other_long_term_liabilities_beginning: null,
  other_long_term_liabilities_ending: null,
  housing_revolving_fund_beginning: null,
  housing_revolving_fund_ending: null,
  long_term_liabilities_total_beginning: null,
  long_term_liabilities_total_ending: null,

  // 递延税项
  deferred_tax_liabilities_beginning: null,
  deferred_tax_liabilities_ending: null,
  deferred_tax_assets_beginning: null,
  deferred_tax_assets_ending: null,

  // 其他长期资产
  other_long_term_assets_beginning: null,
  other_long_term_assets_ending: null,
  construction_in_progress_beginning: null,
  construction_in_progress_ending: null,
  pending_fixed_asset_losses_beginning: null,
  pending_fixed_asset_losses_ending: null,
  fixed_asset_disposal_beginning: null,
  fixed_asset_disposal_ending: null,

  // 减值准备系列
  inventory_impairment_provision_beginning: null,
  inventory_impairment_provision_ending: null,
  short_term_investment_impairment_provision_beginning: null,
  short_term_investment_impairment_provision_ending: null,
  bad_debt_provision_series_beginning: null,
  bad_debt_provision_series_ending: null,
  commodity_price_difference_series_beginning: null,
  commodity_price_difference_series_ending: null,
  long_term_investment_impairment_provision_beginning: null,
  long_term_investment_impairment_provision_ending: null,
  fixed_asset_impairment_provision_beginning: null,
  fixed_asset_impairment_provision_ending: null,
  intangible_asset_impairment_provision_beginning: null,
  intangible_asset_impairment_provision_ending: null,
  construction_impairment_provision_beginning: null,
  construction_impairment_provision_ending: null,
})

// 历史期间数据存储 - 用于累计计算
const historicalData = ref<{[period: string]: {[field: string]: number}}>({})

// 从后端加载历史期间数据
const loadHistoricalData = async () => {
  try {
    // 获取当前年份的所有期间数据
    const currentYear = new Date().getFullYear()
    const periods = []
    for (let month = 1; month <= 12; month++) {
      periods.push(`${currentYear}-${month.toString().padStart(2, '0')}`)
    }
    
    for (const periodStr of periods) {
      // 只加载当前期间之前的数据用于累计计算
      if (periodStr < period.value) {
        try {
          const response = await fetch(`http://127.0.0.1:3000/forms/submission/${moduleId}/${periodStr}`)
          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data && result.data.submission_data) {
              const savedData = typeof result.data.submission_data === 'string' 
                ? JSON.parse(result.data.submission_data) 
                : result.data.submission_data
              
              if (savedData.data && typeof savedData.data === 'string') {
                historicalData.value[periodStr] = JSON.parse(savedData.data)
              } else if (savedData.data && typeof savedData.data === 'object') {
                historicalData.value[periodStr] = savedData.data
              }
            }
          }
        } catch (error) {
          console.log(`加载期间 ${periodStr} 数据失败:`, error)
        }
      }
    }
  } catch (error) {
    console.error('加载历史数据失败:', error)
  }
}

// 计算累计值的函数（从年初到当前期间的所有当期数据之和）
const getCumulativeValue = (fieldName: string): number => {
  const beginningField = fieldName.replace('_ending', '_beginning')
  let cumulative = 0
  
  // 累加历史期间的数据（包括当前期间之前的所有数据）
  Object.keys(historicalData.value).forEach(periodKey => {
    if (periodKey < period.value) { // 只统计当前期间之前的历史数据
      const periodData = historicalData.value[periodKey]
      if (periodData && periodData[beginningField]) {
        cumulative += Number(periodData[beginningField])
      }
    }
  })
  
  // 加上当前期间的数据（如果有的话）
  const currentValue = (balanceSheetData as any)[beginningField]
  if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
    cumulative += Number(currentValue)
  }
  
  return cumulative
}

// 保存功能
const handleSave = async () => {
  try {
    const dataToSave = {
      period: period.value,
      company: 'changzhou_tuoyuan',
      data: JSON.stringify(balanceSheetData)
    }

    // 这里可以调用API保存数据
    console.log('保存数据:', dataToSave)
    
    // 记录表单提交
    await recordFormSubmission(moduleId, period.value, dataToSave, remarks.value, suggestions.value)
    
    alert('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败')
  }
}

// 重置功能
const handleReset = () => {
  Object.keys(balanceSheetData).forEach(key => {
    (balanceSheetData as any)[key] = null
  })
}

// 导出功能
const handleExport = () => {
  // 可以实现导出到Excel的功能
  console.log('导出数据')
}

// 清空当期数据（保持累计计算不受影响）
const clearCurrentData = () => {
  Object.keys(balanceSheetData).forEach(key => {
    if (key.includes('_beginning')) {
      (balanceSheetData as any)[key] = null
    }
  })
}

// 加载保存的数据
const loadSavedData = async () => {
  // 首先清空当期数据
  clearCurrentData()
  
  try {
    const response = await fetch(`http://127.0.0.1:3000/forms/submission/${moduleId}/${period.value}`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data && result.data.submission_data) {
        // 解析保存的数据
        const savedData = typeof result.data.submission_data === 'string' 
          ? JSON.parse(result.data.submission_data) 
          : result.data.submission_data
        
        // 将保存的数据赋值给表单
        if (savedData.data && typeof savedData.data === 'string') {
          const formData = JSON.parse(savedData.data)
          Object.keys(formData).forEach(key => {
            if (key in balanceSheetData) {
              (balanceSheetData as any)[key] = formData[key]
            }
          })
        } else if (savedData.data && typeof savedData.data === 'object') {
          Object.keys(savedData.data).forEach(key => {
            if (key in balanceSheetData) {
              (balanceSheetData as any)[key] = savedData.data[key]
            }
          })
        }
        
        console.log('数据加载成功:', savedData)
      } else {
        console.log('当前期间没有保存的数据，显示空值')
      }
    } else {
      console.log('请求失败，显示空值')
    }
  } catch (error) {
    console.log('没有找到保存的数据或加载失败，显示空值:', error)
  }
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
  if (newPeriod) {
    period.value = newPeriod.toString()
    await loadSavedData()
    await loadRemarksData()
  }
}, { immediate: true })

// 监听期间变化
watch(period, async () => {
  console.log('期间变化为:', period.value)
  await loadHistoricalData() // 重新加载历史数据
  await loadSavedData()
  await loadRemarksData()
})

onMounted(async () => {
  console.log('常州拓源资产负债表组件挂载，当前期间:', period.value)
  await loadHistoricalData() // 加载历史数据用于累计计算
  await loadSavedData()  // 先加载保存的数据
  await loadRemarksData() // 再加载备注和建议
})
</script>

<style scoped>
input[type="number"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

table {
  font-size: 12px;
}

td input {
  font-size: 12px;
  background: transparent;
}

.font-bold input {
  font-weight: bold;
}
</style> 