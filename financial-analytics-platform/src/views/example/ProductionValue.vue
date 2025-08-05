<template>
    <div class="production-value-container">
        <div class="mx-auto bg-white rounded-lg shadow-lg">
            <!-- 标题区域 -->
            <div class="p-6 border-b border-gray-200">
                <div class="flex flex-col space-y-4">
                    <div class="flex justify-between items-center">
                        <h1 class="text-2xl font-bold text-gray-800">产值结构与质量(主表)（单位：万元）</h1>
                        <div class="flex items-center space-x-4">
                            <input v-model="period" type="month"
                                class="px-4 py-2 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-blue-800">
                            主营业务产值——自制/自行施工情况分析
                        </p>
                    </div>
                </div>
            </div>

            <!-- 表格区域 -->
            <div class="p-6">
                <ProductionValueTable v-model:tableData="tableData" />
                
                <!-- 文件上传和备注组件 -->
                <FormAttachmentAndRemarks 
                    :module-id="MODULE_IDS.PRODUCTION_VALUE"
                    :period="period"
                    v-model:remarks="remarks"
                    v-model:suggestions="suggestions"
                />

                <!-- 按钮区域 -->
                <div class="mt-6 flex justify-end space-x-4">
                    <button @click="handleSave" 
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        保存
                    </button>
                    <button @click="handleReset" 
                        class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        重置
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import ProductionValueTable from '@/components/ProductionValueTable.vue'
import { recordFormSubmission, loadRemarksAndSuggestions, MODULE_IDS } from '@/utils/formSubmissionHelper'
import type { ProductionStructureData } from '@/types/production'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')



// 初始数据模板
const getInitialData = (): ProductionStructureData[] => [
    // 设备板块
    { id: 1, segment: '设备', customerType: '上海', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 2, segment: '设备', customerType: '国网', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 3, segment: '设备', customerType: '江苏', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 4, segment: '设备', customerType: '输配电内配', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 5, segment: '设备', customerType: '西门子', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 6, segment: '设备', customerType: '同业', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 7, segment: '设备', customerType: '用户', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    // 元件板块
    { id: 8, segment: '元件', customerType: '其它', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 9, segment: '元件', customerType: '用户', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    // 工程板块
    { id: 10, segment: '工程', customerType: '一包', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 11, segment: '工程', customerType: '二包', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 12, segment: '工程', customerType: '域内合作', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 13, segment: '工程', customerType: '域外合作', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 },
    { id: 14, segment: '工程', customerType: '其它', designCapacity: 0, yearlyPlan: 0, currentPeriod: 0, currentAccumulated: 0, executionProgress: 0, utilizationRate: 0 }
]

const tableData = ref<ProductionStructureData[]>(getInitialData())

// 存储所有历史月份数据，用于计算累计产能
const allMonthsData = ref<Array<{ period: string; data: ProductionStructureData[] }>>([])

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: ProductionStructureData[] }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))

        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://127.0.0.1:3000/production-value/${monthPeriod}`)
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

// 计算累计产能
const calculateCurrentAccumulated = (segment: string, customerType: string) => {
    let total = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        const item = monthData.data.find((d: any) => d.segment === segment && d.customerType === customerType)
        if (item && item.currentPeriod) {
            total += parseFloat(item.currentPeriod.toString()) || 0
        }
    }

    // 加上当前月份的输入值
    const currentItem = tableData.value.find(d => d.segment === segment && d.customerType === customerType)
    if (currentItem && currentItem.currentPeriod) {
        total += parseFloat(currentItem.currentPeriod.toString()) || 0
    }

    return total
}

// 更新累计产能数据
const updateCurrentAccumulated = () => {
    tableData.value.forEach(item => {
        const cumulative = calculateCurrentAccumulated(item.segment, item.customerType)
        item.currentAccumulated = cumulative
    })
}

// 数据合并函数
const mergeData = (initialData: ProductionStructureData[], loadedData: ProductionStructureData[]): ProductionStructureData[] => {
    if (!loadedData || !Array.isArray(loadedData)) {
        return initialData
    }
    
    return initialData.map(templateItem => {
        const loadedItem = loadedData.find(item => 
            item.segment === templateItem.segment && 
            item.customerType === templateItem.customerType
        )
        return loadedItem ? { ...templateItem, ...loadedItem } : templateItem
    })
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载产值结构数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/production-structure/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，重置为初始模板')
            // 重置为初始模板数据
            tableData.value = getInitialData()

            // 加载历史数据并更新累计产能
            await loadAllMonthsData(targetPeriod)
            updateCurrentAccumulated()
            return
        }
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            tableData.value = mergeData(getInitialData(), result.data)
            console.log('合并后的数据:', tableData.value)
        }

        // 加载所有月份数据并更新累计产能
        await loadAllMonthsData(targetPeriod)
        updateCurrentAccumulated()
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.PRODUCTION_VALUE, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

// 监听数据变化，自动更新累计产能
watch(() => tableData.value, () => {
    updateCurrentAccumulated()
}, { deep: true })

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
        console.log('=== 开始保存产值结构数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.PRODUCTION_VALUE)
        console.log('表单数据:', tableData.value)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://127.0.0.1:3000/production-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: tableData.value
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('专用表保存失败，响应:', errorText)
            throw new Error('保存失败')
        }
        
        const result = await response.json()
        console.log('专用表保存成功:', result)

        // 第二步：记录提交状态
        console.log('步骤2：记录提交状态...')
        const recordSuccess = await recordFormSubmission(
            MODULE_IDS.PRODUCTION_VALUE,
            period.value,
            tableData.value,
            remarks.value,
            suggestions.value
        )
        
        console.log('提交状态记录结果:', recordSuccess)
        
        if (recordSuccess) {
            console.log('=== 保存完成，所有步骤成功 ===')
            alert('保存成功')
        } else {
            console.warn('=== 专用表保存成功，但提交状态记录失败 ===')
            alert('保存成功，但提交状态记录失败')
        }
    } catch (error) {
        console.error('=== 保存过程中发生错误 ===', error)
        alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
}

const handleReset = () => {
    tableData.value = getInitialData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('产值结构组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
    } else {
        loadData(period.value)
    }
    loadRemarksData()
})
</script>

<style scoped>
.production-value-container {
    min-height: 100vh;
    background-color: #f8fafc;
    padding: 1rem;
}
</style>