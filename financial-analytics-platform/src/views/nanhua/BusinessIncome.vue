<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">营业收入结构与质量</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（按年度计划口径分解）</span>
                <span class="text-sm text-gray-600">单位：万元</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">序号</th>
                        <th class="border border-gray-300 px-4 py-2">财务科目</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">当期收入</th>
                        <th class="border border-gray-300 px-4 py-2">累计收入</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in summaryData" :key="index">
                        <td class="border border-gray-300 px-4 py-2 text-center">
                            {{ item.id }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ item.category }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ item.yearlyPlan.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ item.currentIncome.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ item.accumulatedIncome.toFixed(2) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="text-sm font-medium">{{ calculateProgress(item.yearlyPlan, item.accumulatedIncome) }}%</span>
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ summaryTotalData.yearlyPlan.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ summaryTotalData.currentIncome.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ summaryTotalData.accumulatedIncome.toFixed(2) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ summaryTotalData.progress.toFixed(2) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 主营业务收入分解情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">主营业务收入分解情况（单位：万元）</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2">板块</th>
                            <th class="border border-gray-300 px-4 py-2">客户属性</th>
                            <th class="border border-gray-300 px-4 py-2">年度计划</th>
                            <th class="border border-gray-300 px-4 py-2">当期</th>
                            <th class="border border-gray-300 px-4 py-2">累计</th>
                            <th class="border border-gray-300 px-4 py-2">完成进度</th>
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
                                    <span v-if="['抢修', '运检'].includes(item.customerName)" class="ml-4">
                                        {{ item.customerName }}
                                    </span>
                                    <span v-else>
                                        {{ item.customerName }}
                                    </span>
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.yearlyPlan) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.current) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    {{ formatNumber(item.accumulated) }}
                                </td>
                                <td class="border border-gray-300 px-4 py-2 text-right">
                                    <span class="text-sm font-medium">{{ calculateCompletionRate(item.yearlyPlan, item.accumulated) }}%</span>
                                </td>
                            </tr>
                        </template>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(totalData.yearlyPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(totalData.current) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(totalData.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-bold">{{ totalData.completionRate }}%</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 非主营业务情况表 -->
        <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">非主营业务情况（单位：万元）</h2>
            <div class="overflow-x-auto my-6">
                <table class="w-full border-collapse border border-gray-300">
                    <thead class="sticky top-0 bg-white">
                        <tr class="bg-gray-50">
                            <th class="border border-gray-300 px-4 py-2 w-24">序号</th>
                            <th class="border border-gray-300 px-4 py-2">财务科目</th>
                            <th class="border border-gray-300 px-4 py-2">年度计划</th>
                            <th class="border border-gray-300 px-4 py-2">当期</th>
                            <th class="border border-gray-300 px-4 py-2">累计</th>
                            <th class="border border-gray-300 px-4 py-2">执行进度</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in nonMainBusinessData" :key="index">
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                {{ index + 1 }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.financialSubject }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.annualPlan" type="number" class="w-full px-2 py-1 border rounded bg-gray-100" step="0.01" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.current" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(item.accumulated) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ calculateProgress(item.annualPlan, item.accumulated) }}%
                            </td>
                        </tr>

                        <!-- 合计行 -->
                        <tr class="bg-gray-50 font-bold">
                            <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                            <td class="border border-gray-300 px-4 py-2"></td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ nonMainBusinessTotalData.annualPlan.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ nonMainBusinessTotalData.current.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ nonMainBusinessTotalData.accumulated.toFixed(2) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ nonMainBusinessTotalData.progress.toFixed(2) }}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BUSINESS_INCOME"
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
    accumulated: number;
    completionRate: number;
}

interface IncomeData {
    customers: IncomeItem[];
}

interface SummaryItem {
    id: number;
    category: string;
    yearlyPlan: number;
    currentIncome: number;
    accumulatedIncome: number;
}

interface NonMainBusinessItem {
    financialSubject: string;
    annualPlan: number;
    current: number;
    accumulated: number;
    executionProgress: number;
}

// 固定的年度计划数据 (根据实际截图数据)
const fixedPlanData: IncomeData = {
    customers: [
        { customerName: '一包项目', yearlyPlan: 5355.05, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '二包项目', yearlyPlan: 2889.91, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '域内合作项目', yearlyPlan: 4165.14, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '域外合作项目', yearlyPlan: 2550.46, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '新能源项目', yearlyPlan: 3744.54, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '苏州项目', yearlyPlan: 752.29, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '抢修', yearlyPlan: 137.61, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '运检', yearlyPlan: 1238.54, current: 0, accumulated: 0, completionRate: 0 },
        { customerName: '自接项目', yearlyPlan: 0, current: 0, accumulated: 0, completionRate: 0 }
    ]
}

const incomeData = ref<IncomeData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 非主营业务数据初始化
const getInitialNonMainBusinessData = (): NonMainBusinessItem[] => [
    { financialSubject: '处置固废收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '车辆租金收入', annualPlan: 30.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '利息收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '设备外服收入', annualPlan: 255.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '政府补贴收入', annualPlan: 50.00, current: 0, accumulated: 0, executionProgress: 0 },
    { financialSubject: '派遣补贴收入', annualPlan: 227.78, current: 0, accumulated: 0, executionProgress: 0 }
]

const nonMainBusinessData = ref<NonMainBusinessItem[]>(getInitialNonMainBusinessData())

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算完成率函数
const calculateCompletionRate = (yearlyPlan: number, accumulated: number): string => {
    if (!yearlyPlan || yearlyPlan === 0) return '0.00'
    const rate = (accumulated / yearlyPlan) * 100
    return rate.toFixed(2)
}

// 计算进度函数
const calculateProgress = (yearlyPlan: number, accumulatedIncome: number): string => {
  if (!yearlyPlan || yearlyPlan === 0) return '0.00'
  const progress = (accumulatedIncome / yearlyPlan) * 100
  return progress.toFixed(2)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        current: 0,
        accumulated: 0,
        completionRate: 0
    }
    
    incomeData.value.customers.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.current += item.current || 0
        total.accumulated += item.accumulated || 0
    })
    
    // 计算总完成率
    total.completionRate = total.yearlyPlan > 0 ? (total.accumulated / total.yearlyPlan * 100) : 0
    total.completionRate = parseFloat(total.completionRate.toFixed(2))
    
    return total
})

// 计算非主营业务合计数据
const nonMainBusinessTotalData = computed(() => {
    const total = {
        annualPlan: 0,
        current: 0,
        accumulated: 0,
        progress: 0
    }
    
    nonMainBusinessData.value.forEach(item => {
        total.annualPlan += item.annualPlan || 0
        total.current += item.current || 0
        total.accumulated += item.accumulated || 0
    })
    
    // 计算总进度
    total.progress = total.annualPlan > 0 ? (total.accumulated / total.annualPlan * 100) : 0
    
    return total
})

// 计算汇总表数据（主营业务 + 非主营业务）
const summaryData = computed((): SummaryItem[] => [
    {
        id: 1,
        category: '主营业务',
        yearlyPlan: totalData.value.yearlyPlan,
        currentIncome: totalData.value.current,
        accumulatedIncome: totalData.value.accumulated
    },
    {
        id: 2,
        category: '非主营业务',
        yearlyPlan: nonMainBusinessTotalData.value.annualPlan,
        currentIncome: nonMainBusinessTotalData.value.current,
        accumulatedIncome: nonMainBusinessTotalData.value.accumulated
    }
])

// 计算汇总表合计数据
const summaryTotalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentIncome: 0,
        accumulatedIncome: 0,
        progress: 0
    }
    
    summaryData.value.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.currentIncome += item.currentIncome || 0
        total.accumulatedIncome += item.accumulatedIncome || 0
    })
    
    // 计算总进度
    total.progress = total.yearlyPlan > 0 ? (total.accumulatedIncome / total.yearlyPlan * 100) : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-business-income/${targetPeriod}`)
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
                accumulated: Number(item.accumulated) || 0,
                completionRate: Number(item.completionRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载非主营业务数据
const loadNonMainBusinessData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载非主营业务数据，期间: ${targetPeriod}`)

        const response = await fetch(`http://127.0.0.1:3000/nanhua-non-main-business/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无非主营业务数据，使用初始模板')
                nonMainBusinessData.value = getInitialNonMainBusinessData()
                return
            }
            throw new Error('加载非主营业务数据失败')
        }

        const result = await response.json()
        console.log('非主营业务API返回数据:', result)

        if (result.success && result.data && result.data.items && Array.isArray(result.data.items)) {
            const loadedData = result.data.items

            // 合并数据：将从数据库加载的数据与初始模板合并
            nonMainBusinessData.value = nonMainBusinessData.value.map(templateItem => {
                const loadedItem = loadedData.find((item: any) => item.financialSubject === templateItem.financialSubject)

                if (loadedItem) {
                    return {
                        ...templateItem,
                        annualPlan: loadedItem.annualPlan || templateItem.annualPlan,
                        current: loadedItem.current || 0,
                        accumulated: loadedItem.accumulated || 0,
                        executionProgress: loadedItem.executionProgress || 0
                    }
                }
                return templateItem
            })

            console.log('非主营业务数据合并完成:', nonMainBusinessData.value)
        }
    } catch (error) {
        console.error('加载非主营业务数据失败:', error)
        nonMainBusinessData.value = getInitialNonMainBusinessData()
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_BUSINESS_INCOME}/${targetPeriod}`)
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

// 监听当期数据变化，自动计算累计
watch(incomeData, (newData) => {
    // 移除自动计算累计的逻辑，累计应该由后端计算历史数据总和
    // 累计不应该简单等于当期，而应该是所有历史期间的当期总和
}, { deep: true })

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadNonMainBusinessData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadNonMainBusinessData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        // 1. 保存主营业务数据
        const response = await fetch('http://127.0.0.1:3000/nanhua-business-income', {
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
            throw new Error('保存主营业务数据失败')
        }

        // 2. 保存非主营业务数据
        const nonMainResponse = await fetch('http://127.0.0.1:3000/nanhua-non-main-business', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: { items: nonMainBusinessData.value }
            })
        })

        if (!nonMainResponse.ok) {
            throw new Error('保存非主营业务数据失败')
        }

        // 3. 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_BUSINESS_INCOME, period.value, {
            mainBusiness: incomeData.value,
            nonMainBusiness: nonMainBusinessData.value
        }, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    incomeData.value = JSON.parse(JSON.stringify(fixedPlanData))
    nonMainBusinessData.value = getInitialNonMainBusinessData()
    remarks.value = ''
    suggestions.value = ''
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadNonMainBusinessData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        loadData(period.value)
        loadNonMainBusinessData(period.value)
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