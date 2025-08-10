<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务净利润贡献情况（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">板块</th>
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">当月值</th>
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">累计值</th>
                        <th class="border border-gray-300 px-4 py-2" rowspan="2">执⾏进度</th>
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
                                <input v-model="item.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.contribution }}
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
                                <input v-model="item.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.contribution }}
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
                                <input v-model="item.plan" type="text" class="w-full px-2 py-1 border rounded bg-gray-100" readonly />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ formatNumber(parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <span class="font-medium">{{ item.actual }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.contribution }}
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.plan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentMonthValue) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.actual) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ totalData.contribution }}
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
            :module-id="MODULE_IDS.MAIN_BUSINESS_NET_PROFIT"
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

interface ProfitItem {
    customerType: string;
    plan: string;
    currentMonthValue: string;
    actual: string;
    contribution: string;
    yearlyPlan?: number;
}

// 注意：预算数据由后端中间件从数据库动态获取，不在前端写死

// 初始数据模板（当没有数据时使用）
const getInitialEquipmentData = (): ProfitItem[] => [
    { customerType: '上海', plan: '2145.03', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '国网', plan: '621.55', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '江苏', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '输配电内配', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '西门子', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '同业', plan: '553.08', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '用户', plan: '323.8', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '其它', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialComponentData = (): ProfitItem[] => [
    { customerType: '用户', plan: '-26.21', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const getInitialProjectData = (): ProfitItem[] => [
    { customerType: '一包', plan: '328.91', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '二包', plan: '14.4', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '域内合作', plan: '-35.24', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '域外合作', plan: '0', currentMonthValue: '0', actual: '0', contribution: '0.00%' },
    { customerType: '其它', plan: '69.6', currentMonthValue: '0', actual: '0', contribution: '0.00%' }
]

const equipmentData = ref<ProfitItem[]>(getInitialEquipmentData())
const componentData = ref<ProfitItem[]>(getInitialComponentData())
const projectData = ref<ProfitItem[]>(getInitialProjectData())

// 格式化数字为千分位格式
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}



// 获取月度数据
const fetchMonthlyData = async (monthPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/monthly-data/${monthPeriod}`)

        if (response.ok) {
            const result = await response.json()
            if (result.success) {
                return result.data
            }
        }

        console.error(`获取${monthPeriod}月度数据失败:`, response.status)
        return null
    } catch (error) {
        console.error(`获取${monthPeriod}月度数据失败:`, error)
        return null
    }
}

// 更新数据项
const updateDataItem = (item: ProfitItem, apiData: any) => {
    if (apiData) {
        item.currentMonthValue = apiData.currentMonthValue?.toFixed(2) || '0'
        item.actual = apiData.cumulativeValue?.toFixed(2) || '0'
        item.contribution = apiData.contribution || '0.00%'
        item.currentLaborCost = 0 // 新接口暂不提供人工费数据
    }
}

// 计算贡献占比
const calculateContribution = (item: ProfitItem) => {
    const plan = parseFloat(item.plan?.replace(/,/g, '') || '0')
    const actual = parseFloat(item.actual?.replace(/,/g, '') || '0')

    if (!isNaN(plan) && !isNaN(actual) && plan !== 0) {
        const contribution = (actual / plan * 100).toFixed(2)
        item.contribution = `${contribution}%`
    } else {
        item.contribution = '0.00%'
    }
}

// 获取项目所属的板块
const getSegmentFromItem = (item: ProfitItem): string => {
    if (equipmentData.value.includes(item)) return '设备'
    if (componentData.value.includes(item)) return '元件'
    if (projectData.value.includes(item)) return '工程'
    return '设备'
}

// 计算合计数据
const totalData = computed(() => {
    let totalPlan = 0
    let totalCurrentMonthValue = 0
    let totalActual = 0
    
    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan?.replace(/,/g, '')) || 0
        totalCurrentMonthValue += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual?.replace(/,/g, '')) || 0
    })
    
    // 汇总元件板块数据
    componentData.value.forEach(item => {
        totalPlan += parseFloat(item.plan?.replace(/,/g, '')) || 0
        totalCurrentMonthValue += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual?.replace(/,/g, '')) || 0
    })
    
    // 汇总工程板块数据
    projectData.value.forEach(item => {
        totalPlan += parseFloat(item.plan?.replace(/,/g, '')) || 0
        totalCurrentMonthValue += parseFloat(item.currentMonthValue?.replace(/,/g, '')) || 0
        totalActual += parseFloat(item.actual?.replace(/,/g, '')) || 0
    })
    
    // 计算总贡献占比
    let contribution = '0.00%'
    if (totalPlan !== 0) {
        contribution = `${(totalActual / totalPlan * 100).toFixed(2)}%`
    }
    
    return {
        plan: totalPlan,
        currentMonthValue: totalCurrentMonthValue,
        actual: totalActual,
        contribution
    }
})

// 合并数据：将从数据库加载的数据与初始模板合并
const mergeData = (templateData: ProfitItem[], loadedData: any[], segment: string): ProfitItem[] => {
    return templateData.map(templateItem => {
        const loadedItem = loadedData?.find(item => item.segment === segment && item.customerType === templateItem.customerType)
        
        if (loadedItem) {
            return {
                customerType: templateItem.customerType,
                // 使用后端返回的预算数据作为年度计划
                plan: loadedItem.yearlyPlan?.toString() || '0',
                currentMonthValue: '0',
                actual: '0',
                contribution: '0.00%',
                yearlyPlan: loadedItem.yearlyPlan || 0
            }
        } else {
            // 没有实际数据时，使用初始模板
            return templateItem
        }
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载主营净利润贡献数据，期间: ${targetPeriod}`)
        
        const response = await fetch(`http://47.111.95.19:3000/main-business-net-profit/${targetPeriod}`)
        let loadedData: any[] = []
        
        if (response.ok) {
            const result = await response.json()
            console.log('API返回数据:', result)
            
            if (result.success && result.data && Array.isArray(result.data)) {
                loadedData = result.data
                console.log('成功获取数据，开始合并...')
            }
        } else if (response.status === 404) {
            console.log('该期间暂无数据，使用初始模板')
            // 使用初始模板数据
            equipmentData.value = getInitialEquipmentData()
            componentData.value = getInitialComponentData()
            projectData.value = getInitialProjectData()
        } else {
            console.log('加载数据失败，使用预算数据填充')
        }
        
        // 无论是否有数据，都进行合并（确保预算数据始终显示）
        equipmentData.value = mergeData(getInitialEquipmentData(), loadedData, '设备')
        componentData.value = mergeData(getInitialComponentData(), loadedData, '元件')
        projectData.value = mergeData(getInitialProjectData(), loadedData, '工程')
        console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })
        
        // 计算所有项目的数据
        await calculateAllCumulativeValues()
        
    } catch (error) {
        console.error('加载数据失败:', error)
        // 出错时也要确保预算数据显示
        equipmentData.value = mergeData(getInitialEquipmentData(), [], '设备')
        componentData.value = mergeData(getInitialComponentData(), [], '元件')
        projectData.value = mergeData(getInitialProjectData(), [], '工程')
    }
}

// 计算所有项目的累计值
const calculateAllCumulativeValues = async () => {
    try {
        console.log('开始获取月度数据，期间:', period.value)

        const monthlyData = await fetchMonthlyData(period.value)

        if (!monthlyData) {
            console.error('获取月度数据失败')
            return
        }

        // 更新设备板块数据
        equipmentData.value.forEach(item => {
            const apiItem = monthlyData.equipment?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        // 更新元件板块数据
        componentData.value.forEach(item => {
            const apiItem = monthlyData.components?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        // 更新工程板块数据
        projectData.value.forEach(item => {
            const apiItem = monthlyData.engineering?.find((d: any) => d.customer === item.customerType)
            updateDataItem(item, apiItem)
        })

        console.log('=== 主营业务净利润数据更新完成 ===')
        console.log('当前期间:', period.value)

    } catch (error) {
        console.error('计算累计值失败:', error)
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
            ...equipmentData.value.map(item => ({ ...item, segment: '设备' })),
            ...componentData.value.map(item => ({ ...item, segment: '元件' })),
            ...projectData.value.map(item => ({ ...item, segment: '工程' }))
        ]

        const saveData = {
            period: period.value,
            data: allData
        }

        console.log('保存数据:', saveData)

        // 1. 保存到 main_business_net_profit 表
        const response = await fetch('http://47.111.95.19:3000/main-business-net-profit', {
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
        await recordFormSubmission(MODULE_IDS.MAIN_BUSINESS_NET_PROFIT, period.value, formData, remarks.value, suggestions.value)
        
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
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.MAIN_BUSINESS_NET_PROFIT, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}



onMounted(() => {
    console.log('=== 主营净利润贡献组件挂载 ===')
    console.log('当前期间:', period.value)
    console.log('路由查询参数:', route.query.period)

    const targetPeriod = route.query.period?.toString() || period.value
    console.log('开始加载数据，期间:', targetPeriod)
    loadData(targetPeriod)
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