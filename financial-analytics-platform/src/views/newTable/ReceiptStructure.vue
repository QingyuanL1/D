<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">收款结构与质量（单位：万元）</h1>
            <div class="text-gray-500">(按年度计划口径分解)</div>
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
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期收款</th>
                        <th class="border border-gray-300 px-4 py-2">累计收款</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="equipmentData.length">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="w-full px-2 py-1">{{ item.plan }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 元件板块 -->
                    <template v-for="(item, index) in componentData" :key="`component-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="componentData.length">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="w-full px-2 py-1">{{ item.plan }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 工程板块 -->
                    <template v-for="(item, index) in projectData" :key="`project-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="projectData.length">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="w-full px-2 py-1">{{ item.plan }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentReceipt" type="text" class="w-full px-2 py-1 border rounded" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.plan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentReceipt) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.actual) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.progress }}
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
            :module-id="MODULE_IDS.RECEIPT_STRUCTURE"
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
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface ReceiptItem {
    customerType: string;
    plan: string;
    currentReceipt: string;
    actual: string;
    progress: string;
    yearlyPlan?: number;
}

// 初始数据模板（当没有数据时使用）
// 注意：预算数据由后端中间件从数据库动态获取，不在前端写死

const getInitialEquipmentData = (): ReceiptItem[] => [
    { customerType: '上海', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '国网', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '江苏', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '输配电内配', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '西门子', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '同业', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '用户', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '其它', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' }
]

const getInitialComponentData = (): ReceiptItem[] => [
    { customerType: '用户', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' }
]

const getInitialProjectData = (): ReceiptItem[] => [
    { customerType: '一包', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '二包', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '域内合作', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '域外合作', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' },
    { customerType: '其它', plan: '0', currentReceipt: '0', actual: '0', progress: '0.00%' }
]

const equipmentData = ref<ReceiptItem[]>(getInitialEquipmentData())
const componentData = ref<ReceiptItem[]>(getInitialComponentData())
const projectData = ref<ReceiptItem[]>(getInitialProjectData())

// 存储所有历史月份数据，用于计算累计收款
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
                const response = await fetch(`http://47.111.95.19:3000/receipt-structure/${monthPeriod}`)
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

// 计算累计收款
const calculateAccumulatedReceipt = (category: 'equipment' | 'component' | 'project', customerType: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        let categoryData: any[] = []

        if (category === 'equipment') {
            categoryData = monthData.data.filter((item: any) => item.segment === '设备')
        } else if (category === 'component') {
            categoryData = monthData.data.filter((item: any) => item.segment === '元件')
        } else if (category === 'project') {
            categoryData = monthData.data.filter((item: any) => item.segment === '工程')
        }

        const item = categoryData.find((d: any) => d.customerType === customerType)
        if (item && item.currentReceipt) {
            total += parseFloat(item.currentReceipt.toString().replace(/,/g, '')) || 0
        }
    }

    // 加上当前月份的输入值
    let currentData: ReceiptItem[] = []
    if (category === 'equipment') {
        currentData = equipmentData.value
    } else if (category === 'component') {
        currentData = componentData.value
    } else if (category === 'project') {
        currentData = projectData.value
    }

    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem && currentItem.currentReceipt) {
        total += parseFloat(currentItem.currentReceipt.toString().replace(/,/g, '')) || 0
    }

    return total
}

// 更新累计收款数据
const updateAccumulatedReceipts = () => {
    // 更新设备板块累计收款
    equipmentData.value.forEach(item => {
        const accumulated = calculateAccumulatedReceipt('equipment', item.customerType)
        item.actual = accumulated.toFixed(2)
    })

    // 更新元件板块累计收款
    componentData.value.forEach(item => {
        const accumulated = calculateAccumulatedReceipt('component', item.customerType)
        item.actual = accumulated.toFixed(2)
    })

    // 更新工程板块累计收款
    projectData.value.forEach(item => {
        const accumulated = calculateAccumulatedReceipt('project', item.customerType)
        item.actual = accumulated.toFixed(2)
    })
}

// 计算执行进度
const calculateProgress = (item: ReceiptItem) => {
    // 移除逗号并转换为数字
    const plan = parseFloat(item.plan.replace(/,/g, ''))
    const actual = parseFloat(item.actual.replace(/,/g, ''))
    
    if (!isNaN(plan) && !isNaN(actual) && plan !== 0) {
        const progress = (actual / plan * 100).toFixed(2)
        item.progress = `${progress}%`
    } else if (actual > 0) {
        item.progress = '0.00%'
    } else {
        item.progress = '0.00%'
    }
}

// 计算合计数据
const totalData = computed(() => {
    let totalPlan = 0
    let totalCurrentReceipt = 0
    let totalActual = 0

    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentReceipt += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })

    // 汇总元件板块数据
    componentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentReceipt += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })

    // 汇总工程板块数据
    projectData.value.forEach(item => {
        totalPlan += parseFloat(item.plan.replace(/,/g, '')) || 0
        totalCurrentReceipt += parseFloat(item.currentReceipt.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual.replace(/,/g, '')) || 0
    })
    
    // 计算总执行进度
    let progress = '0.00%'
    if (totalPlan !== 0) {
        progress = `${(totalActual / totalPlan * 100).toFixed(2)}%`
    }
    
    return {
        plan: totalPlan,
        currentReceipt: totalCurrentReceipt,
        actual: totalActual,
        progress
    }
})

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: ReceiptItem[], loadedData: any[], segment: string): ReceiptItem[] => {
    return templateData.map(templateItem => {
        const loadedItem = loadedData?.find(item => item.segment === segment && item.customerType === templateItem.customerType)

        if (loadedItem) {
            return {
                customerType: templateItem.customerType,
                // 使用后端返回的预算数据作为年度计划
                plan: loadedItem.yearlyPlan?.toString() || '0',
                currentReceipt: loadedItem.currentReceipt || '0',
                actual: loadedItem.actual || '0',
                progress: loadedItem.progress || '0.00%',
                yearlyPlan: loadedItem.yearlyPlan || 0
            }
        } else {
            // 没有实际数据时，尝试从预算中间件返回的数据中查找预算信息
            // 预算中间件会为空数据也附加预算信息
            const budgetItem = loadedData?.find(item =>
                (item.segment === segment || item.category === segment) &&
                (item.customerType === templateItem.customerType || item.customer === templateItem.customerType)
            )

            return {
                customerType: templateItem.customerType,
                plan: budgetItem?.yearlyPlan?.toString() || templateItem.plan || '0',
                currentReceipt: '0',
                actual: '0',
                progress: '0.00%',
                yearlyPlan: budgetItem?.yearlyPlan || 0
            }
        }
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载收款结构数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/receipt-structure/${targetPeriod}`)
        let loadedData: any[] = []
        
        if (response.ok) {
            const result = await response.json()
            console.log('API返回数据:', result)
            
            if (result.success && result.data && Array.isArray(result.data)) {
                loadedData = result.data
                console.log('成功获取数据，开始合并...')
            }
        } else if (response.status === 404) {
            console.log('该期间暂无数据，使用预算数据初始化')
            // 404时使用空数据，让mergeData函数处理预算数据的加载
            loadedData = []
        } else {
            console.log('加载数据失败，使用预算数据填充')
        }
        
        // 无论是否有数据，都进行合并（确保预算数据始终显示）
        equipmentData.value = mergeData(getInitialEquipmentData(), loadedData, '设备')
        componentData.value = mergeData(getInitialComponentData(), loadedData, '元件')
        projectData.value = mergeData(getInitialProjectData(), loadedData, '工程')
        console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })

        // 加载所有月份数据并更新累计收款
        await loadAllMonthsData(targetPeriod)
        updateAccumulatedReceipts()

    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        equipmentData.value = mergeData(getInitialEquipmentData(), [], '设备')
        componentData.value = mergeData(getInitialComponentData(), [], '元件')
        projectData.value = mergeData(getInitialProjectData(), [], '工程')

        // 即使出错也要尝试加载历史数据
        try {
            await loadAllMonthsData(targetPeriod)
            updateAccumulatedReceipts()
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
        // 准备要保存的数据
        const allData = [
            ...equipmentData.value.map(item => ({ ...item, segment: '设备' })),
            ...componentData.value.map(item => ({ ...item, segment: '元件' })),
            ...projectData.value.map(item => ({ ...item, segment: '工程' }))
        ]

        const saveData = {
            period: period.value,
            data: allData
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 receipt_structure 表
        const response = await fetch('http://47.111.95.19:3000/receipt-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        const formData = {
            equipment: equipmentData.value,
            component: componentData.value,
            project: projectData.value
        }
        await recordFormSubmission(MODULE_IDS.RECEIPT_STRUCTURE, period.value, formData, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    equipmentData.value = getInitialEquipmentData()
    componentData.value = getInitialComponentData()
    projectData.value = getInitialProjectData()
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.RECEIPT_STRUCTURE, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
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

// 监听数据变化，自动更新累计收款和进度
watch([equipmentData, componentData, projectData], () => {
    updateAccumulatedReceipts()

    // 更新所有项目的执行进度
    equipmentData.value.forEach(item => calculateProgress(item))
    componentData.value.forEach(item => calculateProgress(item))
    projectData.value.forEach(item => calculateProgress(item))
}, { deep: true })

onMounted(() => {
    console.log('组件挂载，当前期间:', period.value)
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