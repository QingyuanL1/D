<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">拓源成本暂估入库和计提情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">本年累计 = 年初金额 + 当期新增累计</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年初金额</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期新增</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">本年累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">计提率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in costEstimationData.items" :key="`item-${index}`">
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
                                {{ formatNumber(item.yearBeginningAmount) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentPeriodNewAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentYearCumulative) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.provisionRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginningAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodNewAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentYearCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.provisionRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_COST_ESTIMATION"
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

interface CostEstimationItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearBeginningAmount: number;
    currentPeriodNewAmount: number;
    currentYearCumulative: number;
    provisionRate: number;
}

interface CostEstimationData {
    items: CostEstimationItem[];
}

const fixedPlanData: CostEstimationData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '电业项目', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理工程', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设计', yearBeginningAmount: 0.00, currentPeriodNewAmount: 0, currentYearCumulative: 0, provisionRate: 0 }
    ]
}

const costEstimationData = ref<CostEstimationData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return '0.00'
    const numValue = Number(value)
    if (numValue === 0) return '0.00'
    return numValue.toFixed(2)
}

const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(Number(value))) return '0.00'
    const numValue = Number(value)
    if (numValue === 0) return '0.00'
    return numValue.toFixed(2)
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return costEstimationData.value.items[index].segmentAttribute !== costEstimationData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return costEstimationData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算当期新增累计（年初到当前月份的累计）
const calculateCurrentYearCumulative = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个项目计算当期新增累计
        for (let item of costEstimationData.value.items) {
            let cumulativeNewAmount = 0
            
            // 从1月累计到当前月份的"当期新增"
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-cost-estimation/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const projectData = result.data.items.find((p: any) => 
                            p.segment_attribute === item.segmentAttribute && 
                            p.customer_attribute === item.customerAttribute
                        )
                        if (projectData) {
                            cumulativeNewAmount += Number(projectData.current_period_new_amount) || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 如果计算的是当前月份，需要使用当前输入的值替换数据库中的值
            if (targetPeriod === period.value) {
                // 从累计中减去数据库中当前月份的值，加上当前输入的值
                try {
                    const currentResponse = await fetch(`http://127.0.0.1:3000/tuoyuan-cost-estimation/${targetPeriod}`)
                    if (currentResponse.ok) {
                        const currentResult = await currentResponse.json()
                        const currentDbData = currentResult.data.items.find((p: any) => 
                            p.segment_attribute === item.segmentAttribute && 
                            p.customer_attribute === item.customerAttribute
                        )
                        if (currentDbData) {
                            cumulativeNewAmount = cumulativeNewAmount - (Number(currentDbData.current_period_new_amount) || 0) + (Number(item.currentPeriodNewAmount) || 0)
                        }
                    }
                } catch (error) {
                    console.warn('获取当前月份数据失败:', error)
                }
            }
            
            // 本年累计 = 年初金额 + 当期新增累计
            item.currentYearCumulative = (Number(item.yearBeginningAmount) || 0) + cumulativeNewAmount
            
            // 计提率 = 当期新增累计 / 年初金额 * 100%
            item.provisionRate = item.yearBeginningAmount > 0 ? 
                (cumulativeNewAmount / item.yearBeginningAmount) * 100 : 
                (cumulativeNewAmount !== 0 ? (cumulativeNewAmount > 0 ? 100 : -100) : 0)
            
            console.log(`${item.segmentAttribute}-${item.customerAttribute}: 年初=${item.yearBeginningAmount}, 累计新增=${cumulativeNewAmount}, 本年累计=${item.currentYearCumulative}`)
        }
        
    } catch (error) {
        console.error('计算本年累计失败:', error)
    }
}

// 监听当期新增字段变化，自动重新计算本年累计和计提率
watch(() => costEstimationData.value.items.map(item => item.currentPeriodNewAmount), () => {
    // 简化计算：直接基于当前输入值计算
    costEstimationData.value.items.forEach(item => {
        const cumulativeNewAmount = Number(item.currentPeriodNewAmount) || 0
        item.currentYearCumulative = (Number(item.yearBeginningAmount) || 0) + cumulativeNewAmount
        item.provisionRate = item.yearBeginningAmount > 0 ? 
            (cumulativeNewAmount / item.yearBeginningAmount) * 100 : 
            (cumulativeNewAmount !== 0 ? (cumulativeNewAmount > 0 ? 100 : -100) : 0)
    })
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningAmount: 0,
        currentPeriodNewAmount: 0,
        currentYearCumulative: 0,
        provisionRate: 0
    }
    
    costEstimationData.value.items.forEach(item => {
        total.yearBeginningAmount += item.yearBeginningAmount || 0
        total.currentPeriodNewAmount += item.currentPeriodNewAmount || 0
        total.currentYearCumulative += item.currentYearCumulative || 0
    })
    
    // 计算总计提率 = 总当期新增累计 / 总年初金额 * 100%
    const totalCumulativeNewAmount = total.currentYearCumulative - total.yearBeginningAmount
    total.provisionRate = total.yearBeginningAmount > 0 ? 
        (totalCumulativeNewAmount / total.yearBeginningAmount) * 100 : 
        (totalCumulativeNewAmount !== 0 ? (totalCumulativeNewAmount > 0 ? 100 : -100) : 0)
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-cost-estimation/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        console.log('API返回的数据:', result)
        if (result.data && result.data.items) {
            // 合并数据库数据和默认数据，保证顺序一致
            const dbItems = result.data.items
            console.log('数据库项目:', dbItems)
            costEstimationData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.segment_attribute === defaultItem.segmentAttribute && 
                    item.customer_attribute === defaultItem.customerAttribute
                )
                console.log(`匹配项目 ${defaultItem.segmentAttribute}-${defaultItem.customerAttribute}:`, dbItem)
                return {
                    segmentAttribute: defaultItem.segmentAttribute,
                    customerAttribute: defaultItem.customerAttribute,
                    yearBeginningAmount: dbItem ? Number(dbItem.year_beginning_amount) || 0 : defaultItem.yearBeginningAmount,
                    currentPeriodNewAmount: dbItem ? Number(dbItem.current_period_new_amount) || 0 : 0,
                    currentYearCumulative: dbItem ? Number(dbItem.current_year_cumulative) || 0 : 0,
                    provisionRate: dbItem ? Number(dbItem.provision_rate) || 0 : 0
                }
            })
            console.log('最终处理后的数据:', costEstimationData.value.items)
        }
        
        // 加载完数据后重新计算本年累计
        await calculateCurrentYearCumulative(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    costEstimationData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_COST_ESTIMATION}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-cost-estimation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: costEstimationData.value.items.map(item => ({
                        segmentAttribute: item.segmentAttribute,
                        customerAttribute: item.customerAttribute,
                        yearBeginningAmount: item.yearBeginningAmount,
                        currentPeriodNewAmount: item.currentPeriodNewAmount,
                        // 不保存累计值和计提率，由前端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_COST_ESTIMATION, period.value, { items: costEstimationData.value.items }, remarks.value, suggestions.value)
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