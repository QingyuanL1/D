<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务产值--自行施工情况分析</h1>
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
                        <th class="border border-gray-300 px-4 py-2 w-32">公司设计产能</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">年度产能计划</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">当期产能累计</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">计划执行进度</th>
                        <th class="border border-gray-300 px-4 py-2 w-32">产能利用率</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(item, index) in productionData.items" :key="`item-${index}`">
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
                                    v-model="item.companyDesignCapacity" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    @input="calculateValues(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.annualCapacityPlan" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right" 
                                    step="0.01"
                                    @input="calculateValues(item)"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input 
                                    v-model="item.currentCapacityCumulative" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-100" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.planExecutionProgress) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="text-sm font-medium">{{ formatPercentage(item.capacityUtilizationRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.companyDesignCapacity) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualCapacityPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentCapacityCumulative) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.planExecutionProgress) }}%</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.capacityUtilizationRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PRODUCTION_VALUE_SELF_CONSTRUCTION"
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

interface ProductionItem {
    businessType: string;
    customerAttribute: string;
    companyDesignCapacity: number;
    annualCapacityPlan: number;
    currentCapacityCumulative: number;
    planExecutionProgress: number;
    capacityUtilizationRate: number;
}

interface ProductionData {
    items: ProductionItem[];
}

const fixedPlanData: ProductionData = {
    items: [
        { businessType: '主营业务产值', customerAttribute: '电业项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 },
        { businessType: '主营业务产值', customerAttribute: '用户项目', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 },
        { businessType: '主营业务产值', customerAttribute: '贸易', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 },
        { businessType: '主营业务产值', customerAttribute: '代理设备', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 },
        { businessType: '主营业务产值', customerAttribute: '代理工程', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 },
        { businessType: '主营业务产值', customerAttribute: '代理设计', companyDesignCapacity: 0, annualCapacityPlan: 0, currentCapacityCumulative: 0, planExecutionProgress: 0.00, capacityUtilizationRate: 0.00 }
    ]
}

const productionData = ref<ProductionData>(JSON.parse(JSON.stringify(fixedPlanData)))
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

// 计算比例
const calculateValues = (item: ProductionItem) => {
    // 计划执行进度 = (当期产能累计 / 年度产能计划) * 100
    if (item.annualCapacityPlan && item.annualCapacityPlan !== 0) {
        item.planExecutionProgress = (item.currentCapacityCumulative / item.annualCapacityPlan) * 100
    } else {
        item.planExecutionProgress = 0
    }
    
    // 产能利用率 = (当期产能累计 / 公司设计产能) * 100
    if (item.companyDesignCapacity && item.companyDesignCapacity !== 0) {
        item.capacityUtilizationRate = (item.currentCapacityCumulative / item.companyDesignCapacity) * 100
    } else {
        item.capacityUtilizationRate = 0
    }
}

// 判断是否是业务类型的第一行
const isFirstInBusinessType = (index: number): boolean => {
    if (index === 0) return true
    return productionData.value.items[index].businessType !== productionData.value.items[index - 1].businessType
}

// 计算业务类型的行数
const getBusinessTypeRowspan = (businessType: string): number => {
    return productionData.value.items.filter(item => item.businessType === businessType).length
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        companyDesignCapacity: 0,
        annualCapacityPlan: 0,
        currentCapacityCumulative: 0,
        planExecutionProgress: 0,
        capacityUtilizationRate: 0
    }
    
    productionData.value.items.forEach(item => {
        total.companyDesignCapacity += parseFloat(item.companyDesignCapacity?.toString() || '0') || 0
        total.annualCapacityPlan += parseFloat(item.annualCapacityPlan?.toString() || '0') || 0
        total.currentCapacityCumulative += parseFloat(item.currentCapacityCumulative?.toString() || '0') || 0
    })
    
    // 计算总计划执行进度
    if (total.annualCapacityPlan && total.annualCapacityPlan !== 0) {
        total.planExecutionProgress = (total.currentCapacityCumulative / total.annualCapacityPlan) * 100
    } else {
        total.planExecutionProgress = 0
    }
    
    // 计算总产能利用率
    if (total.companyDesignCapacity && total.companyDesignCapacity !== 0) {
        total.capacityUtilizationRate = (total.currentCapacityCumulative / total.companyDesignCapacity) * 100
    } else {
        total.capacityUtilizationRate = 0
    }
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/tuoyuan-main-business-production-value-self-construction/${targetPeriod}`)
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
            productionData.value.items = fixedPlanData.items.map(defaultItem => {
                const dbItem = dbItems.find((item: any) => 
                    item.businessType === defaultItem.businessType && 
                    item.customerAttribute === defaultItem.customerAttribute
                )
                if (dbItem) {
                    const newItem = {
                        businessType: defaultItem.businessType,
                        customerAttribute: defaultItem.customerAttribute,
                        companyDesignCapacity: Number(dbItem.companyDesignCapacity) || 0,
                        annualCapacityPlan: Number(dbItem.annualCapacityPlan) || 0,
                        currentCapacityCumulative: Number(dbItem.currentCapacityCumulative) || 0,
                        planExecutionProgress: Number(dbItem.planExecutionProgress) || 0,
                        capacityUtilizationRate: Number(dbItem.capacityUtilizationRate) || 0
                    }
                    // 重新计算比例
                    calculateValues(newItem)
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
    productionData.value = JSON.parse(JSON.stringify(fixedPlanData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PRODUCTION_VALUE_SELF_CONSTRUCTION}/${targetPeriod}`)
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
        const response = await fetch('http://47.111.95.19:3000/tuoyuan-main-business-production-value-self-construction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: productionData.value.items.map(item => ({
                        businessType: item.businessType,
                        customerAttribute: item.customerAttribute,
                        companyDesignCapacity: item.companyDesignCapacity,
                        annualCapacityPlan: item.annualCapacityPlan,
                        currentCapacityCumulative: item.currentCapacityCumulative
                        // 只保存基础数据，比例由后端计算
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.TUOYUAN_MAIN_BUSINESS_PRODUCTION_VALUE_SELF_CONSTRUCTION, period.value, { items: productionData.value.items }, remarks.value, suggestions.value)
        
        // 保存成功后重新加载数据以获取最新的产能累计值
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