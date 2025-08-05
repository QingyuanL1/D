<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">坏账准备情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <span class="text-xs text-gray-500">本年新增 = 当期之前各月的本期新增数据自动累计</span>
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
                        <th class="border border-gray-300 px-4 py-2">本期新增</th>
                        <th class="border border-gray-300 px-4 py-2">本年新增</th>
                        <th class="border border-gray-300 px-4 py-2">坏账准备余额</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程板块项目 -->
                    <template v-for="(item, index) in badDebtData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="badDebtData.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearBeginningBalance) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.currentPeriodNewAddition" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ formatNumber(item.yearNewAddition) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatNumber(item.endBalance) }}</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 自建项目行 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 font-medium text-center">自建项目</td>
                        <td class="border border-gray-300 px-4 py-2">自建项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(selfBuiltProject.yearBeginningBalance) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="selfBuiltProject.currentPeriodNewAddition" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(selfBuiltProject.yearNewAddition) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-medium">{{ formatNumber(selfBuiltProject.endBalance) }}</span>
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearBeginningBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriodNewAddition) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.yearNewAddition) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatNumber(totalData.endBalance) }}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_BAD_DEBT_PROVISION"
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

interface BadDebtItem {
    customerAttribute: string;
    yearBeginningBalance: number;
    currentPeriodNewAddition: number;
    yearNewAddition: number;
    endBalance: number;
}

interface BadDebtData {
    items: BadDebtItem[];
}

const fixedPlanData: BadDebtData = {
    items: [
        { customerAttribute: '一包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '二包项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '域内合作项目', yearBeginningBalance: 7.48, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 7.48 },
        { customerAttribute: '域外合作项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '新能源项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '苏州项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '抢修项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 },
        { customerAttribute: '运检项目', yearBeginningBalance: 0.00, currentPeriodNewAddition: 0, yearNewAddition: 0, endBalance: 0 }
    ]
}

const badDebtData = ref<BadDebtData>(JSON.parse(JSON.stringify(fixedPlanData)))
const selfBuiltProject = ref({
    yearBeginningBalance: 0.00,
    currentPeriodNewAddition: 0,
    yearNewAddition: 0,
    endBalance: 0
})
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算本年新增（累计当期之前各月的本期新增数据）
const calculateYearNewAddition = async (targetPeriod: string) => {
    try {
        const [year] = targetPeriod.split('-')
        const currentMonth = parseInt(targetPeriod.split('-')[1])
        
        // 为每个客户计算本年新增
        for (let customer of badDebtData.value.items) {
            let yearNewAddition = 0
            
            // 从1月累计到当前月份前一个月的"本期新增"
            for (let m = 1; m < currentMonth; m++) {
                const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
                try {
                    const response = await fetch(`http://127.0.0.1:3000/nanhua-bad-debt-provision/${monthPeriod}`)
                    if (response.ok) {
                        const result = await response.json()
                        const customerData = result.data.items.find((c: any) => c.customerAttribute === customer.customerAttribute)
                        if (customerData) {
                            yearNewAddition += customerData.currentPeriodNewAddition || 0
                        }
                    }
                } catch (error) {
                    console.warn(`无法加载${monthPeriod}的数据:`, error)
                }
            }
            
            // 加上当前月份的本期新增
            yearNewAddition += customer.currentPeriodNewAddition || 0
            
            customer.yearNewAddition = yearNewAddition
            // 计算坏账准备余额 = 年初余额 + 本年新增（已包含当前月份）
            customer.endBalance = customer.yearBeginningBalance + customer.yearNewAddition
        }
        
        // 计算自建项目的本年新增
        let selfBuiltYearNewAddition = 0
        for (let m = 1; m < currentMonth; m++) {
            const monthPeriod = `${year}-${m.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://127.0.0.1:3000/nanhua-bad-debt-provision/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.data.selfBuiltProject) {
                        selfBuiltYearNewAddition += result.data.selfBuiltProject.currentPeriodNewAddition || 0
                    }
                }
            } catch (error) {
                console.warn(`无法加载${monthPeriod}的自建项目数据:`, error)
            }
        }
        
        // 加上当前月份的本期新增
        selfBuiltYearNewAddition += selfBuiltProject.value.currentPeriodNewAddition || 0
        
        selfBuiltProject.value.yearNewAddition = selfBuiltYearNewAddition
        // 计算自建项目坏账准备余额 = 年初余额 + 本年新增（已包含当前月份）
        selfBuiltProject.value.endBalance = selfBuiltProject.value.yearBeginningBalance + selfBuiltProject.value.yearNewAddition
        
    } catch (error) {
        console.error('计算本年新增失败:', error)
    }
}

// 监听数据变化，自动重新计算本年新增和坏账准备余额
watch(() => badDebtData.value.items, async (newItems) => {
    // 当本期新增发生变化时，重新计算本年新增
    await calculateYearNewAddition(period.value)
}, { deep: true })

// 监听自建项目数据变化
watch(() => selfBuiltProject.value, async (newProject) => {
    // 当本期新增发生变化时，重新计算本年新增
    await calculateYearNewAddition(period.value)
}, { deep: true })

// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearBeginningBalance: 0,
        currentPeriodNewAddition: 0,
        yearNewAddition: 0,
        endBalance: 0
    }
    
    badDebtData.value.items.forEach(item => {
        total.yearBeginningBalance += item.yearBeginningBalance || 0
        total.currentPeriodNewAddition += item.currentPeriodNewAddition || 0
        total.yearNewAddition += item.yearNewAddition || 0
        total.endBalance += item.endBalance || 0
    })
    
    // 加上自建项目
    total.yearBeginningBalance += selfBuiltProject.value.yearBeginningBalance || 0
    total.currentPeriodNewAddition += selfBuiltProject.value.currentPeriodNewAddition || 0
    total.yearNewAddition += selfBuiltProject.value.yearNewAddition || 0
    total.endBalance += selfBuiltProject.value.endBalance || 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/nanhua-bad-debt-provision/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log(`${targetPeriod}期间无数据，重置为默认状态`)
            resetToDefaultData()
            return
        }
        const result = await response.json()
        if (result.data) {
            if (result.data.items) {
                badDebtData.value.items = result.data.items.map((item: any) => ({
                    customerAttribute: item.customerAttribute,
                    yearBeginningBalance: Number(item.yearBeginningBalance) || 0,
                    currentPeriodNewAddition: Number(item.currentPeriodNewAddition) || 0,
                    yearNewAddition: Number(item.yearNewAddition) || 0,
                    endBalance: Number(item.endBalance) || 0
                }))
            }
            if (result.data.selfBuiltProject) {
                selfBuiltProject.value = {
                    yearBeginningBalance: Number(result.data.selfBuiltProject.yearBeginningBalance) || 0,
                    currentPeriodNewAddition: Number(result.data.selfBuiltProject.currentPeriodNewAddition) || 0,
                    yearNewAddition: Number(result.data.selfBuiltProject.yearNewAddition) || 0,
                    endBalance: Number(result.data.selfBuiltProject.endBalance) || 0
                }
            }
        }
        
        // 加载完数据后重新计算本年新增
        await calculateYearNewAddition(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    badDebtData.value = JSON.parse(JSON.stringify(fixedPlanData))
    selfBuiltProject.value = {
        yearBeginningBalance: 0.00,
        currentPeriodNewAddition: 0,
        yearNewAddition: 0,
        endBalance: 0
    }
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.NANHUA_BAD_DEBT_PROVISION}/${targetPeriod}`)
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
        await calculateYearNewAddition(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        resetToDefaultData()
        await loadData(newPeriod)
        await calculateYearNewAddition(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/nanhua-bad-debt-provision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: badDebtData.value.items,
                    selfBuiltProject: selfBuiltProject.value
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_BAD_DEBT_PROVISION, period.value, { items: badDebtData.value.items, selfBuiltProject: selfBuiltProject.value }, remarks.value, suggestions.value)
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
    await calculateYearNewAddition(targetPeriod)
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