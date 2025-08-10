<template>
    <div class="project-tracking-container">
        <div class="mx-auto bg-white rounded-lg shadow-lg">
            <!-- 标题区域 -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <h1 class="text-2xl font-bold">项目跟踪情况(主表)（单位：万元）:</h1>
                    <div class="flex items-center space-x-4">
                        <input v-model="period" type="month"
                            class="px-4 py-2 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>
            </div>

            <!-- 表格区域 -->
            <div class="p-6">
                <div class="overflow-x-auto rounded-lg border border-gray-300">
                    <table class="w-full border-collapse text-base">
                        <thead class="sticky top-0 bg-white shadow-sm z-10">
                            <tr class="bg-gray-50">
                                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-600">
                                    板块
                                </th>
                                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-600">
                                    客户属性
                                </th>
                                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-600">
                                    年度计划
                                </th>
                                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-600">
                                    当期
                                </th>
                                <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-600">
                                    执行进度
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- 设备板块 -->
                            <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                                <tr>
                                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center font-medium" 
                                        :rowspan="equipmentData.length">
                                        设备
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-center">{{ item.customerType }}</td>
                                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                        {{ formatNumber(item.yearlyPlan) }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        <input v-model.number="item.currentPeriod" type="number"
                                            class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        {{ calculateProgress(item.currentPeriod, item.yearlyPlan) }}
                                    </td>
                                </tr>
                            </template>

                            <!-- 元件板块 -->
                            <template v-for="(item, index) in componentData" :key="`component-${index}`">
                                <tr>
                                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center font-medium" 
                                        :rowspan="componentData.length">
                                        元件
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-center">{{ item.customerType }}</td>
                                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                        {{ formatNumber(item.yearlyPlan) }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        <input v-model.number="item.currentPeriod" type="number"
                                            class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        {{ calculateProgress(item.currentPeriod, item.yearlyPlan) }}
                                    </td>
                                </tr>
                            </template>

                            <!-- 工程板块 -->
                            <template v-for="(item, index) in engineeringData" :key="`engineering-${index}`">
                                <tr>
                                    <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center font-medium" 
                                        :rowspan="engineeringData.length">
                                        工程
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-center">{{ item.customerType }}</td>
                                    <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                        {{ formatNumber(item.yearlyPlan) }}
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        <input v-model.number="item.currentPeriod" type="number"
                                            class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                                    </td>
                                    <td class="border border-gray-300 px-4 py-2 text-right">
                                        {{ calculateProgress(item.currentPeriod, item.yearlyPlan) }}
                                    </td>
                                </tr>
                            </template>

                            <!-- 合计行 -->
                            <tr class="bg-gray-50 font-bold">
                                <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(totalYearlyPlan) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(totalCurrentPeriod) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ calculateProgress(totalCurrentPeriod, totalYearlyPlan) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 按钮区域 -->
            <div class="p-6 border-t border-gray-200">
                <div class="flex justify-end space-x-4">
                    <button @click="handleSave"
                        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        保存
                    </button>
                    <button @click="handleReset"
                        class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        重置
                    </button>
                </div>
            </div>

            <!-- 附件和备注组件 -->
            <FormAttachmentAndRemarks
              :module-id="moduleId"
              :period="period"
              v-model:remarks="remarks"
              v-model:suggestions="suggestions"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.PROJECT_TRACKING
const remarks = ref('')
const suggestions = ref('')

interface ProjectItem {
    customerType: string;
    yearlyPlan: number;
    currentPeriod: number;
    currentTotal: number;
}

// 初始数据模板（静态写死年度计划）
const getInitialEquipmentData = (): ProjectItem[] => [
    { customerType: '上海', yearlyPlan: 500000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '国网', yearlyPlan: 1050000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '江苏', yearlyPlan: 300000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '输配电内配', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '西门子', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '同业', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '用户', yearlyPlan: 20000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '其它', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 }
]

const getInitialComponentData = (): ProjectItem[] => [
    { customerType: '用户', yearlyPlan: 0.00, currentPeriod: 0, currentTotal: 0 }
]

const getInitialEngineeringData = (): ProjectItem[] => [
    { customerType: '一包', yearlyPlan: 150000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '二包', yearlyPlan: 600.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '域内合作', yearlyPlan: 95000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '域外合作', yearlyPlan: 5000.00, currentPeriod: 0, currentTotal: 0 },
    { customerType: '其它', yearlyPlan: 2000.00, currentPeriod: 0, currentTotal: 0 }
]

// 响应式数据（初始为空，等待从后端加载）
const equipmentData = ref<ProjectItem[]>(getInitialEquipmentData())
const componentData = ref<ProjectItem[]>(getInitialComponentData())
const engineeringData = ref<ProjectItem[]>(getInitialEngineeringData())

// 计算总计
const totalYearlyPlan = computed(() => {
    return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
        .reduce((sum, item) => sum + (item.yearlyPlan || 0), 0)
})

const totalCurrentPeriod = computed(() => {
    return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
        .reduce((sum, item) => sum + (item.currentPeriod || 0), 0)
})

const totalCurrentTotal = computed(() => {
    return [...equipmentData.value, ...componentData.value, ...engineeringData.value]
        .reduce((sum, item) => sum + (item.currentTotal || 0), 0)
})

// 存储所有历史月份数据，用于计算累计
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

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
                const response = await fetch(`http://47.111.95.19:3000/project-tracking/${monthPeriod}`)
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

// 计算累计
const calculateCurrentTotal = (category: string, customerType: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.data[category]) {
            const item = monthData.data[category].find((d: any) => d.customerType === customerType)
            if (item && item.currentPeriod) {
                total += parseFloat(item.currentPeriod.toString()) || 0
            }
        }
    }

    // 加上当前月份的输入值
    let currentData: ProjectItem[] = []
    if (category === 'equipment') {
        currentData = equipmentData.value
    } else if (category === 'component') {
        currentData = componentData.value
    } else if (category === 'engineering') {
        currentData = engineeringData.value
    }

    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem && currentItem.currentPeriod) {
        total += parseFloat(currentItem.currentPeriod.toString()) || 0
    }

    return total
}

// 更新累计数据
const updateCurrentTotals = () => {
    // 更新设备类别累计
    equipmentData.value.forEach(item => {
        const cumulative = calculateCurrentTotal('equipment', item.customerType)
        item.currentTotal = cumulative
    })

    // 更新元件类别累计
    componentData.value.forEach(item => {
        const cumulative = calculateCurrentTotal('component', item.customerType)
        item.currentTotal = cumulative
    })

    // 更新工程类别累计
    engineeringData.value.forEach(item => {
        const cumulative = calculateCurrentTotal('engineering', item.customerType)
        item.currentTotal = cumulative
    })
}

// 计算执行进度（显示用）
const calculateProgress = (current: number, plan: number): string => {
    if (!plan || plan === 0) return '0.00%'
    const percentage = (current / plan) * 100
    return `${percentage.toFixed(2)}%`
}

// 计算执行进度（数值用于保存到数据库）
const calculateProgressNumber = (current: number, plan: number): number => {
    if (!plan || plan === 0) return 0
    return (current / plan) * 100
}

// 格式化数字
const formatNumber = (num: number): string => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 合并数据：加载当期数据，年度计划保持静态，累计需要重新计算
const mergeData = (templateData: ProjectItem[], loadedData: any[]): ProjectItem[] => {
    return templateData.map(templateItem => {
        const loadedItem = loadedData.find(item => item.customerType === templateItem.customerType)
        if (loadedItem) {
            console.log(`匹配成功: ${templateItem.customerType} -> 当期: ${loadedItem.currentPeriod}`)
            return {
                customerType: templateItem.customerType,
                yearlyPlan: templateItem.yearlyPlan, // 使用静态数据
                currentPeriod: Number(loadedItem.currentPeriod) || 0,  // 加载当期数据
                currentTotal: 0  // 累计需要重新计算
            }
        } else {
            console.log(`未匹配到数据: ${templateItem.customerType}`)
            return templateItem
        }
    })
}

// 加载数据 - 从 project_tracking 表读取
const loadData = async (targetPeriod: string) => {
    try {
        const apiUrl = `http://47.111.95.19:3000/project-tracking/${targetPeriod}`
        console.log(`正在加载期间 ${targetPeriod} 的数据...`)
        console.log(`API URL: ${apiUrl}`)
        
        // 使用 project_tracking API 读取数据
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        
        console.log('HTTP响应状态:', response.status)
        console.log('HTTP响应头:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，重置为初始模板')
                equipmentData.value = getInitialEquipmentData()
                componentData.value = getInitialComponentData()
                engineeringData.value = getInitialEngineeringData()

                // 加载历史数据并更新累计
                await loadAllMonthsData(targetPeriod)
                updateCurrentTotals()
                return
            }
            const errorText = await response.text()
            console.error(`HTTP错误 ${response.status}:`, errorText)
            throw new Error(`加载数据失败: ${response.status} - ${errorText}`)
        }
        
        const result = await response.json()
        console.log('API返回的完整数据:', JSON.stringify(result, null, 2)) // 调试用
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始处理...')
            
            // 合并设备数据
            if (result.data.equipment && Array.isArray(result.data.equipment) && result.data.equipment.length > 0) {
                console.log('处理设备数据:', result.data.equipment)
                equipmentData.value = mergeData(getInitialEquipmentData(), result.data.equipment)
            }
            
            // 合并元件数据  
            if (result.data.component && Array.isArray(result.data.component) && result.data.component.length > 0) {
                console.log('处理元件数据:', result.data.component)
                componentData.value = mergeData(getInitialComponentData(), result.data.component)
            }
            
            // 合并工程数据
            if (result.data.engineering && Array.isArray(result.data.engineering) && result.data.engineering.length > 0) {
                console.log('处理工程数据:', result.data.engineering)
                engineeringData.value = mergeData(getInitialEngineeringData(), result.data.engineering)
            }
            
            console.log('数据加载完成！最终结果:')
            console.log('equipmentData:', JSON.stringify(equipmentData.value, null, 2))
            console.log('componentData:', JSON.stringify(componentData.value, null, 2))
            console.log('engineeringData:', JSON.stringify(engineeringData.value, null, 2))
        } else {
            console.log('API返回格式不正确:', result)
        }

        // 加载所有月份数据并更新累计
        await loadAllMonthsData(targetPeriod)
        updateCurrentTotals()
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 监听当期数据变化，自动更新累计
watch(() => [
    equipmentData.value.map(item => item.currentPeriod),
    componentData.value.map(item => item.currentPeriod),
    engineeringData.value.map(item => item.currentPeriod)
], () => {
    updateCurrentTotals()
}, { deep: true })

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
    }
})

const handleSave = async () => {
    try {
        // 准备要保存的数据，使用 customer 字段名
        const cleanEquipmentData = equipmentData.value.map(item => ({
            customer: item.customerType || '',
            yearlyPlan: item.yearlyPlan || 0,
            currentPeriod: item.currentPeriod || 0,
            currentTotal: item.currentTotal || 0,
            progress: calculateProgressNumber(item.currentPeriod || 0, item.yearlyPlan || 0)
        }))

        const cleanComponentData = componentData.value.map(item => ({
            customer: item.customerType || '',
            yearlyPlan: item.yearlyPlan || 0,
            currentPeriod: item.currentPeriod || 0,
            currentTotal: item.currentTotal || 0,
            progress: calculateProgressNumber(item.currentPeriod || 0, item.yearlyPlan || 0)
        }))

        const cleanEngineeringData = engineeringData.value.map(item => ({
            customer: item.customerType || '',
            yearlyPlan: item.yearlyPlan || 0,
            currentPeriod: item.currentPeriod || 0,
            currentTotal: item.currentTotal || 0,
            progress: calculateProgressNumber(item.currentPeriod || 0, item.yearlyPlan || 0)
        }))

        const saveData = {
            period: period.value,
            data: {
                equipment: cleanEquipmentData,
                component: cleanComponentData,
                engineering: cleanEngineeringData
            }
        }

        console.log('保存数据:', saveData) // 调试用

        // 1. 保存到 project_tracking 表
        const response = await fetch('http://47.111.95.19:3000/project-tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存到project_tracking表失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(moduleId, period.value, saveData.data, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    // 重置为初始空数据
    equipmentData.value = getInitialEquipmentData()
    componentData.value = getInitialComponentData()
    engineeringData.value = getInitialEngineeringData()
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
  const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
  remarks.value = loadedRemarks
  suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('组件挂载，当前期间:', period.value)
    // 总是尝试加载数据，不管是否有路由参数
    loadData(period.value)
    loadRemarksData()
})
</script>

<style scoped>
.project-tracking-container {
    min-height: calc(100vh - 64px);
    padding: 24px;
    background-color: #f3f4f6;
}

/* 调整表格列的最小宽度 */
th,
td {
    min-width: 120px;
}

th:first-child,
td:first-child {
    min-width: 100px;
}

/* 输入框样式 */
input[type="number"] {
    -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
</style>