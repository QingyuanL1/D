<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源库存情况(合同存量)（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
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
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model.number="item.initialAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-50" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentIncrease"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                    @input="updateCumulativeAmounts"
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

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentIncrease) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(getTotalMainBusinessIncome()) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateFluctuation(totalData.initialAmount, totalData.cumulativeAmount) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_INVENTORY_STATUS"
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
    initialAmount: number;
    currentIncrease: number;
    cumulativeAmount: number;
}

interface InventoryData {
    items: InventoryItem[];
}

// 静态年初余量数据
const staticInitialAmounts = {
    '电业项目': 490.21,
    '用户项目': 374.66,
    '贸易': 0.00,
    '代理设备': 636.81,
    '代理工程': 0.00,
    '代理设计': 0.00
}

const fixedPlanData: InventoryData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', initialAmount: staticInitialAmounts['电业项目'], currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', initialAmount: staticInitialAmounts['用户项目'], currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', initialAmount: staticInitialAmounts['贸易'], currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', initialAmount: staticInitialAmounts['代理设备'], currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', initialAmount: staticInitialAmounts['代理工程'], currentIncrease: 0, cumulativeAmount: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', initialAmount: staticInitialAmounts['代理设计'], currentIncrease: 0, cumulativeAmount: 0 }
    ]
}

const inventoryData = ref<InventoryData>(JSON.parse(JSON.stringify(fixedPlanData)))
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



// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return inventoryData.value.items[index].segmentAttribute !== inventoryData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return inventoryData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
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

// 获取主营业务收入总计
const getTotalMainBusinessIncome = (): number => {
    if (!mainBusinessIncomeData.value) return 0

    let total = 0
    const equipmentData = mainBusinessIncomeData.value.equipment || []

    equipmentData.forEach((item: any) => {
        total += item.currentMonthIncome || 0
    })

    return total
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
    // 获取年初余量
    const initialAmount = staticInitialAmounts[customerType] || 0

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
    const currentItem = inventoryData.value.items.find(d => d.customerAttribute === customerType)
    if (currentItem) {
        totalIncrease += parseFloat(currentItem.currentIncrease?.toString()) || 0
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
    inventoryData.value.items.forEach(item => {
        const cumulative = calculateCumulativeAmount(item.customerAttribute)
        item.cumulativeAmount = cumulative
    })
}

// 计算波动率
const calculateFluctuation = (initial: number, cumulative: number): string => {
    if (initial === 0) {
        return cumulative === 0 ? '0.00' : 'N/A'
    }
    const fluctuation = ((cumulative - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        initialAmount: 0,
        currentIncrease: 0,
        cumulativeAmount: 0
    }

    inventoryData.value.items.forEach(item => {
        total.initialAmount += Number(item.initialAmount) || 0;
        total.currentIncrease += Number(item.currentIncrease) || 0;
        total.cumulativeAmount += Number(item.cumulativeAmount) || 0;
    });

    return total;
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载拓源库存情况数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-inventory-status/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，重置为初始模板')
            resetToDefaultData()

            // 加载历史数据并更新累计库存
            await loadAllMonthsData(targetPeriod)
            updateCumulativeAmounts()
            return
        }
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            if (result.data.items) {
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
                        initialAmount: defaultItem.initialAmount, // 使用静态初始余量
                        currentIncrease: dbItem ? Number(dbItem.currentIncrease) || 0 : 0,
                        cumulativeAmount: 0 // 累计库存需要重新计算
                    }
                })
            }
            
            console.log('合并后的数据:', { inventoryData: inventoryData.value })
        }

        // 加载所有月份数据并更新累计库存
        await loadAllMonthsData(targetPeriod)
        updateCumulativeAmounts()

        // 加载主营业务收入数据
        await loadMainBusinessIncomeData(targetPeriod)
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
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_INVENTORY_STATUS}/${targetPeriod}`)
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

// 监听当期数据变化，自动更新累计库存
watch(() => inventoryData.value.items.map(item => item.currentIncrease), () => {
    updateCumulativeAmounts()
}, { deep: true })

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await loadMainBusinessIncomeData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const formData = {
            items: inventoryData.value.items.map(item => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                initialAmount: item.initialAmount,
                currentIncrease: item.currentIncrease || 0,
                cumulativeAmount: item.cumulativeAmount
            }))
        }

        const response = await fetch('http://127.0.0.1:3000/tuoyuan-inventory-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: formData
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_INVENTORY_STATUS, period.value, formData, remarks.value, suggestions.value)
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
    console.log('已重置为初始数据')
}

onMounted(async () => {
    console.log('拓源库存情况组件挂载，当前期间:', period.value)
    resetToDefaultData()
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