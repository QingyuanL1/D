<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务净利润贡献情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-32">业务类型</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年度预算</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">分类贡献占比</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in netProfitData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="isFirstInBusinessType(index)" 
                                :rowspan="getBusinessTypeRowspan(item.businessType)" 
                                class="border border-gray-300 px-4 py-2 font-medium text-center">
                                {{ item.businessType }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.annualBudget" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-100" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentPeriod" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    @input="calculateValues(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.cumulative" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-100" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.contributionRatio) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualBudget) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentPeriod) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.contributionRatio) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_MAIN_BUSINESS_NET_PROFIT_CONTRIBUTION"
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

interface NetProfitItem {
    businessType: string;
    customerAttribute: string;
    annualBudget: number;
    currentPeriod: number;
    cumulative: number;
    contributionRatio: number;
}

interface NetProfitData {
    items: NetProfitItem[];
}

const fixedPlanData: NetProfitData = {
    items: [
        { businessType: '主营业务', customerAttribute: '电业项目', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '主营业务', customerAttribute: '用户项目', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '主营业务', customerAttribute: '贸易', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '主营业务', customerAttribute: '代理设备', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '主营业务', customerAttribute: '代理工程', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '主营业务', customerAttribute: '代理设计', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 },
        { businessType: '非主营业务', customerAttribute: '其他', annualBudget: 0, currentPeriod: 0, cumulative: 0, contributionRatio: 0.00 }
    ]
}

const netProfitData = ref<NetProfitData>(JSON.parse(JSON.stringify(fixedPlanData)))
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

// 计算分类贡献占比
const calculateValues = (item: NetProfitItem) => {
    // 当期数据变化时，累计值由后端计算，这里不处理
    // 计算分类贡献占比：该项累计值占总累计值的比例
    calculateAllContributionRatios()
}

// 计算所有项目的分类贡献占比
const calculateAllContributionRatios = () => {
    const totalCumulative = netProfitData.value.items.reduce((sum, i) => sum + (parseFloat(i.cumulative?.toString() || '0') || 0), 0)
    
    netProfitData.value.items.forEach(item => {
        if (totalCumulative && totalCumulative !== 0) {
            item.contributionRatio = (item.cumulative / totalCumulative) * 100
        } else {
            item.contributionRatio = 0
        }
    })
}

// 判断是否是业务类型的第一行
const isFirstInBusinessType = (index: number): boolean => {
    if (index === 0) return true
    return netProfitData.value.items[index].businessType !== netProfitData.value.items[index - 1].businessType
}

// 计算业务类型的行数
const getBusinessTypeRowspan = (businessType: string): number => {
    return netProfitData.value.items.filter(item => item.businessType === businessType).length
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualBudget: 0,
        currentPeriod: 0,
        cumulative: 0,
        contributionRatio: 100 // 合计的分类贡献占比应该是100%
    }
    
    netProfitData.value.items.forEach(item => {
        total.annualBudget += parseFloat(item.annualBudget?.toString() || '0') || 0
        total.currentPeriod += parseFloat(item.currentPeriod?.toString() || '0') || 0
        total.cumulative += parseFloat(item.cumulative?.toString() || '0') || 0
    })
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/tuoyuan-main-business-net-profit-contribution/${targetPeriod}`)
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
            netProfitData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.businessType === defaultItem.businessType && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                if (dbItem) {
                    const newItem = {
                        businessType: defaultItem.businessType,
                        customerAttribute: defaultItem.customerAttribute,
                        annualBudget: Number(dbItem.annualBudget) || 0,
                        currentPeriod: Number(dbItem.currentPeriod) || 0,
                        cumulative: Number(dbItem.cumulative) || 0,
                        contributionRatio: Number(dbItem.contributionRatio) || 0
                    }
                    return newItem
                } else {
                    return { ...defaultItem }
                }
            })
            // 加载完数据后重新计算分类贡献占比
            calculateAllContributionRatios()
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    netProfitData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.TUOYUAN_MAIN_BUSINESS_NET_PROFIT_CONTRIBUTION}/${targetPeriod}`)
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
        const response = await fetch('http://127.0.0.1:3000/tuoyuan-main-business-net-profit-contribution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: netProfitData.value.items.map(item => ({
                        businessType: item.businessType,
                        customerAttribute: item.customerAttribute,
                        annualBudget: item.annualBudget,
                        currentPeriod: item.currentPeriod
                        // 只保存当期数据，累计和执行进度由后端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_MAIN_BUSINESS_NET_PROFIT_CONTRIBUTION, period.value, { items: netProfitData.value.items }, remarks.value, suggestions.value)
        
        // 保存成功后重新加载数据以获取最新的累计值
        await loadData(period.value)
        
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