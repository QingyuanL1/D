<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源在产情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">当期金额累计 = 年初金额 + 当期金额累计变化</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期余额</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in inventoryData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.yearBeginningAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentPeriodAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.fluctuationRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginningAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.fluctuationRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_INVENTORY_IN_PROGRESS"
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

interface InventoryItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearBeginningAmount: number;
    currentPeriodAmount: number;
    fluctuationRate: number;
}

interface InventoryData {
    items: InventoryItem[];
}

const fixedPlanData: InventoryData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningAmount: 490.21, currentPeriodAmount: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningAmount: 374.66, currentPeriodAmount: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningAmount: 0.00, currentPeriodAmount: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningAmount: 636.81, currentPeriodAmount: 0, fluctuationRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningAmount: 0.00, currentPeriodAmount: 0, fluctuationRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningAmount: 0.00, currentPeriodAmount: 0, fluctuationRate: 0 }
    ]
}

const inventoryData = ref<InventoryData>(JSON.parse(JSON.stringify(fixedPlanData)))
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
    return inventoryData.value.items[index].segmentAttribute !== inventoryData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return inventoryData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算波动率
const calculateFluctuationRate = () => {
    for (let item of inventoryData.value.items) {
        // 计算波动率 = (当期余额 - 年初余额) / 年初余额 * 100%
        if (item.yearBeginningAmount && item.yearBeginningAmount !== 0) {
            item.fluctuationRate = ((item.currentPeriodAmount - item.yearBeginningAmount) / item.yearBeginningAmount) * 100
        } else {
            item.fluctuationRate = item.currentPeriodAmount !== 0 ? (item.currentPeriodAmount > 0 ? 100 : -100) : 0
        }
    }
}

// 监听数据变化，自动重新计算波动率
watch(() => inventoryData.value.items, () => {
    calculateFluctuationRate()
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningAmount: 0,
        currentPeriodAmount: 0,
        fluctuationRate: 0
    }
    
    inventoryData.value.items.forEach(item => {
        total.yearBeginningAmount += item.yearBeginningAmount || 0
        total.currentPeriodAmount += item.currentPeriodAmount || 0
    })
    
    // 计算总波动率 = (总当期余额 - 总年初余额) / 总年初余额 * 100%
    if (total.yearBeginningAmount > 0) {
        total.fluctuationRate = ((total.currentPeriodAmount - total.yearBeginningAmount) / total.yearBeginningAmount) * 100
    } else {
        const changeAmount = total.currentPeriodAmount - total.yearBeginningAmount
        total.fluctuationRate = changeAmount !== 0 ? (changeAmount > 0 ? 100 : -100) : 0
    }
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-inventory-in-progress/${targetPeriod}`)
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
            // 合并数据库数据和默认数据，保证顺序一致
            const dbItems = result.data.items
            inventoryData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.segmentAttribute === defaultItem.segmentAttribute && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                return {
                    segmentAttribute: defaultItem.segmentAttribute,
                    customerAttribute: defaultItem.customerAttribute,
                    yearBeginningAmount: defaultItem.yearBeginningAmount, // 使用默认值
                    currentPeriodAmount: dbItem ? Number(dbItem.currentPeriodAmount) || 0 : 0,
                    fluctuationRate: 0 // 将由计算函数重新计算
                }
            })
        }
        
        // 加载完数据后重新计算波动率
        calculateFluctuationRate()
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    inventoryData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_INVENTORY_IN_PROGRESS}/${targetPeriod}`)
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
        calculateFluctuationRate()
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        calculateFluctuationRate()
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-inventory-in-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: inventoryData.value.items.map(item => ({
                        segmentAttribute: item.segmentAttribute,
                        customerAttribute: item.customerAttribute,
                        yearBeginningAmount: item.yearBeginningAmount,
                        currentPeriodAmount: item.currentPeriodAmount,
                        // 不保存波动率，由前端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_INVENTORY_IN_PROGRESS, period.value, { items: inventoryData.value.items }, remarks.value, suggestions.value)
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
    calculateFluctuationRate()
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