<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">逾期应收账款情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">本年累计收款 = 累计以前每个月的当期累计已收款</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2">本年累计收款</th>
                        <th class="border border-gray-300 px-4 py-2">当期累计已收款</th>
                        <th class="border border-gray-300 px-4 py-2">累计新增逾期</th>
                        <th class="border border-gray-300 px-4 py-2">收款进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程板块项目（包含自建项目） -->
                    <template v-for="(item, index) in overdueData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="overdueData.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <!-- 自建项目需要缩进显示 -->
                                <span v-if="item.customerAttribute === '自建项目'" class="ml-4">
                                    {{ item.customerAttribute }}
                                </span>
                                <span v-else>
                                    {{ item.customerAttribute }}
                                </span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearBeginningBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearNewAddition) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentPeriodAccumulatedCollection" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.cumulativeNewOverdue" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.collectionProgress) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginningBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearNewAddition) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodAccumulatedCollection) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeNewOverdue) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.collectionProgress) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_OVERDUE_RECEIVABLES"
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

interface OverdueItem {
    customerAttribute: string;
    yearBeginningBalance: number;
    currentPeriodNewAddition: number;
    currentPeriodAccumulatedCollection: number;
    yearNewAddition: number;
    collectionProgress: number;
    cumulativeNewOverdue: number;
}

interface OverdueData {
    items: OverdueItem[];
}

const fixedPlanData: OverdueData = {
    items: [
        { customerAttribute: '一包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '二包项目', yearBeginningBalance: 5.94, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '域内合作项目', yearBeginningBalance: 129.30, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '域外合作项目', yearBeginningBalance: 12.28, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '新能源项目', yearBeginningBalance: 1.42, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '苏州项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '抢修项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '运检项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 },
        { customerAttribute: '自建项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, currentPeriodAccumulatedCollection: 0, yearNewAddition: 0, collectionProgress: 0, cumulativeNewOverdue: 0 }
    ]
}

const overdueData = ref<OverdueData>(JSON.parse(JSON.stringify(fixedPlanData)))
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

// 计算本年新增（累计以前每个月的当期累计已收款）
const calculateYearNewAddition = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个客户计算本年新增
        for (let customer of overdueData.value.items) {
            let yearNewAddition = 0
            
            // 从1月累计到当前月份的"当期累计已收款"
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/nanhua-overdue-receivables/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const customerData = result.data.items.find((c: any) => c.customerAttribute === customer.customerAttribute)
                        if (customerData) {
                            yearNewAddition += customerData.currentPeriodAccumulatedCollection || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            customer.yearNewAddition = yearNewAddition
            // 计算收款进度
            const totalAmount = customer.yearBeginningBalance + customer.yearNewAddition
            customer.collectionProgress = totalAmount > 0 ? (customer.currentPeriodAccumulatedCollection / totalAmount) * 100 : 0
        }
        
    } catch (error) {
        console.error('计算本年新增失败:', error)
    }
}

// 监听数据变化，自动计算收款进度
watch(() => overdueData.value.items, (newItems) => {
    newItems.forEach(item => {
        const totalAmount = item.yearBeginningBalance + item.yearNewAddition
        item.collectionProgress = totalAmount > 0 ? (item.currentPeriodAccumulatedCollection / totalAmount) * 100 : 0
    })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningBalance: 0,
        yearNewAddition: 0,
        currentPeriodAccumulatedCollection: 0,
        cumulativeNewOverdue: 0,
        collectionProgress: 0
    }
    
    overdueData.value.items.forEach(item => {
        total.yearBeginningBalance += item.yearBeginningBalance || 0
        total.yearNewAddition += item.yearNewAddition || 0
        total.currentPeriodAccumulatedCollection += item.currentPeriodAccumulatedCollection || 0
        total.cumulativeNewOverdue += item.cumulativeNewOverdue || 0
    })
    
    // 计算总收款进度
    const totalAmount = total.yearBeginningBalance + total.yearNewAddition
    total.collectionProgress = totalAmount > 0 ? (total.currentPeriodAccumulatedCollection / totalAmount) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-overdue-receivables/${targetPeriod}`)
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
            overdueData.value.items = result.data.items.map((item: any) => ({
                customerAttribute: item.customerAttribute,
                yearBeginningBalance: Number(item.yearBeginningBalance) || 0,
                currentPeriodNewAddition: Number(item.currentPeriodNewAddition) || 0,
                currentPeriodAccumulatedCollection: Number(item.currentPeriodAccumulatedCollection) || 0,
                yearNewAddition: Number(item.yearNewAddition) || 0,
                collectionProgress: Number(item.collectionProgress) || 0,
                cumulativeNewOverdue: Number(item.cumulativeNewOverdue) || 0
            }))
        }
        
        // 加载完数据后重新计算本年新增
        await calculateYearNewAddition(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    overdueData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_OVERDUE_RECEIVABLES}/${targetPeriod}`)
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
        await calculateYearNewAddition(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateYearNewAddition(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/nanhua-overdue-receivables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: overdueData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_OVERDUE_RECEIVABLES, period.value, { items: overdueData.value.items }, remarks.value, suggestions.value)
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
    await calculateYearNewAddition(targetPeriod)
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