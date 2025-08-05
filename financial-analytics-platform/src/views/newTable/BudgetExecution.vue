<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">预算执行情况</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <!-- BudgetExecution -->
        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当月值</th>
                        <th class="border border-gray-300 px-4 py-2">累计值</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
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
                                <span class="w-full px-2 py-1">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonth" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.currentTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatProgress(item.progress) }}
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
                                <span class="w-full px-2 py-1">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonth" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.currentTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatProgress(item.progress) }}
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
                                <span class="w-full px-2 py-1">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMonth" type="number" class="w-full px-2 py-1 border rounded" step="0.01" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.currentTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatProgress(item.progress) }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.yearlyPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentMonth) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentTotal) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatProgress(totalData.progress) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
        </div>
        
        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.BUDGET_EXECUTION"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
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
    yearlyPlan: number;
    currentMonth: number;
    currentTotal: number;
    progress: number;
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
            { customer: '上海', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '国网', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '江苏', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '输配电内配', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '西门子', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '同业', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '用户', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '其它', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 }
        ],
        components: [
            { customer: '用户', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 }
        ],
        engineering: [
            { customer: '一包', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '二包', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '域内合作', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '域外合作', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 },
            { customer: '其它', yearlyPlan: 0, currentMonth: 0, currentTotal: 0, progress: 0 }
        ]
    }
}

// 数据合并函数
const mergeData = (initialData: OrderData, loadedData: any): OrderData => {
    if (!loadedData) return initialData
    
    const mergeItems = (initialItems: OrderItem[], loadedItems: OrderItem[] = []) => {
        return initialItems.map(item => {
            const loaded = loadedItems.find(l => l.customer === item.customer)
            return loaded ? { ...item, ...loaded } : item
        })
    }
    
    return {
        equipment: mergeItems(initialData.equipment, loadedData.equipment),
        components: mergeItems(initialData.components, loadedData.components),
        engineering: mergeItems(initialData.engineering, loadedData.engineering)
    }
}

const orderData = ref<OrderData>(getInitialData())

// 存储所有历史月份数据，用于计算累计值
const allMonthsData = ref<Array<{ period: string; data: OrderData }>>([])

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
                const response = await fetch(`http://127.0.0.1:3000/budget-execution/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.data) {
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

// 计算累计值
const calculateCurrentTotal = (category: 'equipment' | 'components' | 'engineering', customer: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        const categoryData = monthData.data[category]
        if (categoryData) {
            const item = categoryData.find((d: any) => d.customer === customer)
            if (item && item.currentMonth) {
                total += parseFloat(item.currentMonth.toString()) || 0
            }
        }
    }

    // 加上当前月份的输入值
    let currentData: OrderItem[] = []
    if (category === 'equipment') {
        currentData = orderData.value.equipment
    } else if (category === 'components') {
        currentData = orderData.value.components
    } else if (category === 'engineering') {
        currentData = orderData.value.engineering
    }

    const currentItem = currentData.find(d => d.customer === customer)
    if (currentItem && currentItem.currentMonth) {
        total += parseFloat(currentItem.currentMonth.toString()) || 0
    }

    return total
}

// 更新累计值数据
const updateCurrentTotals = () => {
    // 更新设备类别累计值
    orderData.value.equipment.forEach(item => {
        const cumulative = calculateCurrentTotal('equipment', item.customer)
        item.currentTotal = cumulative
    })

    // 更新元件类别累计值
    orderData.value.components.forEach(item => {
        const cumulative = calculateCurrentTotal('components', item.customer)
        item.currentTotal = cumulative
    })

    // 更新工程类别累计值
    orderData.value.engineering.forEach(item => {
        const cumulative = calculateCurrentTotal('engineering', item.customer)
        item.currentTotal = cumulative
    })
}

// 计算单个项目的进度
const calculateProgress = (item: OrderItem) => {
    if (item.yearlyPlan > 0) {
        item.progress = parseFloat(((item.currentTotal / item.yearlyPlan) * 100).toFixed(2))
    } else {
        item.progress = 0
    }
}

// 格式化进度显示
const formatProgress = (progress: number): string => {
    if (isNaN(progress) || progress === null || progress === undefined) {
        return '0.00%'
    }
    return progress.toFixed(2) + '%'
}

// 格式化数字显示
const formatNumber = (num: number): string => {
    if (isNaN(num) || num === null || num === undefined) {
        return '0.00'
    }
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentMonth: 0,
        currentTotal: 0,
        progress: 0
    }
    
    // 计算所有项的总和
    const allItems = [
        ...orderData.value.equipment,
        ...orderData.value.components,
        ...orderData.value.engineering
    ]
    
    allItems.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.currentMonth += item.currentMonth || 0
        total.currentTotal += item.currentTotal || 0
    })
    
    // 计算总进度
    total.progress = total.yearlyPlan > 0 ? (total.currentTotal / total.yearlyPlan * 100) : 0
    total.progress = parseFloat(total.progress.toFixed(2))
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    console.log(`正在加载预算执行数据，期间: ${targetPeriod}`)
    try {
        const response = await fetch(`http://127.0.0.1:3000/budget-execution/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，重置为初始模板')
            // 重置为初始模板数据
            orderData.value = getInitialData()

            // 加载历史数据并更新累计值
            await loadAllMonthsData(targetPeriod)
            updateCurrentTotals()

            // 重新计算所有进度
            orderData.value.equipment.forEach(item => calculateProgress(item))
            orderData.value.components.forEach(item => calculateProgress(item))
            orderData.value.engineering.forEach(item => calculateProgress(item))
            return
        }
        const result = await response.json()
        console.log('加载到的数据:', result)
        
        if (result.data) {
            // 使用数据合并逻辑
            const mergedData = mergeData(getInitialData(), result.data)
            orderData.value = mergedData
            console.log('数据合并完成:', orderData.value)
        }

        // 加载所有月份数据并更新累计值
        await loadAllMonthsData(targetPeriod)
        updateCurrentTotals()

        // 重新计算所有进度
        orderData.value.equipment.forEach(item => calculateProgress(item))
        orderData.value.components.forEach(item => calculateProgress(item))
        orderData.value.engineering.forEach(item => calculateProgress(item))
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载备注信息
const loadRemarksData = async (targetPeriod: string) => {
    try {
        const remarksData = await loadRemarksAndSuggestions(MODULE_IDS.BUDGET_EXECUTION, targetPeriod)
        remarks.value = remarksData.remarks
        suggestions.value = remarksData.suggestions
    } catch (error) {
        console.error('加载备注信息失败:', error)
    }
}

// 监听期间变化
watch(period, (newPeriod) => {
    if (newPeriod) {
        loadData(newPeriod)
        loadRemarksData(newPeriod)
    }
})

// 监听数据变化，自动重新计算累计值和进度
watch(() => orderData.value, () => {
    updateCurrentTotals()
    orderData.value.equipment.forEach(item => calculateProgress(item))
    orderData.value.components.forEach(item => calculateProgress(item))
    orderData.value.engineering.forEach(item => calculateProgress(item))
}, { deep: true })

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
    }
})

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksData()
    }
})

const handleSave = async () => {
    try {
        console.log('=== 开始保存预算执行数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.BUDGET_EXECUTION)
        console.log('表单数据:', orderData.value)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://127.0.0.1:3000/budget-execution', {
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
            throw new Error('保存失败')
        }
        
        const result = await response.json()
        console.log('专用表保存成功:', result)

        // 第二步：记录提交状态
        console.log('步骤2：记录提交状态...')
        console.log('调用参数:', {
            moduleId: MODULE_IDS.BUDGET_EXECUTION,
            period: period.value,
            formData: orderData.value,
            remarks: remarks.value,
            suggestions: suggestions.value
        })
        
        const recordSuccess = await recordFormSubmission(
            MODULE_IDS.BUDGET_EXECUTION,
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
}

onMounted(() => {
    const targetPeriod = route.query.period?.toString() || period.value
    loadData(targetPeriod)
    loadRemarksData(targetPeriod)
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