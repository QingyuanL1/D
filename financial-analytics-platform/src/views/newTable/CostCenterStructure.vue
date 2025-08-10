<template>
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">成本中心结构与质量（按年度计划口径分解）（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-700">对应当期收入：</h2>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2 w-24" rowspan="2">板块</th>
                        <th class="border border-gray-300 px-4 py-2 w-32" rowspan="2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2 w-32" rowspan="2">累计执行（万元）</th>
                        <th class="border border-gray-300 px-4 py-2 w-32" rowspan="2">当月实际（万元）</th>
                        <th class="border border-gray-300 px-4 py-2 w-32" rowspan="2">分项占收入比</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <tr v-for="(item, index) in equipmentData" :key="`equipment-${index}`" 
                        :class="item.isCategory ? 'bg-blue-50' : ''">
                        <td v-if="index === 0" class="border border-gray-300 px-4 py-2 font-medium bg-blue-100 text-center" 
                            :rowspan="equipmentData.length">设备</td>
                        <td class="border border-gray-300 px-4 py-2" 
                            :class="item.isCategory ? 'font-medium bg-blue-50' : ''">
                            {{ item.customerType }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ formatNumber(item.cumulativeIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-if="!item.isCategory" v-model.number="item.currentMonthIncome" 
                                   type="number" class="w-full px-2 py-1 border rounded text-right" 
                                   step="0.01" @input="calculatePercentage(item)" />
                            <span v-else class="font-medium">{{ formatNumber(item.currentMonthIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium" :class="getPercentageColor(item.percentage)">
                                {{ item.percentage }}%
                            </span>
                        </td>
                    </tr>

                    <!-- 元件板块 -->
                    <tr v-for="(item, index) in componentData" :key="`component-${index}`"
                        :class="item.isCategory ? 'bg-green-50' : ''">
                        <td v-if="index === 0" class="border border-gray-300 px-4 py-2 font-medium bg-green-100 text-center" 
                            :rowspan="componentData.length">元件</td>
                        <td class="border border-gray-300 px-4 py-2" 
                            :class="item.isCategory ? 'font-medium bg-green-50' : ''">
                            {{ item.customerType }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ formatNumber(item.cumulativeIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-if="!item.isCategory" v-model.number="item.currentMonthIncome" 
                                   type="number" class="w-full px-2 py-1 border rounded text-right" 
                                   step="0.01" @input="calculatePercentage(item)" />
                            <span v-else class="font-medium">{{ formatNumber(item.currentMonthIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium" :class="getPercentageColor(item.percentage)">
                                {{ item.percentage }}%
                            </span>
                        </td>
                    </tr>

                    <!-- 工程板块 -->
                    <tr v-for="(item, index) in engineeringData" :key="`engineering-${index}`"
                        :class="item.isCategory ? 'bg-yellow-50' : ''">
                        <td v-if="index === 0" class="border border-gray-300 px-4 py-2 font-medium bg-yellow-100 text-center" 
                            :rowspan="engineeringData.length">工程</td>
                        <td class="border border-gray-300 px-4 py-2" 
                            :class="item.isCategory ? 'font-medium bg-yellow-50' : ''">
                            {{ item.customerType }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ formatNumber(item.cumulativeIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-if="!item.isCategory" v-model.number="item.currentMonthIncome" 
                                   type="number" class="w-full px-2 py-1 border rounded text-right" 
                                   step="0.01" @input="calculatePercentage(item)" />
                            <span v-else class="font-medium">{{ formatNumber(item.currentMonthIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium" :class="getPercentageColor(item.percentage)">
                                {{ item.percentage }}%
                            </span>
                        </td>
                    </tr>

                    <!-- 非主营业务 -->
                    <tr class="bg-purple-50">
                        <td class="border border-gray-300 px-4 py-2 font-medium bg-purple-100 text-center">非主营业务</td>
                        <td class="border border-gray-300 px-4 py-2 font-medium bg-purple-50"></td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium">{{ formatNumber(nonMainBusiness.cumulativeIncome) }}</span>
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model.number="nonMainBusiness.currentMonthIncome" 
                                   type="number" class="w-full px-2 py-1 border rounded text-right" 
                                   step="0.01" @input="calculateTotals" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            <span class="font-medium" :class="getPercentageColor(nonMainBusiness.percentage)">
                                {{ nonMainBusiness.percentage }}%
                            </span>
                        </td>
                    </tr>

                    <!-- 合计 -->
                    <tr class="bg-gray-100 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.cumulativeIncome) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.currentMonthIncome) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ totalData.percentage }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 按钮区域 -->
        <div class="mt-4 flex justify-end space-x-4">
            <button @click="handleSave" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                保存
            </button>
            <button @click="handleReset" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                重置
            </button>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="moduleId"
            :period="period"
            v-model:remarks="remarks"
            v-model:suggestions="suggestions"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const moduleId = MODULE_IDS.COST_CENTER_STRUCTURE
const remarks = ref('')
const suggestions = ref('')
const allMonthsData = ref<any[]>([]) // 存储所有月份的数据

interface CostItem {
    customerType: string;
    cumulativeIncome: number;
    currentMonthIncome: number;
    percentage: string;
    isCategory?: boolean;
}

// 设备板块数据
const equipmentData = ref<CostItem[]>([
    { customerType: '上海', cumulativeIncome: 2363.98, currentMonthIncome: 717.46, percentage: '30.35' },
    { customerType: '国网', cumulativeIncome: 884.59, currentMonthIncome: 122.03, percentage: '13.80' },
    { customerType: '江苏', cumulativeIncome: 119.81, currentMonthIncome: 16.53, percentage: '13.80' },
    { customerType: '输配电内配', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
    { customerType: '西门子', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
    { customerType: '同业', cumulativeIncome: 67.98, currentMonthIncome: 0.99, percentage: '1.46' },
    { customerType: '用户', cumulativeIncome: 0.00, currentMonthIncome: 0.00, percentage: '0.00' },
    { customerType: '其他', cumulativeIncome: 26.41, currentMonthIncome: 138.55, percentage: '524.61' }
])

// 元件板块数据（其他移到设备板块）
const componentData = ref<CostItem[]>([
    { customerType: '用户', cumulativeIncome: 3.09, currentMonthIncome: 2.43, percentage: '78.64' }
])

// 工程板块数据
const engineeringData = ref<CostItem[]>([
    { customerType: '一包', cumulativeIncome: -0.01, currentMonthIncome: 0.15, percentage: '-1645.00' },
    { customerType: '二包', cumulativeIncome: 297.01, currentMonthIncome: 19.23, percentage: '6.47' },
    { customerType: '域内合作', cumulativeIncome: 717.23, currentMonthIncome: 44.14, percentage: '6.15' },
    { customerType: '域外合作', cumulativeIncome: 522.45, currentMonthIncome: 35.99, percentage: '6.89' },
    { customerType: '其它', cumulativeIncome: 145.39, currentMonthIncome: 17.74, percentage: '12.20' }
])

// 非主营业务数据
const nonMainBusiness = ref<CostItem>({
    customerType: '',
    cumulativeIncome: 123.28,
    currentMonthIncome: 32.59,
    percentage: '26.44'
})

// 合计数据
const totalData = computed(() => {
    const totalCumulative = equipmentData.value.reduce((sum, item) => sum + item.cumulativeIncome, 0) +
                           componentData.value.reduce((sum, item) => sum + item.cumulativeIncome, 0) +
                           engineeringData.value.reduce((sum, item) => sum + item.cumulativeIncome, 0) +
                           nonMainBusiness.value.cumulativeIncome
    
    const totalCurrent = equipmentData.value.reduce((sum, item) => sum + item.currentMonthIncome, 0) +
                        componentData.value.reduce((sum, item) => sum + item.currentMonthIncome, 0) +
                        engineeringData.value.reduce((sum, item) => sum + item.currentMonthIncome, 0) +
                        nonMainBusiness.value.currentMonthIncome
    
    const totalPercentage = totalCumulative > 0 ? ((totalCurrent / totalCumulative) * 100).toFixed(2) : '0.00'
    
    return {
        cumulativeIncome: totalCumulative,
        currentMonthIncome: totalCurrent,
        percentage: totalPercentage
    }
})

// 计算百分比
const calculatePercentage = (item: CostItem) => {
    updateCumulativeIncome()
    if (item.cumulativeIncome && item.cumulativeIncome !== 0) {
        item.percentage = ((item.currentMonthIncome / item.cumulativeIncome) * 100).toFixed(2)
    } else {
        item.percentage = '0.00'
    }
    calculateTotals()
}

// 计算总计
const calculateTotals = () => {
    updateCumulativeIncome()
    if (nonMainBusiness.value.cumulativeIncome && nonMainBusiness.value.cumulativeIncome !== 0) {
        nonMainBusiness.value.percentage = ((nonMainBusiness.value.currentMonthIncome / nonMainBusiness.value.cumulativeIncome) * 100).toFixed(2)
    } else {
        nonMainBusiness.value.percentage = '0.00'
    }
}

// 格式化数字
const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取百分比颜色
const getPercentageColor = (percentage: string) => {
    const num = parseFloat(percentage)
    if (num < 0) return 'text-red-600'
    if (num > 100) return 'text-orange-600'
    if (num > 50) return 'text-green-600'
    return 'text-gray-700'
}

// 初始化数据模板
const getInitialData = () => ({
    equipmentData: [
        { customerType: '上海', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '国网', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '江苏', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '输配电内配', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '西门子', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '同业', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '用户', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '其他', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' }
    ],
    componentData: [
        { customerType: '用户', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' }
    ],
    engineeringData: [
        { customerType: '一包', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '二包', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '域内合作', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '域外合作', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' },
        { customerType: '其它', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' }
    ],
    nonMainBusiness: { customerType: '', cumulativeIncome: 0, currentMonthIncome: 0, percentage: '0.00' }
})

// 获取所有月份数据用于累计计算
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const [year, month] = currentPeriod.split('-')
        const currentMonth = parseInt(month)
        const allData = []
        
        // 获取当年1月到当前月的所有数据
        for (let i = 1; i <= currentMonth; i++) {
            const monthPeriod = `${year}-${i.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/cost-center-structure/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.data) {
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

// 计算累计收入
const calculateCumulativeIncome = (categoryType: string, customerType: string) => {
    let total = 0
    const currentPeriod = period.value
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.period === currentPeriod) continue
        
        const categoryData = monthData.data[categoryType]
        if (categoryData) {
            const item = categoryData.find((d: any) => d.customerType === customerType)
            if (item && item.currentMonthIncome) {
                const value = parseFloat(item.currentMonthIncome.toString()) || 0
                total += value
            }
        }
    }
    
    // 加上当前月份的输入值
    let currentData: any[] = []
    if (categoryType === 'equipmentData') currentData = equipmentData.value
    else if (categoryType === 'componentData') currentData = componentData.value
    else if (categoryType === 'engineeringData') currentData = engineeringData.value
    
    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem && currentItem.currentMonthIncome) {
        const currentValue = parseFloat(currentItem.currentMonthIncome.toString()) || 0
        total += currentValue
    }
    
    return total
}

// 计算非主营业务累计收入
const calculateNonMainBusinessCumulative = () => {
    let total = 0
    const currentPeriod = period.value
    
    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.period === currentPeriod) continue
        
        if (monthData.data.nonMainBusiness && monthData.data.nonMainBusiness.currentMonthIncome) {
            const value = parseFloat(monthData.data.nonMainBusiness.currentMonthIncome.toString()) || 0
            total += value
        }
    }
    
    // 加上当前月份的输入值
    if (nonMainBusiness.value.currentMonthIncome) {
        const currentValue = parseFloat(nonMainBusiness.value.currentMonthIncome.toString()) || 0
        total += currentValue
    }
    
    return total
}

// 更新累计收入数据
const updateCumulativeIncome = () => {
    // 更新设备板块累计收入
    equipmentData.value.forEach(item => {
        item.cumulativeIncome = calculateCumulativeIncome('equipmentData', item.customerType)
    })
    
    // 更新元件板块累计收入
    componentData.value.forEach(item => {
        item.cumulativeIncome = calculateCumulativeIncome('componentData', item.customerType)
    })
    
    // 更新工程板块累计收入
    engineeringData.value.forEach(item => {
        item.cumulativeIncome = calculateCumulativeIncome('engineeringData', item.customerType)
    })
    
    // 更新非主营业务累计收入
    nonMainBusiness.value.cumulativeIncome = calculateNonMainBusinessCumulative()
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载成本中心数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/cost-center-structure/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('该期间暂无数据，保持现有数据但清空当期累计')
                // 保持现有数据但清空当月收入
                equipmentData.value = equipmentData.value.map(item => ({
                    ...item,
                    currentMonthIncome: 0,
                    percentage: '0.00'
                }))
                componentData.value = componentData.value.map(item => ({
                    ...item,
                    currentMonthIncome: 0,
                    percentage: '0.00'
                }))
                engineeringData.value = engineeringData.value.map(item => ({
                    ...item,
                    currentMonthIncome: 0,
                    percentage: '0.00'
                }))
                nonMainBusiness.value = {
                    ...nonMainBusiness.value,
                    currentMonthIncome: 0,
                    percentage: '0.00'
                }
                // 加载所有月份数据并更新累计收入
                await loadAllMonthsData(targetPeriod)
                updateCumulativeIncome()
                return
            }
            throw new Error('加载数据失败')
        }
        
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            equipmentData.value = result.data.equipmentData || getInitialData().equipmentData
            componentData.value = result.data.componentData || getInitialData().componentData
            engineeringData.value = result.data.engineeringData || getInitialData().engineeringData
            nonMainBusiness.value = result.data.nonMainBusiness || getInitialData().nonMainBusiness
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
    }
})

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksData()
    }
})

// 保存数据
const handleSave = async () => {
    try {
        const saveData = {
            period: period.value,
            data: {
                equipmentData: equipmentData.value,
                componentData: componentData.value,
                engineeringData: engineeringData.value,
                nonMainBusiness: nonMainBusiness.value
            }
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 cost_center_structure 表
        const response = await fetch('http://47.111.95.19:3000/cost-center-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saveData)
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`保存失败: ${response.status} - ${errorText}`)
        }

        // 2. 保存到 form_submissions 表
        await recordFormSubmission(moduleId, period.value, saveData.data, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

// 重置数据
const handleReset = () => {
    const initialData = getInitialData()
    equipmentData.value = initialData.equipmentData
    componentData.value = initialData.componentData
    engineeringData.value = initialData.engineeringData
    nonMainBusiness.value = initialData.nonMainBusiness
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(moduleId, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('组件挂载，当前期间:', period.value)
    loadData(period.value)
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