<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">中标未履约情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">计算值 = 期初余额 - 所有当期值</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">期初余额</th>
                        <th class="border border-gray-300 px-4 py-2">当期余额</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in bidFulfillmentData.items" :key="`bid-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialBalance) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model.number="item.currentBalance" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialBalance, item.currentBalance || 0) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateFluctuation(totalData.initialBalance, totalData.currentBalance) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_BID_FULFILLMENT"
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

interface BidFulfillmentItem {
    segmentAttribute: string;
    customerAttribute: string;
    initialBalance: number;
    currentBalance: number;
}

interface BidFulfillmentData {
    items: BidFulfillmentItem[];
}

const fixedPlanData: BidFulfillmentData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', initialBalance: 4200.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', initialBalance: 2800.00, currentBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', initialBalance: 0.00, currentBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', initialBalance: 200.00, currentBalance: 0 }
    ]
}

const bidFulfillmentData = ref<BidFulfillmentData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return bidFulfillmentData.value.items[index].segmentAttribute !== bidFulfillmentData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return bidFulfillmentData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算当期余额和波动率
// 计算波动率
const calculateFluctuation = (initial: number, current: number): string => {
    if (initial === 0) return current === 0 ? '0.00' : '0.00';
    const fluctuation = ((current - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        initialBalance: 0,
        currentBalance: 0
    }
    
    bidFulfillmentData.value.items.forEach(item => {
        total.initialBalance += Number(item.initialBalance) || 0
        total.currentBalance += Number(item.currentBalance) || 0
    })
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-bid-fulfillment/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data && result.data.items) {
            // 合并数据库数据和默认数据，保证顺序一致
            const dbItems = result.data.items
            bidFulfillmentData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.segmentAttribute === defaultItem.segmentAttribute && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                return {
                    segmentAttribute: defaultItem.segmentAttribute,
                    customerAttribute: defaultItem.customerAttribute,
                    initialBalance: defaultItem.initialBalance, // 使用固定的初始余额
                    currentBalance: dbItem ? Number(dbItem.currentBalance) || 0 : 0
                }
            })
        }
        

    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    bidFulfillmentData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_BID_FULFILLMENT}/${targetPeriod}`)
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

watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        resetToDefaultData()
        await loadData(newPeriod.toString())

        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-bid-fulfillment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: bidFulfillmentData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_BID_FULFILLMENT, period.value, { items: bidFulfillmentData.value.items }, remarks.value, suggestions.value)
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