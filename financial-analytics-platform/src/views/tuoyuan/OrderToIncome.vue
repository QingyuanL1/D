<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源当年订单转收入</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">当期转收入累计 = 当期转收入 + 之前各月累计</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">当年新签订单累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期转收入</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">当期转收入累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">当年订单转收入比率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in orderToIncomeData.items" :key="`item-${index}`">
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
                                {{ formatNumber(item.annualNewOrderCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentPeriodIncome" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentPeriodIncomeCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.orderToIncomeRatio) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualNewOrderCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodIncome) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodIncomeCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.orderToIncomeRatio) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_ORDER_TO_INCOME"
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

interface OrderToIncomeItem {
    segmentAttribute: string;
    customerAttribute: string;
    annualNewOrderCumulative: number;
    currentPeriodIncome: number;
    currentPeriodIncomeCumulative: number;
    orderToIncomeRatio: number;
}

interface OrderToIncomeData {
    items: OrderToIncomeItem[];
}

const fixedPlanData: OrderToIncomeData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', annualNewOrderCumulative: 550.51, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', annualNewOrderCumulative: 0.00, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', annualNewOrderCumulative: 218.24, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', annualNewOrderCumulative: 622.38, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理工程', annualNewOrderCumulative: 0.00, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设计', annualNewOrderCumulative: 0.00, currentPeriodIncome: 0, currentPeriodIncomeCumulative: 0, orderToIncomeRatio: 0 }
    ]
}

const orderToIncomeData = ref<OrderToIncomeData>(JSON.parse(JSON.stringify(fixedPlanData)))
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
    return orderToIncomeData.value.items[index].segmentAttribute !== orderToIncomeData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return orderToIncomeData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算当期转收入累计（当期转收入 + 之前各月累计）
const calculateCurrentIncomeCumulative = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个项目计算当期转收入累计
        for (let item of orderToIncomeData.value.items) {
            let cumulativeAmount = 0
            
            // 从1月累计到当前月份前一个月的"当期转收入"
            for (let m = 1; m < currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-order-to-income/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const projectData = result.data.items.find((p: any) => 
                            p.segmentAttribute === item.segmentAttribute && 
                            p.customerAttribute === item.customerAttribute
                        )
                        if (projectData) {
                            cumulativeAmount += projectData.currentPeriodIncome || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 加上当前月份的当期转收入
            cumulativeAmount += item.currentPeriodIncome || 0
            
            item.currentPeriodIncomeCumulative = cumulativeAmount
            
            // 计算当年订单转收入比率
            item.orderToIncomeRatio = item.annualNewOrderCumulative > 0 ? 
                (item.currentPeriodIncomeCumulative / item.annualNewOrderCumulative) * 100 : 0
        }
        
    } catch (error) {
        console.error('计算当期转收入累计失败:', error)
    }
}

// 监听数据变化，自动重新计算当期转收入累计和订单转收入比率
watch(() => orderToIncomeData.value.items, async (newItems) => {
    // 当当期转收入发生变化时，重新计算当期转收入累计
    await calculateCurrentIncomeCumulative(period.value)
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualNewOrderCumulative: 0,
        currentPeriodIncome: 0,
        currentPeriodIncomeCumulative: 0,
        orderToIncomeRatio: 0
    }
    
    orderToIncomeData.value.items.forEach(item => {
        total.annualNewOrderCumulative += item.annualNewOrderCumulative || 0
        total.currentPeriodIncome += item.currentPeriodIncome || 0
        total.currentPeriodIncomeCumulative += item.currentPeriodIncomeCumulative || 0
    })
    
    // 计算总订单转收入比率
    total.orderToIncomeRatio = total.annualNewOrderCumulative > 0 ? 
        (total.currentPeriodIncomeCumulative / total.annualNewOrderCumulative) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-order-to-income/${targetPeriod}`)
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
            orderToIncomeData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.segmentAttribute === defaultItem.segmentAttribute && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                return {
                    segmentAttribute: defaultItem.segmentAttribute,
                    customerAttribute: defaultItem.customerAttribute,
                    annualNewOrderCumulative: defaultItem.annualNewOrderCumulative, // 使用默认值
                    currentPeriodIncome: dbItem ? Number(dbItem.currentPeriodIncome) || 0 : 0,
                    currentPeriodIncomeCumulative: 0, // 将由计算函数重新计算
                    orderToIncomeRatio: 0 // 将由计算函数重新计算
                }
            })
        }
        
        // 加载完数据后重新计算当期转收入累计
        await calculateCurrentIncomeCumulative(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    orderToIncomeData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_ORDER_TO_INCOME}/${targetPeriod}`)
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
        await calculateCurrentIncomeCumulative(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateCurrentIncomeCumulative(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-order-to-income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: orderToIncomeData.value.items.map(item => ({
                        segmentAttribute: item.segmentAttribute,
                        customerAttribute: item.customerAttribute,
                        annualNewOrderCumulative: item.annualNewOrderCumulative,
                        currentPeriodIncome: item.currentPeriodIncome,
                        // 不保存累计值和比率，由前端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_ORDER_TO_INCOME, period.value, { items: orderToIncomeData.value.items }, remarks.value, suggestions.value)
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
    await calculateCurrentIncomeCumulative(targetPeriod)
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