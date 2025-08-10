<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">年度重大投资情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">当期执行累计 = 当期执行 + 之前各月累计</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-16">序号</th>
                        <th class="border border-gray-300 px-4 py-2 w-80">项目名称</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期执行</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期执行累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in investmentData.items" :key="`item-${index}`">
                        <tr>
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                {{ item.sequenceNo }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.projectName" 
                                    type="text" 
                                    class="w-full px-2 py-1 border rounded" 
                                    placeholder="请输入项目名称"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.annualPlan" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentExecution" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentExecutionCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.executionProgress) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentExecution) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentExecutionCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.executionProgress) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_MAJOR_INVESTMENT"
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

interface InvestmentItem {
    sequenceNo: number;
    projectName: string;
    annualPlan: number;
    currentExecution: number;
    currentExecutionCumulative: number;
    executionProgress: number;
}

interface InvestmentData {
    items: InvestmentItem[];
}

const fixedPlanData: InvestmentData = {
    items: [
        { sequenceNo: 1, projectName: '固定资产重建、购置', annualPlan: 60.41, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 2, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 3, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 4, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 5, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 6, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 7, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 8, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 9, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 },
        { sequenceNo: 10, projectName: '', annualPlan: 0, currentExecution: 0, currentExecutionCumulative: 0, executionProgress: 0 }
    ]
}

const investmentData = ref<InvestmentData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算当期执行累计（当期执行 + 之前各月累计）
const calculateCurrentExecutionCumulative = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个项目计算当期执行累计
        for (let item of investmentData.value.items) {
            let cumulativeExecution = 0
            
            // 从1月累计到当前月份前一个月的"当期执行"
            for (let m = 1; m < currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://47.111.95.19:3000/nanhua-major-investment/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const projectData = result.data.items.find((p: any) => p.sequenceNo === item.sequenceNo)
                        if (projectData) {
                            cumulativeExecution += projectData.currentExecution || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 加上当前月份的当期执行
            cumulativeExecution += item.currentExecution || 0
            
            item.currentExecutionCumulative = cumulativeExecution
            
            // 计算执行进度
            item.executionProgress = item.annualPlan > 0 ? (item.currentExecutionCumulative / item.annualPlan) * 100 : 0
        }
        
    } catch (error) {
        console.error('计算当期执行累计失败:', error)
    }
}

// 监听数据变化，自动重新计算当期执行累计和执行进度
watch(() => investmentData.value.items, async (newItems) => {
    // 当当期执行发生变化时，重新计算当期执行累计
    await calculateCurrentExecutionCumulative(period.value)
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualPlan: 0,
        currentExecution: 0,
        currentExecutionCumulative: 0,
        executionProgress: 0
    }
    
    investmentData.value.items.forEach(item => {
        total.annualPlan += item.annualPlan || 0
        total.currentExecution += item.currentExecution || 0
        total.currentExecutionCumulative += item.currentExecutionCumulative || 0
    })
    
    // 计算总执行进度
    total.executionProgress = total.annualPlan > 0 ? (total.currentExecutionCumulative / total.annualPlan) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-major-investment/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            investmentData.value.items = result.data.items.map((item: any) => ({
                sequenceNo: item.sequenceNo,
                projectName: item.projectName || '',
                annualPlan: Number(item.annualPlan) || 0,
                currentExecution: Number(item.currentExecution) || 0,
                currentExecutionCumulative: Number(item.currentExecutionCumulative) || 0,
                executionProgress: Number(item.executionProgress) || 0
            }))
        }
        
        // 加载完数据后重新计算当期执行累计
        await calculateCurrentExecutionCumulative(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    investmentData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_MAJOR_INVESTMENT}/${targetPeriod}`)
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
        await calculateCurrentExecutionCumulative(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateCurrentExecutionCumulative(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-major-investment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: investmentData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_MAJOR_INVESTMENT, period.value, { items: investmentData.value.items }, remarks.value, suggestions.value)
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
}

onMounted(async () => {
    resetToDefaultData()
    const targetPeriod = route.query.period?.toString() || period.value
    await loadData(targetPeriod)
    await calculateCurrentExecutionCumulative(targetPeriod)
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