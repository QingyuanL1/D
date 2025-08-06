<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源招投标情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：项）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">集采投标</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">中标数计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">中标率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in biddingData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.collectiveBidding" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="1"
                                    @input="calculateWinningRate(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.winningBidCount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="1"
                                    @input="calculateWinningRate(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.winningRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ totalData.collectiveBidding }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ totalData.winningBidCount }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.winningRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_BIDDING_STATUS"
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

interface BiddingItem {
    segmentAttribute: string;
    customerAttribute: string;
    collectiveBidding: number;
    winningBidCount: number;
    winningRate: number;
}

interface BiddingData {
    items: BiddingItem[];
}

const fixedPlanData: BiddingData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', collectiveBidding: 0, winningBidCount: 0, winningRate: 0 }
    ]
}

const biddingData = ref<BiddingData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算中标率
const calculateWinningRate = (item: BiddingItem) => {
    if (item.collectiveBidding && item.collectiveBidding > 0) {
        item.winningRate = (item.winningBidCount / item.collectiveBidding) * 100
    } else {
        item.winningRate = 0
    }
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return biddingData.value.items[index].segmentAttribute !== biddingData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return biddingData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        collectiveBidding: 0,
        winningBidCount: 0,
        winningRate: 0
    }
    
    biddingData.value.items.forEach(item => {
        total.collectiveBidding += parseInt(item.collectiveBidding?.toString() || '0') || 0
        total.winningBidCount += parseInt(item.winningBidCount?.toString() || '0') || 0
    })
    
    // 计算总中标率
    total.winningRate = total.collectiveBidding > 0 ? (total.winningBidCount / total.collectiveBidding) * 100 : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-bidding-status/${targetPeriod}`)
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
            biddingData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.segmentAttribute === defaultItem.segmentAttribute && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                if (dbItem) {
                    const newItem = {
                        segmentAttribute: defaultItem.segmentAttribute,
                        customerAttribute: defaultItem.customerAttribute,
                        collectiveBidding: Number(dbItem.collectiveBidding) || 0,
                        winningBidCount: Number(dbItem.winningBidCount) || 0,
                        winningRate: 0 // 将由计算函数重新计算
                    }
                    // 计算中标率
                    calculateWinningRate(newItem)
                    return newItem
                } else {
                    return { ...defaultItem }
                }
            })
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    biddingData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_BIDDING_STATUS}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-bidding-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: biddingData.value.items.map(item => ({
                        segmentAttribute: item.segmentAttribute,
                        customerAttribute: item.customerAttribute,
                        collectiveBidding: item.collectiveBidding,
                        winningBidCount: item.winningBidCount,
                        // 不保存中标率，由前端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_BIDDING_STATUS, period.value, { items: biddingData.value.items }, remarks.value, suggestions.value)
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