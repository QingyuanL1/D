<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">施工执行情况</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-20">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-28">年度计划产值</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">自制/自行施工</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">半自制/分包</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">外发/转包</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in constructionExecutionData.items" :key="`execution-${index}`">
                        <tr>
                            <td v-if="item.segmentAttribute && isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td v-else-if="!item.segmentAttribute" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.customerAttribute }}
                            </td>
                            <td v-if="item.segmentAttribute" class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.yearlyPlanProductionValue" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.selfConstruction" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.semiSelfSubcontract" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.outsourceTransfer" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                        </tr>
                    </template>

                    <!-- 合计产值行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计产值</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalProductionValue.yearlyPlanProductionValue) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalProductionValue.selfConstruction) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalProductionValue.semiSelfSubcontract) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalProductionValue.outsourceTransfer) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_CONSTRUCTION_EXECUTION_STATUS"
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

interface ConstructionExecutionItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearlyPlanProductionValue: number;
    selfConstruction: number;
    semiSelfSubcontract: number;
    outsourceTransfer: number;
    selfConstructionPercentage: number;
}

interface ConstructionExecutionData {
    items: ConstructionExecutionItem[];
}

const fixedPlanData: ConstructionExecutionData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理工程', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设计', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 },
        { segmentAttribute: '', customerAttribute: '自行施工率%', yearlyPlanProductionValue: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourceTransfer: 0, selfConstructionPercentage: 0 }
    ]
}

const constructionExecutionData = ref<ConstructionExecutionData>(JSON.parse(JSON.stringify(fixedPlanData)))
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

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    const currentItem = constructionExecutionData.value.items[index]
    const prevItem = constructionExecutionData.value.items[index - 1]
    return currentItem.segmentAttribute !== prevItem.segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return constructionExecutionData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算合计产值（排除自行施工率%行）
const totalProductionValue = computed(() => {
    const total = {
        yearlyPlanProductionValue: 0,
        selfConstruction: 0,
        semiSelfSubcontract: 0,
        outsourceTransfer: 0
    }
    
    constructionExecutionData.value.items.forEach(item => {
        if (item.customerAttribute !== '自行施工率%') {
            total.yearlyPlanProductionValue += item.yearlyPlanProductionValue || 0
            total.selfConstruction += item.selfConstruction || 0
            total.semiSelfSubcontract += item.semiSelfSubcontract || 0
            total.outsourceTransfer += item.outsourceTransfer || 0
        }
    })
    
    return total
})

// 自动计算自行施工率%
watch(constructionExecutionData, () => {
    const selfConstructionRateItem = constructionExecutionData.value.items.find(item => item.customerAttribute === '自行施工率%')
    if (selfConstructionRateItem) {
        const totalValue = totalProductionValue.value.yearlyPlanProductionValue
        if (totalValue > 0) {
            selfConstructionRateItem.selfConstruction = (totalProductionValue.value.selfConstruction / totalValue) * 100
            selfConstructionRateItem.semiSelfSubcontract = (totalProductionValue.value.semiSelfSubcontract / totalValue) * 100
            selfConstructionRateItem.outsourceTransfer = (totalProductionValue.value.outsourceTransfer / totalValue) * 100
        }
    }
}, { deep: true })

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-construction-execution-status/${targetPeriod}`)
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
            constructionExecutionData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearlyPlanProductionValue: Number(item.yearlyPlanProductionValue) || 0,
                selfConstruction: Number(item.selfConstruction) || 0,
                semiSelfSubcontract: Number(item.semiSelfSubcontract) || 0,
                outsourceTransfer: Number(item.outsourceTransfer) || 0,
                selfConstructionPercentage: Number(item.selfConstructionPercentage) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    constructionExecutionData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_CONSTRUCTION_EXECUTION_STATUS}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-construction-execution-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: constructionExecutionData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_CONSTRUCTION_EXECUTION_STATUS, period.value, { items: constructionExecutionData.value.items }, remarks.value, suggestions.value)
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