<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">收款结构与质量</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（按年度计划口径分解）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-20">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">当期</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in paymentData.items" :key="`payment-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" :rowspan="getSegmentRowspan(item.segmentAttribute)"
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.missingData" type="number"
                                    class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentAccumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm">{{ formatPercentage(item.executionProgress) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.missingData) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentAccumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.executionProgress) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks :module-id="MODULE_IDS.PAYMENT_STRUCTURE_QUALITY" :period="period"
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

interface PaymentStructureItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearlyPlan: number;
    missingData: number;
    currentAccumulated: number;
    executionProgress: number;
}

interface PaymentStructureData {
    items: PaymentStructureItem[];
}

const fixedPlanData: PaymentStructureData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearlyPlan: 0, missingData: 0, currentAccumulated: 476.92, executionProgress: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearlyPlan: 0, missingData: 0, currentAccumulated: 458.11, executionProgress: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理工程', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设计', yearlyPlan: 0, missingData: 0, currentAccumulated: 0.00, executionProgress: 0 }
    ]
}

const paymentData = ref<PaymentStructureData>(JSON.parse(JSON.stringify(fixedPlanData)))
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
    return paymentData.value.items[index].segmentAttribute !== paymentData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return paymentData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算当期累计和执行进度
const calculateCurrentAccumulatedAndProgress = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])

        // 为每个项目计算当期累计和执行进度
        for (let item of paymentData.value.items) {
            let totalCurrentValues = 0

            // 从1月累计到当前月份的所有"缺少数据"值
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-payment-structure-quality/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const projectData = result.data.items.find((p: any) =>
                            p.segmentAttribute === item.segmentAttribute &&
                            p.customerAttribute === item.customerAttribute
                        )
                        if (projectData) {
                            totalCurrentValues += projectData.missingData || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }

            // 当期累计 = 年初到当前月份的累计输入值
            item.currentAccumulated = totalCurrentValues

            // 执行进度 = 当期累计 / 年度计划 * 100%
            item.executionProgress = item.yearlyPlan > 0 ?
                (item.currentAccumulated / item.yearlyPlan) * 100 : 0
        }

    } catch (error) {
        console.error('计算当期累计和执行进度失败:', error)
    }
}

// 监听输入变化，仅当手动输入缺少数据时重新计算
watch(() => paymentData.value.items.map(item => item.missingData), async () => {
    // 只在输入变化时重新计算，避免无限循环
    await calculateCurrentAccumulatedAndProgress(period.value)
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        missingData: 0,
        currentAccumulated: 0,
        executionProgress: 0
    }

    paymentData.value.items.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.missingData += item.missingData || 0
        total.currentAccumulated += item.currentAccumulated || 0
    })

    // 计算总执行进度
    total.executionProgress = total.yearlyPlan > 0 ?
        (total.currentAccumulated / total.yearlyPlan) * 100 : 0

    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-payment-structure-quality/${targetPeriod}`)
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
            paymentData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearlyPlan: Number(item.yearlyPlan) || 0,
                missingData: Number(item.missingData) || 0,
                currentAccumulated: Number(item.currentAccumulated) || 0,
                executionProgress: Number(item.executionProgress) || 0
            }))
        }

        // 加载完数据后重新计算
        await calculateCurrentAccumulatedAndProgress(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    paymentData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.PAYMENT_STRUCTURE_QUALITY}/${targetPeriod}`)
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
        await calculateCurrentAccumulatedAndProgress(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateCurrentAccumulatedAndProgress(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-payment-structure-quality', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: paymentData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.PAYMENT_STRUCTURE_QUALITY, period.value, { items: paymentData.value.items }, remarks.value, suggestions.value)
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
    await calculateCurrentAccumulatedAndProgress(targetPeriod)
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