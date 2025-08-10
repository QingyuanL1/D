<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">中标未履约情况</h1>
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
                        <th class="border border-gray-300 px-4 py-2">期初金额</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 客户列表 -->
                    <template v-for="(item, index) in bidData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="bidData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.initialAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.current" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.accumulated) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right" :class="getFluctuationClass(item.fluctuationRate)">
                                <span class="text-sm font-medium">{{ formatFluctuationRate(item.fluctuationRate) }}</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.current) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.accumulated) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right" :class="getFluctuationClass(totalData.fluctuationRate)">
                            <span class="text-sm font-bold">{{ formatFluctuationRate(totalData.fluctuationRate) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BID_FULFILLMENT"
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

interface BidItem {
    customerName: string;
    initialAmount: number;
    current: number;
    accumulated: number;
    fluctuationRate: number;
}

interface BidData {
    customers: BidItem[];
}

// 固定的期初金额数据
const fixedPlanData: BidData = {
    customers: [
        { customerName: '一包项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '二包项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '域内合作项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '域外合作项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '新能源项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '苏州项目', initialAmount: 1300.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '抢修项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '运检项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 },
        { customerName: '自接项目', initialAmount: 0.00, current: 0, accumulated: 0, fluctuationRate: 0 }
    ]
}

const bidData = ref<BidData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化波动率
const formatFluctuationRate = (value: number): string => {
    if (value === 0) return '0.00%'
    return value.toFixed(2) + '%'
}

// 获取波动率的CSS类
const getFluctuationClass = (value: number): string => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return ''
}

// 计算波动率函数
const calculateFluctuationRate = (initialAmount: number, accumulated: number): number => {
    if (!initialAmount || initialAmount === 0) return 0
    return ((accumulated - initialAmount) / initialAmount) * 100
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        initialAmount: 0,
        current: 0,
        accumulated: 0,
        fluctuationRate: 0
    }
    
    bidData.value.customers.forEach(item => {
        total.initialAmount += item.initialAmount || 0
        total.current += item.current || 0
        total.accumulated += item.accumulated || 0
    })
    
    // 计算总波动率
    total.fluctuationRate = calculateFluctuationRate(total.initialAmount, total.accumulated)
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-bid-fulfillment/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data && result.data.customers) {
            // 直接使用后端返回的数据
            bidData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                initialAmount: Number(item.initialAmount) || 0,
                current: Number(item.current) || 0,
                accumulated: Number(item.accumulated) || 0,
                fluctuationRate: Number(item.fluctuationRate) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_BID_FULFILLMENT}/${targetPeriod}`)
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
        // 保存前更新波动率
        bidData.value.customers.forEach(item => {
            item.fluctuationRate = calculateFluctuationRate(item.initialAmount, item.accumulated)
        })
        
        const response = await fetch('http://127.0.0.1:3000/nanhua-bid-fulfillment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: bidData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_BID_FULFILLMENT, period.value, bidData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    bidData.value = JSON.parse(JSON.stringify(fixedPlanData))
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
