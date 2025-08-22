<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务边际贡献率结构与质量</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：%）</span>
                <span class="text-xs text-gray-500">偏差=当期实际-年度计划</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-24">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-28">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2 w-28">当期实际</th>
                        <th class="border border-gray-300 px-4 py-2 w-28">偏差</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in contributionRateData.items" :key="`contribution-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" :rowspan="getSegmentRowspan(item.segmentAttribute)"
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(item.yearlyPlan) }}%
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">
                                    {{ formatPercentage(item.currentActual) }}%
                                </span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium"
                                    :class="item.deviation >= 0 ? 'text-green-600' : 'text-red-600'">
                                    {{ formatPercentage(item.deviation) }}%
                                </span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(totalData.yearlyPlan) }}%
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(totalData.currentActual) }}%
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold"
                                :class="totalData.deviation >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatPercentage(totalData.deviation) }}%
                            </span>
                        </td>
                    </tr>

                    <!-- 加权平均行 -->
                    <tr class="bg-blue-50 font-bold text-blue-800" v-if="weightedData">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">
                            加权平均
                            <span class="text-xs text-gray-600 block">(按收入加权)</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right text-gray-500">-</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(weightedData.weightedContributionRate) }}%
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right text-xs">
                            <div>收入: {{ formatNumber(weightedData.totalIncome) }}</div>
                            <div>成本: {{ formatNumber(weightedData.totalCost) }}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks :module-id="MODULE_IDS.TUOYUAN_MAIN_BUSINESS_CONTRIBUTION_RATE" :period="period"
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface ContributionRateItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearlyPlan: number;
    currentActual: number;
    deviation: number;
}

interface ContributionRateData {
    items: ContributionRateItem[];
}

const fixedPlanData: ContributionRateData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlan: 15.47, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 6.00, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 26.67, currentActual: 0, deviation: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearlyPlan: 0, currentActual: 0, deviation: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearlyPlan: 100.00, currentActual: 0, deviation: 0 }
    ]
}

const contributionRateData = ref<ContributionRateData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

// 添加合计和加权数据
const totalData = ref({
    yearlyPlan: 0,
    currentActual: 0,
    deviation: 0,
    simpleAverage: 0
})

const weightedData = ref({
    totalIncome: 0,
    totalCost: 0,
    weightedContributionRate: 0,
    marginContribution: 0
})

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return contributionRateData.value.items[index].segmentAttribute !== contributionRateData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return contributionRateData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算偏差
const calculateDeviation = () => {
    contributionRateData.value.items.forEach(item => {
        item.deviation = (item.currentActual || 0) - (item.yearlyPlan || 0)
    })
}

// 在数据加载后计算偏差（不需要监听变化）

// 计算合计数据
const calculateTotalData = () => {
    totalData.value = {
        yearlyPlan: 0,
        currentActual: 0,
        deviation: 0,
        simpleAverage: 0
    }

    contributionRateData.value.items.forEach(item => {
        totalData.value.yearlyPlan += item.yearlyPlan || 0
        totalData.value.currentActual += item.currentActual || 0
    })

    totalData.value.deviation = totalData.value.currentActual - totalData.value.yearlyPlan

    // 计算简单平均
    totalData.value.simpleAverage = totalData.value.yearlyPlan / contributionRateData.value.items.length
}



// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-contribution-rate/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，尝试自动计算...`)

            // 尝试自动计算
            try {
                const calculateResponse = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-contribution-rate/calculate/${targetPeriod}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (calculateResponse.ok) {
                    const calculateResult = await calculateResponse.json()
                    if (calculateResult.success && calculateResult.data && calculateResult.data.items) {
                        contributionRateData.value.items = calculateResult.data.items.map((item: any) => ({
                            segmentAttribute: item.segmentAttribute,
                            customerAttribute: item.customerAttribute,
                            yearlyPlan: Number(item.yearlyPlan) || 0,
                            currentActual: Number(item.currentActual) || 0,
                            deviation: Number(item.deviation) || 0
                        }))

                        // 处理合计和加权数据
                        if (calculateResult.data.summary) {
                            const summary = calculateResult.data.summary
                            weightedData.value = {
                                totalIncome: Number(summary.totalIncome) || 0,
                                totalCost: Number(summary.totalCost) || 0,
                                weightedContributionRate: Number(summary.weightedContributionRate) || 0,
                                marginContribution: Number(summary.totalIncome - summary.totalCost) || 0
                            }
                        }

                        // 计算合计数据
                        calculateTotalData()

                        console.log('自动计算成功，数据已加载')
                        return
                    }
                }
            } catch (calcError) {
                console.log('自动计算失败，使用默认数据:', calcError)
            }

            // 如果自动计算失败，重置为默认数据
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            contributionRateData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearlyPlan: Number(item.yearlyPlan) || 0,
                currentActual: Number(item.currentActual) || 0,
                deviation: Number(item.deviation) || 0
            }))

            // 使用后端返回的真实合计数据
            if (result.data.total) {
                totalData.value = {
                    yearlyPlan: Number(result.data.total.yearlyPlan) || 0,
                    currentActual: Number(result.data.total.currentActual) || 0,
                    deviation: Number(result.data.total.deviation) || 0,
                    simpleAverage: Number(result.data.total.simpleAverage) || 0
                }
            }

            // 使用后端返回的真实加权数据
            if (result.data.weighted) {
                weightedData.value = {
                    totalIncome: Number(result.data.weighted.totalIncome) || 0,
                    totalCost: Number(result.data.weighted.totalCost) || 0,
                    weightedContributionRate: Number(result.data.weighted.weightedContributionRate) || 0,
                    marginContribution: Number(result.data.weighted.marginContribution) || 0
                }
            }
        }

        // 重新计算偏差
        calculateDeviation()
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    contributionRateData.value = JSON.parse(JSON.stringify(fixedPlanData))
    calculateDeviation()
    calculateTotalData()
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.TUOYUAN_MAIN_BUSINESS_CONTRIBUTION_RATE}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                remarks.value = result.data.remarks || ''
                suggestions.value = result.data.suggestions || ''
            }
        }
    } catch (error) {
        console.error('加载备注失败:', error)
    }
}

watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        resetToDefaultData()
        await loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/tuoyuan-main-business-contribution-rate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: contributionRateData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_MAIN_BUSINESS_CONTRIBUTION_RATE, period.value, { items: contributionRateData.value.items }, remarks.value, suggestions.value)
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    resetToDefaultData()
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    resetToDefaultData()
    const targetPeriod = route.query.period?.toString() || period.value
    await loadData(targetPeriod)
    loadRemarksAndSuggestions(targetPeriod)
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