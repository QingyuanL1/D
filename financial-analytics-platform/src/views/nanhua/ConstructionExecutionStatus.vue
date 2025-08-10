<template>
    <div class="max-w-[1500px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">施工执行情况</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">板块</th>
                        <th class="border border-gray-300 px-4 py-2">客户属性</th>
                        <th class="border border-gray-300 px-4 py-2">年度计划产值</th>
                        <th class="border border-gray-300 px-4 py-2">自制/自行施工</th>
                        <th class="border border-gray-300 px-4 py-2">半自制/分包</th>
                        <th class="border border-gray-300 px-4 py-2">外发/转包</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 工程板块项目 -->
                    <template v-for="(item, index) in executionData.items" :key="`item-${index}`">
                        <tr>
                            <td v-if="index === 0" :rowspan="executionData.items.length" class="border border-gray-300 px-4 py-2 font-medium text-center">
                                工程
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                {{ item.customerAttribute }}
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.annualPlannedOutput" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.selfConstruction" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.semiSelfSubcontract" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                            <td class="border border-gray-300 px-4 py-2">
                                <input v-model="item.outsourcedSubcontract" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" />
                            </td>
                        </tr>
                    </template>

                    <!-- 合计产值行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计产值</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.annualPlannedOutput) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.selfConstruction) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.semiSelfSubcontract) }}
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            {{ formatNumber(totalData.outsourcedSubcontract) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_CONSTRUCTION_EXECUTION_STATUS"
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

interface ExecutionStatusItem {
    customerAttribute: string;
    annualPlannedOutput: number;
    selfConstruction: number;
    semiSelfSubcontract: number;
    outsourcedSubcontract: number;
}

interface ExecutionStatusData {
    items: ExecutionStatusItem[];
}

const fixedExecutionData: ExecutionStatusData = {
    items: [
        { customerAttribute: '一包项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '二包项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '域内合作项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '域外合作项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '新能源项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '苏州项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '抢修项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 },
        { customerAttribute: '运检项目', annualPlannedOutput: 0, selfConstruction: 0, semiSelfSubcontract: 0, outsourcedSubcontract: 0 }
    ]
}

const executionData = ref<ExecutionStatusData>(JSON.parse(JSON.stringify(fixedExecutionData)))
const remarks = ref('')
const suggestions = ref('')

const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        annualPlannedOutput: 0,
        selfConstruction: 0,
        semiSelfSubcontract: 0,
        outsourcedSubcontract: 0
    }
    
    executionData.value.items.forEach(item => {
        total.annualPlannedOutput += item.annualPlannedOutput || 0
        total.selfConstruction += item.selfConstruction || 0
        total.semiSelfSubcontract += item.semiSelfSubcontract || 0
        total.outsourcedSubcontract += item.outsourcedSubcontract || 0
    })
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-construction-execution-status/${targetPeriod}`)
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
            executionData.value.items = result.data.items.map((item: any) => ({
                customerAttribute: item.customerAttribute,
                annualPlannedOutput: Number(item.annualPlannedOutput) || 0,
                selfConstruction: Number(item.selfConstruction) || 0,
                semiSelfSubcontract: Number(item.semiSelfSubcontract) || 0,
                outsourcedSubcontract: Number(item.outsourcedSubcontract) || 0
            }))
        }
    } catch (error) {
        console.error('加载数据失败:', error)
        resetToDefaultData()
    }
}

const resetToDefaultData = () => {
    executionData.value = JSON.parse(JSON.stringify(fixedExecutionData))
}

// 加载备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_CONSTRUCTION_EXECUTION_STATUS}/${targetPeriod}`)
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
        const response = await fetch('http://47.111.95.19:3000/nanhua-construction-execution-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: {
                    items: executionData.value.items
                }
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        await recordFormSubmission(MODULE_IDS.NANHUA_CONSTRUCTION_EXECUTION_STATUS, period.value, { items: executionData.value.items }, remarks.value, suggestions.value)
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