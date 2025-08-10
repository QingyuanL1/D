<template>
    <div class="max-w-[1600px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">在建工程（合同存量）</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">（单位：万元）</span>
                <input v-model="period" type="month" class="px-3 py-2 border rounded" />
            </div>
        </div>

        <div class="overflow-x-auto my-6">
            <table class="w-full border-collapse border border-gray-300">
                <thead class="sticky top-0 bg-white">
                    <tr class="bg-gray-50">
                        <th class="border border-gray-300 px-4 py-2">模块</th>
                        <th class="border border-gray-300 px-4 py-2">项目名称</th>
                        <th class="border border-gray-300 px-4 py-2">年初滚动数据</th>
                        <th class="border border-gray-300 px-4 py-2">当期</th>
                        <th class="border border-gray-300 px-4 py-2">累计</th>
                        <th class="border border-gray-300 px-4 py-2">变动率</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- 运检项目 -->
                    <tr>
                        <td rowspan="3" class="border border-gray-300 px-4 py-2 font-medium text-center">运检项目</td>
                        <td class="border border-gray-300 px-4 py-2">一包项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[0].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.yunJianProjects[0].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.yunJianProjects[0])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[0].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.yunJianProjects[0].fluctuationRate)">{{ formatPercentage(contractData.yunJianProjects[0].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">二包项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[1].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.yunJianProjects[1].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.yunJianProjects[1])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[1].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.yunJianProjects[1].fluctuationRate)">{{ formatPercentage(contractData.yunJianProjects[1].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">自建项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[2].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.yunJianProjects[2].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.yunJianProjects[2])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianProjects[2].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.yunJianProjects[2].fluctuationRate)">{{ formatPercentage(contractData.yunJianProjects[2].fluctuationRate) }}%</span>
                        </td>
                    </tr>

                    <!-- 运检合力项目 -->
                    <tr>
                        <td class="border border-gray-300 px-4 py-2 font-medium text-center">运检合力项目</td>
                        <td class="border border-gray-300 px-4 py-2"></td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianHeLiProject.beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.yunJianHeLiProject.currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.yunJianHeLiProject)" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.yunJianHeLiProject.accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.yunJianHeLiProject.fluctuationRate)">{{ formatPercentage(contractData.yunJianHeLiProject.fluctuationRate) }}%</span>
                        </td>
                    </tr>

                    <!-- 工程项目 -->
                    <tr>
                        <td rowspan="5" class="border border-gray-300 px-4 py-2 font-medium text-center">工程</td>
                        <td class="border border-gray-300 px-4 py-2">建筑工程项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[0].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.engineeringProjects[0].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.engineeringProjects[0])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[0].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.engineeringProjects[0].fluctuationRate)">{{ formatPercentage(contractData.engineeringProjects[0].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">新能源项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[1].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.engineeringProjects[1].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.engineeringProjects[1])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[1].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.engineeringProjects[1].fluctuationRate)">{{ formatPercentage(contractData.engineeringProjects[1].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">苏州项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[2].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.engineeringProjects[2].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.engineeringProjects[2])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[2].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.engineeringProjects[2].fluctuationRate)">{{ formatPercentage(contractData.engineeringProjects[2].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">烟囱项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[3].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.engineeringProjects[3].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.engineeringProjects[3])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[3].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.engineeringProjects[3].fluctuationRate)">{{ formatPercentage(contractData.engineeringProjects[3].fluctuationRate) }}%</span>
                        </td>
                    </tr>
                    <tr>
                        <td class="border border-gray-300 px-4 py-2">运检项目</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[4].beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2">
                            <input v-model="contractData.engineeringProjects[4].currentAmount" type="number" class="w-full px-2 py-1 border rounded text-right" step="0.01" @input="calculateAccumulated(contractData.engineeringProjects[4])" />
                        </td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(contractData.engineeringProjects[4].accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span :class="getFluctuationClass(contractData.engineeringProjects[4].fluctuationRate)">{{ formatPercentage(contractData.engineeringProjects[4].fluctuationRate) }}%</span>
                        </td>
                    </tr>

                    <!-- 合计行 -->
                    <tr class="bg-gray-50 font-bold">
                        <td colspan="2" class="border border-gray-300 px-4 py-2 text-center">合计</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.beginningRollingData) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.currentAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">{{ formatNumber(totalData.accumulatedAmount) }}</td>
                        <td class="border border-gray-300 px-4 py-2 text-right">
                            <span class="text-sm font-bold">{{ formatPercentage(totalData.fluctuationRate) }}%</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 文件上传和备注组件 -->
        <FormAttachmentAndRemarks 
            :module-id="MODULE_IDS.NANHUA_CONTRACT_INVENTORY"
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

interface ProjectItem {
    projectName: string;
    beginningRollingData: number;
    currentAmount: number;
    accumulatedAmount: number;
    fluctuationRate: number;
}

interface ContractData {
    yunJianProjects: ProjectItem[];
    yunJianHeLiProject: ProjectItem;
    engineeringProjects: ProjectItem[];
}

// 固定的年初滚动数据
const fixedPlanData: ContractData = {
    yunJianProjects: [
        { projectName: '一包项目', beginningRollingData: 1900.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '二包项目', beginningRollingData: 500.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '自建项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 }
    ],
    yunJianHeLiProject: { projectName: '运检合力项目', beginningRollingData: 180.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
    engineeringProjects: [
        { projectName: '建筑工程项目', beginningRollingData: 280.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '新能源项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '苏州项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '烟囱项目', beginningRollingData: 0.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 },
        { projectName: '运检项目', beginningRollingData: 3000.00, currentAmount: 0, accumulatedAmount: 0, fluctuationRate: 0 }
    ]
}

const contractData = ref<ContractData>(JSON.parse(JSON.stringify(fixedPlanData)))

// 备注和建议
const remarks = ref('')
const suggestions = ref('')

// 格式化数字显示
const formatNumber = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 格式化百分比显示
const formatPercentage = (value: number): string => {
    if (value === 0) return '0.00'
    return value.toFixed(2)
}

// 获取波动率样式
const getFluctuationClass = (rate: number): string => {
    if (rate > 0) return 'text-red-500'
    if (rate < 0) return 'text-green-500'
    return 'text-gray-500'
}

// 计算累计和波动率
const calculateAccumulated = (item: ProjectItem) => {
    // 累计 = 年初滚动数据 + 当期
    item.accumulatedAmount = item.beginningRollingData + (item.currentAmount || 0)
    
    // 变动率 = (累计 - 年初滚动数据) / 年初滚动数据 * 100%
    if (item.beginningRollingData > 0) {
        item.fluctuationRate = ((item.accumulatedAmount - item.beginningRollingData) / item.beginningRollingData) * 100
    } else {
        item.fluctuationRate = item.accumulatedAmount > 0 ? 100 : 0
    }
}

// 计算合计数据
const totalData = computed(() => {
    const total = {
        beginningRollingData: 0,
        currentAmount: 0,
        accumulatedAmount: 0,
        fluctuationRate: 0
    }
    
    // 累计运检项目
    contractData.value.yunJianProjects.forEach(item => {
        total.beginningRollingData += item.beginningRollingData || 0
        total.currentAmount += item.currentAmount || 0
        total.accumulatedAmount += item.accumulatedAmount || 0
    })
    
    // 运检合力项目
    total.beginningRollingData += contractData.value.yunJianHeLiProject.beginningRollingData || 0
    total.currentAmount += contractData.value.yunJianHeLiProject.currentAmount || 0
    total.accumulatedAmount += contractData.value.yunJianHeLiProject.accumulatedAmount || 0
    
    // 工程项目
    contractData.value.engineeringProjects.forEach(item => {
        total.beginningRollingData += item.beginningRollingData || 0
        total.currentAmount += item.currentAmount || 0
        total.accumulatedAmount += item.accumulatedAmount || 0
    })
    
    // 计算总波动率
    if (total.beginningRollingData > 0) {
        total.fluctuationRate = ((total.accumulatedAmount - total.beginningRollingData) / total.beginningRollingData) * 100
    } else {
        total.fluctuationRate = total.accumulatedAmount > 0 ? 100 : 0
    }
    
    return total
})

// 加载数据
const loadData = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/nanhua-contract-inventory/${targetPeriod}`)
        if (!response.ok) {
            if (response.status !== 404) {
                throw new Error('加载数据失败')
            }
            return
        }
        const result = await response.json()
        if (result.data) {
            // 合并固定数据和API返回的数据
            const apiData = result.data
            const mergedData = JSON.parse(JSON.stringify(fixedPlanData))
            
            // 合并运检项目数据
            if (apiData.yunJianProjects && Array.isArray(apiData.yunJianProjects)) {
                apiData.yunJianProjects.forEach(apiProject => {
                    const index = mergedData.yunJianProjects.findIndex(p => p.projectName === apiProject.projectName)
                    if (index !== -1) {
                        mergedData.yunJianProjects[index] = { ...mergedData.yunJianProjects[index], ...apiProject }
                    }
                })
            }
            
            // 合并运检合力项目数据
            if (apiData.yunJianHeLiProject && apiData.yunJianHeLiProject.projectName) {
                mergedData.yunJianHeLiProject = { ...mergedData.yunJianHeLiProject, ...apiData.yunJianHeLiProject }
            }
            
            // 合并工程项目数据
            if (apiData.engineeringProjects && Array.isArray(apiData.engineeringProjects)) {
                apiData.engineeringProjects.forEach(apiProject => {
                    const index = mergedData.engineeringProjects.findIndex(p => p.projectName === apiProject.projectName)
                    if (index !== -1) {
                        mergedData.engineeringProjects[index] = { ...mergedData.engineeringProjects[index], ...apiProject }
                    }
                })
            }
            
            contractData.value = mergedData
        }
    } catch (error) {
        console.error('加载数据失败:', error)
    }
}

// 加载已保存的备注和建议
const loadRemarksAndSuggestions = async (targetPeriod: string) => {
    try {
        const response = await fetch(`http://47.111.95.19:3000/forms/submission/${MODULE_IDS.NANHUA_CONTRACT_INVENTORY}/${targetPeriod}`)
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

// 监听路由参数变化
watch(() => route.query.period, async (newPeriod) => {
    if (newPeriod) {
        period.value = newPeriod.toString()
        await loadData(newPeriod.toString())
        loadRemarksAndSuggestions(newPeriod.toString())
    }
})

// 监听期间变化，重新加载数据和备注
watch(period, async (newPeriod, oldPeriod) => {
    if (newPeriod && newPeriod !== oldPeriod) {
        console.log(`期间发生变化: ${oldPeriod} -> ${newPeriod}`)
        await loadData(newPeriod)
        loadRemarksAndSuggestions(newPeriod)
    }
})

const handleSave = async () => {
    try {
        const response = await fetch('http://47.111.95.19:3000/nanhua-contract-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                period: period.value,
                data: contractData.value
            })
        })

        if (!response.ok) {
            throw new Error('保存失败')
        }

        // 记录提交状态（包含备注和建议）
        await recordFormSubmission(MODULE_IDS.NANHUA_CONTRACT_INVENTORY, period.value, contractData.value, remarks.value, suggestions.value)

        alert('保存成功')
    } catch (error) {
        console.error('保存失败:', error)
        alert('保存失败')
    }
}

const handleReset = () => {
    contractData.value = JSON.parse(JSON.stringify(fixedPlanData))
    remarks.value = ''
    suggestions.value = ''
}

onMounted(async () => {
    if (route.query.period) {
        await loadData(route.query.period.toString())
        loadRemarksAndSuggestions(route.query.period.toString())
    } else {
        await loadData(period.value)
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