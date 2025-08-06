<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务毛利率结构与质量</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（按年度计划口径分解）</span>
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
                    <template v-for="(item, index) in profitMarginData.items" :key="`profit-margin-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
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
                                <span class="font-medium">{{ formatPercentage(item.currentActual) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium" :class="item.deviation >= 0 ? 'text-green-600' : 'text-red-600'">
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
                            <span class="text-sm font-bold" :class="totalData.deviation >= 0 ? 'text-green-600' : 'text-red-600'">
                                {{ formatPercentage(totalData.deviation) }}%
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PROFIT_MARGIN"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleCalculate" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                自动计算
            </button>
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

interface ProfitMarginItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearlyPlan: number;
    currentActual: number;
    deviation: number;
}

interface ProfitMarginData {
    items: ProfitMarginItem[];
}

const fixedPlanData: ProfitMarginData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlan: 8.00, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 0, currentActual: 0, deviation: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 24.99, currentActual: 0, deviation: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearlyPlan: 0, currentActual: 0, deviation: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearlyPlan: 100, currentActual: 0, deviation: 0 }
    ]
}

const profitMarginData = ref<ProfitMarginData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return profitMarginData.value.items[index].segmentAttribute !== profitMarginData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return profitMarginData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算偏差
const calculateDeviation = () => {
    profitMarginData.value.items.forEach(item => {
        item.deviation = (item.currentActual || 0) - (item.yearlyPlan || 0)
    })
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentActual: 0,
        deviation: 0
    }
    
    // 毛利率应该使用加权平均计算，而不是简单相加
    let totalPlanWeight = 0
    let totalActualWeight = 0
    let totalPlanValue = 0
    let totalActualValue = 0
    
    profitMarginData.value.items.forEach(item => {
        const planWeight = Math.max(item.yearlyPlan || 0, 1) // 使用计划值作为权重，最小为1
        const actualWeight = Math.max(item.yearlyPlan || 0, 1) // 使用计划值作为权重
        
        totalPlanValue += (item.yearlyPlan || 0) * planWeight
        totalPlanWeight += planWeight
        
        totalActualValue += (item.currentActual || 0) * actualWeight
        totalActualWeight += actualWeight
    })
    
    // 计算加权平均
    total.yearlyPlan = totalPlanWeight > 0 ? Number((totalPlanValue / totalPlanWeight).toFixed(2)) : 0
    total.currentActual = totalActualWeight > 0 ? Number((totalActualValue / totalActualWeight).toFixed(2)) : 0
    total.deviation = total.currentActual - total.yearlyPlan
    
    return total
})

// 自动计算毛利率的辅助函数
const autoCalculateProfitMargin = async (targetPeriod: string) => {
    try {
        console.log(`自动计算毛利率，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-profit-margin/calculate/${targetPeriod}`)
        
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data && result.data.items) {
                // 将计算结果赋值到当期实际字段
                result.data.items.forEach((calculatedItem: any) => {
                    const existingItem = profitMarginData.value.items.find(item => 
                        item.segmentAttribute === calculatedItem.segmentAttribute && 
                        item.customerAttribute === calculatedItem.customerAttribute
                    )
                    if (existingItem) {
                        existingItem.currentActual = Number(calculatedItem.currentActual) || 0
                        existingItem.deviation = Number(calculatedItem.deviation) || 0
                    }
                })
                
                console.log('✓ 自动计算毛利率完成')
            }
        } else {
            console.log('无法自动计算毛利率：可能缺少基础数据')
        }
    } catch (error) {
        console.error('自动计算毛利率失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-profit-margin/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            
            // 尝试自动计算毛利率
            await autoCalculateProfitMargin(targetPeriod)
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            profitMarginData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearlyPlan: Number(item.yearlyPlan) || 0,
                currentActual: Number(item.currentActual) || 0,
                deviation: Number(item.deviation) || 0
            }))
        }
        
        // 重新计算偏差
        calculateDeviation()
        
        // 如果当期实际值都为0，尝试自动计算
        const hasActualValues = profitMarginData.value.items.some(item => item.currentActual > 0)
        if (!hasActualValues) {
            await autoCalculateProfitMargin(targetPeriod)
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
        // 即使加载失败也尝试自动计算
        await autoCalculateProfitMargin(targetPeriod)
    }
}

const resetToDefaultData = () => {
    profitMarginData.value = JSON.parse(JSON.stringify(fixedPlanData))
    calculateDeviation()
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PROFIT_MARGIN}/${targetPeriod}`)
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

const handleCalculate = async () => {
    try {
        await autoCalculateProfitMargin(period.value)
        alert('自动计算完成！')
    } catch (error) {
        console.error('手动计算失败:', error)
        alert('计算失败: ' + (error as Error).message)
    }
}

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-main-business-profit-margin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: profitMarginData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PROFIT_MARGIN, period.value, { items: profitMarginData.value.items }, remarks.value, suggestions.value)
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