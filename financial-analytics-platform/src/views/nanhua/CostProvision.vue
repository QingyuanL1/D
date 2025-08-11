<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">成本计提情况:（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-xs text-gray-500">本年累计 = 年初余额 + 累计新增（1月至当前月） - 累计冲销（1月至当前月）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2">当期新增</th>
                        <th class="border border-gray-300 px-4 py-2">当期冲销</th>
                        <th class="border border-gray-300 px-4 py-2">本年累计</th>
                        <th class="border border-gray-300 px-4 py-2">计提率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in costProvisionData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="costProvisionData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearBeginBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyIncrease" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyWriteOff" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearlyAccumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatProvisionRate(item.provisionRate) }}</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.monthlyIncrease) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.monthlyWriteOff) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearlyAccumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatProvisionRate(totalData.provisionRate) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_COST_PROVISION"
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

interface CostProvisionItem {
    customerName: string;
    yearBeginBalance: number;
    monthlyIncrease: number;
    monthlyWriteOff: number;
    yearlyAccumulated: number;
    provisionRate: number;
}

interface CostProvisionData {
    customers: CostProvisionItem[];
}

// 固定的年初余额数据 - 更新为与图片一致
const fixedBalanceData: CostProvisionData = {
    customers: [
        { customerName: '一包项目', yearBeginBalance: 1164.76, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '二包项目', yearBeginBalance: 426.90, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域内合作项目', yearBeginBalance: 474.41, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '域外合作项目', yearBeginBalance: 661.56, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '新能源项目', yearBeginBalance: 730.12, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '苏州项目', yearBeginBalance: 93.99, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '自接项目', yearBeginBalance: 242.66, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 },
        { customerName: '其他', yearBeginBalance: 19.50, monthlyIncrease: 0, monthlyWriteOff: 0, yearlyAccumulated: 0, provisionRate: 0 }
    ]
}

const costProvisionData = ref<CostProvisionData>(JSON.parse(JSON.stringify(fixedBalanceData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化计提率显示 - 处理特殊情况显示斜杠
const formatProvisionRate = (value: number): string => {
    if (value === 0 && Math.abs(value) < 0.01) return '0.00%'
    // 如果计算不出来的情况下使用斜杠
    if (isNaN(value) || value === Infinity || value === -Infinity) return '/'
    return value.toFixed(2) + '%'
}

// 使用优化接口获取累计数据（替代原来的逐月请求方式，大幅提升性能）
const loadAccumulatedData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-cost-provision/accumulated/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载累计数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 使用后端返回的累计数据
            costProvisionData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                yearBeginBalance: Number(item.yearBeginBalance) || 0,
                monthlyIncrease: Number(item.monthlyIncrease) || 0,
                monthlyWriteOff: Number(item.monthlyWriteOff) || 0,
                yearlyAccumulated: Number(item.yearlyAccumulated) || 0,
                provisionRate: Number(item.provisionRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载累计数据失败:', error)
    }
}

// 监听当期新增和冲销字段变化，本地预览计算（不覆盖已有的累计数据）
watch(() => costProvisionData.value.customers.map(item => [item.monthlyIncrease, item.monthlyWriteOff]), () => {
    // 用户修改当期数据时，仅重新计算计提率，不修改yearlyAccumulated
    // 因为yearlyAccumulated应该基于历史累计数据，需要保存后重新获取
    costProvisionData.value.customers.forEach(item => {
        if (item.yearBeginBalance > 0) {
            item.provisionRate = (item.yearlyAccumulated / item.yearBeginBalance) * 100
        } else {
            item.provisionRate = item.yearlyAccumulated !== 0 ? (item.yearlyAccumulated > 0 ? 100 : -100) : 0
        }
    })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginBalance: 0,
        monthlyIncrease: 0,
        monthlyWriteOff: 0,
        yearlyAccumulated: 0,
        provisionRate: 0
    }
    
    costProvisionData.value.customers.forEach(item => {
        total.yearBeginBalance += item.yearBeginBalance || 0
        total.monthlyIncrease += item.monthlyIncrease || 0
        total.monthlyWriteOff += item.monthlyWriteOff || 0
        total.yearlyAccumulated += item.yearlyAccumulated || 0
    })
    
    // 计算总计提率
    if (total.yearBeginBalance > 0) {
        total.provisionRate = (total.yearlyAccumulated / total.yearBeginBalance) * 100
    }
    
    return total
})

// 加载单月数据（仅在需要时使用）
const loadSingleMonthData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-cost-provision/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 仅用于获取单月数据，不包含累计计算
            costProvisionData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                yearBeginBalance: Number(item.yearBeginBalance) || 0,
                monthlyIncrease: Number(item.monthlyIncrease) || 0,
                monthlyWriteOff: Number(item.monthlyWriteOff) || 0,
                yearlyAccumulated: Number(item.yearlyAccumulated) || 0,
                provisionRate: Number(item.provisionRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_COST_PROVISION}/${targetPeriod}`)
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
        await loadAccumulatedData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadAccumulatedData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-cost-provision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: costProvisionData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_COST_PROVISION, period.value, costProvisionData.value, remarks.value, suggestions.value)

        // 保存成功后重新加载累计数据，确保显示正确的累计值
        await loadAccumulatedData(period.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    costProvisionData.value = JSON.parse(JSON.stringify(fixedBalanceData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    if (route.query.period) {
        await loadAccumulatedData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        await loadAccumulatedData(period.value)
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
