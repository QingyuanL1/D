<template>
    <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3">招投标情况（单位：万元）</h4>
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
                    <template v-for="(item, index) in data.equipment" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="data.equipment.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.bidAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentWin) }}
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
                    <template v-for="(item, index) in data.components" :key="`components-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="data.components.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.bidAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentWin) }}
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
                    <template v-for="(item, index) in data.engineering" :key="`engineering-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="data.engineering.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customer }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.bidAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentWin) }}
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
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'

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

const props = defineProps<{
  period: string
}>()

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

const data = ref<BiddingData>(getInitialData())

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
                const response = await fetch(`http://47.111.95.19:3000/bidding-status/${monthPeriod}`)
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
        currentData = data.value.equipment
    } else if (category === 'components') {
        currentData = data.value.components
    } else if (category === 'engineering') {
        currentData = data.value.engineering
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
    data.value.equipment.forEach(item => {
        const cumulative = calculateWinAmount('equipment', item.customer)
        item.winAmount = cumulative
    })

    // 更新元件类别累计中标
    data.value.components.forEach(item => {
        const cumulative = calculateWinAmount('components', item.customer)
        item.winAmount = cumulative
    })

    // 更新工程类别累计中标
    data.value.engineering.forEach(item => {
        const cumulative = calculateWinAmount('engineering', item.customer)
        item.winAmount = cumulative
    })
}

// 计算中标率
const calculateWinRate = (winAmount: number, bidAmount: number): number => {
  if (bidAmount === 0) return 0
  return parseFloat(((winAmount / bidAmount) * 100).toFixed(2))
}

// 监听数据变化，自动计算中标率
watch(data, () => {
  // 更新设备中标率
  data.value.equipment.forEach(item => {
    item.winRate = calculateWinRate(item.winAmount, item.bidAmount)
  })

  // 更新元件中标率
  data.value.components.forEach(item => {
    item.winRate = calculateWinRate(item.winAmount, item.bidAmount)
  })

  // 更新工程中标率
  data.value.engineering.forEach(item => {
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
        ...data.value.equipment,
        ...data.value.components,
        ...data.value.engineering
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
        const response = await fetch(`http://47.111.95.19:3000/bidding-status/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('未找到数据，重置为初始模板')
                data.value = getInitialData()

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
            data.value = mergedData
            console.log('合并后的数据:', data.value)
        } else {
            console.log('数据格式不正确，使用初始模板')
            data.value = getInitialData()
        }

        // 加载所有月份数据并更新累计中标
        await loadAllMonthsData(targetPeriod)
        updateWinAmounts()
    } catch (error) {
        console.error('加载数据失败:', error)
        data.value = getInitialData()
    }
}

// 监听当期数据变化，自动更新累计中标
watch(() => [
    data.value.equipment.map(item => item.currentWin),
    data.value.components.map(item => item.currentWin),
    data.value.engineering.map(item => item.currentWin)
], () => {
    updateWinAmounts()
}, { deep: true })

// 监听期间变化
watch(() => props.period, (newPeriod) => {
    if (newPeriod) {
        loadData(newPeriod)
    }
}, { immediate: true })

onMounted(() => {
    console.log('招投标报表组件挂载，当前期间:', props.period)
    if (props.period) {
        loadData(props.period)
    }
})
</script>
