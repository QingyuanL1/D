<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">部门成本中心实际发生情况（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">部门属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度预算</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                        <th class="border border-gray-300 px-4 py-2">预算占产值比</th>
                        <th class="border border-gray-300 px-4 py-2">实际占产值比</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in departmentData" :key="index">
                        <td class="border border-gray-300 px-4 py-2">{{ item.department }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.yearlyBudget }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="item.currentPeriod" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ item.currentTotal }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.executionProgress }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.budgetToOutputRatio }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.actualToOutputRatio }}</span>
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.yearlyBudget }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="totalRow.currentPeriod" type="text" class="w-full px-2 py-1 border rounded font-bold" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.currentTotal }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.executionProgress }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.budgetToOutputRatio }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.actualToOutputRatio }}</span>
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
            :module-id="MODULE_IDS.DEPARTMENT_COST_CENTER"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface DepartmentItem {
    department: string;
    yearlyBudget: string;
    currentPeriod: string;
    currentTotal: string;
    executionProgress: string;
    budgetToOutputRatio: string;
    actualToOutputRatio: string;
}

// 初始数据模板（当没有数据时使用）
const getInitialDepartmentData = (): DepartmentItem[] => [
    { department: '总经理室', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '企管部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '财务部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '销售部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '市场部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '营运部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '研技部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: 'C-GIS 事业部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' },
    { department: '工程事业部', yearlyBudget: '0', currentPeriod: '0', currentTotal: '0', executionProgress: '0%', budgetToOutputRatio: '0%', actualToOutputRatio: '0%' }
]

const getInitialTotalRow = (): DepartmentItem => ({
    department: '合计',
    yearlyBudget: '0',
    currentPeriod: '0',
    currentTotal: '0',
    executionProgress: '0%',
    budgetToOutputRatio: '0%',
    actualToOutputRatio: '0%'
})

const departmentData = ref<DepartmentItem[]>(getInitialDepartmentData())
const totalRow = ref<DepartmentItem>(getInitialTotalRow())

// 存储所有历史月份数据，用于计算累计
const allMonthsData = ref<Array<{ period: string; data: { departments: DepartmentItem[], total: DepartmentItem } }>>([])

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: { departments: DepartmentItem[], total: DepartmentItem } }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))

        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/department-cost-center/${monthPeriod}`)
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

// 计算累计值
const calculateCurrentTotal = (department: string) => {
    let total = 0

    if (department === '合计') {
        // 合计行：计算所有部门的累计总和
        // 累加历史月份数据
        for (const monthData of allMonthsData.value) {
            if (monthData.data.departments) {
                for (const deptItem of monthData.data.departments) {
                    if (deptItem.currentPeriod) {
                        total += parseFloat(deptItem.currentPeriod) || 0
                    }
                }
            }
        }

        // 加上当前月份的输入值
        for (const currentDeptItem of departmentData.value) {
            if (currentDeptItem.currentPeriod) {
                total += parseFloat(currentDeptItem.currentPeriod) || 0
            }
        }
    } else {
        // 单个部门：计算该部门的累计值
        // 累加历史月份数据
        for (const monthData of allMonthsData.value) {
            const deptItem = monthData.data.departments.find(d => d.department === department)
            if (deptItem && deptItem.currentPeriod) {
                total += parseFloat(deptItem.currentPeriod) || 0
            }
        }

        // 加上当前月份的输入值
        const currentDeptItem = departmentData.value.find(d => d.department === department)
        if (currentDeptItem && currentDeptItem.currentPeriod) {
            total += parseFloat(currentDeptItem.currentPeriod) || 0
        }
    }

    return total.toString()
}

// 计算执行进度
const calculateExecutionProgress = (currentTotal: string, yearlyBudget: string): string => {
    const current = parseFloat(currentTotal) || 0
    const budget = parseFloat(yearlyBudget) || 0
    if (budget === 0) return '0%'
    return ((current / budget) * 100).toFixed(2) + '%'
}

// 更新累计数据和其他计算字段
const updateCurrentTotal = () => {
    // 更新各部门累计和计算字段
    departmentData.value.forEach(item => {
        item.currentTotal = calculateCurrentTotal(item.department)
        item.executionProgress = calculateExecutionProgress(item.currentTotal, item.yearlyBudget)
        // 预算占产值比和实际占产值比需要产值数据，暂时设为空
        item.budgetToOutputRatio = '0%'
        item.actualToOutputRatio = '0%'
    })

    // 更新合计行累计和计算字段
    totalRow.value.currentTotal = calculateCurrentTotal('合计')

    // 计算合计行年度预算（所有部门年度预算之和）
    const totalYearlyBudget = departmentData.value.reduce((sum, item) => {
        return sum + (parseFloat(item.yearlyBudget) || 0)
    }, 0)
    totalRow.value.yearlyBudget = totalYearlyBudget.toString()

    totalRow.value.executionProgress = calculateExecutionProgress(totalRow.value.currentTotal, totalRow.value.yearlyBudget)
    totalRow.value.budgetToOutputRatio = '0%'
    totalRow.value.actualToOutputRatio = '0%'
}

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: DepartmentItem[], loadedData: any): DepartmentItem[] => {
    if (!Array.isArray(loadedData) || loadedData.length === 0) {
        return templateData
    }
    
    return templateData.map(templateItem => {
        const loadedItem = loadedData.find((item: any) => item.department === templateItem.department)
        if (loadedItem) {
            return {
                department: templateItem.department,
                yearlyBudget: loadedItem.yearlyBudget || '0',
                currentPeriod: loadedItem.currentPeriod || '0',
                currentTotal: loadedItem.currentTotal || '0',
                executionProgress: loadedItem.executionProgress || '0%',
                budgetToOutputRatio: loadedItem.budgetToOutputRatio || '0%',
                actualToOutputRatio: loadedItem.actualToOutputRatio || '0%'
            }
        }
        // 没有加载数据时，返回模板数据（保持年度预算为0，其他字段也为0）
        return {
            department: templateItem.department,
            yearlyBudget: '0',
            currentPeriod: '0',
            currentTotal: '0',
            executionProgress: '0%',
            budgetToOutputRatio: '0%',
            actualToOutputRatio: '0%'
        }
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载部门成本中心数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/department-cost-center/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，重置为初始模板')
                // 重置为初始模板数据
                departmentData.value = getInitialDepartmentData()
                totalRow.value = getInitialTotalRow()

                // 加载历史数据并更新累计
                await loadAllMonthsData(targetPeriod)
                updateCurrentTotal()
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            if (result.data.departments) {
                departmentData.value = mergeData(getInitialDepartmentData(), result.data.departments)
            }
            if (result.data.total) {
                totalRow.value = { ...getInitialTotalRow(), ...result.data.total }
            }
            console.log('合并后的数据:', { departmentData: departmentData.value, totalRow: totalRow.value })
        }

        // 加载所有月份数据并更新累计
        await loadAllMonthsData(targetPeriod)
        updateCurrentTotal()
    } catch (error) {
        console.error('加载数据失败:', error)

        // 即使出错也要尝试加载历史数据
        try {
            await loadAllMonthsData(targetPeriod)
            updateCurrentTotal()
        } catch (historyError) {
            console.error('加载历史数据失败:', historyError)
        }
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.DEPARTMENT_COST_CENTER, period.value)
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

// 监听数据变化，自动更新累计
watch(departmentData, () => {
    updateCurrentTotal()
}, { deep: true })

watch(totalRow, () => {
    updateCurrentTotal()
}, { deep: true })

const handleSave = async () => {
    try {
        const formData = {
            departments: departmentData.value,
            total: totalRow.value
        }
        
        console.log('保存数据:', { period: period.value, data: formData })

        // 1. 保存到专用表
        const response = await fetch('http://47.111.95.19:3000/department-cost-center', {
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
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(MODULE_IDS.DEPARTMENT_COST_CENTER, period.value, formData, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    departmentData.value = getInitialDepartmentData()
    totalRow.value = getInitialTotalRow()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('部门成本中心组件挂载，当前期间:', period.value)
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