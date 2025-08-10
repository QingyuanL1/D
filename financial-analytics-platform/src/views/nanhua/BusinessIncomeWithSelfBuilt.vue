<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务边际贡献率结构与质量</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（按年度计划口径分解）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="mb-4 text-sm font-medium text-gray-700">
            对应主营收入：
        </div>

        <!-- 计算状态提示 -->
        <div v-if="calculating" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-blue-700">正在自动计算边际贡献率...</span>
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期实际</th>
                        <th class="border border-gray-300 px-4 py-2">偏差</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in incomeData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="incomeData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <!-- 苏州项目的子项目需要缩进显示 -->
                                <span v-if="['抢修', '运检', '自接项目'].includes(item.customerName)" class="ml-4">
                                    {{ item.customerName }}
                                </span>
                                <span v-else>
                                    {{ item.customerName }}
                                </span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(item.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="px-2 py-1 text-blue-600 font-medium">{{ formatPercentage(item.current) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(calculateDeviation(item.yearlyPlan, item.current)) }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(totalData.yearlyPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(totalData.current) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatPercentage(calculateDeviation(totalData.yearlyPlan, totalData.current)) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 说明文字 -->
        <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p class="text-sm text-yellow-700">
                <strong>说明：</strong>当期实际数值为系统自动计算结果，计算公式为：边际贡献率 = (累计收入 - 累计成本) / 累计收入 × 100%
            </p>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleRecalculate" :disabled="calculating" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400">
                {{ calculating ? '计算中...' : '重新计算' }}
            </button>
            <button @click="handleSave" :disabled="calculating" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
                保存
            </button>
            <button @click="handleReset" :disabled="calculating" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-400">
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
const calculating = ref(false)

interface IncomeItem {
    customerName: string;
    yearlyPlan: number;
    current: number;
    deviation: number;
}

interface IncomeData {
    customers: IncomeItem[];
}

    // 固定的年度计划数据 (根据实际截图数据，运检项目下添加自接项目) - 百分比格式
const fixedPlanData: IncomeData = {
    customers: [
        { customerName: '一包项目', yearlyPlan: 26.52, current: 0, deviation: 0 },
        { customerName: '二包项目', yearlyPlan: 18.00, current: 0, deviation: 0 },
        { customerName: '域内合作项目', yearlyPlan: 8.00, current: 0, deviation: 0 },
        { customerName: '域外合作项目', yearlyPlan: 5.48, current: 0, deviation: 0 },
        { customerName: '新能源项目', yearlyPlan: 25.00, current: 0, deviation: 0 },
        { customerName: '苏州项目', yearlyPlan: 6.00, current: 0, deviation: 0 },
        { customerName: '抢修', yearlyPlan: 100.00, current: 0, deviation: 0 },
        { customerName: '运检', yearlyPlan: 30.00, current: 0, deviation: 0 },
        { customerName: '自接项目', yearlyPlan: 0, current: 0, deviation: 0 }
    ]
}

const incomeData = ref<IncomeData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化百分比显示
const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00%'
    return value.toFixed(2) + '%'
}

// 计算偏差（当期实际 - 年度计划）
const calculateDeviation = (yearlyPlan: number, current: number): number => {
    return (current || 0) - (yearlyPlan || 0)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        current: 0
    }
    
    incomeData.value.customers.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.current += item.current || 0
    })
    
    // 对于百分比数据，计算平均值
    total.yearlyPlan = total.yearlyPlan / incomeData.value.customers.length
    total.current = total.current / incomeData.value.customers.length
    
    return total
})

// 自动计算边际贡献率
const calculateContributionRates = async (targetPeriod: string) => {
    calculating.value = true
    try {
        console.log('尝试自动计算南华边际贡献率...')
        const calculateResponse = await fetch(`http://47.111.95.19:3000/nanhua-business-contribution-with-self-built/calculate/${targetPeriod}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (calculateResponse.ok) {
            const calculateResult = await calculateResponse.json()
            if (calculateResult.success) {
                console.log('南华边际贡献率自动计算成功:', calculateResult.data)
                return calculateResult.data
            }
        } else {
            const errorResult = await calculateResponse.json()
            console.log('自动计算失败，将使用现有数据:', errorResult.error)
        }
    } catch (calcError) {
        console.log('自动计算失败，将使用现有数据:', calcError.message)
    } finally {
        calculating.value = false
    }
    return null
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        // 首先尝试自动计算边际贡献率
        let calculatedData = await calculateContributionRates(targetPeriod)
        
        // 如果自动计算成功，使用计算结果；否则加载现有数据
        let finalData = calculatedData
        
        if (!finalData) {
            const response = await fetch(`http://47.111.95.19:3000/nanhua-business-contribution-with-self-built/${targetPeriod}`)
            if (response.ok) {
                const result = await response.json()
                finalData = result.data
                console.log('加载现有数据:', finalData)
            }
        }

        if (finalData && finalData.customers) {
            // 直接使用后端返回的数据
            incomeData.value.customers = finalData.customers.map((item: any) => ({
                customerName: item.customerName,
                yearlyPlan: Number(item.yearlyPlan) || 0,
                current: Number(item.current) || 0,
                deviation: Number(item.deviation) || 0
            }))
        } else {
            // 重置为默认数据
            incomeData.value = JSON.parse(JSON.stringify(fixedPlanData))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        // 重置为默认数据
        incomeData.value = JSON.parse(JSON.stringify(fixedPlanData))
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT}/${targetPeriod}`)
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

// 重新计算
const handleRecalculate = async () => {
    await calculateContributionRates(period.value)
    await loadData(period.value)
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-business-contribution-with-self-built', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: incomeData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT, period.value, incomeData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    incomeData.value = JSON.parse(JSON.stringify(fixedPlanData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        loadData(period.value)
        loadRemarksAndSuggestions(period.value)
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