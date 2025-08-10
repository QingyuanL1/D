<template>
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">成本中心结构与质量（按年度计划口径分解）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">对应当期收入：（单位：万元）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年计划收入</th>
                        <th class="border border-gray-300 px-4 py-2">当期计入损益</th>
                        <th class="border border-gray-300 px-4 py-2">累计计入损益</th>
                        <th class="border border-gray-300 px-4 py-2">分摊损益占比</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程客户列表 -->
                    <template v-for="(item, index) in costCenterData.engineering" :key="`engineering-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="costCenterData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyPlannedIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentIncome" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulatedIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatNumber(item.contributionRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 非主营业务客户列表 -->
                    <template v-for="(item, index) in costCenterData.nonMainBusiness" :key="`nonmain-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="costCenterData.nonMainBusiness.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                非主营业务
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyPlannedIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentIncome" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulatedIncome) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatNumber(item.contributionRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyPlannedIncome) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentIncome) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.accumulatedIncome) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.contributionRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_COST_CENTER_STRUCTURE"
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

interface CostCenterItem {
    customerName: string;
    yearlyPlannedIncome: number;
    currentIncome: number;
    accumulatedIncome: number;
    contributionRate: number;
}

interface CostCenterData {
    engineering: CostCenterItem[];
    nonMainBusiness: CostCenterItem[];
}

// 固定的数据结构
const fixedData: CostCenterData = {
    engineering: [
        { customerName: '一包项目', yearlyPlannedIncome: 284.22, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '二包项目', yearlyPlannedIncome: 106.53, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '域内合作项目', yearlyPlannedIncome: 41.41, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '域外合作项目', yearlyPlannedIncome: 17.07, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '新能源项目', yearlyPlannedIncome: 157.09, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '苏州项目', yearlyPlannedIncome: 12.88, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '抢修项目', yearlyPlannedIncome: 41.77, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '运检项目', yearlyPlannedIncome: 68.06, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '自接项目', yearlyPlannedIncome: 0.00, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 }
    ],
    nonMainBusiness: [
        { customerName: '存货盘盈', yearlyPlannedIncome: 0.47, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 },
        { customerName: '利息收入', yearlyPlannedIncome: 5.91, currentIncome: 0, accumulatedIncome: 0, contributionRate: 0 }
    ]
}

const costCenterData = ref<CostCenterData>(JSON.parse(JSON.stringify(fixedData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算累计收入（从年初到当前月份）
const calculateAccumulatedIncome = async (targetPeriod: string) => {
    try {
        const [year, month] = targetPeriod.split('-')
        const currentMonth = parseInt(month)
        
        // 计算工程项目的累计收入
        for (let customer of costCenterData.value.engineering) {
            let accumulated = 0
            
            // 从1月累计到当前月份
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/nanhua-cost-center-structure/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const customerData = result.data.engineering.find((c: any) => c.customerName === customer.customerName)
                        if (customerData) {
                            accumulated += customerData.currentIncome || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            customer.accumulatedIncome = accumulated
            // 计算分摊损益占比
            customer.contributionRate = customer.yearlyPlannedIncome > 0 ? (accumulated / customer.yearlyPlannedIncome * 100) : 0
        }
        
        // 计算非主营业务的累计收入
        for (let customer of costCenterData.value.nonMainBusiness) {
            let accumulated = 0
            
            // 从1月累计到当前月份
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/nanhua-cost-center-structure/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const customerData = result.data.nonMainBusiness.find((c: any) => c.customerName === customer.customerName)
                        if (customerData) {
                            accumulated += customerData.currentIncome || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            customer.accumulatedIncome = accumulated
            // 计算分摊损益占比
            customer.contributionRate = customer.yearlyPlannedIncome > 0 ? (accumulated / customer.yearlyPlannedIncome * 100) : 0
        }
    } catch (error) {
        console.error('计算累计收入失败:', error)
    }
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlannedIncome: 0,
        currentIncome: 0,
        accumulatedIncome: 0,
        contributionRate: 0
    }
    
    // 合计工程项目
    costCenterData.value.engineering.forEach(item => {
        total.yearlyPlannedIncome += item.yearlyPlannedIncome || 0
        total.currentIncome += item.currentIncome || 0
        total.accumulatedIncome += item.accumulatedIncome || 0
    })
    
    // 合计非主营业务
    costCenterData.value.nonMainBusiness.forEach(item => {
        total.yearlyPlannedIncome += item.yearlyPlannedIncome || 0
        total.currentIncome += item.currentIncome || 0
        total.accumulatedIncome += item.accumulatedIncome || 0
    })
    
    // 计算总体分摊损益占比
    total.contributionRate = total.yearlyPlannedIncome > 0 ? (total.accumulatedIncome / total.yearlyPlannedIncome * 100) : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-cost-center-structure/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data) {
            // 更新工程数据
            if (result.data.engineering) {
                costCenterData.value.engineering = result.data.engineering.map((item: any) => ({
                    customerName: item.customerName,
                    yearlyPlannedIncome: Number(item.yearlyPlannedIncome) || 0,
                    currentIncome: Number(item.currentIncome) || 0,
                    accumulatedIncome: Number(item.accumulatedIncome) || 0,
                    contributionRate: Number(item.contributionRate) || 0
                }))
            }
            
            // 更新非主营业务数据
            if (result.data.nonMainBusiness) {
                costCenterData.value.nonMainBusiness = result.data.nonMainBusiness.map((item: any) => ({
                    customerName: item.customerName,
                    yearlyPlannedIncome: Number(item.yearlyPlannedIncome) || 0,
                    currentIncome: Number(item.currentIncome) || 0,
                    accumulatedIncome: Number(item.accumulatedIncome) || 0,
                    contributionRate: Number(item.contributionRate) || 0
                }))
            }
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_COST_CENTER_STRUCTURE}/${targetPeriod}`)
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
        await calculateAccumulatedIncome(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        await calculateAccumulatedIncome(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/nanhua-cost-center-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: costCenterData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_COST_CENTER_STRUCTURE, period.value, costCenterData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    costCenterData.value = JSON.parse(JSON.stringify(fixedData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    if (route.query.period) {
        await loadData(route.query.period.toString())
        await calculateAccumulatedIncome(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        await loadData(period.value)
        await calculateAccumulatedIncome(period.value)
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