<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">逾期应收账款情况（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初余额</th>
                        <th class="border border-gray-300 px-4 py-2">本年新增</th>
                        <th class="border border-gray-300 px-4 py-2">当月收款</th>
                        <th class="border border-gray-300 px-4 py-2">累计已收款</th>
                        <th class="border border-gray-300 px-4 py-2">收款进度</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 设备板块 -->
                    <template v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="equipmentData.length">
                                设备
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.yearlyPlan || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newAddition" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.totalReceipt) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 元件板块 -->
                    <template v-for="(item, index) in componentData" :key="`component-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="componentData.length">
                                元件
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.yearlyPlan || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newAddition" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.totalReceipt) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 工程板块 -->
                    <template v-for="(item, index) in projectData" :key="`project-${index}`">
                        <tr>
                            <td v-if="index === 0" class="border border-gray-300 px-4 py-2 text-center" :rowspan="projectData.length">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">{{ item.customerType }}</td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.yearlyPlan || 0) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.newAddition" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.monthlyReceipt" type="text" class="w-full px-2 py-1 border rounded" @input="calculateProgress(item)" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ formatNumber(item.totalReceipt) }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.progress }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.initialBalance) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.newAddition) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.monthlyReceipt) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.totalReceipt) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.progress }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

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
            :module-id="MODULE_IDS.OVERDUE_RECEIVABLES"
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
const remarks = ref('')
const suggestions = ref('')

interface OverdueReceivableItem {
    customerType: string;
    initialBalance: string;
    newAddition: string;
    monthlyReceipt: string;
    totalReceipt: number;
    progress: string;
    yearlyPlan?: number;
    historicalReceipts?: number;
}

// 初始数据模板（当没有数据时使用）
const getInitialEquipmentData = (): OverdueReceivableItem[] => [
    { customerType: '上海', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '国网', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '江苏', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '输配电内配', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '西门子', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '同业', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '用户', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '其它', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' }
]

const getInitialComponentData = (): OverdueReceivableItem[] => [
    { customerType: '用户', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' }
]

const getInitialProjectData = (): OverdueReceivableItem[] => [
    { customerType: '一包', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '二包', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '域内合作', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '域外合作', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' },
    { customerType: '其它', initialBalance: '0', newAddition: '0', monthlyReceipt: '0', totalReceipt: 0, progress: '0.00%' }
]

const equipmentData = ref<OverdueReceivableItem[]>(getInitialEquipmentData())
const componentData = ref<OverdueReceivableItem[]>(getInitialComponentData())
const projectData = ref<OverdueReceivableItem[]>(getInitialProjectData())

// 定义历史数据类型结构
interface HistoricalDataMap {
  设备: Record<string, number>;
  元件: Record<string, number>;
  工程: Record<string, number>;
  [key: string]: Record<string, number>;
}

const historicalData = ref<HistoricalDataMap>({
  '设备': {},
  '元件': {},
  '工程': {}
})

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 解析期间字符串为年月
const parsePeriod = (periodStr: string): { year: number, month: number } => {
    const [year, month] = periodStr.split('-').map(Number)
    return { year, month }
}

// 获取指定期间之前的所有期间
const getPreviousPeriods = (currentPeriod: string): string[] => {
    const { year, month } = parsePeriod(currentPeriod)
    const periods: string[] = []
    
    // 当年的月份
    for (let m = 1; m < month; m++) {
        periods.push(`${year}-${m.toString().padStart(2, '0')}`)
    }
    
    return periods
}

// 计算收款进度
const calculateProgress = (item: OverdueReceivableItem) => {
    // 移除逗号并转换为数字
    const initialBalance = parseFloat(item.initialBalance.replace(/,/g, '')) || 0
    const newAddition = parseFloat(item.newAddition.replace(/,/g, '')) || 0
    const monthlyReceipt = parseFloat(item.monthlyReceipt.replace(/,/g, '')) || 0
    
    // 计算历史收款总额（当前月不包括在内）
    const historicalReceipts = item.historicalReceipts || 0
    
    // 计算累计收款金额
    item.totalReceipt = historicalReceipts + monthlyReceipt
    
    const total = initialBalance + newAddition
    
    if (total > 0) {
        const progress = (item.totalReceipt / total * 100).toFixed(2)
        item.progress = `${progress}%`
    } else {
        item.progress = '0.00%'
    }
}

// 计算合计数据
const totalData = computed(() => {
    let initialBalanceTotal = 0
    let newAdditionTotal = 0
    let monthlyReceiptTotal = 0
    let totalReceiptTotal = 0
    
    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        initialBalanceTotal += item.yearlyPlan || 0
        newAdditionTotal += parseFloat(item.newAddition.replace(/,/g, '')) || 0
        monthlyReceiptTotal += parseFloat(item.monthlyReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += item.totalReceipt || 0
    })
    
    // 汇总元件板块数据
    componentData.value.forEach(item => {
        initialBalanceTotal += item.yearlyPlan || 0
        newAdditionTotal += parseFloat(item.newAddition.replace(/,/g, '')) || 0
        monthlyReceiptTotal += parseFloat(item.monthlyReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += item.totalReceipt || 0
    })
    
    // 汇总工程板块数据
    projectData.value.forEach(item => {
        initialBalanceTotal += item.yearlyPlan || 0
        newAdditionTotal += parseFloat(item.newAddition.replace(/,/g, '')) || 0
        monthlyReceiptTotal += parseFloat(item.monthlyReceipt.replace(/,/g, '')) || 0
        totalReceiptTotal += item.totalReceipt || 0
    })
    
    // 计算总收款进度
    let progress = '0.00%'
    const total = initialBalanceTotal + newAdditionTotal
    if (total > 0) {
        progress = `${(totalReceiptTotal / total * 100).toFixed(2)}%`
    }
    
    return {
        initialBalance: initialBalanceTotal,
        newAddition: newAdditionTotal,
        monthlyReceipt: monthlyReceiptTotal,
        totalReceipt: totalReceiptTotal,
        progress
    }
})

// 预算数据映射（来自BudgetPlanning.vue）
interface BudgetDataMap {
  '设备': Record<string, number>;
  '元件': Record<string, number>;
  '工程': Record<string, number>;
}

const budgetDataMap: BudgetDataMap = {
    '设备': {
        '上海': 1349.60,
        '国网': 462.01,
        '江苏': 1123.94,
        '输配电内配': 176.86,
        '西门子': 0.00,
        '同业': 46.23,
        '用户': 1705.24,
        '其它': 391.31
    },
    '元件': {
        '用户': 380.94
    },
    '工程': {
        '一包': 106.86,
        '二包': 189.12,
        '域内合作': 358.51,
        '域外合作': 564.23,
        '其它': 324.30
    }
}

// 加载历史数据
const loadHistoricalData = async (currentPeriod: string) => {
    try {
        const previousPeriods = getPreviousPeriods(currentPeriod)
        if (previousPeriods.length === 0) {
            console.log('没有历史期间数据需要加载')
            return
        }
        
        console.log('正在加载历史数据，期间:', previousPeriods)
        
        // 初始化历史数据存储
        historicalData.value = {
            '设备': {},
            '元件': {},
            '工程': {}
        }
        
        for (const period of previousPeriods) {
            try {
                const response = await fetch(`http://127.0.0.1:3000/overdue-receivables/${period}`)
                
                if (response.ok) {
                    const result = await response.json()
                    
                    if (result.success && result.data && Array.isArray(result.data)) {
                        // 处理每个历史记录
                        result.data.forEach((record: any) => {
                            const segment = record.segment as keyof HistoricalDataMap
                            const customerType = record.customerType
                            const monthlyReceipt = parseFloat(record.monthlyReceipt || '0')
                            
                            if (!historicalData.value[segment]) {
                                historicalData.value[segment] = {}
                            }
                            
                            if (!historicalData.value[segment][customerType]) {
                                historicalData.value[segment][customerType] = 0
                            }
                            
                            // 累加历史月收款
                            historicalData.value[segment][customerType] += monthlyReceipt
                        })
                    }
                }
            } catch (e) {
                console.error(`加载期间 ${period} 的数据失败:`, e)
            }
        }
        
        console.log('历史数据加载完成:', historicalData.value)
        
    } catch (error) {
        console.error('加载历史数据失败:', error)
    }
}

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: OverdueReceivableItem[], loadedData: any[], segment: string): OverdueReceivableItem[] => {
    return templateData.map(templateItem => {
        const loadedItem = loadedData?.find(item => item.segment === segment && item.customerType === templateItem.customerType)
        const segmentKey = segment as keyof BudgetDataMap
        const budgetValue = budgetDataMap[segmentKey]?.[templateItem.customerType] || 0
        const historicalReceiptValue = historicalData.value[segment]?.[templateItem.customerType] || 0
        
        if (loadedItem) {
            // 当月数据
            const monthlyReceipt = loadedItem.monthlyReceipt || '0'
            // 总收款 = 历史收款 + 当月收款
            const totalReceipt = historicalReceiptValue + (parseFloat(monthlyReceipt.replace(/,/g, '')) || 0)
            
            return {
                customerType: templateItem.customerType,
                initialBalance: budgetValue.toString(),
                newAddition: loadedItem.newAddition || '0',
                monthlyReceipt: monthlyReceipt,
                totalReceipt: totalReceipt,
                progress: '0.00%', // 将在calculateProgress中重新计算
                yearlyPlan: budgetValue,
                historicalReceipts: historicalReceiptValue
            }
        } else {
            // 没有实际数据时，只显示预算数据
            return {
                customerType: templateItem.customerType,
                initialBalance: budgetValue.toString(),
                newAddition: '0',
                monthlyReceipt: '0',
                totalReceipt: historicalReceiptValue,
                progress: '0.00%',
                yearlyPlan: budgetValue,
                historicalReceipts: historicalReceiptValue
            }
        }
    }).map(item => {
        // 计算进度
        calculateProgress(item)
        return item
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载逾期应收款数据，期间: ${targetPeriod}`)
        
        // 首先加载历史数据
        await loadHistoricalData(targetPeriod)
        
        const response = await fetch(`http://127.0.0.1:3000/overdue-receivables/${targetPeriod}`)
        let loadedData: any[] = []
        
        if (response.ok) {
            const result = await response.json()
            console.log('API返回数据:', result)
            
            if (result.success && result.data && Array.isArray(result.data)) {
                loadedData = result.data
                console.log('成功获取数据，开始合并...')
            }
        } else if (response.status === 404) {
            console.log('该期间暂无数据，使用预算数据填充')
        } else {
            console.log('加载数据失败，使用预算数据填充')
        }
        
        // 无论是否有数据，都进行合并（确保预算数据始终显示）
        equipmentData.value = mergeData(getInitialEquipmentData(), loadedData, '设备')
        componentData.value = mergeData(getInitialComponentData(), loadedData, '元件')
        projectData.value = mergeData(getInitialProjectData(), loadedData, '工程')
        console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })
        
    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        equipmentData.value = mergeData(getInitialEquipmentData(), [], '设备')
        componentData.value = mergeData(getInitialComponentData(), [], '元件')
        projectData.value = mergeData(getInitialProjectData(), [], '工程')
    }
}

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
        // 准备要保存的数据
        const allData = [
            ...equipmentData.value.map(item => ({ 
                segment: '设备',
                customerType: item.customerType, 
                newAddition: item.newAddition,
                monthlyReceipt: item.monthlyReceipt,
                // 不保存totalReceipt，因为它是计算的结果
                // 不保存initialBalance，因为它是从预算中获取的
            })),
            ...componentData.value.map(item => ({ 
                segment: '元件',
                customerType: item.customerType, 
                newAddition: item.newAddition,
                monthlyReceipt: item.monthlyReceipt,
            })),
            ...projectData.value.map(item => ({ 
                segment: '工程',
                customerType: item.customerType, 
                newAddition: item.newAddition,
                monthlyReceipt: item.monthlyReceipt,
            }))
        ]

        const saveData = {
            period: period.value,
            data: allData
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 overdue_receivables 表
        const response = await fetch('http://127.0.0.1:3000/overdue-receivables', {
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
        const formData = {
            equipment: equipmentData.value,
            component: componentData.value,
            project: projectData.value
        }
        await recordFormSubmission(MODULE_IDS.OVERDUE_RECEIVABLES, period.value, formData, remarks.value, suggestions.value)
        
        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    equipmentData.value = getInitialEquipmentData()
    componentData.value = getInitialComponentData()
    projectData.value = getInitialProjectData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.OVERDUE_RECEIVABLES, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

onMounted(() => {
    console.log('逾期应收款组件挂载，当前期间:', period.value)
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