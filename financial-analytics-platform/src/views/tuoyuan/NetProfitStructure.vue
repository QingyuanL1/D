<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">净利润结构与质量（单位：万元）</h1>
            <div class="text-gray-500">(按年度计划口径分解)</div>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">序号</th>
                        <th class="border border-gray-300 px-4 py-2">财务科目</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 主营业务 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-center">1</td>
                        <td class="border border-gray-300 px-4 py-2">主营业务净利润</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.plan" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.current" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.progress" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                    </tr>

                    <!-- 非主营业务 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-center">2</td>
                        <td class="border border-gray-300 px-4 py-2">非主营业务</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.plan" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.current" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.progress" type="text"
                                class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.plan" type="text"
                                class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.current" type="text"
                                class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.cumulative" type="text"
                                class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.progress" type="text"
                                class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 主营业务净利润贡献情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">主营业务利润总额贡献情况（单位：万元）</h2>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">序号</th>
                            <th class="border border-gray-300 px-4 py-2">客户名称</th>
                            <th class="border border-gray-300 px-4 py-2">营业收入</th>
                            <th class="border border-gray-300 px-4 py-2">直接成本</th>
                            <th class="border border-gray-300 px-4 py-2">间接成本</th>
                            <th class="border border-gray-300 px-4 py-2">利润总额</th>
                            <th class="border border-gray-300 px-4 py-2">利润率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in mainBusinessData" :key="index">
                            <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerName }}</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.totalIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulativeMaterialCost) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulativeLaborCost) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right"
                                :class="item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatNumber(item.netProfit) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right"
                                :class="item.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatPercentage(item.netProfitMargin) }}%
                            </td>
                        </tr>
                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.totalIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.totalDirectCosts) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.totalCenterCosts) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right"
                                :class="mainBusinessTotalData.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatNumber(mainBusinessTotalData.totalNetProfit) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right"
                                :class="mainBusinessTotalData.overallNetProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatPercentage(mainBusinessTotalData.overallNetProfitMargin) }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 成本中心费用明细 -->
        <div class="mt-8" v-if="centerCosts">
            <h3 class="text-lg font-bold mb-4">成本中心费用明细（单位：万元）</h3>
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div class="text-red-800 font-medium">营销费用</div>
                    <div class="text-red-600 text-2xl font-bold">{{ formatNumber(centerCosts.totalMarketingCost) }}
                    </div>
                </div>
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div class="text-orange-800 font-medium">管理费用</div>
                    <div class="text-orange-600 text-2xl font-bold">{{ formatNumber(centerCosts.totalManagementCost) }}
                    </div>
                </div>
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div class="text-purple-800 font-medium">财务费用</div>
                    <div class="text-purple-600 text-2xl font-bold">{{ formatNumber(centerCosts.totalFinanceCost) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks :module-id="MODULE_IDS.TUOYUAN_NET_PROFIT_STRUCTURE" :period="period"
            v-model:remarks="remarks" v-model:suggestions="suggestions" />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface ProfitItem {
    plan: string;
    current: string;
    cumulative: string;
    progress: string;
}

interface MainBusinessItem {
    customerName: string;
    totalIncome: number;
    cumulativeMaterialCost: number;
    cumulativeLaborCost: number;
    marketingCost: number;
    managementCost: number;
    financeCost: number;
    netProfit: number;
    netProfitMargin: number;
}

interface CenterCosts {
    totalMarketingCost: number;
    totalManagementCost: number;
    totalFinanceCost: number;
}

// 初始化数据模板
const getInitialData = () => ({
    mainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    nonMainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    total: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' }
})

// 响应式数据
const data = reactive<{
    mainBusiness: ProfitItem;
    nonMainBusiness: ProfitItem;
    total: ProfitItem;
}>(getInitialData())

const mainBusinessData = ref<MainBusinessItem[]>([])
const centerCosts = ref<CenterCosts | null>(null)

// 计算汇总数据
const mainBusinessTotalData = computed(() => {
    const totals = mainBusinessData.value.reduce((acc, item) => {
        acc.totalIncome += item.totalIncome
        acc.totalDirectCosts += item.cumulativeMaterialCost + item.cumulativeLaborCost
        acc.totalCenterCosts += item.marketingCost + item.managementCost + item.financeCost
        acc.totalNetProfit += item.netProfit
        return acc
    }, { totalIncome: 0, totalDirectCosts: 0, totalCenterCosts: 0, totalNetProfit: 0 })

    const overallNetProfitMargin = totals.totalIncome > 0 ? (totals.totalNetProfit / totals.totalIncome * 100) : 0

    return {
        ...totals,
        overallNetProfitMargin
    }
})

// 格式化数字
const formatNumber = (value: number): string => {
    return value.toFixed(2)
}

// 格式化百分比
const formatPercentage = (value: number): string => {
    return value.toFixed(2)
}

// 加载净利润数据
const loadNetProfitData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-net-profit/calculate/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                // 更新主营业务数据
                mainBusinessData.value = result.data.customers || []

                // 更新成本中心费用
                centerCosts.value = result.data.centerCosts || null

                // 获取原始净利润数据
                const totals = result.data.totals || {}
                let adjustedCurrentProfit = parseFloat(totals.totalNetProfit?.toFixed(2) || '0')
                let adjustedCumulativeProfit = parseFloat(totals.totalNetProfit?.toFixed(2) || '0')

                // 获取拓源利润表数据，扣减营业税金及附加和所得税
                try {
                    const incomeStatementResponse = await fetch(`http://47.111.95.19:3000/changzhou-tuoyuan-income-statement/${targetPeriod}`)
                    if (incomeStatementResponse.ok) {
                        const incomeStatementResult = await incomeStatementResponse.json()
                        if (incomeStatementResult.success && incomeStatementResult.data) {
                            // 使用拓源利润表的正确字段名：main_business_taxes 和 income_tax
                            const taxesAndSurcharges = parseFloat(incomeStatementResult.data.main_business_taxes?.current_amount) || 0
                            const incomeTaxExpense = parseFloat(incomeStatementResult.data.income_tax?.current_amount) || 0

                            console.log(`拓源营业税金及附加当期值: ${taxesAndSurcharges}`)
                            console.log(`拓源所得税当期值: ${incomeTaxExpense}`)
                            console.log(`拓源主营业务净利润(扣减前): ${adjustedCurrentProfit}`)

                            // 从主营业务净利润中减去营业税金及附加和所得税
                            adjustedCurrentProfit = adjustedCurrentProfit - taxesAndSurcharges - incomeTaxExpense
                            adjustedCumulativeProfit = adjustedCumulativeProfit - taxesAndSurcharges - incomeTaxExpense

                            console.log(`拓源主营业务净利润(扣减后): ${adjustedCurrentProfit}`)
                        }
                    }
                } catch (incomeStatementError) {
                    console.error('获取拓源利润表数据失败:', incomeStatementError)
                }

                // 更新汇总数据（使用调整后的值）
                data.mainBusiness.current = adjustedCurrentProfit.toFixed(2)
                data.mainBusiness.cumulative = adjustedCumulativeProfit.toFixed(2)

                // 非主营业务暂时为0
                data.nonMainBusiness.current = '0'
                data.nonMainBusiness.cumulative = '0'

                // 总计
                data.total.current = data.mainBusiness.current
                data.total.cumulative = data.mainBusiness.cumulative

                console.log('拓源净利润数据加载成功:', result.data)
            }
        }
    } catch (error) {
        console.error('加载拓源净利润数据失败:', error)
    }
}



// 监听期间变化
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadNetProfitData(newPeriod)
        loadRemarksData()
    }
})

const handleSave = async () => {
    try {
        const formData = {
            mainBusiness: data.mainBusiness,
            nonMainBusiness: data.nonMainBusiness,
            total: data.total,
            mainBusinessData: mainBusinessData.value,
            centerCosts: centerCosts.value
        }

        // 记录提交状态
        await recordFormSubmission(MODULE_IDS.TUOYUAN_NET_PROFIT_STRUCTURE, period.value, formData, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    const initialData = getInitialData()
    data.mainBusiness = { ...initialData.mainBusiness }
    data.nonMainBusiness = { ...initialData.nonMainBusiness }
    data.total = { ...initialData.total }

    mainBusinessData.value = []
    centerCosts.value = null

    remarks.value = ''
    suggestions.value = ''
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.TUOYUAN_NET_PROFIT_STRUCTURE, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(async () => {
    await loadNetProfitData(period.value)
    loadRemarksData()
})
</script>

<style scoped>
.overflow-x-auto::-webkit-scrollbar {
    height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
