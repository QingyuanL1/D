<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">招投标情况</h1>
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
                        <th class="border border-gray-300 px-4 py-2">投标金额</th>
                        <th class="border border-gray-300 px-4 py-2">当期中标</th>
                        <th class="border border-gray-300 px-4 py-2">中标金额</th>
                        <th class="border border-gray-300 px-4 py-2">中标率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备类别 -->
                    <template v-for="(item, index) in biddingData.equipment" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="biddingData.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.bidAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentWin" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.winAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ item.winRate.toFixed(2) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 元件类别 -->
                    <template v-for="(item, index) in biddingData.components" :key="`components-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="biddingData.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.bidAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentWin" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.winAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ item.winRate.toFixed(2) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 工程类别 -->
                    <template v-for="(item, index) in biddingData.engineering" :key="`engineering-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="biddingData.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.bidAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentWin" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.winAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ item.winRate.toFixed(2) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.bidAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentWin) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.winAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ totalData.winRate.toFixed(2) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.BIDDING_STATUS"
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
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface BiddingItem {
    customer: string;
    bidAmount: number;
    currentWin: number;
    winAmount: number;
    winRate: number;
}

interface BiddingData {
    equipment: BiddingItem[];
    components: BiddingItem[];
    engineering: BiddingItem[];
}

// 获取初始数据模板
const getInitialData = (): BiddingData => ({
    equipment: [
        { customer: '上海', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '国网', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '江苏', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '输配电内配', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '西门子', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '同业', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '用户', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '其它', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 }
    ],
    components: [
        { customer: '用户', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 }
    ],
    engineering: [
        { customer: '一包', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '二包', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '域内合作', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '域外合作', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 },
        { customer: '其它', bidAmount: 0, currentWin: 0, winAmount: 0, winRate: 0 }
    ]
})

// 数据合并函数
const mergeData = (initialData: BiddingData, loadedData: any): BiddingData => {
    if (!loadedData || typeof loadedData !== 'object') {
        return initialData
    }
    
    // 合并设备数据
    if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
        initialData.equipment = initialData.equipment.map(templateItem => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customer === templateItem.customer)
            if (loadedItem) {
                return {
                    customer: templateItem.customer,
                    bidAmount: Number(loadedItem.bidAmount) || 0,
                    currentWin: Number(loadedItem.currentWin) || 0,
                    winAmount: 0, // 累计中标需要重新计算
                    winRate: 0 // 中标率需要重新计算
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.components && Array.isArray(loadedData.components)) {
        initialData.components = initialData.components.map(templateItem => {
            const loadedItem = loadedData.components.find((item: any) => item.customer === templateItem.customer)
            if (loadedItem) {
                return {
                    customer: templateItem.customer,
                    bidAmount: Number(loadedItem.bidAmount) || 0,
                    currentWin: Number(loadedItem.currentWin) || 0,
                    winAmount: 0, // 累计中标需要重新计算
                    winRate: 0 // 中标率需要重新计算
                }
            }
            return templateItem
        })
    }
    
    // 合并工程数据
    if (loadedData.engineering && Array.isArray(loadedData.engineering)) {
        initialData.engineering = initialData.engineering.map(templateItem => {
            const loadedItem = loadedData.engineering.find((item: any) => item.customer === templateItem.customer)
            if (loadedItem) {
                return {
                    customer: templateItem.customer,
                    bidAmount: Number(loadedItem.bidAmount) || 0,
                    currentWin: Number(loadedItem.currentWin) || 0,
                    winAmount: 0, // 累计中标需要重新计算
                    winRate: 0 // 中标率需要重新计算
                }
            }
            return templateItem
        })
    }
    
    return initialData
}

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    const num = Number(value) || 0
    return num.toLocaleString()
}

// 存储所有历史月份数据，用于计算累计中标
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: any }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))

        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://127.0.0.1:3000/bidding-status/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        allData.push({ period: monthPeriod, data: result.data })
                    }
                }
            } catch (error) {
                console.log(`跳过月份 ${monthPeriod}:`, error)
            }
        }

        allMonthsData.value = allData
        console.log('加载的所有月份数据:', allData)
    } catch (error) {
        console.error('加载所有月份数据失败:', error)
    }
}

// 计算累计中标
const calculateWinAmount = (category: string, customer: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.data[category]) {
            const item = monthData.data[category].find((d: any) => d.customer === customer)
            if (item && item.currentWin) {
                total += parseFloat(item.currentWin.toString()) || 0
            }
        }
    }

    // 加上当前月份的输入值
    let currentData: BiddingItem[] = []
    if (category === 'equipment') {
        currentData = biddingData.value.equipment
    } else if (category === 'components') {
        currentData = biddingData.value.components
    } else if (category === 'engineering') {
        currentData = biddingData.value.engineering
    }

    const currentItem = currentData.find(d => d.customer === customer)
    if (currentItem && currentItem.currentWin) {
        total += parseFloat(currentItem.currentWin.toString()) || 0
    }

    return total
}

// 更新累计中标数据
const updateWinAmounts = () => {
    // 更新设备类别累计中标
    biddingData.value.equipment.forEach(item => {
        const cumulative = calculateWinAmount('equipment', item.customer)
        item.winAmount = cumulative
    })

    // 更新元件类别累计中标
    biddingData.value.components.forEach(item => {
        const cumulative = calculateWinAmount('components', item.customer)
        item.winAmount = cumulative
    })

    // 更新工程类别累计中标
    biddingData.value.engineering.forEach(item => {
        const cumulative = calculateWinAmount('engineering', item.customer)
        item.winAmount = cumulative
    })
}

const biddingData = ref<BiddingData>(getInitialData())

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 计算中标率
const calculateWinRate = (winAmount: number, bidAmount: number): number => {
  if (bidAmount === 0) return 0
  return parseFloat(((winAmount / bidAmount) * 100).toFixed(2))
}

// 监听数据变化，自动计算中标率
watch(biddingData, () => {
  // 更新设备中标率
  biddingData.value.equipment.forEach(item => {
    item.winRate = calculateWinRate(item.winAmount, item.bidAmount)
  })
  
  // 更新元件中标率
  biddingData.value.components.forEach(item => {
    item.winRate = calculateWinRate(item.winAmount, item.bidAmount)
  })
  
  // 更新工程中标率
  biddingData.value.engineering.forEach(item => {
    item.winRate = calculateWinRate(item.winAmount, item.bidAmount)
  })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        bidAmount: 0,
        currentWin: 0,
        winAmount: 0,
        winRate: 0
    }
    
    // 计算所有项的总和
    const allItems = [
        ...biddingData.value.equipment,
        ...biddingData.value.components,
        ...biddingData.value.engineering
    ]
    
    allItems.forEach(item => {
        total.bidAmount += item.bidAmount || 0
        total.currentWin += item.currentWin || 0
        total.winAmount += item.winAmount || 0
    })
    
    // 计算总中标率
    total.winRate = total.bidAmount > 0 ? (total.winAmount / total.bidAmount * 100) : 0
    
    return total
})



// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载招投标数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/bidding-status/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('未找到数据，重置为初始模板')
                biddingData.value = getInitialData()

                // 加载历史数据并更新累计中标
                await loadAllMonthsData(targetPeriod)
                updateWinAmounts()
                return
            }
            throw new Error('加载数据失败')
        }
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            const initialData = getInitialData()
            const mergedData = mergeData(initialData, result.data)
            biddingData.value = mergedData
            console.log('合并后的数据:', biddingData.value)
        } else {
            console.log('数据格式不正确，使用初始模板')
            biddingData.value = getInitialData()
        }

        // 加载所有月份数据并更新累计中标
        await loadAllMonthsData(targetPeriod)
        updateWinAmounts()
    } catch (error) {
        console.error('加载数据失败:', error)
        biddingData.value = getInitialData()
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.BIDDING_STATUS, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

// 监听当期数据变化，自动更新累计中标
watch(() => [
    biddingData.value.equipment.map(item => item.currentWin),
    biddingData.value.components.map(item => item.currentWin),
    biddingData.value.engineering.map(item => item.currentWin)
], () => {
    updateWinAmounts()
}, { deep: true })

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksData()
    }
})

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData()
})

const handleSave = async () => {
    try {
        console.log('=== 开始保存招投标数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.BIDDING_STATUS)
        console.log('表单数据:', biddingData.value)
        
        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://127.0.0.1:3000/bidding-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: biddingData.value
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('专用表保存失败，响应:', errorText)
            throw new Error('保存失败')
        }
        
        const result = await response.json()
        console.log('专用表保存成功:', result)

        // 第二步：记录提交状态
        console.log('步骤2：记录提交状态...')
        const recordSuccess = await recordFormSubmission(
            MODULE_IDS.BIDDING_STATUS,
            period.value,
            biddingData.value,
            remarks.value,
            suggestions.value
        )
        
        console.log('提交状态记录结果:', recordSuccess)
        
        if (recordSuccess) {
            console.log('=== 保存完成，所有步骤成功 ===')
            alert('保存成功')
        } else {
            console.warn('=== 专用表保存成功，但提交状态记录失败 ===')
            alert('保存成功，但提交状态记录失败')
        }
    } catch (error) {
        console.error('=== 保存过程中发生错误 ===', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    biddingData.value = getInitialData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('招投标组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
    loadRemarksData()
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
