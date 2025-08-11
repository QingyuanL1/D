<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">存量结构与质量</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初金额</th>
                        <th class="border border-gray-300 px-4 py-2">当期金额</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in inventoryData.customers" :key="`customer-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="inventoryData.customers.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerName }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.initialAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="font-medium">{{ formatNumber(item.current) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right" :class="getFluctuationClass(item.fluctuationRate)">
                                <span class="text-sm font-medium">{{ formatFluctuationRate(item.fluctuationRate) }}</span>
                            </td>
                        </tr>
                    </template>

                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.current) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right" :class="getFluctuationClass(totalData.fluctuationRate)">
                            <span class="text-sm font-bold">{{ formatFluctuationRate(totalData.fluctuationRate) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="mt-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 class="text-lg font-semibold mb-2 text-blue-800">计算说明</h3>
            <p class="text-sm text-blue-700">
                当期金额 = 中标未履约当期余额 + 在建工程（合同存量评估）当期评估金额
            </p>
            <p class="text-sm text-blue-700 mt-1">
                数据由系统根据中标未履约、合同存量评估等模块数据自动计算生成
            </p>
        </div>

        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_INVENTORY_STRUCTURE"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />

        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存备注
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

interface InventoryItem {
    customerName: string;
    initialAmount: number;
    current: number;
    fluctuationRate: number;
}

interface InventoryData {
    customers: InventoryItem[];
}

const fixedPlanData: InventoryData = {
    customers: [
        { customerName: '一包项目', initialAmount: 10000.00, current: 0, fluctuationRate: 0 },
        { customerName: '二包项目', initialAmount: 4400.00, current: 0, fluctuationRate: 0 },
        { customerName: '域内合作项目', initialAmount: 8600.00, current: 0, fluctuationRate: 0 },
        { customerName: '域外合作项目', initialAmount: 4900.00, current: 0, fluctuationRate: 0 },
        { customerName: '新能源项目', initialAmount: 1900.00, current: 0, fluctuationRate: 0 },
        { customerName: '苏州项目', initialAmount: 4200.00, current: 0, fluctuationRate: 0 },
        { customerName: '抢修项目', initialAmount: 0.00, current: 0, fluctuationRate: 0 },
        { customerName: '运检项目', initialAmount: 0.00, current: 0, fluctuationRate: 0 },
        { customerName: '自接项目', initialAmount: 0.00, current: 0, fluctuationRate: 0 }
    ]
}

const inventoryData = ref<InventoryData>(JSON.parse(JSON.stringify(fixedPlanData)))

const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const formatFluctuationRate = (value: number): string => {
    if (value === 0) return '0.00%'
    return value.toFixed(2) + '%'
}

const getFluctuationClass = (value: number): string => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return ''
}

const calculateFluctuationRate = (initialAmount: number, current: number): number => {
    if (!initialAmount || initialAmount === 0) return 0
    return ((current - initialAmount) / initialAmount) * 100
}

const totalData = computed(() => {
    const total = {
        initialAmount: 0,
        current: 0,
        fluctuationRate: 0
    }
    
    inventoryData.value.customers.forEach(item => {
        total.initialAmount += item.initialAmount || 0
        total.current += item.current || 0
    })
    
    total.fluctuationRate = calculateFluctuationRate(total.initialAmount, total.current)
    
    return total
})

const loadData = async (targetPeriod: string) => {
    try {
        console.log(`=== 开始加载南华存量结构数据，期间: ${targetPeriod} ===`)
        
        const response = await fetch(`http://47.111.95.19:3000/nanhua-inventory-structure/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('该期间暂无数据，使用默认数据')
            inventoryData.value = JSON.parse(JSON.stringify(fixedPlanData))
            return
        }
        
        const result = await response.json()
        console.log('从API加载的数据:', result)
        
        if (result.success && result.data && result.data.customers) {
            inventoryData.value.customers = result.data.customers.map((item: any) => ({
                customerName: item.customerName,
                initialAmount: Number(item.initialAmount) || 0,
                current: Number(item.current) || 0,
                fluctuationRate: Number(item.fluctuationRate) || 0
            }))
            console.log('数据加载完成:', inventoryData.value)
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        inventoryData.value = JSON.parse(JSON.stringify(fixedPlanData))
    }
}

const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_INVENTORY_STRUCTURE}/${targetPeriod}`)
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

watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-inventory-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: inventoryData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_INVENTORY_STRUCTURE, period.value, inventoryData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    loadData(period.value)
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
