<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务——当年订单转收入（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">当年新签订单累计</th>
                        <th class="border border-gray-300 px-4 py-2">当期转收入</th>
                        <th class="border border-gray-300 px-4 py-2">累计转收入</th>
                        <th class="border border-gray-300 px-4 py-2">当年订单转收入比率</th>
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
                                {{ item.signedOrder.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.incomeRate }}%
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
                                {{ item.signedOrder.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.incomeRate }}%
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
                                {{ item.signedOrder.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentIncome" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.incomeTotal || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.incomeRate }}%
                            </td>
                        </tr>
                    </template>
                    
                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2">{{ totalData.signedOrder.toFixed(2) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ totalData.currentIncome.toFixed(2) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ totalData.incomeTotal.toFixed(2) }}</td>
                        <td class="border border-gray-300 px-4 py-2">{{ totalData.incomeRate.toFixed(2) }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.ORDER_TO_INCOME"
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
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface OrderItem {
    customer: string;
    signedOrder: number;
    currentIncome: number;
    incomeTotal: number;
    incomeRate: number;
}

interface OrderData {
    equipment: OrderItem[];
    components: OrderItem[];
    engineering: OrderItem[];
}

// 获取初始数据模板
const getInitialData = (): OrderData => {
    return {
        equipment: [
            { customer: '上海', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '国网', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '江苏', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '输配电内配', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '西门子', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '同业', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '用户', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '其它', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
        ],
        components: [
            { customer: '用户', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
        ],
        engineering: [
            { customer: '一包', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '二包', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '域内合作', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '域外合作', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 },
            { customer: '其它', signedOrder: 0.00, currentIncome: 0.00, incomeTotal: 0.00, incomeRate: 0.00 }
        ]
    }
}

// 数据合并函数
const mergeData = (defaultData: OrderData, savedData: OrderData): OrderData => {
    const merged = JSON.parse(JSON.stringify(defaultData))
    
    // 合并设备数据
    if (savedData.equipment) {
        merged.equipment.forEach((item, index) => {
            if (savedData.equipment[index]) {
                Object.assign(item, savedData.equipment[index])
            }
        })
    }
    
    // 合并元件数据
    if (savedData.components) {
        merged.components.forEach((item, index) => {
            if (savedData.components[index]) {
                Object.assign(item, savedData.components[index])
            }
        })
    }
    
    // 合并工程数据
    if (savedData.engineering) {
        merged.engineering.forEach((item, index) => {
            if (savedData.engineering[index]) {
                Object.assign(item, savedData.engineering[index])
            }
        })
    }
    
    return merged
}

const orderData = ref<OrderData>(getInitialData())

// 存储所有历史月份数据，用于计算累计转收入
const allMonthsData = ref<Array<{ period: string; data: OrderData }>>([])

// 数字格式化函数
const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 加载新签订单数据获取当年新签订单累计
const loadNewOrdersCumulativeData = async (currentPeriod: string) => {
    try {
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))
        
        // 客户名称映射（从newOrder.vue到OrderToIncome.vue）
        const customerMapping = {
            '上海项目': '上海',
            '国网项目': '国网', 
            '江苏项目': '江苏',
            '输配电内配': '输配电内配',
            '西门子项目': '西门子',
            '同业项目': '同业',
            '用户项目': '用户',
            '其它项目': '其它',
            '一包项目': '一包',
            '二包项目': '二包',
            '域内合作项目': '域内合作',
            '域外合作项目': '域外合作'
        }
        
        // 从年初到当前月份累计获取新签订单数据
        for (let month = 1; month <= currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/new-orders/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        const newOrderData = result.data
                        
                        // 更新设备类别的新签订单累计
                        if (newOrderData.equipment) {
                            newOrderData.equipment.forEach((item: any) => {
                                const mappedCustomer = customerMapping[item.customer as keyof typeof customerMapping]
                                if (mappedCustomer) {
                                    const orderItem = orderData.value.equipment.find(o => o.customer === mappedCustomer)
                                    if (orderItem) {
                                        orderItem.signedOrder = item.cumulativeTotal || 0
                                    }
                                }
                            })
                        }
                        
                        // 更新元件类别的新签订单累计
                        if (newOrderData.components) {
                            newOrderData.components.forEach((item: any) => {
                                const mappedCustomer = customerMapping[item.customer as keyof typeof customerMapping]
                                if (mappedCustomer) {
                                    const orderItem = orderData.value.components.find(o => o.customer === mappedCustomer)
                                    if (orderItem) {
                                        orderItem.signedOrder = item.cumulativeTotal || 0
                                    }
                                }
                            })
                        }
                        
                        // 更新工程类别的新签订单累计
                        if (newOrderData.engineering) {
                            newOrderData.engineering.forEach((item: any) => {
                                const mappedCustomer = customerMapping[item.customer as keyof typeof customerMapping]
                                if (mappedCustomer) {
                                    const orderItem = orderData.value.engineering.find(o => o.customer === mappedCustomer)
                                    if (orderItem) {
                                        orderItem.signedOrder = item.cumulativeTotal || 0
                                    }
                                }
                            })
                        }
                    }
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error)
            }
        }
        
        console.log('已更新新签订单累计数据:', orderData.value)
    } catch (error) {
        console.error('加载新签订单累计数据失败:', error)
    }
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
                const response = await fetch(`http://47.111.95.19:3000/order-to-income/${monthPeriod}`)
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
            if (item && item.currentIncome) {
                total += item.currentIncome
            }
        }
    }

    // 加上当前月份的输入值
    const currentCategoryData = orderData.value[category]
    const currentItem = currentCategoryData.find(d => d.customer === customer)
    if (currentItem && currentItem.currentIncome) {
        total += currentItem.currentIncome
    }

    return total
}

// 更新累计转收入数据
const updateIncomeTotal = () => {
    // 更新设备板块累计转收入
    orderData.value.equipment.forEach(item => {
        item.incomeTotal = calculateIncomeTotal('equipment', item.customer)
    })

    // 更新元件板块累计转收入
    orderData.value.components.forEach(item => {
        item.incomeTotal = calculateIncomeTotal('components', item.customer)
    })

    // 更新工程板块累计转收入
    orderData.value.engineering.forEach(item => {
        item.incomeTotal = calculateIncomeTotal('engineering', item.customer)
    })
}

// 自动计算转收入比率
const calculateIncomeRate = (item: OrderItem) => {
    // 先更新累计转收入
    updateIncomeTotal()

    if (item.signedOrder > 0) {
        item.incomeRate = parseFloat(((item.incomeTotal / item.signedOrder) * 100).toFixed(2));
    } else {
        item.incomeRate = 0;
    }
};

// 监听当期转收入累计的变化，自动计算比率
watch(() => orderData.value, () => {
    orderData.value.equipment.forEach(item => calculateIncomeRate(item));
    orderData.value.components.forEach(item => calculateIncomeRate(item));
    orderData.value.engineering.forEach(item => calculateIncomeRate(item));
}, { deep: true });

// 计算合计数据
const totalData = computed(() => {
    const total = {
        signedOrder: 0,
        currentIncome: 0,
        incomeTotal: 0,
        incomeRate: 0
    }

    // 计算所有项的总和
    const allItems = [
        ...orderData.value.equipment,
        ...orderData.value.components,
        ...orderData.value.engineering
    ]

    allItems.forEach(item => {
        total.signedOrder += item.signedOrder || 0;
        total.currentIncome += item.currentIncome || 0;
        total.incomeTotal += item.incomeTotal || 0;
    });

    // 计算总转收入比率
    total.incomeRate = total.signedOrder > 0 ? parseFloat(((total.incomeTotal / total.signedOrder) * 100).toFixed(2)) : 0;

    return total;
});

// 加载备注数据
const loadRemarksData = async (targetPeriod: string) => {
    try {
        const result = await loadRemarksAndSuggestions(MODULE_IDS.ORDER_TO_INCOME, targetPeriod)
        remarks.value = result.remarks || ''
        suggestions.value = result.suggestions || ''
    } catch (error) {
        console.error('加载备注和建议失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    console.log('开始加载订单转收入数据:', targetPeriod)
    try {
        // 先加载专用表数据
        const response = await fetch(`http://47.111.95.19:3000/order-to-income/${targetPeriod}`)
        let businessData = null
        if (response.ok) {
            const result = await response.json()
            businessData = result.data
            console.log('专用表数据:', businessData)
        }
        
        // 再加载form_submissions表数据
        const formResponse = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.ORDER_TO_INCOME}/${targetPeriod}`)
        let formData = null
        if (formResponse.ok) {
            const formResult = await formResponse.json()
            formData = formResult.data?.formData
            console.log('系统表数据:', formData)
        }
        
        // 合并数据：专用表优先，系统表补充
        const finalData = businessData || formData
        if (finalData) {
            orderData.value = mergeData(getInitialData(), finalData)
            console.log('合并后数据:', orderData.value)
        } else {
            orderData.value = getInitialData()
            console.log('使用默认数据')
        }

        // 加载新签订单累计数据
        await loadNewOrdersCumulativeData(targetPeriod)
        
        // 加载所有月份数据并更新累计转收入
        await loadAllMonthsData(targetPeriod)
        updateIncomeTotal()
    } catch (error) {
        console.error('加载数据失败:', error)
        orderData.value = getInitialData()

        // 即使出错也要尝试加载历史数据
        try {
            await loadNewOrdersCumulativeData(targetPeriod)
            await loadAllMonthsData(targetPeriod)
            updateIncomeTotal()
        } catch (historyError) {
            console.error('加载历史数据失败:', historyError)
        }
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksData(newPeriod.toString())
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData(newPeriod)
})

const handleSave = async () => {
    try {
        // 双重保存：专用表 + 系统表
        const saveBusinessData = async () => {
            const response = await fetch('http://47.111.95.19:3000/order-to-income', {
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
                throw new Error('保存专用表失败')
            }
        }
        
        // 先保存专用表数据
        await saveBusinessData()
        
        // 再记录系统表单提交
        await recordFormSubmission(
            MODULE_IDS.ORDER_TO_INCOME,
            period.value,
            orderData.value,
            remarks.value,
            suggestions.value
        )

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    orderData.value = getInitialData()
    remarks.value = ''
    suggestions.value = ''
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksData(route.query.period.toString())
    } else {
        loadData(period.value)
        loadRemarksData(period.value)
    }
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