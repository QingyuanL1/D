<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">主营业务成本结构与质量（按年度计划口径分解）（单位：万元）</h1>
            <div class="flex items-center space-x-4">
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <h2 class="text-xl font-semibold mb-3">对应年度计划:</h2>
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划</th>
                        <th class="border border-gray-300 px-4 py-2">计划执行率</th>
                        <th class="border border-gray-300 px-4 py-2">当期直接费用</th>
                        <th class="border border-gray-300 px-4 py-2">累计直接费用</th>
                        <th class="border border-gray-300 px-4 py-2">当期制造费用/间接成本</th>
                        <th class="border border-gray-300 px-4 py-2">累计制造费用/间接成本</th>
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
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ calculateExecutionRate(item.cumulativeMaterialCost + item.cumulativeLaborCost, item.yearlyPlan) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMaterialCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeMaterialCost) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentLaborCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeLaborCost) }}</span>
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
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ calculateExecutionRate(item.cumulativeMaterialCost + item.cumulativeLaborCost, item.yearlyPlan) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMaterialCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeMaterialCost) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentLaborCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeLaborCost) }}</span>
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
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.yearlyPlan) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50 text-right">
                                <span class="px-2 py-1 text-gray-700">{{ calculateExecutionRate(item.cumulativeMaterialCost + item.cumulativeLaborCost, item.yearlyPlan) }}%</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentMaterialCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeMaterialCost) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model.number="item.currentLaborCost" type="number" class="w-full px-2 py-1 border rounded" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2 bg-gray-50">
                                <span class="px-2 py-1 text-gray-700">{{ formatNumber(item.cumulativeLaborCost) }}</span>
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.yearlyPlan) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateExecutionRate(totalData.cumulativeMaterialCost + totalData.cumulativeLaborCost, totalData.yearlyPlan) }}%
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentMaterialCost) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.cumulativeMaterialCost) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.currentLaborCost) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2">
                            {{ formatNumber(totalData.cumulativeLaborCost) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.MAIN_BUSINESS_COST"
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
import FormAttachmentAndRemarks from '@/components/FormAttachmentAndRemarks.vue'
import { recordFormSubmission, MODULE_IDS, loadRemarksAndSuggestions } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))

interface CostItem {
    customerType: string;
    yearlyPlan: number;
    planExecutionRate: number;
    currentMaterialCost: number;
    cumulativeMaterialCost: number;
    currentLaborCost: number;
    cumulativeLaborCost: number;
}

// 静态年度计划数据
const staticYearlyPlans = {
    equipment: {
        '上海': 15000.00,
        '国网': 8000.00,
        '江苏': 5000.00,
        '输配电内配': 2000.00,
        '西门子': 1000.00,
        '同业': 3000.00,
        '用户': 2500.00,
        '其它': 500.00
    },
    component: {
        '用户': 1200.00
    },
    project: {
        '一包': 12000.00,
        '二包': 3000.00,
        '域内合作': 8000.00,
        '域外合作': 4000.00,
        '其它': 2000.00
    }
}

// 获取初始数据模板
const getInitialData = () => {
    return {
        equipment: [
            { customerType: '上海', yearlyPlan: staticYearlyPlans.equipment['上海'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '国网', yearlyPlan: staticYearlyPlans.equipment['国网'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '江苏', yearlyPlan: staticYearlyPlans.equipment['江苏'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '输配电内配', yearlyPlan: staticYearlyPlans.equipment['输配电内配'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '西门子', yearlyPlan: staticYearlyPlans.equipment['西门子'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '同业', yearlyPlan: staticYearlyPlans.equipment['同业'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '用户', yearlyPlan: staticYearlyPlans.equipment['用户'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '其它', yearlyPlan: staticYearlyPlans.equipment['其它'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 }
        ],
        component: [
            { customerType: '用户', yearlyPlan: staticYearlyPlans.component['用户'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 }
        ],
        project: [
            { customerType: '一包', yearlyPlan: staticYearlyPlans.project['一包'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '二包', yearlyPlan: staticYearlyPlans.project['二包'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '域内合作', yearlyPlan: staticYearlyPlans.project['域内合作'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '域外合作', yearlyPlan: staticYearlyPlans.project['域外合作'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 },
            { customerType: '其它', yearlyPlan: staticYearlyPlans.project['其它'], planExecutionRate: 0, currentMaterialCost: 0, cumulativeMaterialCost: 0, currentLaborCost: 0, cumulativeLaborCost: 0 }
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
        initialData.equipment = initialData.equipment.map((templateItem: CostItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年度计划始终使用静态数据
                    yearlyPlan: templateItem.yearlyPlan,
                    // 计划执行率自动计算，不从数据库加载
                    planExecutionRate: 0,
                    currentMaterialCost: Number(loadedItem.currentMaterialCost) || 0,
                    cumulativeMaterialCost: Number(loadedItem.cumulativeMaterialCost) || 0,
                    currentLaborCost: Number(loadedItem.currentLaborCost) || 0,
                    cumulativeLaborCost: Number(loadedItem.cumulativeLaborCost) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = initialData.component.map((templateItem: CostItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年度计划始终使用静态数据
                    yearlyPlan: templateItem.yearlyPlan,
                    // 计划执行率自动计算，不从数据库加载
                    planExecutionRate: 0,
                    currentMaterialCost: Number(loadedItem.currentMaterialCost) || 0,
                    cumulativeMaterialCost: Number(loadedItem.cumulativeMaterialCost) || 0,
                    currentLaborCost: Number(loadedItem.currentLaborCost) || 0,
                    cumulativeLaborCost: Number(loadedItem.cumulativeLaborCost) || 0
                }
            }
            return templateItem
        })
    }
    
    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = initialData.project.map((templateItem: CostItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    // 年度计划始终使用静态数据
                    yearlyPlan: templateItem.yearlyPlan,
                    // 计划执行率自动计算，不从数据库加载
                    planExecutionRate: 0,
                    currentMaterialCost: Number(loadedItem.currentMaterialCost) || 0,
                    cumulativeMaterialCost: Number(loadedItem.cumulativeMaterialCost) || 0,
                    currentLaborCost: Number(loadedItem.currentLaborCost) || 0,
                    cumulativeLaborCost: Number(loadedItem.cumulativeLaborCost) || 0
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

const equipmentData = ref<CostItem[]>([])
const componentData = ref<CostItem[]>([])
const projectData = ref<CostItem[]>([])

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 计算平均执行率
const calculateAvgExecutionRate = (): string => {
    const allItems = [
        ...equipmentData.value,
        ...componentData.value,
        ...projectData.value
    ]

    let totalRate = 0
    let validItemCount = 0

    allItems.forEach(item => {
        if (item.planExecutionRate && item.planExecutionRate !== '/') {
            const rateValue = typeof item.planExecutionRate === 'string' ? item.planExecutionRate.replace(/%/g, '') : String(item.planExecutionRate);
            const rate = parseFloat(rateValue) || 0
            totalRate += rate
            validItemCount++
        }
    })

    if (validItemCount === 0) return '/'
    return (totalRate / validItemCount).toFixed(2) + '%'
}

// 计算执行率
const calculateExecutionRate = (cumulativeCost: number, yearlyPlan: number): string => {
    if (yearlyPlan === 0) return '0.00'
    const rate = (cumulativeCost / yearlyPlan) * 100
    return rate.toFixed(2)
}

// 格式化数字
const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}



// 计算合计数据
const totalData = computed(() => {
    const total = {
        yearlyPlan: 0,
        currentMaterialCost: 0,
        cumulativeMaterialCost: 0,
        currentLaborCost: 0,
        cumulativeLaborCost: 0
    }

    // 汇总设备板块数据
    equipmentData.value.forEach(item => {
        if (item.yearlyPlan && item.yearlyPlan !== '/') {
            const planValue = typeof item.yearlyPlan === 'string' ? item.yearlyPlan.replace(/,/g, '') : String(item.yearlyPlan);
            total.yearlyPlan += parseFloat(planValue) || 0;
        }
        total.currentMaterialCost += item.currentMaterialCost || 0;
        total.cumulativeMaterialCost += item.cumulativeMaterialCost || 0;
        total.currentLaborCost += item.currentLaborCost || 0;
        total.cumulativeLaborCost += item.cumulativeLaborCost || 0;
    });

    // 汇总元件板块数据
    componentData.value.forEach(item => {
        if (item.yearlyPlan && item.yearlyPlan !== '/') {
            const planValue = typeof item.yearlyPlan === 'string' ? item.yearlyPlan.replace(/,/g, '') : String(item.yearlyPlan);
            total.yearlyPlan += parseFloat(planValue) || 0;
        }
        total.currentMaterialCost += item.currentMaterialCost || 0;
        total.cumulativeMaterialCost += item.cumulativeMaterialCost || 0;
        total.currentLaborCost += item.currentLaborCost || 0;
        total.cumulativeLaborCost += item.cumulativeLaborCost || 0;
    });

    // 汇总工程板块数据
    projectData.value.forEach(item => {
        if (item.yearlyPlan && item.yearlyPlan !== '/') {
            const planValue = typeof item.yearlyPlan === 'string' ? item.yearlyPlan.replace(/,/g, '') : String(item.yearlyPlan);
            total.yearlyPlan += parseFloat(planValue) || 0;
        }
        total.currentMaterialCost += item.currentMaterialCost || 0;
        total.cumulativeMaterialCost += item.cumulativeMaterialCost || 0;
        total.currentLaborCost += item.currentLaborCost || 0;
        total.cumulativeLaborCost += item.cumulativeLaborCost || 0;
    });

    return total;
});

// 计算累计费用（当年累计）
const calculateCumulativeCosts = async (targetPeriod: string) => {
    try {
        console.log(`开始计算累计费用，目标期间: ${targetPeriod}`)
        const year = targetPeriod.substring(0, 4)
        const targetMonth = parseInt(targetPeriod.substring(5, 7))

        // 获取当年1月到目标月份的所有数据
        const promises = []
        for (let month = 1; month <= targetMonth; month++) {
            const monthStr = month.toString().padStart(2, '0')
            const periodStr = `${year}-${monthStr}`
            console.log(`获取期间 ${periodStr} 的数据`)
            promises.push(
                fetch(`http://127.0.0.1:3000/main-business-cost/${periodStr}`)
                    .then(response => response.ok ? response.json() : { success: false })
                    .catch(() => ({ success: false }))
            )
        }

        const results = await Promise.all(promises)
        console.log(`获取到 ${results.length} 个月份的数据`)

        // 计算累计数据
        const cumulativeData = {
            equipment: {},
            component: {},
            project: {}
        }

        results.forEach((result, index) => {
            if (result.success && result.data) {
                console.log(`处理第 ${index + 1} 个月的数据`)
                // 累计设备数据
                result.data.equipment?.forEach(item => {
                    const key = item.customerType
                    if (!cumulativeData.equipment[key]) {
                        cumulativeData.equipment[key] = { materialCost: 0, laborCost: 0 }
                    }
                    cumulativeData.equipment[key].materialCost += Number(item.currentMaterialCost) || 0
                    cumulativeData.equipment[key].laborCost += Number(item.currentLaborCost) || 0
                })

                // 累计元件数据
                result.data.component?.forEach(item => {
                    const key = item.customerType
                    if (!cumulativeData.component[key]) {
                        cumulativeData.component[key] = { materialCost: 0, laborCost: 0 }
                    }
                    cumulativeData.component[key].materialCost += Number(item.currentMaterialCost) || 0
                    cumulativeData.component[key].laborCost += Number(item.currentLaborCost) || 0
                })

                // 累计工程数据
                result.data.project?.forEach(item => {
                    const key = item.customerType
                    if (!cumulativeData.project[key]) {
                        cumulativeData.project[key] = { materialCost: 0, laborCost: 0 }
                    }
                    cumulativeData.project[key].materialCost += Number(item.currentMaterialCost) || 0
                    cumulativeData.project[key].laborCost += Number(item.currentLaborCost) || 0
                })
            } else {
                console.log(`第 ${index + 1} 个月的数据无效或不存在`)
            }
        })

        console.log('累计数据计算完成:', cumulativeData)

        // 更新累计数据到当前数据中
        console.log('开始更新累计数据到界面')
        equipmentData.value.forEach(item => {
            const cumulative = cumulativeData.equipment[item.customerType]
            if (cumulative) {
                item.cumulativeMaterialCost = cumulative.materialCost
                item.cumulativeLaborCost = cumulative.laborCost
                console.log(`设备-${item.customerType}: 材料累计=${cumulative.materialCost}, 人工累计=${cumulative.laborCost}`)
            } else {
                item.cumulativeMaterialCost = 0
                item.cumulativeLaborCost = 0
            }
        })

        componentData.value.forEach(item => {
            const cumulative = cumulativeData.component[item.customerType]
            if (cumulative) {
                item.cumulativeMaterialCost = cumulative.materialCost
                item.cumulativeLaborCost = cumulative.laborCost
                console.log(`元件-${item.customerType}: 材料累计=${cumulative.materialCost}, 人工累计=${cumulative.laborCost}`)
            } else {
                item.cumulativeMaterialCost = 0
                item.cumulativeLaborCost = 0
            }
        })

        projectData.value.forEach(item => {
            const cumulative = cumulativeData.project[item.customerType]
            if (cumulative) {
                item.cumulativeMaterialCost = cumulative.materialCost
                item.cumulativeLaborCost = cumulative.laborCost
                console.log(`工程-${item.customerType}: 材料累计=${cumulative.materialCost}, 人工累计=${cumulative.laborCost}`)
            } else {
                item.cumulativeMaterialCost = 0
                item.cumulativeLaborCost = 0
            }
        })

        console.log('累计费用计算和更新完成')
    } catch (error) {
        console.error('计算累计费用失败:', error)
    }
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`正在加载主营业务成本数据，期间: ${targetPeriod}`)
        const response = await fetch(`http://127.0.0.1:3000/main-business-cost/${targetPeriod}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log('未找到数据，使用初始模板')
                initializeData()
                return
            }
            throw new Error('加载数据失败')
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

            // 计算累计费用（包含当前期间的数据）
            await calculateCumulativeCosts(targetPeriod)
        } else {
            console.log('数据格式不正确，使用初始模板')
            initializeData()
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        initializeData()
    }
}

// 加载备注和建议
const loadRemarksData = async () => {
    const { remarks: loadedRemarks, suggestions: loadedSuggestions } = await loadRemarksAndSuggestions(MODULE_IDS.MAIN_BUSINESS_COST, period.value)
    remarks.value = loadedRemarks
    suggestions.value = loadedSuggestions
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

// 监听当期费用变化，自动重新计算累计费用
watch([equipmentData, componentData, projectData], () => {
    // 使用防抖来避免频繁计算
    clearTimeout(cumulativeCalculationTimer.value)
    cumulativeCalculationTimer.value = setTimeout(() => {
        calculateCumulativeCosts(period.value)
    }, 300)
}, { deep: true })

// 防抖计时器
const cumulativeCalculationTimer = ref<NodeJS.Timeout | null>(null)

const handleSave = async () => {
    try {
        console.log('=== 开始保存主营业务成本数据 ===')
        console.log('期间:', period.value)
        console.log('模块ID:', MODULE_IDS.MAIN_BUSINESS_COST)
        
        // 准备表单数据
        const formData = {
            equipment: equipmentData.value.map(item => ({
                customerType: item.customerType,
                yearlyPlan: item.yearlyPlan,
                planExecutionRate: item.planExecutionRate,
                currentMaterialCost: item.currentMaterialCost,
                cumulativeMaterialCost: item.cumulativeMaterialCost,
                currentLaborCost: item.currentLaborCost,
                cumulativeLaborCost: item.cumulativeLaborCost
            })),
            component: componentData.value.map(item => ({
                customerType: item.customerType,
                yearlyPlan: item.yearlyPlan,
                planExecutionRate: item.planExecutionRate,
                currentMaterialCost: item.currentMaterialCost,
                cumulativeMaterialCost: item.cumulativeMaterialCost,
                currentLaborCost: item.currentLaborCost,
                cumulativeLaborCost: item.cumulativeLaborCost
            })),
            project: projectData.value.map(item => ({
                customerType: item.customerType,
                yearlyPlan: item.yearlyPlan,
                planExecutionRate: item.planExecutionRate,
                currentMaterialCost: item.currentMaterialCost,
                cumulativeMaterialCost: item.cumulativeMaterialCost,
                currentLaborCost: item.currentLaborCost,
                cumulativeLaborCost: item.cumulativeLaborCost
            }))
        }
        
        console.log('表单数据:', formData)

        // 第一步：保存到专用表
        console.log('步骤1：保存到专用表...')
        const response = await fetch('http://127.0.0.1:3000/main-business-cost', {
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
            MODULE_IDS.MAIN_BUSINESS_COST,
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
    console.log('主营业务成本组件挂载，当前期间:', period.value)
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