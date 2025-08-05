<template>
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">上海南华实业公司 - 部门成本中心计入损益情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
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
                    <!-- 部门列表 -->
                    <template v-for="(item, index) in departmentData.departments" :key="`department-${index}`">
                        <tr>
                            <td class="border border-gray-300 px-4 py-2 font-medium">
                                {{ item.departmentName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyBudget) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulatedAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatNumber(item.executionProgress) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                /
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatNumber(item.actualRatio) }}%</span>
                            </td>
                        </tr>
                    </template>


                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyBudget) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.accumulatedAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.executionProgress) }}%</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            /
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.actualRatio) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_DEPARTMENT_COST_INPUT"
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

interface DepartmentItem {
    departmentName: string;
    yearlyBudget: number;
    currentAmount: number;
    accumulatedAmount: number;
    executionProgress: number;
    actualRatio: number;
}

interface DepartmentData {
    departments: DepartmentItem[];
}

// 固定的部门数据（基于截图）
const fixedData: DepartmentData = {
    departments: [
        { departmentName: '总经理室', yearlyBudget: 361.36, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '综管部', yearlyBudget: 461.45, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '经管部', yearlyBudget: 93.07, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '安质部', yearlyBudget: 116.00, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '工程部', yearlyBudget: 821.07, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '运检部', yearlyBudget: 569.90, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 },
        { departmentName: '营销部', yearlyBudget: 1048.86, currentAmount: 0, accumulatedAmount: 0, executionProgress: 0, actualRatio: 0 }
    ]
}


const departmentData = ref<DepartmentData>(JSON.parse(JSON.stringify(fixedData)))

// 部门名称映射表，用于处理历史数据中的名称变更
const departmentNameMapping: Record<string, string> = {
    '综合部': '综管部',
    '财务部': '经管部'
}

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}


// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyBudget: 0,
        currentAmount: 0,
        accumulatedAmount: 0,
        executionProgress: 0,
        actualRatio: 0
    }
    
    // 计算所有部门的合计
    departmentData.value.departments.forEach(item => {
        total.yearlyBudget += item.yearlyBudget || 0
        total.currentAmount += item.currentAmount || 0
        total.accumulatedAmount += item.accumulatedAmount || 0
    })
    
    // 计算总执行进度
    total.executionProgress = total.yearlyBudget > 0 ? (total.accumulatedAmount / total.yearlyBudget * 100) : 0
    
    // 计算总实际占产值比
    total.actualRatio = 0 // 需要根据产值计算
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        // 首先重置为固定结构
        departmentData.value = JSON.parse(JSON.stringify(fixedData))
        
        const response = await fetch(`http://127.0.0.1:3000/nanhua-department-cost-input/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        
        const result = await response.json()
        if (result.data && result.data.departments) {
            // 创建后端数据的映射表
            const backendDataMap = new Map<string, any>()
            result.data.departments.forEach((item: any) => {
                // 处理名称映射，将旧名称转换为新名称
                let departmentName = item.departmentName
                if (departmentNameMapping[departmentName]) {
                    departmentName = departmentNameMapping[departmentName]
                }
                backendDataMap.set(departmentName, item)
            })
            
            // 合并固定结构和后端数据
            departmentData.value.departments = departmentData.value.departments.map(fixedItem => {
                const backendItem = backendDataMap.get(fixedItem.departmentName)
                if (backendItem) {
                    return {
                        departmentName: fixedItem.departmentName,
                        yearlyBudget: fixedItem.yearlyBudget, // 保持固定的预算值
                        currentAmount: Number(backendItem.currentAmount) || 0,
                        accumulatedAmount: 0, // 稍后重新计算
                        executionProgress: 0, // 稍后重新计算
                        actualRatio: Number(backendItem.actualRatio) || 0
                    }
                }
                return fixedItem
            })
        }
        
        // 重新计算累计金额和执行进度
        await calculateAccumulatedAmounts(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时保持固定结构
        departmentData.value = JSON.parse(JSON.stringify(fixedData))
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_DEPARTMENT_COST_INPUT}/${targetPeriod}`)
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

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        await loadData(newPeriod.toString())
        await loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        await loadRemarksAndSuggestions(newPeriod)
    }
})

// 获取历史累计数据并计算累计金额
const calculateAccumulatedAmounts = async (targetPeriod: string) => {
    try {
        const year = targetPeriod.split('-')[0]
        const month = parseInt(targetPeriod.split('-')[1])
        
        // 获取从年初到当期的所有历史数据
        const promises = []
        for (let m = 1; m <= month; m++) {
            const periodStr = `${year}-${m.toString().padStart(2, '0')}`
            promises.push(
                fetch(`http://127.0.0.1:3000/nanhua-department-cost-input/${periodStr}`)
                    .then(res => res.ok ? res.json() : { data: null })
                    .catch(() => ({ data: null }))
            )
        }
        
        const results = await Promise.all(promises)
        
        // 为每个部门计算累计金额
        departmentData.value.departments.forEach(item => {
            let accumulatedAmount = 0
            results.forEach(result => {
                if (result.data && result.data.departments) {
                    const historyItem = result.data.departments.find((dept: any) => {
                        // 考虑名称映射
                        let deptName = dept.departmentName
                        if (departmentNameMapping[deptName]) {
                            deptName = departmentNameMapping[deptName]
                        }
                        return deptName === item.departmentName
                    })
                    if (historyItem) {
                        accumulatedAmount += Number(historyItem.currentAmount) || 0
                    }
                }
            })
            item.accumulatedAmount = accumulatedAmount
        })
    } catch (error) {
        console.error('计算累计金额失败:', error)
    }
}

// 监听当期金额变化，自动计算累计金额和执行进度
watch(() => departmentData.value.departments.map(d => d.currentAmount), async () => {
    // 重新计算累计金额
    await calculateAccumulatedAmounts(period.value)
    
    // 计算执行进度
    departmentData.value.departments.forEach(item => {
        if (item.yearlyBudget > 0) {
            item.executionProgress = (item.accumulatedAmount / item.yearlyBudget) * 100
        } else {
            item.executionProgress = 0
        }
    })
}, { deep: true })

const handleSave = async () => {
    try {
        // 保存前重新计算累计金额和执行进度
        await calculateAccumulatedAmounts(period.value)
        
        const response = await fetch('http://127.0.0.1:3000/nanhua-department-cost-input', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    departments: departmentData.value.departments
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_DEPARTMENT_COST_INPUT, period.value, { departments: departmentData.value.departments }, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    departmentData.value = JSON.parse(JSON.stringify(fixedData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    if (route.query.period) {
        await loadData(route.query.period.toString())
        await loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        await loadData(period.value)
        await loadRemarksAndSuggestions(period.value)
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