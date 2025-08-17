<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务——存量订单转收入（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当月转收入</th>
                        <th class="border border-gray-300 px-4 py-2">累计转收入</th>
                        <th class="border border-gray-300 px-4 py-2">往年订单转收入比率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备类别 -->
                    <template v-for="(item, index) in orderData.equipment" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonthIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" min="-999999999" @input="calculateIncomeRate(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatRate(item.incomeRate) }}
                            </td>
                        </tr>
                    </template>

                    <!-- 元件类别 -->
                    <template v-for="(item, index) in orderData.components" :key="`components-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonthIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" min="-999999999" @input="calculateIncomeRate(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatRate(item.incomeRate) }}
                            </td>
                        </tr>
                    </template>

                    <!-- 工程类别 -->
                    <template v-for="(item, index) in orderData.engineering" :key="`engineering-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="orderData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber((item.yearlyPlan || 0) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(((item.yearlyPlan || 0) / 2) / 2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonthIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" min="-999999999" @input="calculateIncomeRate(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatRate(item.incomeRate) }}
                            </td>
                        </tr>
                    </template>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2">{{ formatNumber(totalYearlyPlan / 2) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ formatNumber(totalYearlyPlan / 4) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ formatNumber(totalCurrentMonthIncome) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ formatNumber(totalIncomeTotal) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ formatRate(totalIncomeRate) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.STOCK_ORDER_TO_INCOME"
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
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface OrderItem {
    customer: string;
    stockOrder: number;
    currentMonthIncome: number;
    incomeTotal: number;
    incomeRate: number;
    yearlyPlan?: number;
}

interface OrderData {
    equipment: OrderItem[];
    components: OrderItem[];
    engineering: OrderItem[];
}

// 初始数据模板（当没有数据时使用）
const getInitialData = (): OrderData => ({
    equipment: [
        { customer: '上海', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '国网', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '江苏', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '输配电内配', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '西门子', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '同业', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 }
    ],
    components: [
        { customer: '用户', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 }
    ],
    engineering: [
        { customer: '一包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '二包', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '域内合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '域外合作', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 },
        { customer: '其它', stockOrder: 0, currentMonthIncome: 0, incomeTotal: 0, incomeRate: 0 }
    ]
})

const orderData = ref<OrderData>(getInitialData())

// 存储所有历史月份数据，用于计算累计收入
const allMonthsData = ref<Array<{ period: string; data: OrderData }>>([])

// 数字格式化函数
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 比率格式化函数
const formatRate = (rate: number): string => {
    if (isNaN(rate) || rate === null || rate === undefined) {
        return '0.00%';
    }
    return rate.toFixed(2) + '%';
}

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: OrderData }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))

        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/stock-order-to-income/${monthPeriod}`)
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

// 计算累计转收入
const calculateIncomeTotal = (category: 'equipment' | 'components' | 'engineering', customer: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        const categoryData = monthData.data[category]
        if (categoryData) {
            const item = categoryData.find(d => d.customer === customer)
            if (item && item.currentMonthIncome !== null && item.currentMonthIncome !== undefined) {
                total += item.currentMonthIncome
            }
        }
    }

    // 加上当前月份的输入值
    const currentCategoryData = orderData.value[category]
    const currentItem = currentCategoryData.find(d => d.customer === customer)
    if (currentItem && currentItem.currentMonthIncome !== null && currentItem.currentMonthIncome !== undefined) {
        total += currentItem.currentMonthIncome
    }

    return total
}

// 更新累计转收入数据
const updateIncomeTotal = () => {
    // 更新设备板块累计转收入
    orderData.value.equipment.forEach(item => {
        item.incomeTotal = parseFloat(calculateIncomeTotal('equipment', item.customer).toFixed(2))
    })

    // 更新元件板块累计转收入
    orderData.value.components.forEach(item => {
        item.incomeTotal = parseFloat(calculateIncomeTotal('components', item.customer).toFixed(2))
    })

    // 更新工程板块累计转收入
    orderData.value.engineering.forEach(item => {
        item.incomeTotal = parseFloat(calculateIncomeTotal('engineering', item.customer).toFixed(2))
    })
}

// 自动计算转收入比率
const calculateIncomeRate = (item: OrderItem) => {
    // 先更新累计转收入
    updateIncomeTotal()

    if (item.stockOrder > 0) {
        item.incomeRate = parseFloat(((item.incomeTotal / item.stockOrder) * 100).toFixed(2));
    } else {
        item.incomeRate = 0;
    }
};

// 计算总的年度计划
const totalYearlyPlan = computed(() => {
    const allItems = [...orderData.value.equipment, ...orderData.value.components, ...orderData.value.engineering];
    return allItems.reduce((sum, item) => sum + (Number(item.yearlyPlan) || 0), 0);
});

// 计算总的年初存量订单余额
const totalStockOrder = computed(() => {
    const allItems = [...orderData.value.equipment, ...orderData.value.components, ...orderData.value.engineering];
    return allItems.reduce((sum, item) => sum + (Number(item.stockOrder) || 0), 0);
});

// 计算总的当月转收入
const totalCurrentMonthIncome = computed(() => {
    const allItems = [...orderData.value.equipment, ...orderData.value.components, ...orderData.value.engineering];
    return allItems.reduce((sum, item) => sum + (Number(item.currentMonthIncome) || 0), 0);
});

// 计算总的累计转收入
const totalIncomeTotal = computed(() => {
    const allItems = [...orderData.value.equipment, ...orderData.value.components, ...orderData.value.engineering];
    return allItems.reduce((sum, item) => sum + (Number(item.incomeTotal) || 0), 0);
});

// 计算总的转收入比率
const totalIncomeRate = computed(() => {
    if (totalStockOrder.value > 0) {
        return parseFloat(((totalIncomeTotal.value / totalStockOrder.value) * 100).toFixed(2));
    }
    return 0;
});

// 监听数据变化，自动计算比率
watch(() => orderData.value, () => {
    orderData.value.equipment.forEach(item => calculateIncomeRate(item));
    orderData.value.components.forEach(item => calculateIncomeRate(item));
    orderData.value.engineering.forEach(item => calculateIncomeRate(item));
}, { deep: true });

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: OrderData, loadedData: OrderData): OrderData => {
    if (!loadedData || typeof loadedData !== 'object') {
        return templateData
    }
    
    const result = JSON.parse(JSON.stringify(templateData))
    
    // 合并设备数据
    if (Array.isArray(loadedData.equipment)) {
        result.equipment = result.equipment.map((templateItem: OrderItem) => {
            const loadedItem = loadedData.equipment.find((item: OrderItem) => item.customer === templateItem.customer)
            return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
        })
    }
    
    // 合并元件数据
    if (Array.isArray(loadedData.components)) {
        result.components = result.components.map((templateItem: OrderItem) => {
            const loadedItem = loadedData.components.find((item: OrderItem) => item.customer === templateItem.customer)
            return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
        })
    }
    
    // 合并工程数据
    if (Array.isArray(loadedData.engineering)) {
        result.engineering = result.engineering.map((templateItem: OrderItem) => {
            const loadedItem = loadedData.engineering.find((item: OrderItem) => item.customer === templateItem.customer)
            return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
        })
    }
    
    return result
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载存量订单转收入数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/stock-order-to-income/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持年度计划但清空当月转收入')
                // 保持现有的年度计划值，但将当月转收入重置为0
                orderData.value.equipment.forEach(item => {
                    item.stockOrder = 0
                    item.currentMonthIncome = 0
                    item.incomeRate = 0
                })
                orderData.value.components.forEach(item => {
                    item.stockOrder = 0
                    item.currentMonthIncome = 0
                    item.incomeRate = 0
                })
                orderData.value.engineering.forEach(item => {
                    item.stockOrder = 0
                    item.currentMonthIncome = 0
                    item.incomeRate = 0
                })

                // 加载所有月份数据并更新累计转收入
                await loadAllMonthsData(targetPeriod)
                updateIncomeTotal()
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始处理...')
            // 直接使用API返回的数据，因为已经包含预算信息
            orderData.value = result.data
            console.log('API数据:', orderData.value)
        }

        // 加载所有月份数据并更新累计转收入
        await loadAllMonthsData(targetPeriod)
        updateIncomeTotal()

        // 重新计算所有比率
        orderData.value.equipment.forEach(item => calculateIncomeRate(item));
        orderData.value.components.forEach(item => calculateIncomeRate(item));
        orderData.value.engineering.forEach(item => calculateIncomeRate(item));
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksData()
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData()
})

const handleSave = async () => {
    try {
        console.log('=== 开始保存存量订单转收入数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.STOCK_ORDER_TO_INCOME)
        console.log('表单数据:', orderData.value)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://47.111.95.19:3000/stock-order-to-income', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: orderData.value
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('专用表保存失败，响应:', errorText)
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }
        
        const result = await response.json()
        console.log('专用表保存成功:', result)

        // 第二步：记录提交状态
        console.log('步骤2：记录提交状态...')
        console.log('调用参数:', {
            moduleId: MODULE_IDS.STOCK_ORDER_TO_INCOME,
            period: period.value,
            formData: orderData.value,
            remarks: remarks.value,
            suggestions: suggestions.value
        })
        
        const recordSuccess = await recordFormSubmission(
            MODULE_IDS.STOCK_ORDER_TO_INCOME, 
            period.value, 
            orderData.value, 
            remarks.value, 
            suggestions.value
        )
        
        console.log('提交状态记录结果:', recordSuccess)
        
        if (recordSuccess) {
            console.log('=== 保存完成，所有步骤成功 ===')
            alert('保存成功')
        } else {
            console.warn('=== 专用表保存成功，但提交状态记录失败 ===')
            alert('保存成功，但提交状态记录失败')
        }
    } catch (error) {
        console.error('=== 保存过程中发生错误 ===', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    orderData.value = getInitialData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.STOCK_ORDER_TO_INCOME, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('存量订单转收入组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
    loadRemarksData()
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