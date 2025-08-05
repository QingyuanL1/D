<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">在建工程（合同存量）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年初评估数据</th>
                        <th class="border border-gray-300 px-4 py-2">当期评估数据</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in contractData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="contractData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearBeginning) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentEvaluation" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span :class="getFluctuationClass(item.fluctuationRate)">
                                    {{ formatFluctuation(item.fluctuationRate) }}
                                </span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginning) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentEvaluation) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(totalData.fluctuationRate)" class="font-bold">
                                {{ formatFluctuation(totalData.fluctuationRate) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_CONTRACT_INVENTORY_EVALUATION"
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

interface ContractItem {
    customerName: string;
    yearBeginning: number;
    currentEvaluation: number;
    fluctuationRate: number;
}

interface ContractData {
    customers: ContractItem[];
}

// 固定的年初评估数据
const fixedYearBeginningData: ContractData = {
    customers: [
        { customerName: '一包项目', yearBeginning: 1900.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '二包项目', yearBeginning: 500.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '域内合作项目', yearBeginning: 500.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '域外合作项目', yearBeginning: 180.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '新能源项目', yearBeginning: 280.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '苏州项目', yearBeginning: 460.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '抢修项目', yearBeginning: 0.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '运检项目', yearBeginning: 0.00, currentEvaluation: 0, fluctuationRate: 0 },
        { customerName: '自建项目', yearBeginning: 0.00, currentEvaluation: 0, fluctuationRate: 0 }
    ]
}

const contractData = ref<ContractData>(JSON.parse(JSON.stringify(fixedYearBeginningData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化波动率显示
const formatFluctuation = (value: number): string => {
    if (value === 0) return '/'
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

// 获取波动率样式类
const getFluctuationClass = (value: number): string => {
    if (value === 0) return 'text-gray-500'
    return value > 0 ? 'text-green-600' : 'text-red-600'
}

// 计算波动率
const calculateFluctuationRate = (customer: ContractItem) => {
    if (customer.yearBeginning === 0) {
        customer.fluctuationRate = 0
        return
    }
    
    const change = customer.currentEvaluation - customer.yearBeginning
    customer.fluctuationRate = (change / customer.yearBeginning) * 100
}

// 监听当期评估数据变化，自动计算波动率
watch(() => contractData.value.customers, (newCustomers) => {
    newCustomers.forEach(customer => {
        calculateFluctuationRate(customer)
    })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginning: 0,
        currentEvaluation: 0,
        fluctuationRate: 0
    }
    
    contractData.value.customers.forEach(item => {
        total.yearBeginning += item.yearBeginning || 0
        total.currentEvaluation += item.currentEvaluation || 0
    })
    
    // 计算总波动率
    if (total.yearBeginning > 0) {
        const change = total.currentEvaluation - total.yearBeginning
        total.fluctuationRate = (change / total.yearBeginning) * 100
    }
    
    return total
})

// 重置为默认数据的函数
const resetToDefaultData = () => {
    contractData.value = JSON.parse(JSON.stringify(fixedYearBeginningData))
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-contract-inventory-evaluation/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            // 404时重置为默认数据
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 使用后端返回的数据
            contractData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                yearBeginning: Number(item.yearBeginning) || 0,
                currentEvaluation: Number(item.currentEvaluation) || 0,
                fluctuationRate: Number(item.fluctuationRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_CONTRACT_INVENTORY_EVALUATION}/${targetPeriod}`)
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
        resetToDefaultData()
        await loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/nanhua-contract-inventory-evaluation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: contractData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_CONTRACT_INVENTORY_EVALUATION, period.value, contractData.value, remarks.value, suggestions.value)

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
