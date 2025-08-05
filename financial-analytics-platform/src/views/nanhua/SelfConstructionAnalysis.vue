<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务产值——自行施工情况分析</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（可修订）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">公司设计产能</th>
                        <th class="border border-gray-300 px-4 py-2">年度产能计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期产能累计</th>
                        <th class="border border-gray-300 px-4 py-2">计划执行进度</th>
                        <th class="border border-gray-300 px-4 py-2">产能利用率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程板块项目 -->
                    <template v-for="(item, index) in analysisData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="analysisData.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.companyDesignCapacity" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.annualCapacityPlan" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentPeriodCapacityAccumulated" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.planExecutionProgress) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.capacityUtilizationRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.companyDesignCapacity) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualCapacityPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodCapacityAccumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.planExecutionProgress) }}%</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.capacityUtilizationRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_SELF_CONSTRUCTION_ANALYSIS"
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface AnalysisItem {
    customerAttribute: string;
    companyDesignCapacity: number;
    annualCapacityPlan: number;
    currentPeriodCapacityAccumulated: number;
    planExecutionProgress: number;
    capacityUtilizationRate: number;
}

interface AnalysisData {
    items: AnalysisItem[];
}

const fixedPlanData: AnalysisData = {
    items: [
        { customerAttribute: '一包项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 18.35, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '二包项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 26.85, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '域内合作项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '域外合作项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '新能源项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 48.62, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '苏州项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 0, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '抢修项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 7.80, planExecutionProgress: 0, capacityUtilizationRate: 0 },
        { customerAttribute: '运检项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentPeriodCapacityAccumulated: 44.61, planExecutionProgress: 0, capacityUtilizationRate: 0 }
    ]
}

const analysisData = ref<AnalysisData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 监听数据变化，自动计算进度和利用率
watch(() => analysisData.value.items, (newItems) => {
    newItems.forEach(item => {
        // 计算计划执行进度 = (当期产能累计 / 年度产能计划) × 100%
        item.planExecutionProgress = item.annualCapacityPlan > 0 ? (item.currentPeriodCapacityAccumulated / item.annualCapacityPlan) * 100 : 0
        
        // 计算产能利用率 = (当期产能累计 / 公司设计产能) × 100%
        item.capacityUtilizationRate = item.companyDesignCapacity > 0 ? (item.currentPeriodCapacityAccumulated / item.companyDesignCapacity) * 100 : 0
    })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        companyDesignCapacity: 0,
        annualCapacityPlan: 0,
        currentPeriodCapacityAccumulated: 0,
        planExecutionProgress: 0,
        capacityUtilizationRate: 0
    }
    
    analysisData.value.items.forEach(item => {
        total.companyDesignCapacity += item.companyDesignCapacity || 0
        total.annualCapacityPlan += item.annualCapacityPlan || 0
        total.currentPeriodCapacityAccumulated += item.currentPeriodCapacityAccumulated || 0
    })
    
    // 计算总计划执行进度
    total.planExecutionProgress = total.annualCapacityPlan > 0 ? (total.currentPeriodCapacityAccumulated / total.annualCapacityPlan) * 100 : 0
    
    // 计算总产能利用率
    total.capacityUtilizationRate = total.companyDesignCapacity > 0 ? (total.currentPeriodCapacityAccumulated / total.companyDesignCapacity) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-self-construction-analysis/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            analysisData.value.items = result.data.items.map((item: any) => ({
                customerAttribute: item.customerAttribute,
                companyDesignCapacity: Number(item.companyDesignCapacity) || 0,
                annualCapacityPlan: Number(item.annualCapacityPlan) || 0,
                currentPeriodCapacityAccumulated: Number(item.currentPeriodCapacityAccumulated) || 0,
                planExecutionProgress: Number(item.planExecutionProgress) || 0,
                capacityUtilizationRate: Number(item.capacityUtilizationRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    analysisData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_SELF_CONSTRUCTION_ANALYSIS}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/nanhua-self-construction-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: analysisData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_SELF_CONSTRUCTION_ANALYSIS, period.value, analysisData.value, remarks.value, suggestions.value)
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