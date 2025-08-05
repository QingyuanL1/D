<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">库存情况(合同存量)（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初余量</th>
                        <th class="border border-gray-300 px-4 py-2">当期新增</th>
                        <th class="border border-gray-300 px-4 py-2">当月收入</th>
                        <th class="border border-gray-300 px-4 py-2">当期库存</th>
                        <th class="border border-gray-300 px-4 py-2">波动率</th>
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
                                <input 
                                    v-model.number="item.initialAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-50" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentIncrease"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                    @input="updateCumulativeAmounts"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(getMainBusinessIncome('equipment', item.customerType)) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.cumulativeAmount) }}%
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
                                <input 
                                    v-model.number="item.initialAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-50" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentIncrease"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                    @input="updateCumulativeAmounts"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(getMainBusinessIncome('component', item.customerType)) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.cumulativeAmount) }}%
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
                                <input 
                                    v-model.number="item.initialAmount" 
                                    type="number" 
                                    class="w-full px-2 py-1 border rounded text-right bg-gray-50" 
                                    step="0.01"
                                    readonly
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input
                                    v-model.number="item.currentIncrease"
                                    type="number"
                                    class="w-full px-2 py-1 border rounded text-right"
                                    step="0.01"
                                    @input="updateCumulativeAmounts"
                                />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(getMainBusinessIncome('project', item.customerType)) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                <span class="font-medium">{{ formatNumber(item.cumulativeAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.cumulativeAmount) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.initialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.currentIncrease) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(getTotalMainBusinessIncome()) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.cumulativeAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateFluctuation(totalData.initialAmount, totalData.cumulativeAmount) }}%
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
            :module-id="MODULE_IDS.CONTRACT_INVENTORY"
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

interface InventoryItem {
    customerType: string;
    initialAmount: number;
    currentIncrease: number;  // 当期新增
    cumulativeAmount: number;
}

// 静态年初余量数据
const staticInitialAmounts = {
    equipment: {
        '上海': 1200.50,
        '国网': 2300.75,
        '江苏': 800.25,
        '输配电内配': 150.00,
        '西门子': 0.00,
        '同业': 950.60,
        '用户': 750.40,
        '其它': 200.30
    },
    component: {
        '用户': 500.80
    },
    project: {
        '一包': 300.20,
        '二包': 150.10,
        '域内合作': 1100.90,
        '域外合作': 650.75,
        '其它': 400.50
    }
}

// 获取初始数据模板
const getInitialData = () => {
    return {
        equipment: [
            { customerType: '上海', initialAmount: staticInitialAmounts.equipment['上海'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '国网', initialAmount: staticInitialAmounts.equipment['国网'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '江苏', initialAmount: staticInitialAmounts.equipment['江苏'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '输配电内配', initialAmount: staticInitialAmounts.equipment['输配电内配'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '西门子', initialAmount: staticInitialAmounts.equipment['西门子'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '同业', initialAmount: staticInitialAmounts.equipment['同业'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '用户', initialAmount: staticInitialAmounts.equipment['用户'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '其它', initialAmount: staticInitialAmounts.equipment['其它'], currentIncrease: 0, cumulativeAmount: 0 }
        ],
        component: [
            { customerType: '用户', initialAmount: staticInitialAmounts.component['用户'], currentIncrease: 0, cumulativeAmount: 0 }
        ],
        project: [
            { customerType: '一包', initialAmount: staticInitialAmounts.project['一包'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '二包', initialAmount: staticInitialAmounts.project['二包'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '域内合作', initialAmount: staticInitialAmounts.project['域内合作'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '域外合作', initialAmount: staticInitialAmounts.project['域外合作'], currentIncrease: 0, cumulativeAmount: 0 },
            { customerType: '其它', initialAmount: staticInitialAmounts.project['其它'], currentIncrease: 0, cumulativeAmount: 0 }
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
        initialData.equipment = initialData.equipment.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年初余量始终使用静态数据
                    initialAmount: templateItem.initialAmount,
                    currentIncrease: Number(loadedItem.currentIncrease) || 0,
                    cumulativeAmount: 0 // 累计库存需要重新计算
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = initialData.component.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年初余量始终使用静态数据
                    initialAmount: templateItem.initialAmount,
                    currentIncrease: Number(loadedItem.currentIncrease) || 0,
                    cumulativeAmount: 0 // 累计库存需要重新计算
                }
            }
            return templateItem
        })
    }

    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = initialData.project.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年初余量始终使用静态数据
                    initialAmount: templateItem.initialAmount,
                    currentIncrease: Number(loadedItem.currentIncrease) || 0,
                    cumulativeAmount: 0 // 累计库存需要重新计算
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

const equipmentData = ref<InventoryItem[]>([])
const componentData = ref<InventoryItem[]>([])
const projectData = ref<InventoryItem[]>([])

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 存储所有历史月份数据，用于计算累计库存
const allMonthsData = ref<Array<{ period: string; data: any }>>([])

// 存储主营业务收入数据
const mainBusinessIncomeData = ref<any>(null)

// 加载主营业务收入数据
const loadMainBusinessIncomeData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/main-business-income/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                mainBusinessIncomeData.value = result.data
                console.log('主营业务收入数据:', mainBusinessIncomeData.value)
            }
        }
    } catch (error) {
        console.error('加载主营业务收入数据失败:', error)
    }
}

// 获取主营业务收入值
const getMainBusinessIncome = (category: string, customerType: string): number => {
    if (!mainBusinessIncomeData.value) return 0

    let categoryData: any[] = []
    if (category === 'equipment') {
        categoryData = mainBusinessIncomeData.value.equipment || []
    } else if (category === 'component') {
        categoryData = mainBusinessIncomeData.value.components || []
    } else if (category === 'project') {
        categoryData = mainBusinessIncomeData.value.engineering || []
    }

    const item = categoryData.find((item: any) => item.customer === customerType)
    return item ? (item.currentMonthIncome || 0) : 0
}

// 获取主营业务收入总计
const getTotalMainBusinessIncome = (): number => {
    if (!mainBusinessIncomeData.value) return 0

    let total = 0
    const allCategories = [
        ...(mainBusinessIncomeData.value.equipment || []),
        ...(mainBusinessIncomeData.value.components || []),
        ...(mainBusinessIncomeData.value.engineering || [])
    ]

    allCategories.forEach((item: any) => {
        total += item.currentMonthIncome || 0
    })

    return total
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
                const response = await fetch(`http://127.0.0.1:3000/contract-inventory/${monthPeriod}`)
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

// 计算累计库存：年初余量 + 当期新增（每个月）- 当月收入（每月）（含税）
const calculateCumulativeAmount = (category: string, customerType: string) => {
    // 获取年初余量
    let initialAmount = 0
    if (category === 'equipment' && staticInitialAmounts.equipment[customerType] !== undefined) {
        initialAmount = staticInitialAmounts.equipment[customerType]
    } else if (category === 'component' && staticInitialAmounts.component[customerType] !== undefined) {
        initialAmount = staticInitialAmounts.component[customerType]
    } else if (category === 'project' && staticInitialAmounts.project[customerType] !== undefined) {
        initialAmount = staticInitialAmounts.project[customerType]
    }

    let totalIncrease = 0

    // 累加历史月份数据
    for (const monthData of allMonthsData.value) {
        if (monthData.data[category]) {
            const item = monthData.data[category].find((d: any) => d.customerType === customerType)
            if (item) {
                totalIncrease += parseFloat(item.currentIncrease?.toString()) || 0
            }
        }
    }

    // 加上当前月份的输入值
    let currentData: InventoryItem[] = []
    if (category === 'equipment') {
        currentData = equipmentData.value
    } else if (category === 'component') {
        currentData = componentData.value
    } else if (category === 'project') {
        currentData = projectData.value
    }

    const currentItem = currentData.find(d => d.customerType === customerType)
    if (currentItem) {
        totalIncrease += parseFloat(currentItem.currentIncrease?.toString()) || 0
    }

    // 获取当月收入（含税）
    const currentMonthIncome = getMainBusinessIncome(category, customerType)
    let currentMonthIncomeWithTax = 0

    if (currentMonthIncome > 0) {
        // 根据板块确定税率
        let taxRate = 0
        if (category === 'equipment' || category === 'component') {
            taxRate = 0.13 // 设备和元件板块为13%
        } else if (category === 'project') {
            taxRate = 0.09 // 工程板块为9%
        }

        // 当月收入（含税）= 当月收入 / (1 - 税率)
        currentMonthIncomeWithTax = currentMonthIncome / (1 - taxRate)
    }

    // 累计库存 = 年初余量 + 总新增 - 当月收入（含税）
    return initialAmount + totalIncrease - currentMonthIncomeWithTax
}

// 更新累计库存数据
const updateCumulativeAmounts = () => {
    // 更新设备类别累计库存
    equipmentData.value.forEach(item => {
        const cumulative = calculateCumulativeAmount('equipment', item.customerType)
        item.cumulativeAmount = cumulative
    })

    // 更新元件类别累计库存
    componentData.value.forEach(item => {
        const cumulative = calculateCumulativeAmount('component', item.customerType)
        item.cumulativeAmount = cumulative
    })

    // 更新工程类别累计库存
    projectData.value.forEach(item => {
        const cumulative = calculateCumulativeAmount('project', item.customerType)
        item.cumulativeAmount = cumulative
    })
}

// 获取项目所属的板块
const getSegmentFromItem = (item: InventoryItem): string => {
    if (equipmentData.value.includes(item)) return 'equipment'
    if (componentData.value.includes(item)) return 'component'
    if (projectData.value.includes(item)) return 'project'
    return 'equipment'
}

// 计算波动率
const calculateFluctuation = (initial: number, cumulative: number): string => {
    if (initial === 0) {
        return cumulative === 0 ? '0.00' : 'N/A'
    }
    const fluctuation = ((cumulative - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 格式化数字
const formatNumber = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00'
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        initialAmount: 0,
        currentIncrease: 0,
        cumulativeAmount: 0
    }

    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        total.initialAmount += Number(item.initialAmount) || 0;
        total.currentIncrease += Number(item.currentIncrease) || 0;
        total.cumulativeAmount += Number(item.cumulativeAmount) || 0;
    });

    // 汇总元件板块数据
    componentData.value.forEach(item => {
        total.initialAmount += Number(item.initialAmount) || 0;
        total.currentIncrease += Number(item.currentIncrease) || 0;
        total.cumulativeAmount += Number(item.cumulativeAmount) || 0;
    });

    // 汇总工程板块数据
    projectData.value.forEach(item => {
        total.initialAmount += Number(item.initialAmount) || 0;
        total.currentIncrease += Number(item.currentIncrease) || 0;
        total.cumulativeAmount += Number(item.cumulativeAmount) || 0;
    });

    return total;
});

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载合同存量数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/contract-inventory/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            console.log('未找到数据，重置为初始模板')
            initializeData()

            // 加载历史数据并更新累计库存
            await loadAllMonthsData(targetPeriod)
            updateCumulativeAmounts()
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

        // 加载所有月份数据并更新累计库存
        await loadAllMonthsData(targetPeriod)
        updateCumulativeAmounts()

        // 加载主营业务收入数据
        await loadMainBusinessIncomeData(targetPeriod)
    } catch (error) {
        console.error('加载数据失败:', error)
        initializeData()
    }
}



// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.CONTRACT_INVENTORY, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
}

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksData()
    loadMainBusinessIncomeData(newPeriod)
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadMainBusinessIncomeData(newPeriod.toString())
    }
})

// 监听当期数据变化，自动更新累计库存
watch(() => [
    equipmentData.value.map(item => item.currentPeriod),
    componentData.value.map(item => item.currentPeriod),
    projectData.value.map(item => item.currentPeriod)
], () => {
    updateCumulativeAmounts()
}, { deep: true })

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksData()
    }
})

const handleSave = async () => {
    try {
        console.log('=== 开始保存合同存量数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.CONTRACT_INVENTORY)
        
        // 准备表单数据
        const formData = {
            equipment: equipmentData.value.map(item => ({
                customerType: item.customerType,
                initialAmount: item.initialAmount,
                currentIncrease: item.currentIncrease || 0,
                cumulativeAmount: item.cumulativeAmount
            })),
            component: componentData.value.map(item => ({
                customerType: item.customerType,
                initialAmount: item.initialAmount,
                currentIncrease: item.currentIncrease || 0,
                cumulativeAmount: item.cumulativeAmount
            })),
            project: projectData.value.map(item => ({
                customerType: item.customerType,
                initialAmount: item.initialAmount,
                currentIncrease: item.currentIncrease || 0,
                cumulativeAmount: item.cumulativeAmount
            }))
        }
        
        console.log('表单数据:', formData)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://127.0.0.1:3000/contract-inventory', {
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
            MODULE_IDS.CONTRACT_INVENTORY,
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
    console.log('合同存量组件挂载，当前期间:', period.value)
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadMainBusinessIncomeData(route.query.period.toString())
    } else {
        loadData(period.value)
        loadMainBusinessIncomeData(period.value)
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