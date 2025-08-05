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
                                <span v-if="['抢修', '运检', '自建项目'].includes(item.customerName)" class="ml-4">
                                    {{ item.customerName }}
                                </span>
                                <span v-else>
                                    {{ item.customerName }}
                                </span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatPercentage(item.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.current" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" max="100" />
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

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT"
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

interface IncomeItem {
    customerName: string;
    yearlyPlan: number;
    current: number;
    deviation: number;
}

interface IncomeData {
    customers: IncomeItem[];
}

// 固定的年度计划数据 (根据实际截图数据，运检项目下添加自建项目) - 百分比格式
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
        { customerName: '自建项目', yearlyPlan: 0, current: 0, deviation: 0 }
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

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-business-contribution-with-self-built/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 直接使用后端返回的数据
            incomeData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                yearlyPlan: Number(item.yearlyPlan) || 0,
                current: Number(item.current) || 0,
                deviation: Number(item.deviation) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_BUSINESS_CONTRIBUTION_WITH_SELF_BUILT}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/nanhua-business-contribution-with-self-built', {
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