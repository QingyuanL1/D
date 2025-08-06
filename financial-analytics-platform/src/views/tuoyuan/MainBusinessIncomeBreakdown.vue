<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">业务收入分解情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">当期 = 当年订单转收入 + 存量订单转收入</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-24">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in businessIncomeData.items" :key="`income-${index}`">
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
                                {{ formatNumber(item.annualPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="text-blue-600 font-medium">{{ formatNumber(item.currentPeriod) }}</span>
                                <span class="text-xs text-gray-500 ml-1">(计算值)</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.executionProgress) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriod) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.executionProgress) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 当年订单转收入详细数据 -->
        <div v-if="orderToIncomeData" class="mt-8">
            <h2 class="text-xl font-bold mb-4">当年订单转收入明细</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-blue-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">当年新订单累计</th>
                            <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                            <th class="border border-gray-300 px-4 py-2">当期转收入累计</th>
                            <th class="border border-gray-300 px-4 py-2">订单转收入率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in orderToIncomeData.items" :key="`order-${index}`">
                            <tr>
                                <td v-if="isFirstInOrderSegment(index)" 
                                    :rowspan="getOrderSegmentRowspan(item.segmentAttribute)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.customerAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.annualNewOrderCumulative) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.currentPeriodIncome) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.currentPeriodIncomeCumulative) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatPercentage(item.orderToIncomeRatio) }}%
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 存量订单转收入详细数据 -->
        <div v-if="stockOrderData" class="mt-8">
            <h2 class="text-xl font-bold mb-4">存量订单转收入明细</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-green-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">期初存量订单余额</th>
                            <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                            <th class="border border-gray-300 px-4 py-2">当期转收入累计</th>
                            <th class="border border-gray-300 px-4 py-2">存量订单转收入率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in stockOrderData.items" :key="`stock-${index}`">
                            <tr>
                                <td v-if="isFirstInStockSegment(index)" 
                                    :rowspan="getStockSegmentRowspan(item.segmentAttribute)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.customerAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.initialStockOrderBalance) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.currentPeriodIncome) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.currentIncomeCumulative) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatPercentage(item.stockOrderIncomeRatio) }}%
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 完整的存量订单转收入表格 -->
        <div class="mt-12 border-t-2 border-gray-200 pt-8">
            <h2 class="text-2xl font-bold mb-6">存量订单转收入</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-green-50">
                            <th class="border border-gray-300 px-4 py-2 w-24">板块</th>
                            <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2 w-32">期初存量订单余额</th>
                            <th class="border border-gray-300 px-4 py-2 w-32">当期转收入</th>
                            <th class="border border-gray-300 px-4 py-2 w-32">当期转收入累计</th>
                            <th class="border border-gray-300 px-4 py-2 w-32">存量订单转收入比率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in editableStockData.items" :key="`edit-stock-${index}`">
                            <tr>
                                <td v-if="isFirstInEditStockSegment(index)" 
                                    :rowspan="getEditStockSegmentRowspan(item.segmentAttribute)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">
                                    {{ item.customerAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.initialStockOrderBalance) }}
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
                                    {{ formatNumber(item.currentIncomeCumulative) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="text-sm font-medium">{{ formatPercentage(item.stockOrderIncomeRatio) }}%</span>
                                </td>
                            </tr>
                        </template>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(editStockTotalData.initialStockOrderBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(editStockTotalData.currentPeriodIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(editStockTotalData.currentIncomeCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-bold">{{ formatPercentage(editStockTotalData.stockOrderIncomeRatio) }}%</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.MAIN_BUSINESS_INCOME_BREAKDOWN"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSaveAll" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
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

interface BusinessIncomeItem {
    segmentAttribute: string;
    customerAttribute: string;
    annualPlan: number;
    currentPeriod: number;
    currentCumulative: number;
    executionProgress: number;
}

interface BusinessIncomeData {
    items: BusinessIncomeItem[];
}

interface OrderToIncomeItem {
    segmentAttribute: string;
    customerAttribute: string;
    annualNewOrderCumulative: number;
    currentPeriodIncome: number;
    currentPeriodIncomeCumulative: number;
    orderToIncomeRatio: number;
}

interface StockOrderItem {
    segmentAttribute: string;
    customerAttribute: string;
    initialStockOrderBalance: number;
    currentPeriodIncome: number;
    currentIncomeCumulative: number;
    stockOrderIncomeRatio: number;
}

const businessIncomeData = ref<BusinessIncomeData>({ items: [] })
const orderToIncomeData = ref<{ items: OrderToIncomeItem[] } | null>(null)
const stockOrderData = ref<{ items: StockOrderItem[] } | null>(null)

// 可编辑的存量订单转收入数据
const editableStockData = ref<{ items: StockOrderItem[] }>({ 
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', initialStockOrderBalance: 1104.53, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', initialStockOrderBalance: 374.66, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', initialStockOrderBalance: 861.89, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 }
    ]
})

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

// 主表格的板块合并逻辑
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return businessIncomeData.value.items[index].segmentAttribute !== businessIncomeData.value.items[index - 1].segmentAttribute
}

const getSegmentRowspan = (segmentAttribute: string): number => {
    return businessIncomeData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 当年订单转收入表格的板块合并逻辑
const isFirstInOrderSegment = (index: number): boolean => {
    if (!orderToIncomeData.value) return false
    if (index === 0) return true
    return orderToIncomeData.value.items[index].segmentAttribute !== orderToIncomeData.value.items[index - 1].segmentAttribute
}

const getOrderSegmentRowspan = (segmentAttribute: string): number => {
    if (!orderToIncomeData.value) return 1
    return orderToIncomeData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 存量订单转收入表格的板块合并逻辑
const isFirstInStockSegment = (index: number): boolean => {
    if (!stockOrderData.value) return false
    if (index === 0) return true
    return stockOrderData.value.items[index].segmentAttribute !== stockOrderData.value.items[index - 1].segmentAttribute
}

const getStockSegmentRowspan = (segmentAttribute: string): number => {
    if (!stockOrderData.value) return 1
    return stockOrderData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 可编辑存量订单转收入表格的板块合并逻辑
const isFirstInEditStockSegment = (index: number): boolean => {
    if (index === 0) return true
    return editableStockData.value.items[index].segmentAttribute !== editableStockData.value.items[index - 1].segmentAttribute
}

const getEditStockSegmentRowspan = (segmentAttribute: string): number => {
    return editableStockData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualPlan: 0,
        currentPeriod: 0,
        currentCumulative: 0,
        executionProgress: 0
    }
    
    businessIncomeData.value.items.forEach(item => {
        total.annualPlan += item.annualPlan || 0
        total.currentPeriod += item.currentPeriod || 0
        total.currentCumulative += item.currentCumulative || 0
    })
    
    // 计算总执行进度
    total.executionProgress = total.annualPlan > 0 ? (total.currentCumulative / total.annualPlan) * 100 : 0
    
    return total
})

// 计算可编辑存量订单转收入的当期转收入累计
const calculateEditStockIncomeCumulative = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        for (let item of editableStockData.value.items) {
            let cumulativeIncome = 0
            
            // 从1月累计到当前月份前一个月的"当期转收入"
            for (let m = 1; m < currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-stock-order-to-income/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const projectData = result.data.items.find((p: any) => 
                            p.segmentAttribute === item.segmentAttribute && 
                            p.customerAttribute === item.customerAttribute
                        )
                        if (projectData) {
                            cumulativeIncome += projectData.currentPeriodIncome || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 加上当前月份的当期转收入
            cumulativeIncome += item.currentPeriodIncome || 0
            
            item.currentIncomeCumulative = cumulativeIncome
            
            // 计算存量订单转收入比率
            item.stockOrderIncomeRatio = item.initialStockOrderBalance > 0 ? (item.currentIncomeCumulative / item.initialStockOrderBalance) * 100 : 0
        }
    } catch (error) {
        console.error('计算存量订单转收入累计失败:', error)
    }
}

// 监听可编辑数据变化，自动重新计算累计和比率
watch(() => editableStockData.value.items, async (newItems) => {
    await calculateEditStockIncomeCumulative(period.value)
}, { deep: true })

// 计算可编辑存量订单转收入合计数据
const editStockTotalData = computed(() => {
    const total = {
        initialStockOrderBalance: 0,
        currentPeriodIncome: 0,
        currentIncomeCumulative: 0,
        stockOrderIncomeRatio: 0
    }
    
    editableStockData.value.items.forEach(item => {
        total.initialStockOrderBalance += item.initialStockOrderBalance || 0
        total.currentPeriodIncome += item.currentPeriodIncome || 0
        total.currentIncomeCumulative += item.currentIncomeCumulative || 0
    })
    
    // 计算总转收入比率
    total.stockOrderIncomeRatio = total.initialStockOrderBalance > 0 ? (total.currentIncomeCumulative / total.initialStockOrderBalance) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-income-breakdown/${targetPeriod}`)
        if (!response.ok) {
            throw new Error('加载数据失败')
        }
        const result = await response.json()
        if (result.success) {
            businessIncomeData.value = result.data
            orderToIncomeData.value = result.orderToIncomeData
            stockOrderData.value = result.stockOrderData
        }

        // 单独加载可编辑表格数据
        await loadEditableStockData(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        // 重置为默认状态
        businessIncomeData.value = {
            items: [
                { segmentAttribute: '设备', customerAttribute: '电业项目', annualPlan: 6017.70, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '用户项目', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '贸易', annualPlan: 707.96, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '设备', customerAttribute: '代理设备', annualPlan: 2654.87, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理工程', annualPlan: 0.00, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 },
                { segmentAttribute: '其他', customerAttribute: '代理设计', annualPlan: 73.58, currentPeriod: 0, currentCumulative: 0, executionProgress: 0 }
            ]
        }
        orderToIncomeData.value = null
        stockOrderData.value = null
        resetEditableData()
    }
}

// 加载可编辑存量订单转收入数据
const loadEditableStockData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-stock-order-to-income/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.data && result.data.items) {
                const dbItems = result.data.items
                editableStockData.value.items = editableStockData.value.items.map(defaultItem => {
                    const dbItem = dbItems.find((item: any) => 
                        item.segmentAttribute === defaultItem.segmentAttribute && 
                        item.customerAttribute === defaultItem.customerAttribute
                    )
                    return {
                        segmentAttribute: defaultItem.segmentAttribute,
                        customerAttribute: defaultItem.customerAttribute,
                        initialStockOrderBalance: defaultItem.initialStockOrderBalance,
                        currentPeriodIncome: dbItem ? Number(dbItem.currentPeriodIncome) || 0 : 0,
                        currentIncomeCumulative: 0,
                        stockOrderIncomeRatio: 0
                    }
                })
            }
        }
        await calculateEditStockIncomeCumulative(targetPeriod)
    } catch (error) {
        console.error('加载可编辑存量订单转收入数据失败:', error)
    }
}

// 重置可编辑数据
const resetEditableData = () => {
    editableStockData.value = { 
        items: [
            { segmentAttribute: '设备', customerAttribute: '电业项目', initialStockOrderBalance: 1104.53, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
            { segmentAttribute: '设备', customerAttribute: '用户项目', initialStockOrderBalance: 374.66, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
            { segmentAttribute: '设备', customerAttribute: '贸易', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
            { segmentAttribute: '设备', customerAttribute: '代理设备', initialStockOrderBalance: 861.89, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
            { segmentAttribute: '其他', customerAttribute: '代理工程', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 },
            { segmentAttribute: '其他', customerAttribute: '代理设计', initialStockOrderBalance: 0.00, currentPeriodIncome: 0, currentIncomeCumulative: 0, stockOrderIncomeRatio: 0 }
        ]
    }
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.MAIN_BUSINESS_INCOME_BREAKDOWN}/${targetPeriod}`)
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
        await loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-main-business-income-breakdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: businessIncomeData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.MAIN_BUSINESS_INCOME_BREAKDOWN, period.value, businessIncomeData.value, remarks.value, suggestions.value)
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleSaveAll = async () => {
    try {
        // 1. 保存主业务收入分解数据
        const mainResponse = await fetch('http://127.0.0.1:3000/tuoyuan-main-business-income-breakdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: businessIncomeData.value
            })
        })

        if (!mainResponse.ok) {
            throw new Error('保存主业务收入分解数据失败')
        }

        // 2. 保存存量订单转收入数据
        const stockResponse = await fetch('http://127.0.0.1:3000/tuoyuan-stock-order-to-income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: editableStockData.value.items
                }
            })
        })

        if (!stockResponse.ok) {
            throw new Error('保存存量订单转收入数据失败')
        }

        // 3. 保存表单提交记录
        await recordFormSubmission(MODULE_IDS.MAIN_BUSINESS_INCOME_BREAKDOWN, period.value, {
            businessIncomeData: businessIncomeData.value,
            stockData: editableStockData.value
        }, remarks.value, suggestions.value)

        alert('全部数据保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert(`保存失败: ${error.message}`)
    }
}

const handleReset = () => {
    loadData(period.value)
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
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