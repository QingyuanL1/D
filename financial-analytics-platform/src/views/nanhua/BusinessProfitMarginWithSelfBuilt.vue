<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold">主营业务毛利率结构与质量</h1>
                <div class="text-sm text-blue-600 mt-1">当期实际值自动计算：(主营收入-主营成本)/主营收入 × 100%</div>
            </div>
            <div class="text-gray-500">（按年度计划口径分解）</div>
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
                        <th class="border border-gray-300 px-4 py-2">当期实际</th>
                        <th class="border border-gray-300 px-4 py-2">偏差</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in profitMarginData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="profitMarginData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <!-- 苏州项目的子项目需要缩进显示 -->
                                <span v-if="['抢修', '运检项目', '自接项目'].includes(item.customerName)" class="ml-4">
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
                                <input :value="formatPercentage(item.current)" type="text" class="w-full px-2 py-1 border rounded text-right bg-gray-50" readonly />
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

        <div class="mt-6 text-sm font-medium text-gray-700">
            办公室评估意见：
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BUSINESS_PROFIT_MARGIN_WITH_SELF_BUILT"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleRefresh" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                重新计算
            </button>
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

interface ProfitMarginItem {
    customerName: string;
    yearlyPlan: number;
    current: number;
}

interface ProfitMarginData {
    customers: ProfitMarginItem[];
}

    // 固定的年度计划数据 (根据截图数据，运检项目下添加自接项目) - 百分比格式
const fixedPlanData: ProfitMarginData = {
    customers: [
        { customerName: '一包项目', yearlyPlan: 14.54, current: 0 },
        { customerName: '二包项目', yearlyPlan: 15.50, current: 0 },
        { customerName: '域内合作项目', yearlyPlan: 8.00, current: 0 },
        { customerName: '域外合作项目', yearlyPlan: 5.48, current: 0 },
        { customerName: '新能源项目', yearlyPlan: 17.25, current: 0 },
        { customerName: '苏州项目', yearlyPlan: 6.00, current: 0 },
        { customerName: '抢修', yearlyPlan: 33.52, current: 0 },
        { customerName: '运检项目', yearlyPlan: 13.60, current: 0 },
        { customerName: '自接项目', yearlyPlan: 0, current: 0 }
    ]
}

const profitMarginData = ref<ProfitMarginData>(JSON.parse(JSON.stringify(fixedPlanData)))

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
    
    profitMarginData.value.customers.forEach(item => {
        total.yearlyPlan += item.yearlyPlan || 0
        total.current += item.current || 0
    })
    
    // 对于百分比数据，计算平均值
    total.yearlyPlan = total.yearlyPlan / profitMarginData.value.customers.length
    total.current = total.current / profitMarginData.value.customers.length
    
    return total
})

// 自动计算业务利润率
const calculateProfitMargin = async (targetPeriod: string) => {
    try {
        console.log(`正在计算南华业务利润率，期间: ${targetPeriod}`)

        const response = await fetch(`http://127.0.0.1:3000/nanhua-business-profit-margin-with-self-built/calculate/${targetPeriod}`)

        if (response.ok) {
            const result = await response.json()
            console.log('计算结果:', result)

            if (result.success && result.data) {
                // 更新计算后的数据
                profitMarginData.value = result.data
                console.log('南华业务利润率计算完成:', profitMarginData.value)
                return
            }
        } else if (response.status === 404) {
            console.log('缺少必要的收入或成本数据，无法计算利润率')
            alert('缺少必要的收入或成本数据，无法计算利润率。请先填写南华主营业务收入和主营业务成本数据。')
        } else {
            console.log('计算利润率失败')
        }

        // 如果计算失败，使用初始数据
        profitMarginData.value = JSON.parse(JSON.stringify(fixedPlanData))

    } catch (error) {
        console.error('计算南华业务利润率失败:', error)
        // 出错时使用初始数据
        profitMarginData.value = JSON.parse(JSON.stringify(fixedPlanData))
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载南华主营业务毛利率结构数据，期间: ${targetPeriod}`)

        // 首先尝试自动计算
        await calculateProfitMargin(targetPeriod)

        // 然后尝试加载已保存的数据（如果有的话）
        const response = await fetch(`http://127.0.0.1:3000/nanhua-business-profit-margin-with-self-built/${targetPeriod}`)
        let loadedData: any = null

        if (response.ok) {
            const result = await response.json()
            console.log('API返回已保存数据:', result)

            if (result.success && result.data) {
                loadedData = result.data
                console.log('成功获取已保存数据，开始合并...')

                // 合并已保存的数据，但保持计算的实际值
                const currentCalculatedData = JSON.parse(JSON.stringify(profitMarginData.value))
                if (loadedData.customers && currentCalculatedData.customers) {
                    currentCalculatedData.customers.forEach((calcItem: any, index: number) => {
                        const savedItem = loadedData.customers.find((item: any) => item.customerName === calcItem.customerName)
                        if (savedItem) {
                            // 保持年度计划为固定值，但可以覆盖其他非计算字段
                            // 当期实际值始终使用计算值
                            calcItem.yearlyPlan = fixedPlanData.customers[index]?.yearlyPlan || calcItem.yearlyPlan
                        }
                    })
                }
                profitMarginData.value = currentCalculatedData
            }
        } else if (response.status === 404) {
            console.log('该期间暂无已保存数据，使用计算数据')
        } else {
            console.log('加载已保存数据失败，使用计算数据')
        }

        console.log('最终数据:', profitMarginData.value)

    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        profitMarginData.value = JSON.parse(JSON.stringify(fixedPlanData))
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_BUSINESS_PROFIT_MARGIN_WITH_SELF_BUILT}/${targetPeriod}`)
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

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksAndSuggestions(newPeriod)
})

const handleSave = async () => {
    try {
        console.log('保存数据:', { period: period.value, data: profitMarginData.value })

        // 1. 保存到专用表
        const response = await fetch('http://127.0.0.1:3000/nanhua-business-profit-margin-with-self-built', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: profitMarginData.value
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(MODULE_IDS.NANHUA_BUSINESS_PROFIT_MARGIN_WITH_SELF_BUILT, period.value, profitMarginData.value, remarks.value, suggestions.value)
        
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleRefresh = async () => {
    try {
        console.log('手动重新计算南华业务利润率')
        await calculateProfitMargin(period.value)
        alert('重新计算完成')
    } catch (error) {
        console.error('重新计算失败:', error)
        alert('重新计算失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    profitMarginData.value = JSON.parse(JSON.stringify(fixedPlanData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(() => {
    console.log('南华主营业务毛利率结构与质量组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
    loadRemarksAndSuggestions(period.value)
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