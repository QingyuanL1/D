<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">非主营业务情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
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
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">执行进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 财务科目列表 -->
                    <template v-for="(item, index) in businessData.items" :key="`item-${index}`">
                        <tr>
                            <td class="border border-gray-300 px-4 py-2 text-center">
                                {{ index + 1 }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.financialSubject }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.annualPlan) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.current" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ calculateProgress(item.annualPlan, item.accumulated) }}%</span>
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
                            {{ formatNumber(totalData.current) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.accumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ totalData.executionProgress }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_NON_MAIN_BUSINESS"
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

interface BusinessItem {
    financialSubject: string;
    annualPlan: number;
    current: number;
    accumulated: number;
    executionProgress: number;
}

interface BusinessData {
    items: BusinessItem[];
}

// 固定的年度计划数据
const fixedPlanData: BusinessData = {
    items: [
        { financialSubject: '处置固废收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '车辆租金收入', annualPlan: 30.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '利息收入', annualPlan: 5.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '设备外服收入', annualPlan: 255.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '政府补贴收入', annualPlan: 50.00, current: 0, accumulated: 0, executionProgress: 0 },
        { financialSubject: '派遣补贴收入', annualPlan: 227.78, current: 0, accumulated: 0, executionProgress: 0 }
    ]
}

const businessData = ref<BusinessData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算执行进度函数
const calculateProgress = (annualPlan: number, accumulated: number): string => {
    if (!annualPlan || annualPlan === 0) return '0.00'
    const progress = (accumulated / annualPlan) * 100
    return progress.toFixed(2)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualPlan: 0,
        current: 0,
        accumulated: 0,
        executionProgress: 0
    }

    businessData.value.items.forEach(item => {
        total.annualPlan += item.annualPlan || 0
        total.current += item.current || 0
        total.accumulated += item.accumulated || 0
    })

    // 计算总执行进度
    total.executionProgress = total.annualPlan > 0 ? (total.accumulated / total.annualPlan * 100) : 0
    total.executionProgress = parseFloat(total.executionProgress.toFixed(2))

    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-non-main-business/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            // 直接使用后端返回的数据
            businessData.value.items = result.data.items.map((item: any) => ({
                financialSubject: item.financialSubject,
                annualPlan: Number(item.annualPlan) || 0,
                current: Number(item.current) || 0,
                accumulated: Number(item.accumulated) || 0,
                executionProgress: Number(item.executionProgress) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_NON_MAIN_BUSINESS}/${targetPeriod}`)
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
        // 保存前更新累计数据
        businessData.value.items.forEach(item => {
            // 执行进度基于累计数据计算
            item.executionProgress = parseFloat(calculateProgress(item.annualPlan, item.accumulated))
        })

        const response = await fetch('http://127.0.0.1:3000/nanhua-non-main-business', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: businessData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_NON_MAIN_BUSINESS, period.value, businessData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    businessData.value = JSON.parse(JSON.stringify(fixedPlanData))
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
