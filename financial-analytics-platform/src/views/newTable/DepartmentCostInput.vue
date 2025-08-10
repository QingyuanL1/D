<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">部门成本中心计入损益情况（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">当月执行</th>
                        <th class="border border-gray-300 px-4 py-2">累计执行</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                        <th class="border border-gray-300 px-4 py-2">预算占产值比</th>
                        <th class="border border-gray-300 px-4 py-2">实际占产值比</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in departmentData" :key="index">
                        <td class="border border-gray-300 px-4 py-2">{{ item.department }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ formatNumber(item.yearlyBudget) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="item.currentMonthIncome" @input="updateAccumulatedIncome" type="text" class="w-full px-2 py-1 border rounded" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1">{{ item.accumulatedIncome }}</span>
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
                            <span class="w-full px-2 py-1 font-bold">{{ formatNumber(totalRow.yearlyBudget) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="totalRow.currentMonthIncome" @input="updateAccumulatedIncome" type="text" class="w-full px-2 py-1 border rounded font-bold" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="w-full px-2 py-1 font-bold">{{ totalRow.accumulatedIncome }}</span>
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
            :module-id="MODULE_IDS.DEPARTMENT_COST_INPUT"
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

interface DepartmentItem {
    department: string;
    yearlyBudget: string;
    currentMonthIncome: string;
    accumulatedIncome: string;
    executionProgress: string;
    budgetToOutputRatio: string;
    actualToOutputRatio: string;
}

// 获取初始数据模板
const getInitialData = () => {
    const departments: DepartmentItem[] = [
        { department: '总经理室', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '企管部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '财务部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '销售部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '市场部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '营运部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '研技部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: 'C-GIS 事业部', yearlyBudget: '1894.69', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' },
        { department: '工程事业部', yearlyBudget: '', currentMonthIncome: '', accumulatedIncome: '', executionProgress: '', budgetToOutputRatio: '', actualToOutputRatio: '' }
    ]
    
    const total: DepartmentItem = {
        department: '合计',
        yearlyBudget: '',
        currentMonthIncome: '',
        accumulatedIncome: '',
        executionProgress: '',
        budgetToOutputRatio: '',
        actualToOutputRatio: ''
    }
    
    return { departments, total }
}

// 数据合并函数
const mergeData = (initialData: any, loadedData: any) => {
    if (!loadedData) return initialData
    
    console.log('部门成本数据合并开始:', { initialData, loadedData })
    
    const mergedDepartments = initialData.departments.map((dept: DepartmentItem) => {
        const loaded = loadedData.departments?.find((d: any) => d.department === dept.department)
        if (loaded) {
            console.log(`合并部门数据: ${dept.department}`, loaded)
            // 优先使用API返回的预算数据
            return { 
                ...dept, 
                ...loaded,
                // 确保yearlyBudget使用API返回的预算数据
                yearlyBudget: loaded.yearlyBudget || dept.yearlyBudget
            }
        }
        return dept
    })
    
    const mergedTotal = loadedData.total ? { 
        ...initialData.total, 
        ...loadedData.total,
        // 确保合计行的yearlyBudget使用API返回的预算数据
        yearlyBudget: loadedData.total.yearlyBudget || initialData.total.yearlyBudget
    } : initialData.total
    
    console.log('部门成本数据合并完成:', { departments: mergedDepartments, total: mergedTotal })
    
    return {
        departments: mergedDepartments,
        total: mergedTotal
    }
}

const initialData = getInitialData()
const departmentData = ref<DepartmentItem[]>(initialData.departments)
const totalRow = ref<DepartmentItem>(initialData.total)
const allMonthsData = ref<any[]>([]) // 存储所有月份的数据

// 获取所有月份数据用于累计计算
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const [year, month] = currentPeriod.split('-')
        const currentMonth = parseInt(month)
        const allData = []
        
        // 获取当年1月到当前月的所有数据
        for (let i = 1; i <= currentMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/department-cost-input/${monthPeriod}`)
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

// 计算累计收入（包含当前月份的输入值）
const calculateAccumulated = (department: string, fieldName: string = 'currentMonthIncome') => {
    let total = 0
    const currentPeriod = period.value
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        // 跳过当前月份，因为要用当前输入的值
        if (monthData.period === currentPeriod) continue
        
        const deptData = monthData.data.departments?.find((d: any) => d.department === department)
        if (deptData && deptData[fieldName]) {
            const value = parseFloat(deptData[fieldName].toString().replace(/,/g, '')) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    const currentDept = departmentData.value.find(d => d.department === department)
    if (currentDept && currentDept[fieldName]) {
        const currentValue = parseFloat(currentDept[fieldName].toString().replace(/,/g, '')) || 0
        total += currentValue
    }
    
    return total.toLocaleString()
}

// 计算合计行累计收入（包含当前月份的输入值）
const calculateTotalAccumulated = (fieldName: string = 'currentMonthIncome') => {
    let total = 0
    const currentPeriod = period.value
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        // 跳过当前月份，因为要用当前输入的值
        if (monthData.period === currentPeriod) continue
        
        if (monthData.data.total && monthData.data.total[fieldName]) {
            const value = parseFloat(monthData.data.total[fieldName].toString().replace(/,/g, '')) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    if (totalRow.value[fieldName]) {
        const currentValue = parseFloat(totalRow.value[fieldName].toString().replace(/,/g, '')) || 0
        total += currentValue
    }
    
    return total.toLocaleString()
}

// 计算执行进度（累计收入 / 年度预算 * 100%）
const calculateExecutionProgress = (accumulatedIncome: string, yearlyBudget: string) => {
    const accumulated = parseFloat(accumulatedIncome.replace(/,/g, '')) || 0
    const budget = parseFloat(yearlyBudget.replace(/,/g, '')) || 0
    if (budget === 0) return '0%'
    return ((accumulated / budget) * 100).toFixed(1) + '%'
}

// 计算预算占产值比和实际占产值比（这里需要产值数据，暂时返回空）
const calculateRatio = (value: string, baseValue: string = '0') => {
    const val = parseFloat(value.replace(/,/g, '')) || 0
    const base = parseFloat(baseValue.replace(/,/g, '')) || 0
    if (base === 0) return '0%'
    return ((val / base) * 100).toFixed(1) + '%'
}

// 格式化数字显示
const formatNumber = (value: string | number): string => {
    if (!value || value === '') return ''
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    return num.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

// 更新所有计算字段
const updateCalculatedFields = () => {
    // 更新各部门计算字段
    departmentData.value.forEach(item => {
        item.accumulatedIncome = calculateAccumulated(item.department)
        item.executionProgress = calculateExecutionProgress(item.accumulatedIncome, item.yearlyBudget)
        // 预算占产值比和实际占产值比需要产值数据，暂时设为空
        item.budgetToOutputRatio = ''
        item.actualToOutputRatio = ''
    })
    
    // 更新合计行计算字段
    totalRow.value.accumulatedIncome = calculateTotalAccumulated()
    totalRow.value.executionProgress = calculateExecutionProgress(totalRow.value.accumulatedIncome, totalRow.value.yearlyBudget)
    totalRow.value.budgetToOutputRatio = ''
    totalRow.value.actualToOutputRatio = ''
}

// 更新累计收入数据（保持向后兼容）
const updateAccumulatedIncome = () => {
    updateCalculatedFields()
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    console.log(`正在加载部门成本中心数据，期间: ${targetPeriod}`)
    try {
        const response = await fetch(`http://47.111.95.19:3000/department-cost-input/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，使用空白模板')
            // 即使没有当前期间数据，也要加载所有月份数据计算所有字段
            await loadAllMonthsData(targetPeriod)
            updateCalculatedFields()
            return
        }
        const result = await response.json()
        console.log('加载到的数据:', result)
        
        if (result.data) {
            // 使用数据合并逻辑
            const mergedData = mergeData(getInitialData(), result.data)
            departmentData.value = mergedData.departments
            totalRow.value = mergedData.total
            console.log('数据合并完成:', { departments: departmentData.value, total: totalRow.value })
        }
        
        // 加载所有月份数据并计算所有字段
        await loadAllMonthsData(targetPeriod)
        updateCalculatedFields()
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载备注信息
const loadRemarksData = async (targetPeriod: string) => {
    try {
        const remarksData = await loadRemarksAndSuggestions(MODULE_IDS.DEPARTMENT_COST_INPUT, targetPeriod)
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

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
    }
})

const handleSave = async () => {
    try {
        console.log('=== 开始保存部门成本中心计入损益数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.DEPARTMENT_COST_INPUT)
        
        const formData = {
            departments: departmentData.value,
            total: totalRow.value
        }
        
        console.log('表单数据:', formData)
        
        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://47.111.95.19:3000/department-cost-input', {
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
            console.error('专用表保存失败，响应:', errorText)
            throw new Error('保存失败')
        }
        
        const result = await response.json()
        console.log('专用表保存成功:', result)

        // 第二步：记录提交状态
        console.log('步骤2：记录提交状态...')
        console.log('调用参数:', {
            moduleId: MODULE_IDS.DEPARTMENT_COST_INPUT,
            period: period.value,
            formData: formData,
            remarks: remarks.value,
            suggestions: suggestions.value
        })
        
        const recordSuccess = await recordFormSubmission(
            MODULE_IDS.DEPARTMENT_COST_INPUT,
            period.value,
            formData,
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
    const initialData = getInitialData()
    departmentData.value = initialData.departments
    totalRow.value = initialData.total
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