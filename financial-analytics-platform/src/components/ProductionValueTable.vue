<!--
ProductionValueTable 组件

使用说明：
1. 通过 v-model:tableData 绑定数据
2. 组件会自动计算执行进度和产能利用率
3. 支持实时编辑和自动更新

Props:
- tableData: ProductionStructureData[] - 表格数据

Events:
- update:tableData - 数据更新事件

示例：
<ProductionValueTable v-model:tableData="tableData" />
-->

<template>
    <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full border-collapse text-base">
            <thead class="sticky top-0 bg-white shadow-sm z-10">
                <tr class="bg-gray-50">
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[100px]">
                        板块
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        客户属性
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        公司设计产能
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        年度产能计划
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        当期产能
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        累计产能
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        计划执行进度
                    </th>
                    <th rowspan="2"
                        class="border border-gray-200 px-6 py-4 text-center font-semibold text-gray-600 min-w-[120px]">
                        产能利用率
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- 设备板块 -->
                <tr v-for="(item, index) in equipmentData" :key="`equipment-${index}`">
                    <td v-if="index === 0" :rowspan="equipmentData.length"
                        class="border border-gray-200 px-6 py-3 text-center font-bold">设备</td>
                    <td class="border border-gray-200 px-6 py-3 text-center">{{ item.customerType }}</td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.designCapacity" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" @input="calculateRates(item)" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="w-full px-3 py-2">{{ formatNumber(item.yearlyPlan) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.currentPeriod" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="font-medium">{{ formatNumber(item.currentAccumulated) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.executionProgress) }}
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.utilizationRate) }}
                    </td>
                </tr>
                
                <!-- 元件板块 -->
                <tr v-for="(item, index) in componentData" :key="`component-${index}`">
                    <td v-if="index === 0" :rowspan="componentData.length"
                        class="border border-gray-200 px-6 py-3 text-center font-bold">元件</td>
                    <td class="border border-gray-200 px-6 py-3 text-center">{{ item.customerType }}</td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.designCapacity" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" @input="calculateRates(item)" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="w-full px-3 py-2">{{ formatNumber(item.yearlyPlan) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.currentPeriod" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="font-medium">{{ formatNumber(item.currentAccumulated) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.executionProgress) }}
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.utilizationRate) }}
                    </td>
                </tr>
                
                <!-- 工程板块 -->
                <tr v-for="(item, index) in projectData" :key="`project-${index}`">
                    <td v-if="index === 0" :rowspan="projectData.length"
                        class="border border-gray-200 px-6 py-3 text-center font-bold">工程</td>
                    <td class="border border-gray-200 px-6 py-3 text-center">{{ item.customerType }}</td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.designCapacity" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" @input="calculateRates(item)" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="w-full px-3 py-2">{{ formatNumber(item.yearlyPlan) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <input v-model.number="item.currentPeriod" type="number"
                            class="w-full px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.01" />
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        <span class="font-medium">{{ formatNumber(item.currentAccumulated) }}</span>
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.executionProgress) }}
                    </td>
                    <td class="border border-gray-200 px-6 py-3 text-right">
                        {{ formatPercentage(item.utilizationRate) }}
                    </td>
                </tr>
                
                <!-- 合计行 -->
                <tr class="bg-gray-50 font-bold">
                    <td colspan="2" class="border border-gray-200 px-6 py-4 text-center">合计</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ totalDesignCapacity.toLocaleString() }}</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ totalYearlyPlan.toLocaleString() }}</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ totalCurrentPeriod.toLocaleString() }}</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ totalCurrentAccumulated.toLocaleString() }}</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ averageExecutionProgress }}%</td>
                    <td class="border border-gray-200 px-6 py-4 text-right">{{ averageUtilizationRate }}%</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { ProductionStructureData } from '@/types/production'

interface Props {
    tableData: ProductionStructureData[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:tableData': [value: ProductionStructureData[]]
}>()

const formatNumber = (value: number | string): string => {
    const num = Number(value) || 0
    return num.toLocaleString()
}

const formatPercentage = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined) {
        return '0.00%'
    }
    return value.toFixed(2) + '%'
}

const calculateRates = (item: ProductionStructureData) => {
    if (item.yearlyPlan > 0) {
        item.executionProgress = parseFloat(((item.currentAccumulated / item.yearlyPlan) * 100).toFixed(2))
    } else {
        item.executionProgress = 0
    }
    
    if (item.designCapacity > 0) {
        item.utilizationRate = parseFloat(((item.currentAccumulated / item.designCapacity) * 100).toFixed(2))
    } else {
        item.utilizationRate = 0
    }
    
    // 触发数据更新
    emit('update:tableData', [...props.tableData])
}

const equipmentData = computed(() => {
    return props.tableData.filter(item => item.segment === '设备')
})

const componentData = computed(() => {
    return props.tableData.filter(item => item.segment === '元件')
})

const projectData = computed(() => {
    return props.tableData.filter(item => item.segment === '工程')
})

const totalDesignCapacity = computed(() => {
    return props.tableData.reduce((sum, item) => sum + Number(item.designCapacity || 0), 0)
})

const totalYearlyPlan = computed(() => {
    return props.tableData.reduce((sum, item) => sum + Number(item.yearlyPlan || 0), 0)
})

const totalCurrentPeriod = computed(() => {
    return props.tableData.reduce((sum, item) => sum + Number(item.currentPeriod || 0), 0)
})

const totalCurrentAccumulated = computed(() => {
    return props.tableData.reduce((sum, item) => sum + Number(item.currentAccumulated || 0), 0)
})

const averageExecutionProgress = computed(() => {
    if (totalYearlyPlan.value > 0) {
        return parseFloat(((totalCurrentAccumulated.value / totalYearlyPlan.value) * 100).toFixed(2))
    }
    return 0
})

const averageUtilizationRate = computed(() => {
    if (totalDesignCapacity.value > 0) {
        return parseFloat(((totalCurrentAccumulated.value / totalDesignCapacity.value) * 100).toFixed(2))
    }
    return 0
})

// 监听数据变化，自动重新计算比率
watch(() => props.tableData, () => {
    props.tableData.forEach(item => {
        // 只重新计算比率，不触发emit避免循环
        if (item.yearlyPlan > 0) {
            item.executionProgress = parseFloat(((item.currentAccumulated / item.yearlyPlan) * 100).toFixed(2))
        } else {
            item.executionProgress = 0
        }
        
        if (item.designCapacity > 0) {
            item.utilizationRate = parseFloat(((item.currentAccumulated / item.designCapacity) * 100).toFixed(2))
        } else {
            item.utilizationRate = 0
        }
    })
}, { deep: true })
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