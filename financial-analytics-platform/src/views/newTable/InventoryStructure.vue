<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">存量结构与质量（按年度计划口径分解）（单位：万元）</h1>
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
                        <th class="border border-gray-300 px-4 py-2">年初金额</th>
                        <th class="border border-gray-300 px-4 py-2">当期金额</th>
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="font-medium">{{ formatNumber(item.currentAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="font-medium">{{ formatNumber(item.currentAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount) }}%
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
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span>{{ formatNumber(item.initialAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right bg-gray-50">
                                <span class="font-medium">{{ formatNumber(item.currentAmount) }}</span>
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-right">
                                {{ calculateFluctuation(item.initialAmount, item.currentAmount) }}%
                            </td>
                        </tr>
                    </template>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td class="border border-gray-300 px-4 py-2 text-center" colspan="2">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalInitialAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalCurrentAmount) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ calculateFluctuation(totalInitialAmount, totalCurrentAmount) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.INVENTORY_STRUCTURE"
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
import { recordFormSubmission, MODULE_IDS } from '@/utils/formSubmissionHelper'

const route = useRoute()
const period = ref(route.query.period?.toString() || new Date().toISOString().slice(0, 7))
const remarks = ref('')
const suggestions = ref('')

interface InventoryItem {
    customerType: string;
    initialAmount: number;
    currentAmount: number;
}

// 设备板块数据（静态写死年初金额）
const equipmentMockData: InventoryItem[] = [
    { customerType: '上海', initialAmount: 39151.53, currentAmount: 0 },
    { customerType: '国网', initialAmount: 7841.48, currentAmount: 0 },
    { customerType: '江苏', initialAmount: 6793.01, currentAmount: 0 },
    { customerType: '输配电内配', initialAmount: 0.00, currentAmount: 0 },
    { customerType: '西门子', initialAmount: 28.46, currentAmount: 0 },
    { customerType: '同业', initialAmount: 821.55, currentAmount: 0 },
    { customerType: '用户', initialAmount: 577.37, currentAmount: 0 },
    { customerType: '其它', initialAmount: 220.08, currentAmount: 0 }
]

// 元件板块数据（静态写死年初金额）
const componentMockData: InventoryItem[] = [
    { customerType: '用户', initialAmount: 26.60, currentAmount: 0 }
]

// 工程板块数据（静态写死年初金额）
const projectMockData: InventoryItem[] = [
    { customerType: '一包', initialAmount: 12720.17, currentAmount: 0 },
    { customerType: '二包', initialAmount: 960.55, currentAmount: 0 },
    { customerType: '域内合作', initialAmount: 1818.79, currentAmount: 0 },
    { customerType: '域外合作', initialAmount: 8063.91, currentAmount: 0 },
    { customerType: '其它', initialAmount: 1973.08, currentAmount: 0 }
]

const equipmentData = ref<InventoryItem[]>(JSON.parse(JSON.stringify(equipmentMockData)))
const componentData = ref<InventoryItem[]>(JSON.parse(JSON.stringify(componentMockData)))
const projectData = ref<InventoryItem[]>(JSON.parse(JSON.stringify(projectMockData)))

// 格式化数字为千分位格式
const formatNumber = (value: number | string): string => {
    const num = Number(value) || 0
    return num.toLocaleString()
}

// 计算波动率
const calculateFluctuation = (initial: number, current: number): string => {
    if (initial === 0) return current === 0 ? '0.00' : '0.00';
    const fluctuation = ((current - initial) / initial) * 100;
    return fluctuation.toFixed(2);
}

// 计算合计数据
const totalInitialAmount = computed(() => {
    return [...equipmentData.value, ...componentData.value, ...projectData.value]
        .reduce((sum, item) => sum + (Number(item.initialAmount) || 0), 0)
})

const totalCurrentAmount = computed(() => {
    return [...equipmentData.value, ...componentData.value, ...projectData.value]
        .reduce((sum, item) => sum + (Number(item.currentAmount) || 0), 0)
})


// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/forms/submission/${MODULE_IDS.INVENTORY_STRUCTURE}/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                remarks.value = result.data.remarks || ''
                suggestions.value = result.data.suggestions || ''
            }
        }
    } catch (error) {
        console.error('加载备注和建议失败:', error)
    }
}

// 数据合并函数（保持静态年初金额，使用API计算的当期金额）
const mergeData = (initialData: any, loadedData: any) => {
    // 合并设备数据
    if (loadedData.equipment && Array.isArray(loadedData.equipment)) {
        initialData.equipment = equipmentMockData.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.equipment.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    initialAmount: templateItem.initialAmount, // 使用静态数据
                    currentAmount: Number(loadedItem.currentAmount) || 0 // 使用API计算的当期金额
                }
            }
            return templateItem
        })
    }

    // 合并元件数据
    if (loadedData.component && Array.isArray(loadedData.component)) {
        initialData.component = componentMockData.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.component.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    initialAmount: templateItem.initialAmount, // 使用静态数据
                    currentAmount: Number(loadedItem.currentAmount) || 0 // 使用API计算的当期金额
                }
            }
            return templateItem
        })
    }

    // 合并工程数据
    if (loadedData.project && Array.isArray(loadedData.project)) {
        initialData.project = projectMockData.map((templateItem: InventoryItem) => {
            const loadedItem = loadedData.project.find((item: any) => item.customerType === templateItem.customerType)
            if (loadedItem) {
                return {
                    ...templateItem,
                    initialAmount: templateItem.initialAmount, // 使用静态数据
                    currentAmount: Number(loadedItem.currentAmount) || 0 // 使用API计算的当期金额
                }
            }
            return templateItem
        })
    }

    return initialData
}

// 加载存量结构数据（直接从API获取计算好的数据）
const loadInventoryStructureData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://127.0.0.1:3000/inventory-structure/${targetPeriod}`)
        if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
                return result.data
            }
        }
    } catch (error) {
        console.error('加载存量结构数据失败:', error)
    }
    return null
}

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        console.log(`=== 开始加载存量结构数据，期间: ${targetPeriod} ===`)

        // 从API获取计算好的存量结构数据
        const apiData = await loadInventoryStructureData(targetPeriod)

        console.log('从API加载的存量结构数据:', apiData)

        // 重置为初始模板数据
        equipmentData.value = JSON.parse(JSON.stringify(equipmentMockData))
        componentData.value = JSON.parse(JSON.stringify(componentMockData))
        projectData.value = JSON.parse(JSON.stringify(projectMockData))

        if (apiData) {
            console.log('=== 开始更新设备板块 ===')
            // 更新设备板块的数据
            if (apiData.equipment) {
                equipmentData.value.forEach(item => {
                    const apiItem = apiData.equipment.find((d: any) => d.customerType === item.customerType)
                    if (apiItem) {
                        item.currentAmount = Number(apiItem.currentAmount) || 0
                        console.log(`  ${item.customerType}: 当期金额=${item.currentAmount}`)
                    }
                })
            }

            console.log('=== 开始更新元件板块 ===')
            // 更新元件板块的数据
            if (apiData.component) {
                componentData.value.forEach(item => {
                    const apiItem = apiData.component.find((d: any) => d.customerType === item.customerType)
                    if (apiItem) {
                        item.currentAmount = Number(apiItem.currentAmount) || 0
                        console.log(`  ${item.customerType}: 当期金额=${item.currentAmount}`)
                    }
                })
            }

            console.log('=== 开始更新工程板块 ===')
            // 更新工程板块的数据
            if (apiData.project) {
                projectData.value.forEach(item => {
                    const apiItem = apiData.project.find((d: any) => d.customerType === item.customerType)
                    if (apiItem) {
                        item.currentAmount = Number(apiItem.currentAmount) || 0
                        console.log(`  ${item.customerType}: 当期金额=${item.currentAmount}`)
                    }
                })
            }
        }

        console.log('=== 数据加载完成 ===')
        console.log('最终数据:', {
            equipmentData: equipmentData.value,
            componentData: componentData.value,
            projectData: projectData.value
        })
    } catch (error) {
        console.error('加载数据失败:', error)
        // 重置为初始模板数据
        equipmentData.value = JSON.parse(JSON.stringify(equipmentMockData))
        componentData.value = JSON.parse(JSON.stringify(componentMockData))
        projectData.value = JSON.parse(JSON.stringify(projectMockData))
    }
}

// 监听期间变化
watch(period, (newPeriod) => {
    loadData(newPeriod)
    loadRemarksAndSuggestions(newPeriod)
})

// 监听路由参数变化
watch(() => route.query.period, (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听period值变化，当用户手动修改月份下拉框时重新加载数据
watch(period, (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        // 只保存年初金额到数据库，当期金额由API计算
        const response = await fetch('http://127.0.0.1:3000/inventory-structure', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    equipment: equipmentData.value.map(item => ({
                        customerType: item.customerType,
                        initialAmount: item.initialAmount
                    })),
                    component: componentData.value.map(item => ({
                        customerType: item.customerType,
                        initialAmount: item.initialAmount
                    })),
                    project: projectData.value.map(item => ({
                        customerType: item.customerType,
                        initialAmount: item.initialAmount
                    }))
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录表单提交
        await recordFormSubmission(
            MODULE_IDS.INVENTORY_STRUCTURE,
            period.value,
            {
                equipment: equipmentData.value,
                component: componentData.value,
                project: projectData.value
            },
            remarks.value,
            suggestions.value
        )

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    equipmentData.value = JSON.parse(JSON.stringify(equipmentMockData))
    componentData.value = JSON.parse(JSON.stringify(componentMockData))
    projectData.value = JSON.parse(JSON.stringify(projectMockData))
}

onMounted(() => {
    if (route.query.period) {
        loadData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        loadRemarksAndSuggestions(period.value)
    }
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