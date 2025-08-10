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
                        <td class="border border-gray-300 px-4 py-2">主营业务</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.current" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.cumulative" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.mainBusiness.progress" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                    </tr>

                    <!-- 非主营业务 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 text-center">2</td>
                        <td class="border border-gray-300 px-4 py-2">非主营业务</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.current" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.cumulative" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.nonMainBusiness.progress" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.plan" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.current" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.cumulative" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="data.total.progress" type="text" class="w-full px-2 py-1 border rounded font-bold bg-gray-100" readonly />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 主营业务净利润贡献情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">主营业务净利润贡献情况（单位：万元）</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">板块</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">年度计划</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">当月值</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">累计值</th>
                            <th class="border border-gray-300 px-4 py-2" rowspan="2">分类贡献占比</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- 工程板块 -->
                        <template v-for="(item, index) in mainBusinessData" :key="`main-${index}`">
                            <tr>
                                <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="mainBusinessData.length">
                                    工程
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerName }}</td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.yearlyPlan) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="font-medium">{{ formatNumber(item.currentPeriod) }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="font-medium">{{ formatNumber(item.cumulative) }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatPercentage(item.annualRatio) }}%
                                </td>
                            </tr>
                        </template>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.currentPeriod) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(mainBusinessTotalData.cumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                100.00%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 非主营业务净利润贡献情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">非主营业务净利润贡献情况（单位：万元）</h2>
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
                        <tr v-for="(item, index) in nonMainBusinessData" :key="index">
                            <td class="border border-gray-300 px-4 py-2 text-center">{{ index + 1 }}</td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.financialSubject }}</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.annualPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.current) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(item.executionProgress) }}%
                            </td>
                        </tr>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(nonMainBusinessTotalData.annualPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(nonMainBusinessTotalData.current) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(nonMainBusinessTotalData.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(nonMainBusinessTotalData.executionProgress) }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_NET_PROFIT_STRUCTURE"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

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
    yearlyPlan: number;
    currentPeriod: number;
    cumulative: number;
    annualRatio: number;
}

interface NonMainBusinessItem {
    financialSubject: string;
    annualPlan: number;
    current: number;
    accumulated: number;
    executionProgress: number;
}

// 初始化数据模板
const getInitialData = () => ({
    mainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    nonMainBusiness: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' },
    total: { plan: '0', current: '0', cumulative: '0', progress: '0.00%' }
})

// 主营业务数据
const getInitialMainBusinessData = (): MainBusinessItem[] => [
    { customerName: '一包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '二包项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '域内合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '域外合作项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '新能源项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '苏州项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '抢修项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '运检项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 },
    { customerName: '自建项目', yearlyPlan: 0, currentPeriod: 0, cumulative: 0, annualRatio: 0 }
]

// 非主营业务数据
const getInitialNonMainBusinessData = (): NonMainBusinessItem[] => [
    { financialSubject: '处置固废收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '车辆租金收入', annualPlan: 30.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '利息收入', annualPlan: 0.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '设备外服收入', annualPlan: 11.78, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '政府补贴收入', annualPlan: 50.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '派遣补贴收入', annualPlan: 20.71, current: 0, accumulated: 0, executionProgress: 0 }
]

// 响应式数据
const data = reactive<{
    mainBusiness: ProfitItem;
    nonMainBusiness: ProfitItem;
    total: ProfitItem;
}>(getInitialData())

const mainBusinessData = ref<MainBusinessItem[]>(getInitialMainBusinessData())
const nonMainBusinessData = ref<NonMainBusinessItem[]>(getInitialNonMainBusinessData())

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化百分比显示
const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算主营业务合计数据
const mainBusinessTotalData = computed(() => {
    let totalYearlyPlan = 0
    let totalCurrentPeriod = 0
    let totalCumulative = 0

    mainBusinessData.value.forEach(item => {
        totalYearlyPlan += item.yearlyPlan || 0
        totalCurrentPeriod += item.currentPeriod || 0
        totalCumulative += item.cumulative || 0
    })

    return {
        yearlyPlan: totalYearlyPlan,
        currentPeriod: totalCurrentPeriod,
        cumulative: totalCumulative
    }
})

// 计算非主营业务合计数据
const nonMainBusinessTotalData = computed(() => {
    let totalAnnualPlan = 0
    let totalCurrent = 0
    let totalAccumulated = 0

    nonMainBusinessData.value.forEach(item => {
        totalAnnualPlan += item.annualPlan || 0
        totalCurrent += item.current || 0
        totalAccumulated += item.accumulated || 0
    })

    const executionProgress = totalAnnualPlan > 0 ? (totalAccumulated / totalAnnualPlan * 100) : 0

    return {
        annualPlan: totalAnnualPlan,
        current: totalCurrent,
        accumulated: totalAccumulated,
        executionProgress: executionProgress
    }
})

// 加载主营业务数据
const loadMainBusinessData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-main-business-net-profit/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.data && result.data.customers) {
                // 合并数据
                mainBusinessData.value = getInitialMainBusinessData().map(item => {
                    const dbItem = result.data.customers.find((c: any) => c.customerName === item.customerName)
                    return {
                        customerName: item.customerName,
                        yearlyPlan: dbItem ? (dbItem.yearlyPlan || 0) : 0,
                        currentPeriod: dbItem ? (dbItem.currentPeriod || 0) : 0,
                        cumulative: dbItem ? (dbItem.cumulative || 0) : 0,
                        annualRatio: dbItem ? (dbItem.annualRatio || 0) : 0
                    }
                })
            }
        }
    } catch (error) {
        console.error('加载主营业务数据失败:', error)
    }
}

// 加载非主营业务数据
const loadNonMainBusinessData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-non-main-business-net-profit/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.data && result.data.items) {
                // 合并数据
                nonMainBusinessData.value = getInitialNonMainBusinessData().map(item => {
                    const dbItem = result.data.items.find((i: any) => i.financialSubject === item.financialSubject)
                    return {
                        financialSubject: item.financialSubject,
                        annualPlan: dbItem ? (dbItem.annualPlan || item.annualPlan) : item.annualPlan,
                        current: dbItem ? (dbItem.current || 0) : 0,
                        accumulated: dbItem ? (dbItem.accumulated || 0) : 0,
                        executionProgress: dbItem ? (dbItem.executionProgress || 0) : 0
                    }
                })
            }
        }
    } catch (error) {
        console.error('加载非主营业务数据失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        // 加载净利润结构数据
        const response = await fetch(`http://47.111.95.19:3000/nanhua-net-profit-structure/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                data.mainBusiness = {
                    plan: result.data.mainBusiness?.plan || '0',
                    current: result.data.mainBusiness?.current || '0',
                    cumulative: result.data.mainBusiness?.cumulative || '0',
                    progress: result.data.mainBusiness?.progress || '0.00%'
                }
                data.nonMainBusiness = {
                    plan: result.data.nonMainBusiness?.plan || '0',
                    current: result.data.nonMainBusiness?.current || '0',
                    cumulative: result.data.nonMainBusiness?.cumulative || '0',
                    progress: result.data.nonMainBusiness?.progress || '0.00%'
                }
                data.total = {
                    plan: result.data.total?.plan || '0',
                    current: result.data.total?.current || '0',
                    cumulative: result.data.total?.cumulative || '0',
                    progress: result.data.total?.progress || '0.00%'
                }
            }
        }

        // 加载主营业务和非主营业务详细数据
        await Promise.all([
            loadMainBusinessData(targetPeriod),
            loadNonMainBusinessData(targetPeriod)
        ])

        // 根据加载的数据更新汇总
        updateSummaryData()

    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 更新汇总数据
const updateSummaryData = () => {
    // 更新主营业务汇总
    const mainTotal = mainBusinessTotalData.value
    data.mainBusiness.current = mainTotal.currentPeriod.toFixed(2)
    data.mainBusiness.cumulative = mainTotal.cumulative.toFixed(2)
    
    // 更新非主营业务汇总
    const nonMainTotal = nonMainBusinessTotalData.value
    data.nonMainBusiness.current = nonMainTotal.current.toFixed(2)
    data.nonMainBusiness.cumulative = nonMainTotal.accumulated.toFixed(2)
    
    // 更新总计
    const totalPlan = parseFloat(data.mainBusiness.plan) + parseFloat(data.nonMainBusiness.plan)
    const totalCurrent = parseFloat(data.mainBusiness.current) + parseFloat(data.nonMainBusiness.current)
    const totalCumulative = parseFloat(data.mainBusiness.cumulative) + parseFloat(data.nonMainBusiness.cumulative)
    
    data.total.plan = totalPlan.toFixed(2)
    data.total.current = totalCurrent.toFixed(2)
    data.total.cumulative = totalCumulative.toFixed(2)
    data.total.progress = totalPlan > 0 ? ((totalCumulative / totalPlan) * 100).toFixed(2) + '%' : '0.00%'
}

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        await loadData(newPeriod.toString())
        loadRemarksData()
    }
})

// 监听期间变化
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        loadRemarksData()
    }
})

const handleSave = async () => {
    try {
        const formData = {
            mainBusiness: data.mainBusiness,
            nonMainBusiness: data.nonMainBusiness,
            total: data.total
        }

        const response = await fetch('http://47.111.95.19:3000/nanhua-net-profit-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: formData
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态
        await recordFormSubmission(MODULE_IDS.NANHUA_NET_PROFIT_STRUCTURE, period.value, formData, remarks.value, suggestions.value)

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
    
    mainBusinessData.value = getInitialMainBusinessData()
    nonMainBusinessData.value = getInitialNonMainBusinessData()
    
    remarks.value = ''
    suggestions.value = ''
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.NANHUA_NET_PROFIT_STRUCTURE, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(async () => {
    await loadData(period.value)
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