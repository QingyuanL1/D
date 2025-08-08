<template>
    <div class="max-w-[1800px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">应收账款情况 <span class="text-sm text-gray-600">当期应收余额已减去坏账准备</span></h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">累计=前面各月当期值之和</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-20">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">年初应收余额</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">当期开票</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">累计开票</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">当期收款</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">累计收款</th>
                        <th class="border border-gray-300 px-4 py-2 w-24">当期应收余额 <span class="text-xs text-gray-500">已减去坏账准备</span></th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in accountsReceivableData.items" :key="`accounts-${index}`">
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
                                {{ formatNumber(item.yearBeginningBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentInvoicing" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulativeInvoicing) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentCollection" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    placeholder="0.00"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.cumulativeCollection) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.currentReceivableBalance) }}
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
                            {{ formatNumber(totalData.currentInvoicing) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeInvoicing) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentCollection) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeCollection) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentReceivableBalance) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_ACCOUNTS_RECEIVABLE"
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

interface AccountsReceivableItem {
    segmentAttribute: string;
    customerAttribute: string;
    yearBeginningBalance: number;
    currentInvoicing: number;
    cumulativeInvoicing: number;
    currentCollection: number;
    cumulativeCollection: number;
    currentReceivableBalance: number;
}

interface AccountsReceivableData {
    items: AccountsReceivableItem[];
}

const fixedPlanData: AccountsReceivableData = {
    items: [
        { segmentAttribute: '设备', customerAttribute: '申业项目', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '用户项目', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '贸易', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 },
        { segmentAttribute: '设备', customerAttribute: '代理设备', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理工程', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 },
        { segmentAttribute: '其他', customerAttribute: '代理设计', yearBeginningBalance: 0, currentInvoicing: 0, cumulativeInvoicing: 0, currentCollection: 0, cumulativeCollection: 0, currentReceivableBalance: 0 }
    ]
}

const accountsReceivableData = ref<AccountsReceivableData>(JSON.parse(JSON.stringify(fixedPlanData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 判断是否是板块的第一行
const isFirstInSegment = (index: number): boolean => {
    if (index === 0) return true
    return accountsReceivableData.value.items[index].segmentAttribute !== accountsReceivableData.value.items[index - 1].segmentAttribute
}

// 计算板块的行数
const getSegmentRowspan = (segmentAttribute: string): number => {
    return accountsReceivableData.value.items.filter(item => item.segmentAttribute === segmentAttribute).length
}

// 计算累计开票和累计收款
const calculateCumulativeValues = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个项目计算累计值
        for (let item of accountsReceivableData.value.items) {
            let totalInvoicing = 0
            let totalCollection = 0
            
            // 从1月累计到当前月份的所有当期值
            for (let m = 1; m <= currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/tuoyuan-accounts-receivable/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const itemData = result.data.items.find((i: any) => 
                            i.segmentAttribute === item.segmentAttribute && 
                            i.customerAttribute === item.customerAttribute
                        )
                        if (itemData) {
                            totalInvoicing += itemData.currentInvoicing || 0
                            totalCollection += itemData.currentCollection || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            item.cumulativeInvoicing = totalInvoicing
            item.cumulativeCollection = totalCollection
            
            // 注意：不在此处计算currentReceivableBalance，因为后端已经包含了坏账准备的扣减
        }
        
    } catch (error) {
        console.error('计算累计值失败:', error)
    }
}

// 注意：不再监听数据变化自动重新计算，因为后端已经处理了坏账准备扣减

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningBalance: 0,
        currentInvoicing: 0,
        cumulativeInvoicing: 0,
        currentCollection: 0,
        cumulativeCollection: 0,
        currentReceivableBalance: 0
    }
    
    accountsReceivableData.value.items.forEach(item => {
        total.yearBeginningBalance += item.yearBeginningBalance || 0
        total.currentInvoicing += item.currentInvoicing || 0
        total.cumulativeInvoicing += item.cumulativeInvoicing || 0
        total.currentCollection += item.currentCollection || 0
        total.cumulativeCollection += item.cumulativeCollection || 0
        total.currentReceivableBalance += item.currentReceivableBalance || 0
    })
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-accounts-receivable/${targetPeriod}`)
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
            accountsReceivableData.value.items = result.data.items.map((item: any) => ({
                segmentAttribute: item.segmentAttribute,
                customerAttribute: item.customerAttribute,
                yearBeginningBalance: Number(item.yearBeginningBalance) || 0,
                currentInvoicing: Number(item.currentInvoicing) || 0,
                cumulativeInvoicing: Number(item.cumulativeInvoicing) || 0,
                currentCollection: Number(item.currentCollection) || 0,
                cumulativeCollection: Number(item.cumulativeCollection) || 0,
                currentReceivableBalance: Number(item.currentReceivableBalance) || 0
            }))
            console.log('已加载后端数据，包含坏账准备扣减的当期应收余额')
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    accountsReceivableData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_ACCOUNTS_RECEIVABLE}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-accounts-receivable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: accountsReceivableData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_ACCOUNTS_RECEIVABLE, period.value, { items: accountsReceivableData.value.items }, remarks.value, suggestions.value)
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