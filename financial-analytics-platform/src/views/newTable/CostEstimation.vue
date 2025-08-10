<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">成本暂估入库和计提情况（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">当期新增</th>
                        <th class="border border-gray-300 px-4 py-2">当期冲销</th>
                        <th class="border border-gray-300 px-4 py-2">本年累计</th>
                        <th class="border border-gray-300 px-4 py-2">计提率</th>
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialBalance) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentPeriod"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentWriteOff"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialBalance) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentPeriod"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentWriteOff"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
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
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span>{{ formatNumber(item.initialBalance) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentPeriod"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentWriteOff"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.yearTotal) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.provisionRate) }}%</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.initialBalance) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.currentPeriod) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.currentWriteOff) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.yearTotal) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.averageProvisionRate) }}%</td>
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
            :module-id="MODULE_IDS.COST_ESTIMATION"
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
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface CostEstimationItem {
    customerType: string;
    initialBalance: number;
    currentPeriod: number;
    currentWriteOff: number;
    yearTotal: number;
    provisionRate: number;
}

// 获取初始数据模板
const getInitialData = () => {
    return {
        equipment: [
            { customerType: '上海', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '国网', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '江苏', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '输配电内配', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '西门子', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '同业', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
        ],
        component: [
            { customerType: '用户', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
        ],
        project: [
            { customerType: '一包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '二包', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '域内合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '域外合作', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 },
            { customerType: '其它', initialBalance: 0, currentPeriod: 0, currentWriteOff: 0, yearTotal: 0, provisionRate: 0 }
        ]
    }
}

// 数据合并函数
const mergeData = (initialData: any, loadedData: any) => {
    if (!loadedData || typeof loadedData !== 'object') {
        return initialData
    }
    
    // 合并设备数据
    if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
        initialData.equipment = initialData.equipment.map((templateItem: CostEstimationItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 优先使用API返回的预算数据（initialBalance包含预算数据）
                    initialBalance: Number(loadedItem.initialBalance) || 0,
                    currentPeriod: Number(loadedItem.currentPeriod) || 0,
                    currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
                    yearTotal: 0, // 本年累计需要重新计算
                    provisionRate: Number(loadedItem.provisionRate) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = initialData.component.map((templateItem: CostEstimationItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 优先使用API返回的预算数据（initialBalance包含预算数据）
                    initialBalance: Number(loadedItem.initialBalance) || 0,
                    currentPeriod: Number(loadedItem.currentPeriod) || 0,
                    currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
                    yearTotal: 0, // 本年累计需要重新计算
                    provisionRate: Number(loadedItem.provisionRate) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = initialData.project.map((templateItem: CostEstimationItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 优先使用API返回的预算数据（initialBalance包含预算数据）
                    initialBalance: Number(loadedItem.initialBalance) || 0,
                    currentPeriod: Number(loadedItem.currentPeriod) || 0,
                    currentWriteOff: Number(loadedItem.currentWriteOff) || 0,
                    yearTotal: 0, // 本年累计需要重新计算
                    provisionRate: Number(loadedItem.provisionRate) || 0
                }
            }
            return templateItem
        })
    }
    
    return initialData
}

// 初始化数据
const initializeData = () => {
    const initialData = getInitialData()
    equipmentData.value = initialData.equipment
    componentData.value = initialData.component
    projectData.value = initialData.project
}

const equipmentData = ref<CostEstimationItem[]>([])
const componentData = ref<CostEstimationItem[]>([])
const projectData = ref<CostEstimationItem[]>([])

// 存储所有历史月份数据，用于计算累计
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

// 存储主营业务收入数据，用于计算计提率
const mainBusinessIncomeData = ref<any>(null)

// 加载主营业务收入数据
const loadMainBusinessIncomeData = async (currentPeriod: string) => {
    try {
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))
        
        // 累计收入数据 - 从年初到当前月份
        const cumulativeIncomeData = {
            equipment: {} as Record<string, number>,
            component: {} as Record<string, number>,
            project: {} as Record<string, number>
        }
        
        // 从1月到当前月份累计收入
        for (let month = 1; month <= currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/main-business-income/${monthPeriod}`)
                if (response.ok) {
                    const result = await response.json()
                    if (result.success && result.data) {
                        const data = result.data
                        
                        // 累计设备收入
                        if (data.equipment) {
                            data.equipment.forEach((item: any) => {
                                const customerType = item.customer
                                if (!cumulativeIncomeData.equipment[customerType]) {
                                    cumulativeIncomeData.equipment[customerType] = 0
                                }
                                cumulativeIncomeData.equipment[customerType] += Number(item.currentMonthIncome) || 0
                            })
                        }
                        
                        // 累计元件收入
                        if (data.components) {
                            data.components.forEach((item: any) => {
                                const customerType = item.customer
                                if (!cumulativeIncomeData.component[customerType]) {
                                    cumulativeIncomeData.component[customerType] = 0
                                }
                                cumulativeIncomeData.component[customerType] += Number(item.currentMonthIncome) || 0
                            })
                        }
                        
                        // 累计工程收入
                        if (data.engineering) {
                            data.engineering.forEach((item: any) => {
                                const customerType = item.customer
                                if (!cumulativeIncomeData.project[customerType]) {
                                    cumulativeIncomeData.project[customerType] = 0
                                }
                                cumulativeIncomeData.project[customerType] += Number(item.currentMonthIncome) || 0
                            })
                        }
                    }
                }
            } catch (error) {
                console.log(`跳过主营业务收入月份 ${monthPeriod}:`, error)
            }
        }
        
        mainBusinessIncomeData.value = cumulativeIncomeData
        console.log('主营业务收入累计数据:', cumulativeIncomeData)
    } catch (error) {
        console.error('加载主营业务收入数据失败:', error)
    }
}

// 加载所有月份数据（从年初到当前月份）
const loadAllMonthsData = async (currentPeriod: string) => {
    try {
        const allData: Array<{ period: string; data: any }> = []
        const currentYear = currentPeriod.substring(0, 4)
        const currentMonth = parseInt(currentPeriod.substring(5, 7))

        // 从1月到当前月份（不包括当前月份）
        for (let month = 1; month < currentMonth; month++) {
            const monthPeriod = `${currentYear}-${month.toString().padStart(2, '0')}`
            try {
                const response = await fetch(`http://47.111.95.19:3000/cost-estimation/${monthPeriod}`)
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

// 计算年初至今的累计新增和累计冲销
const calculateCumulativeAmounts = (category: string, customerType: string): { totalAddition: number, totalWriteOff: number } => {
    let totalAddition = 0
    let totalWriteOff = 0

    console.log(`🔍 计算累计数据: ${category}-${customerType}`)

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.data[category]) {
            const item = monthData.data[category].find((d: any) => d.customerType === customerType)
            if (item) {
                const additionValue = parseFloat(item.currentPeriod?.toString()) || 0
                const writeOffValue = parseFloat(item.currentWriteOff?.toString()) || 0
                totalAddition += additionValue
                totalWriteOff += writeOffValue
                console.log(`📅 ${monthData.period}: ${customerType} 新增=${additionValue}, 冲销=${writeOffValue}`)
            }
        }
    }

    // 加上当前月份的输入值
    let currentData: CostEstimationItem[] = []
    if (category === 'equipment') {
        currentData = equipmentData.value
    } else if (category === 'component') {
        currentData = componentData.value
    } else if (category === 'project') {
        currentData = projectData.value
    }

    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem) {
        const currentAddition = parseFloat(currentItem.currentPeriod?.toString()) || 0
        const currentWriteOff = parseFloat(currentItem.currentWriteOff?.toString()) || 0
        totalAddition += currentAddition
        totalWriteOff += currentWriteOff
        console.log(`📝 当前月份: ${customerType} 新增=${currentAddition}, 冲销=${currentWriteOff}`)
    }

    console.log(`✅ ${category}-${customerType} 累计计算完成: 新增=${totalAddition}, 冲销=${totalWriteOff}`)
    return { totalAddition, totalWriteOff }
}

// 更新本年累计数据
const updateYearTotals = () => {
    // 更新设备类别
    equipmentData.value.forEach(item => {
        const { totalAddition, totalWriteOff } = calculateCumulativeAmounts('equipment', item.customerType)
        calculateYearTotal(item, totalAddition, totalWriteOff)
    })

    // 更新元件类别
    componentData.value.forEach(item => {
        const { totalAddition, totalWriteOff } = calculateCumulativeAmounts('component', item.customerType)
        calculateYearTotal(item, totalAddition, totalWriteOff)
    })

    // 更新工程类别
    projectData.value.forEach(item => {
        const { totalAddition, totalWriteOff } = calculateCumulativeAmounts('project', item.customerType)
        calculateYearTotal(item, totalAddition, totalWriteOff)
    })
}

// 自动计算本年累计 = 年初余额 + 当期新增(累计) - 当期冲销(累计)
const calculateYearTotal = (item: CostEstimationItem, totalAddition: number, totalWriteOff: number) => {
    item.yearTotal = (item.initialBalance || 0) + totalAddition - totalWriteOff
    
    // 自动计算计提率 = 本年累计 / 主营业务收入对应口径累计收入
    if (mainBusinessIncomeData.value) {
        const category = getItemCategory(item.customerType)
        const cumulativeIncome = getCumulativeIncomeForCustomer(category, item.customerType)
        
        if (cumulativeIncome > 0 && item.yearTotal > 0) {
            item.provisionRate = (item.yearTotal / cumulativeIncome) * 100
        } else {
            item.provisionRate = 0
        }
    }
}

// 根据客户类型确定属于哪个类别
const getItemCategory = (customerType: string): string => {
    const equipmentCustomers = ['上海', '国网', '江苏', '输配电内配', '西门子', '同业', '用户', '其它']
    const componentCustomers = ['用户']
    const projectCustomers = ['一包', '二包', '域内合作', '域外合作', '其它']
    
    if (equipmentCustomers.includes(customerType)) return 'equipment'
    if (componentCustomers.includes(customerType)) return 'component'
    if (projectCustomers.includes(customerType)) return 'project'
    return 'equipment' // 默认
}

// 获取对应客户类型的累计收入
const getCumulativeIncomeForCustomer = (category: string, customerType: string): number => {
    if (!mainBusinessIncomeData.value || !mainBusinessIncomeData.value[category]) {
        return 0
    }
    return mainBusinessIncomeData.value[category][customerType] || 0
}

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算合计数据
const totalData = computed(() => {
    const allItems = [...equipmentData.value, ...componentData.value, ...projectData.value]
    
    const total = {
        initialBalance: 0,
        currentPeriod: 0,
        currentWriteOff: 0,
        yearTotal: 0,
        averageProvisionRate: 0
    }

    let totalProvisionRate = 0
    let validRateCount = 0

    allItems.forEach(item => {
        total.initialBalance += item.initialBalance || 0
        total.currentPeriod += item.currentPeriod || 0
        total.currentWriteOff += item.currentWriteOff || 0
        total.yearTotal += item.yearTotal || 0
        
        if (item.provisionRate > 0) {
            totalProvisionRate += item.provisionRate
            validRateCount++
        }
    })
    
    // 计算平均计提率
    total.averageProvisionRate = validRateCount > 0 ? totalProvisionRate / validRateCount : 0
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载成本暂估数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://47.111.95.19:3000/cost-estimation/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，重置为初始模板')
            initializeData()

            // 加载历史数据并更新本年累计
            await loadAllMonthsData(targetPeriod)
            await loadMainBusinessIncomeData(targetPeriod)
            updateYearTotals()
            return
        }
        const result = await response.json()
        console.log('API返回数据:', result)
        
        if (result.success && result.data) {
            console.log('成功获取数据，开始合并...')
            const initialData = getInitialData()
            const mergedData = mergeData(initialData, result.data)
            
            equipmentData.value = mergedData.equipment
            componentData.value = mergedData.component
            projectData.value = mergedData.project
            
            console.log('合并后的数据:', { equipmentData: equipmentData.value, componentData: componentData.value, projectData: projectData.value })
        }

        // 加载所有月份数据并更新本年累计
        await loadAllMonthsData(targetPeriod)
        await loadMainBusinessIncomeData(targetPeriod)
        updateYearTotals()
    } catch (error) {
        console.error('加载数据失败:', error)
        initializeData()
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.COST_ESTIMATION, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

// 监听期间变化
watch(period, async (newPeriod) => {
    await loadData(newPeriod)
    await loadRemarksData()
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
    }
})

// 监听当期数据变化，自动更新本年累计
watch(() => [
    equipmentData.value.map(item => item.currentPeriod),
    componentData.value.map(item => item.currentPeriod),
    equipmentData.value.map(item => item.currentWriteOff),
    componentData.value.map(item => item.currentWriteOff),
    projectData.value.map(item => item.currentPeriod),
    projectData.value.map(item => item.currentWriteOff)
], async () => {
    // 只有当期数据变化时才重新计算累计值和计提率
    if (mainBusinessIncomeData.value === null) {
        await loadMainBusinessIncomeData(period.value)
    }
    updateYearTotals()
}, { deep: true })


const handleSave = async () => {
    try {
        console.log('=== 开始保存成本暂估数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.COST_ESTIMATION)
        
        // 准备表单数据
        const formData = {
            equipment: equipmentData.value.map(item => ({
                customerType: item.customerType,
                initialBalance: item.initialBalance,
                currentPeriod: item.currentPeriod,
                currentWriteOff: item.currentWriteOff,
                yearTotal: item.yearTotal,
                provisionRate: item.provisionRate
            })),
            component: componentData.value.map(item => ({
                customerType: item.customerType,
                initialBalance: item.initialBalance,
                currentPeriod: item.currentPeriod,
                currentWriteOff: item.currentWriteOff,
                yearTotal: item.yearTotal,
                provisionRate: item.provisionRate
            })),
            project: projectData.value.map(item => ({
                customerType: item.customerType,
                initialBalance: item.initialBalance,
                currentPeriod: item.currentPeriod,
                currentWriteOff: item.currentWriteOff,
                yearTotal: item.yearTotal,
                provisionRate: item.provisionRate
            }))
        }
        
        console.log('表单数据:', formData)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://47.111.95.19:3000/cost-estimation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: formData
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
            MODULE_IDS.COST_ESTIMATION,
            period.value,
            formData,
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
    initializeData()
    remarks.value = ''
    suggestions.value = ''
    console.log('已重置为初始数据')
}

onMounted(() => {
    console.log('成本暂估组件挂载，当前期间:', period.value)
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