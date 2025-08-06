<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源存量结构与质量（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">按年度计划口径分解</span>
                <span class="text-xs text-gray-500">当期金额累计 = 当期金额 + 之前各月累计</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年初金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-40">当期金额(计算值)</th>
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearBeginningAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentPeriodCalculated) }}
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
                            {{ formatNumber(totalData.currentPeriodCalculated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.fluctuationRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 在产表单 -->
        <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">在产情况（单位：万元）</h2>
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">年初余额</th>
                            <th class="border border-gray-300 px-4 py-2">当期余额</th>
                            <th class="border border-gray-300 px-4 py-2">波动率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in inProgressData.items" :key="`inprogress-${index}`">
                            <tr>
                                <td v-if="isFirstInSegment(index, inProgressData.items)" 
                                    :rowspan="getSegmentRowspan(item.segmentAttribute, inProgressData.items)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.yearBeginningAmount) }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input 
                                        v-model.number="item.currentPeriodAmount" 
                                        type="number" 
                                        class="w-full px-2 py-1 border rounded text-right" 
                                        step="0.01"
                                        @input="updateCalculatedValues"
                                    />
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ calculateFluctuation(item.yearBeginningAmount, item.currentPeriodAmount) }}%
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 中标未履约表单 -->
        <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">中标未履约（单位：万元）</h2>
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">期初余额</th>
                            <th class="border border-gray-300 px-4 py-2">当期余额</th>
                            <th class="border border-gray-300 px-4 py-2">波动率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in bidFulfillmentData.items" :key="`bid-${index}`">
                            <tr>
                                <td v-if="isFirstInSegment(index, bidFulfillmentData.items)" 
                                    :rowspan="getSegmentRowspan(item.segmentAttribute, bidFulfillmentData.items)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.initialBalance) }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input 
                                        v-model.number="item.currentBalance" 
                                        type="number" 
                                        class="w-full px-2 py-1 border rounded text-right" 
                                        step="0.01"
                                        @input="updateCalculatedValues"
                                    />
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ calculateFluctuation(item.initialBalance, item.currentBalance) }}%
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 库存情况表单 -->
        <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">库存情况(合同存量)（单位：万元）</h2>
            <div class="overflow-x-auto">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">年初余量</th>
                            <th class="border border-gray-300 px-4 py-2">当期新增</th>
                            <th class="border border-gray-300 px-4 py-2">当月收入</th>
                            <th class="border border-gray-300 px-4 py-2">当期库存</th>
                            <th class="border border-gray-300 px-4 py-2">波动率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(item, index) in inventoryStatusData.items" :key="`status-${index}`">
                            <tr>
                                <td v-if="isFirstInSegment(index, inventoryStatusData.items)" 
                                    :rowspan="getSegmentRowspan(item.segmentAttribute, inventoryStatusData.items)" 
                                    class="border border-gray-300 px-4 py-2 font-medium text-center">
                                    {{ item.segmentAttribute }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2">{{ item.customerAttribute }}</td>
                                <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(item.initialAmount) }}</td>
                                <td class="border border-gray-300 px-4 py-2">
                                    <input 
                                        v-model.number="item.currentIncrease" 
                                        type="number" 
                                        class="w-full px-2 py-1 border rounded text-right" 
                                        step="0.01"
                                        @input="updateCalculatedValues"
                                    />
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="font-medium">{{ formatNumber(getMainBusinessIncome('equipment', item.customerAttribute)) }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ calculateFluctuation(item.initialAmount, item.cumulativeAmount) }}%
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_INVENTORY_STRUCTURE"
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
    currentPeriodCalculated: number;
    fluctuationRate: number;
}

interface InProgressItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearBeginningAmount: number;
    currentPeriodAmount: number;
}

interface BidFulfillmentItem {
    segmentAttribute: string;
    customerAttribute: string;
    initialBalance: number;
    currentBalance: number;
}

interface InventoryStatusItem {
    segmentAttribute: string;
    customerAttribute: string;
    initialAmount: number;
    currentIncrease: number;
    cumulativeAmount: number;
}

interface InventoryData {
    items: InventoryItem[];
}

interface InProgressData {
    items: InProgressItem[];
}

interface BidFulfillmentData {
    items: BidFulfillmentItem[];
}

interface InventoryStatusData {
    items: InventoryStatusItem[];
}

// 静态年初金额数据 - 使用存量结构的年初金额
const staticYearBeginningAmounts = {
    '电业项目': 5304.53,
    '用户项目': 374.66,
    '贸易': 0.00,
    '代理设备': 3661.89,
    '代理工程': 0.00,
    '代理设计': 200.00
}

const fixedPlanData: InventoryData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningAmount: staticYearBeginningAmounts['电业项目'], currentPeriodCalculated: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningAmount: staticYearBeginningAmounts['用户项目'], currentPeriodCalculated: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningAmount: staticYearBeginningAmounts['贸易'], currentPeriodCalculated: 0, fluctuationRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningAmount: staticYearBeginningAmounts['代理设备'], currentPeriodCalculated: 0, fluctuationRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningAmount: staticYearBeginningAmounts['代理工程'], currentPeriodCalculated: 0, fluctuationRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningAmount: staticYearBeginningAmounts['代理设计'], currentPeriodCalculated: 0, fluctuationRate: 0 }
    ]
}

// 在产数据
const inProgressFixedData: InProgressData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningAmount: 490.21, currentPeriodAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningAmount: 374.66, currentPeriodAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningAmount: 0.00, currentPeriodAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningAmount: 636.81, currentPeriodAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningAmount: 0.00, currentPeriodAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningAmount: 0.00, currentPeriodAmount: 0 }
    ]
}

// 中标未履约数据
const bidFulfillmentFixedData: BidFulfillmentData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', initialBalance: 4200.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', initialBalance: 0.00, currentBalance: 0 }
    ]
}

// 库存情况数据
const inventoryStatusFixedData: InventoryStatusData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', initialAmount: 490.21, currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', initialAmount: 374.66, currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', initialAmount: 0.00, currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', initialAmount: 636.81, currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', initialAmount: 0.00, currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', initialAmount: 0.00, currentIncrease: 0, cumulativeAmount: 0 }
    ]
}

const inventoryData = ref<InventoryData>(JSON.parse(JSON.stringify(fixedPlanData)))
const inProgressData = ref<InProgressData>(JSON.parse(JSON.stringify(inProgressFixedData)))
const bidFulfillmentData = ref<BidFulfillmentData>(JSON.parse(JSON.stringify(bidFulfillmentFixedData)))
const inventoryStatusData = ref<InventoryStatusData>(JSON.parse(JSON.stringify(inventoryStatusFixedData)))

const remarks = ref('')
const suggestions = ref('')

// 存储所有历史月份数据，用于计算累计库存
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

// 存储主营业务收入数据
const mainBusinessIncomeData = ref<any>(null)

const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatPercentage = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toFixed(2)
}

// 计算波动率
const calculateFluctuation = (initial: number, current: number): string => {
    if (initial === 0) {
        return current === 0 ? '0.00' : 'N/A'
    }
    const fluctuation = ((current - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 加载主营业务收入数据
const loadMainBusinessIncomeData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-income/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                mainBusinessIncomeData.value = result.data
                console.log('拓源主营业务收入数据:', mainBusinessIncomeData.value)
            }
        }
    } catch (error) {
        console.error('加载拓源主营业务收入数据失败:', error)
    }
}

// 获取主营业务收入值
const getMainBusinessIncome = (category: string, customerType: string): number => {
    if (!mainBusinessIncomeData.value) return 0

    // 拓源只有设备板块，所以直接查找设备数据
    const categoryData = mainBusinessIncomeData.value.equipment || []
    const item = categoryData.find((item: any) => item.customer === customerType)
    return item ? (item.currentMonthIncome || 0) : 0
}

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: any }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))
            
        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
                try {
                const response = await fetch(`http://127.0.0.1:3000/tuoyuan-inventory-status/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                    if (result.success && result.data) {
                        allData.push({ period: monthPeriod, data: result.data })
                        }
                    }
                } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error)
                }
            }
            
        allMonthsData.value = allData
        console.log('加载的所有月份数据:', allData)
    } catch (error) {
        console.error('加载所有月份数据失败:', error)
    }
}

// 计算累计库存：年初余量 + 当期新增（每个月）- 当月收入（每月）（含税）
const calculateCumulativeAmount = (customerType: string) => {
    // 从库存情况数据中获取年初余量
    const statusItem = inventoryStatusData.value.items.find(item => item.customerAttribute === customerType)
    const initialAmount = statusItem ? statusItem.initialAmount : 0

    let totalIncrease = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.data.items) {
            const item = monthData.data.items.find((d: any) => d.customerAttribute === customerType)
            if (item) {
                totalIncrease += parseFloat(item.currentIncrease?.toString()) || 0
            }
        }
    }

    // 加上当前月份的输入值
    if (statusItem) {
        totalIncrease += parseFloat(statusItem.currentIncrease?.toString()) || 0
    }

    // 获取当月收入（含税）
    const currentMonthIncome = getMainBusinessIncome('equipment', customerType)
    let currentMonthIncomeWithTax = 0

    if (currentMonthIncome > 0) {
        // 设备板块税率为13%
        const taxRate = 0.13
        // 当月收入（含税）= 当月收入 / (1 - 税率)
        currentMonthIncomeWithTax = currentMonthIncome / (1 - taxRate)
    }

    // 累计库存 = 年初余量 + 总新增 - 当月收入（含税）
    return initialAmount + totalIncrease - currentMonthIncomeWithTax
}

// 更新累计库存数据
const updateCumulativeAmounts = () => {
    inventoryStatusData.value.items.forEach(item => {
        const cumulative = calculateCumulativeAmount(item.customerAttribute)
        item.cumulativeAmount = cumulative
    })
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number, items?: any[]): boolean => {
    if (index === 0) return true
    const dataItems = items || inventoryData.value.items
    return dataItems[index].segmentAttribute !== dataItems[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string, items?: any[]): number => {
    const dataItems = items || inventoryData.value.items
    return dataItems.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算当期金额(计算值) = 在产 + 中标未履约 + 库存情况
const updateCalculatedValues = () => {
    // 更新库存情况的累计数据
    updateCumulativeAmounts()
    
    // 计算存量结构的当期金额(计算值)
    inventoryData.value.items.forEach(item => {
        const inProgressItem = inProgressData.value.items.find(ip => ip.customerAttribute === item.customerAttribute)
        const bidItem = bidFulfillmentData.value.items.find(bid => bid.customerAttribute === item.customerAttribute)
        const statusItem = inventoryStatusData.value.items.find(status => status.customerAttribute === item.customerAttribute)
        
        // 当期金额(计算值) = 在产 + 中标未履约 + 库存情况
        item.currentPeriodCalculated = (inProgressItem?.currentPeriodAmount || 0) + 
                                     (bidItem?.currentBalance || 0) + 
                                     (statusItem?.cumulativeAmount || 0)
        
        // 计算波动率 = (当期金额(计算值) - 年初金额) / 年初金额 * 100%
        item.fluctuationRate = item.yearBeginningAmount > 0 ? 
            ((item.currentPeriodCalculated - item.yearBeginningAmount) / item.yearBeginningAmount) * 100 : 0
    })
}

// 监听数据变化，自动重新计算当期金额和波动率
watch([
    () => inProgressData.value.items.map(item => item.currentPeriodAmount),
    () => bidFulfillmentData.value.items.map(item => item.currentBalance),
    () => inventoryStatusData.value.items.map(item => item.currentIncrease)
], () => {
    updateCalculatedValues()
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningAmount: 0,
        currentPeriodCalculated: 0,
        fluctuationRate: 0
    }
    
    inventoryData.value.items.forEach(item => {
        total.yearBeginningAmount += item.yearBeginningAmount || 0
        total.currentPeriodCalculated += item.currentPeriodCalculated || 0
    })
    
    // 计算总波动率
    total.fluctuationRate = total.yearBeginningAmount > 0 ? 
        ((total.currentPeriodCalculated - total.yearBeginningAmount) / total.yearBeginningAmount) * 100 : 0
    
    return total
})

// 加载三张表的数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载拓源存量结构与质量数据，期间: ${targetPeriod}`)
        
        // 初始化为默认数据
        resetToDefaultData()
        
        // 并行加载三张表的数据
        const [inProgressResponse, bidFulfillmentResponse, inventoryStatusResponse] = await Promise.all([
            fetch(`http://127.0.0.1:3000/tuoyuan-inventory-in-progress/${targetPeriod}`).catch(() => ({ ok: false, status: 404 })),
            fetch(`http://127.0.0.1:3000/tuoyuan-bid-fulfillment/${targetPeriod}`).catch(() => ({ ok: false, status: 404 })),
            fetch(`http://127.0.0.1:3000/tuoyuan-inventory-status/${targetPeriod}`).catch(() => ({ ok: false, status: 404 }))
        ])
        
        // 处理在产数据
        if (inProgressResponse.ok) {
            const inProgressResult = await inProgressResponse.json()
            console.log('在产数据API响应:', inProgressResult)
            if (inProgressResult.success && inProgressResult.data && inProgressResult.data.items) {
                // 使用API返回的数据替换默认数据
                inProgressData.value.items = inProgressFixedData.items.map(defaultItem => {
                    const apiItem = inProgressResult.data.items.find((item: any) => 
                        item.segmentAttribute === defaultItem.segmentAttribute && 
                        item.customerAttribute === defaultItem.customerAttribute
                    )
                    return {
                        segmentAttribute: defaultItem.segmentAttribute,
                        customerAttribute: defaultItem.customerAttribute,
                        yearBeginningAmount: defaultItem.yearBeginningAmount, // 使用默认年初余额
                        currentPeriodAmount: apiItem ? Number(apiItem.currentPeriodAmount) || 0 : 0
                    }
                })
            }
        }
        
        // 处理中标未履约数据
        if (bidFulfillmentResponse.ok) {
            const bidFulfillmentResult = await bidFulfillmentResponse.json()
            console.log('中标未履约数据API响应:', bidFulfillmentResult)
            if (bidFulfillmentResult.success && bidFulfillmentResult.data && bidFulfillmentResult.data.items) {
                // 使用API返回的数据替换默认数据
                bidFulfillmentData.value.items = bidFulfillmentFixedData.items.map(defaultItem => {
                    const apiItem = bidFulfillmentResult.data.items.find((item: any) => 
                        item.segmentAttribute === defaultItem.segmentAttribute && 
                        item.customerAttribute === defaultItem.customerAttribute
                    )
                    return {
                        segmentAttribute: defaultItem.segmentAttribute,
                        customerAttribute: defaultItem.customerAttribute,
                        initialBalance: defaultItem.initialBalance, // 使用默认期初余额
                        currentBalance: apiItem ? Number(apiItem.currentBalance) || 0 : 0
                    }
                })
            }
        }
        
        // 处理库存情况数据
        if (inventoryStatusResponse.ok) {
            const inventoryStatusResult = await inventoryStatusResponse.json()
            console.log('库存情况数据API响应:', inventoryStatusResult)
            if (inventoryStatusResult.success && inventoryStatusResult.data && inventoryStatusResult.data.items) {
                // 使用API返回的数据替换默认数据
                inventoryStatusData.value.items = inventoryStatusFixedData.items.map(defaultItem => {
                    const apiItem = inventoryStatusResult.data.items.find((item: any) => 
                    item.segmentAttribute === defaultItem.segmentAttribute && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                return {
                    segmentAttribute: defaultItem.segmentAttribute,
                    customerAttribute: defaultItem.customerAttribute,
                        initialAmount: defaultItem.initialAmount, // 使用默认年初余量
                        currentIncrease: apiItem ? Number(apiItem.currentIncrease) || 0 : 0,
                        cumulativeAmount: 0 // 将在updateCalculatedValues中计算
                }
            })
            }
        }
        
        // 加载历史数据并更新累计库存
        await loadAllMonthsData(targetPeriod)
        
        // 加载完数据后重新计算当期金额和波动率
        updateCalculatedValues()
        console.log('拓源存量结构与质量数据加载完成')
        
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    inventoryData.value = JSON.parse(JSON.stringify(fixedPlanData))
    inProgressData.value = JSON.parse(JSON.stringify(inProgressFixedData))
    bidFulfillmentData.value = JSON.parse(JSON.stringify(bidFulfillmentFixedData))
    inventoryStatusData.value = JSON.parse(JSON.stringify(inventoryStatusFixedData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_INVENTORY_STRUCTURE}/${targetPeriod}`)
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
        console.log('=== 开始保存拓源存量结构与质量数据 ===')
        
        // 准备三张表的数据
        const inProgressData = {
                    items: inventoryData.value.items.map(item => ({
                        segmentAttribute: item.segmentAttribute,
                        customerAttribute: item.customerAttribute,
                        yearBeginningAmount: item.yearBeginningAmount,
                currentPeriodAmount: item.inventoryInProgress,
                fluctuationRate: 0
            }))
        }
        
        const bidFulfillmentData = {
            items: inventoryData.value.items.map(item => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                initialBalance: 4200.00, // 使用中标未履约的静态年初数据
                currentBalance: item.bidFulfillment
            }))
        }
        
        const inventoryStatusData = {
            items: inventoryData.value.items.map(item => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                initialAmount: item.yearBeginningAmount,
                currentIncrease: 0, // 这里可以根据业务逻辑调整
                cumulativeAmount: item.inventoryStatus
            }))
        }
        
        // 并行保存到三张表
        const savePromises = [
            fetch('http://127.0.0.1:3000/tuoyuan-inventory-in-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period: period.value, data: inProgressData })
            }),
            fetch('http://127.0.0.1:3000/tuoyuan-bid-fulfillment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period: period.value, data: bidFulfillmentData })
            }),
            fetch('http://127.0.0.1:3000/tuoyuan-inventory-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period: period.value, data: inventoryStatusData })
            })
        ]
        
        const responses = await Promise.all(savePromises)
        
        // 检查所有响应是否成功
        const allSuccessful = responses.every(response => response.ok)
        
        if (!allSuccessful) {
            throw new Error('部分数据保存失败')
        }
        
        console.log('所有数据保存成功')
        
        // 记录表单提交状态
        const formData = {
            items: inventoryData.value.items.map(item => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearBeginningAmount: item.yearBeginningAmount,
                inventoryInProgress: item.inventoryInProgress,
                bidFulfillment: item.bidFulfillment,
                inventoryStatus: item.inventoryStatus,
                currentPeriodCalculated: item.currentPeriodCalculated,
                fluctuationRate: item.fluctuationRate
            }))
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_INVENTORY_STRUCTURE, period.value, formData, remarks.value, suggestions.value)
        alert('保存成功')
        
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    resetToDefaultData()
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    console.log('拓源存量结构与质量组件挂载，当前期间:', period.value)
    const targetPeriod = route.query.period?.toString() || period.value
    await loadData(targetPeriod)
    await loadMainBusinessIncomeData(targetPeriod)
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