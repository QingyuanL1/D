<template>
    <div class="max-w-[1800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">坏账准备情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">累计已收款=历史月份+当期已收款</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-20">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">本年新增</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">当期已收款</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">累计已收款</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">坏账准备余额</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in badDebtProvisionData.items" :key="`bad-debt-${index}`">
                        <tr>
                            <td v-if="isFirstInSegment(index)" 
                                :rowspan="getSegmentRowspan(item.segmentAttribute)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.segmentAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                {{ formatNumber(item.yearBeginningBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model.number="item.yearNewIncrease" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    placeholder="0.00"
                                    @input="calculateProvisionBalance(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model.number="item.currentCollected" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    placeholder="0.00"
                                    @input="onCurrentCollectedChange(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulativeCollected) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium" :class="getProvisionColor(item.provisionBalance)">
                                    {{ formatNumber(item.provisionBalance) }}
                                </span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginningBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearNewIncrease) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentCollected) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeCollected) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold" :class="getProvisionColor(totalData.provisionBalance)">
                                {{ formatNumber(totalData.provisionBalance) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_BAD_DEBT_PROVISION"
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

interface BadDebtProvisionItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearBeginningBalance: number;
    yearNewIncrease: number;
    currentCollected: number;
    cumulativeCollected: number;
    provisionBalance: number;
}

interface BadDebtProvisionData {
    items: BadDebtProvisionItem[];
}

const fixedPlanData: BadDebtProvisionData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '申业项目', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningBalance: 0, yearNewIncrease: 0, currentCollected: 0, cumulativeCollected: 0, provisionBalance: 0 }
    ]
}

const badDebtProvisionData = ref<BadDebtProvisionData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

const getProvisionColor = (balance: number): string => {
    if (balance > 0) return 'text-red-600'
    if (balance < 0) return 'text-green-600'
    return 'text-gray-600'
}

// 计算坏账准备余额
const calculateProvisionBalance = (item: BadDebtProvisionItem) => {
    // 坏账准备余额 = 年初余额 + 本年新增 - 累计已收款
    item.provisionBalance = (item.yearBeginningBalance || 0) + (item.yearNewIncrease || 0) - (item.cumulativeCollected || 0)
}

// 当期已收款变化时的处理
const onCurrentCollectedChange = async (item: BadDebtProvisionItem) => {
    // 重新计算累计已收款
    await calculateCumulativeCollected(period.value)
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return badDebtProvisionData.value.items[index].segmentAttribute !== badDebtProvisionData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return badDebtProvisionData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算累计已收款
const calculateCumulativeCollected = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个项目计算累计已收款
        for (let item of badDebtProvisionData.value.items) {
            let totalCollected = 0
            
            // 从1月累计到当前月份前一个月的历史数据，加上当前月份的当期已收款
            for (let m = 1; m < currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-bad-debt-provision/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const itemData = result.data.items.find((i: any) => 
                            i.segmentAttribute === item.segmentAttribute && 
                            i.customerAttribute === item.customerAttribute
                        )
                        if (itemData) {
                            totalCollected += itemData.currentCollected || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 加上当前月份的当期已收款
            totalCollected += item.currentCollected || 0
            
            item.cumulativeCollected = totalCollected
            
            // 计算坏账准备余额 = 年初余额 + 本年新增 - 累计已收款
            item.provisionBalance = (item.yearBeginningBalance || 0) + (item.yearNewIncrease || 0) - item.cumulativeCollected
        }
        
    } catch (error) {
        console.error('计算累计已收款失败:', error)
    }
}



// 监听数据变化，自动重新计算
watch(() => badDebtProvisionData.value.items, async (newItems) => {
    await calculateCumulativeCollected(period.value)
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningBalance: 0,
        yearNewIncrease: 0,
        currentCollected: 0,
        cumulativeCollected: 0,
        provisionBalance: 0
    }
    
    badDebtProvisionData.value.items.forEach(item => {
        total.yearBeginningBalance += item.yearBeginningBalance || 0
        total.yearNewIncrease += item.yearNewIncrease || 0
        total.currentCollected += item.currentCollected || 0
        total.cumulativeCollected += item.cumulativeCollected || 0
        total.provisionBalance += item.provisionBalance || 0
    })
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-bad-debt-provision/${targetPeriod}`)
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
            badDebtProvisionData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearBeginningBalance: Number(item.yearBeginningBalance) || 0,
                yearNewIncrease: Number(item.yearNewIncrease) || 0,
                currentCollected: Number(item.currentCollected) || 0,
                cumulativeCollected: Number(item.cumulativeCollected) || 0,
                provisionBalance: Number(item.provisionBalance) || 0
            }))
        }
        
        // 重新计算累计值
        await calculateCumulativeCollected(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    badDebtProvisionData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_BAD_DEBT_PROVISION}/${targetPeriod}`)
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
    await calculateCumulativeCollected(newPeriod.toString())
    loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateCumulativeCollected(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-bad-debt-provision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: badDebtProvisionData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_BAD_DEBT_PROVISION, period.value, { items: badDebtProvisionData.value.items }, remarks.value, suggestions.value)
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
    await calculateCumulativeCollected(targetPeriod)
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